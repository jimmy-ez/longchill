import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from "@supabase/supabase-js";

const MAX_PER_TABLE = 4;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** คืนค่า YYYY-MM-DD ของวันนี้ใน timezone ไทย (Asia/Bangkok) */
function getTodayTH(): string {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
}

/** คืนค่านาทีนับจาก 00:00 ของตอนนี้ใน timezone ไทย */
function getNowMinutesTH(): number {
    const now = new Date();
    const thStr = now.toLocaleTimeString("en-GB", {
        timeZone: "Asia/Bangkok",
        hour: "2-digit",
        minute: "2-digit",
    });
    const [h, m] = thStr.split(":").map(Number);
    return h * 60 + m;
}

/** แปลง time string "HH:MM:SS+07:00" → นาที */
function timeStringToMinutes(timeStr: string): number {
    // รองรับรูปแบบ "17:00:00+07:00" หรือ "17:00"
    const match = timeStr.match(/^(\d{2}):(\d{2})/);
    if (!match) return 0;
    return parseInt(match[1]) * 60 + parseInt(match[2]);
}

// ── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const bookingMode: "with-table" | "walk-in" = body.booking_mode === "walk-in" ? "walk-in" : "with-table";
        const tableNo: string[] = Array.isArray(body.table_no) ? body.table_no : [];
        const partySize: number = parseInt(body.party_size) || 1;
        const bookingDate: string = body.date || "";
        const bookingTime: string = body.time || ""; // e.g. "17:00:00+07:00"

        const todayTH = getTodayTH();
        const nowMinutes = getNowMinutesTH();
        const isToday = bookingDate === todayTH;
        const bookingMinutes = timeStringToMinutes(bookingTime);

        // ── Validate date range (today ~ today+7) ────────────────────────
        if (!bookingDate) {
            return NextResponse.json({ error: "กรุณาระบุวันที่จอง" }, { status: 400 });
        }

        const todayDate = new Date(todayTH);
        const maxDate = new Date(todayTH);
        maxDate.setDate(maxDate.getDate() + 7);
        const selectedDate = new Date(bookingDate);

        if (selectedDate < todayDate || selectedDate > maxDate) {
            return NextResponse.json(
                { error: "สามารถจองล่วงหน้าได้สูงสุด 7 วันเท่านั้น" },
                { status: 400 }
            );
        }

        // ── Validate time slots & cutoff times ──────────────────────────
        const TABLE_TIME_MINUTES = [17 * 60, 17 * 60 + 30, 18 * 60, 18 * 60 + 30,
        19 * 60, 19 * 60 + 30, 20 * 60];
        const WALK_IN_TIME_MINUTES = [17 * 60, 17 * 60 + 30, 18 * 60, 18 * 60 + 30,
        19 * 60, 19 * 60 + 30, 20 * 60, 20 * 60 + 30,
        21 * 60, 21 * 60 + 30, 22 * 60];

        if (bookingMode === "with-table") {
            // ตรวจสอบ slot เวลา
            if (!TABLE_TIME_MINUTES.includes(bookingMinutes)) {
                return NextResponse.json(
                    { error: "เวลาที่เลือกไม่ถูกต้องสำหรับการจองแบบเลือกโต๊ะ (17:00–20:00)" },
                    { status: 400 }
                );
            }
            // ตรวจสอบ cutoff วันนี้ (17:00 = 1020)
            if (isToday && nowMinutes >= 17 * 60) {
                return NextResponse.json(
                    { error: "เลย 17:00 น. แล้ว ไม่สามารถจองแบบเลือกโต๊ะสำหรับวันนี้ได้" },
                    { status: 400 }
                );
            }
            // ตรวจสอบจำนวนโต๊ะ
            const minTables = Math.ceil(partySize / MAX_PER_TABLE);
            if (tableNo.length < minTables) {
                return NextResponse.json(
                    { error: `ต้องเลือกอย่างน้อย ${minTables} โต๊ะ สำหรับ ${partySize} คน` },
                    { status: 400 }
                );
            }
        } else {
            // walk-in
            if (!WALK_IN_TIME_MINUTES.includes(bookingMinutes)) {
                return NextResponse.json(
                    { error: "เวลาที่เลือกไม่ถูกต้องสำหรับการจองแบบไม่เลือกโต๊ะ (17:00–22:00)" },
                    { status: 400 }
                );
            }
            // ตรวจสอบ cutoff วันนี้ (22:00 = 1320)
            if (isToday && nowMinutes >= 22 * 60) {
                return NextResponse.json(
                    { error: "เลย 22:00 น. แล้ว ปิดการจองสำหรับวันนี้แล้ว" },
                    { status: 400 }
                );
            }
            // ตรวจสอบว่าเวลาที่จองยังไม่ผ่านมาแล้ว (สำหรับวันนี้)
            if (isToday && bookingMinutes <= nowMinutes) {
                return NextResponse.json(
                    { error: "ไม่สามารถจองเวลาที่ผ่านมาแล้วได้ กรุณาเลือกเวลาถัดไป" },
                    { status: 400 }
                );
            }
        }

        // ── Supabase setup ───────────────────────────────────────────────
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const supabaseServiceKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY ||
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
            "";

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // ── Check double-booking (เฉพาะแบบเลือกโต๊ะ) ────────────────────
        if (bookingMode === "with-table" && tableNo.length > 0) {
            const { data: existingRows } = await supabase
                .from("reservations")
                .select("table_no")
                .eq("date", bookingDate)
                .neq("status", "cancelled");

            const occupiedTables: string[] = [];
            for (const row of existingRows || []) {
                if (!row.table_no) continue;
                try {
                    const tables = JSON.parse(row.table_no);
                    if (Array.isArray(tables)) occupiedTables.push(...tables);
                } catch {
                    occupiedTables.push(row.table_no);
                }
            }

            const conflict = tableNo.filter((t) => occupiedTables.includes(t));
            if (conflict.length > 0) {
                return NextResponse.json(
                    { error: `โต๊ะ ${conflict.join(", ")} ถูกจองแล้วในวันนี้ กรุณาเลือกโต๊ะอื่น` },
                    { status: 409 }
                );
            }
        }

        // ── Insert reservation ───────────────────────────────────────────
        const { error } = await supabase.from("reservations").insert({
            customer_name: body.customer_name,
            phone: body.phone,
            date: bookingDate,
            time: bookingTime,
            party_size: partySize,
            status: "pending",
            uid: session.user.id,
            table_no: JSON.stringify(tableNo),
        });

        if (error) {
            console.error("Supabase insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        // ── LINE Messaging API (fire-and-forget) ─────────────────────────
        const lineToken = process.env.LINE_MESSAGING_TOKEN;
        const lineGroupId = process.env.LINE_GROUP_ID;
        if (lineToken && lineGroupId) {
            // วันที่: YYYY-MM-DD → DD-MM-YYYY
            const [y, mo, d] = bookingDate.split("-");
            const dateDisplay = `${d}-${mo}-${y}`;

            // เวลา: "17:30:00+07:00" → "17.30"
            const timeMatch = bookingTime.match(/^(\d{2}):(\d{2})/);
            const timeDisplay = timeMatch ? `${timeMatch[1]}.${timeMatch[2]}` : bookingTime;

            const modeLabel = bookingMode === "with-table"
                ? `🪑 เลือกโต๊ะ: ${tableNo.join(", ")}`
                : "🚶 ไม่เลือกโต๊ะ (ทางร้านจัดให้)";

            const text = [
                "🔔 มีการจองโต๊ะใหม่!",
                `👤 ชื่อ: ${body.customer_name}`,
                `📞 เบอร์: ${body.phone}`,
                `📅 วันที่: ${dateDisplay}`,
                `🕐 เวลา: ${timeDisplay} น.`,
                `👥 จำนวน: ${partySize} คน`,
                modeLabel,
            ].join("\n");

            fetch("https://api.line.me/v2/bot/message/push", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${lineToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    to: lineGroupId,
                    messages: [{ type: "text", text }],
                }),
            }).catch((err) => console.error("LINE Messaging API error:", err));
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Internal Server Error";
        console.error("API error:", msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
