import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from "@supabase/supabase-js";

const MAX_PER_TABLE = 4;

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const tableNo: string[] = Array.isArray(body.table_no) ? body.table_no : [];
        const partySize: number = parseInt(body.party_size) || 1;

        // Validate table count
        const minTables = Math.ceil(partySize / MAX_PER_TABLE);
        if (tableNo.length < minTables) {
            return NextResponse.json(
                { error: `ต้องเลือกอย่างน้อย ${minTables} โต๊ะ สำหรับ ${partySize} คน` },
                { status: 400 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const supabaseServiceKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY ||
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
            "";

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Check double-booking: get all reservations for this date
        const { data: existingRows } = await supabase
            .from("reservations")
            .select("table_no")
            .eq("date", body.date)
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

        const { error } = await supabase.from("reservations").insert({
            customer_name: body.customer_name,
            phone: body.phone,
            date: body.date,
            time: body.time,
            party_size: partySize,
            status: "pending",
            uid: session.user.id,
            table_no: JSON.stringify(tableNo),
        });

        if (error) {
            console.error("Supabase insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Internal Server Error";
        console.error("API error:", msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
