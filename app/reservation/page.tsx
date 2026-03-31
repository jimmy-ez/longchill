"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FloorPlan from "./FloorPlan";
import "./page.css";

const MAX_PER_TABLE = 5;

// ── กฎการเลือกโต๊ะที่ติดกัน ───────────────────────────────────────────────
const ADJACENCY_MAP: Record<string, string[]> = {
    // T Horizontal
    "T5": ["T10"], "T10": ["T5", "T15"], "T15": ["T10", "T20"], "T20": ["T15", "T24"], "T24": ["T20"],
    "T4": ["T9"], "T9": ["T4", "T14"], "T14": ["T9", "T19"], "T19": ["T14", "T23"], "T23": ["T19"],
    "T3": ["T8"], "T8": ["T3", "T13"], "T13": ["T8", "T18"], "T18": ["T13"],
    "T2": ["T7"], "T7": ["T2", "T12"], "T12": ["T7", "T17"], "T17": ["T12"],
    "T1": ["T6"], "T6": ["T1", "T11"], "T11": ["T6", "T16"], "T16": ["T11"],
    "T21": ["T22"], "T22": ["T21"],
    // V Vertical
    "V4": ["V3"], "V3": ["V4", "V2"], "V2": ["V3", "V1"], "V1": ["V2"],
    "V8": ["V7"], "V7": ["V8", "V6"], "V6": ["V7", "V5"], "V5": ["V6"],
    "V11": ["V10"], "V10": ["V11", "V9"], "V9": ["V10"],
    "V15": ["V14"], "V14": ["V15", "V13"], "V13": ["V14", "V12"], "V12": ["V13"],
};

function isConnectedComponent(tables: string[]): boolean {
    if (tables.length <= 1) return true;
    const visited = new Set<string>();
    const queue = [tables[0]];
    visited.add(tables[0]);
    let head = 0;
    while (head < queue.length) {
        const curr = queue[head++];
        const neighbors = ADJACENCY_MAP[curr] || [];
        for (const neighbor of neighbors) {
            if (tables.includes(neighbor) && !visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
    return visited.size === tables.length;
}

// แบบไม่เลือกโต๊ะ: 17:00–22:00
const WALK_IN_TIMES = [
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    "20:00", "20:30", "21:00", "21:30", "22:00",
];

// คืนค่า YYYY-MM-DD ตาม timezone ไทย
function getTodayTH(): string {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
}

// คืนค่าวันที่ +N วัน (YYYY-MM-DD) ตาม timezone ไทย
function getMaxDateTH(daysAhead: number): string {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
}

// ชั่วโมง + นาที ของตอนนี้ใน TH
function getNowMinutesTH(): number {
    const now = new Date();
    const thStr = now.toLocaleTimeString("en-GB", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit" });
    const [h, m] = thStr.split(":").map(Number);
    return h * 60 + m;
}

export default function ReservationPage() {
    const { data: session } = useSession();
    const router = useRouter();

    // "with-table" | "walk-in"
    const [bookingMode, setBookingMode] = useState<"with-table" | "walk-in">("with-table");
    const [step, setStep] = useState<1 | 2>(1);
    const [formData, setFormData] = useState({
        customer_name: "",
        phone: "",
        date: "",
        time: "",
        party_size: "2",
    });
    const [selectedTables, setSelectedTables] = useState<string[]>([]);
    const [occupiedTables, setOccupiedTables] = useState<string[]>([]);
    const [loadingTables, setLoadingTables] = useState(false);

    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [bookedTables, setBookedTables] = useState<string[]>([]);

    const [today] = useState(() => getTodayTH());
    const [maxDate] = useState(() => getMaxDateTH(7));
    const [nowMinutes, setNowMinutes] = useState(0);

    // Pre-fill name if logged in
    const [hasPrefilled, setHasPrefilled] = useState(false);
    useEffect(() => {
        if (session?.user?.name && !hasPrefilled) {
            setFormData(prev => ({ ...prev, customer_name: session.user!.name || "" }));
            setHasPrefilled(true);
        }
    }, [session, hasPrefilled]);

    useEffect(() => {
        setNowMinutes(getNowMinutesTH());
    }, []);

    // ── ตรวจสอบเงื่อนไขวันที่เลือก ──────────────────────────────────────
    const isToday = formData.date === today;

    // แบบเลือกโต๊ะ: วันจันทร์-พฤหัส 20:00 // ศุกร์-อาทิตย์ 19:30
    const bookingDateObj = new Date(formData.date || today);
    const dayOfWeek = bookingDateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;

    const currentTableTimes = isWeekend
        ? ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30"]
        : ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];

    const tableBookingCutoffMinutes = isWeekend ? 19 * 60 + 30 : 20 * 60;
    const isTodayTableBlocked = isToday && nowMinutes >= tableBookingCutoffMinutes;

    // แบบไม่เลือกโต๊ะ: ปิดจองวันนี้เมื่อถึง 22:00 (1320 นาที)
    const walkInCutoffMinutes = 22 * 60; // 22:00 = 1320
    const isTodayWalkInBlocked = isToday && nowMinutes >= walkInCutoffMinutes;

    // Reset time & mode-specific blocks when date changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, time: "" }));
    }, [formData.date, bookingMode]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cleaned = e.target.value.replace(/\D/g, "");
        let formatted = cleaned;
        if (cleaned.length > 3 && cleaned.length <= 6) {
            formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        } else if (cleaned.length > 6) {
            formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
        }
        setFormData((prev) => ({ ...prev, phone: formatted }));
    };

    const handlePartySizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "");
        setFormData((prev) => ({ ...prev, party_size: val }));
    };

    const partySize = parseInt(formData.party_size) || 1;
    const maxTables = Math.ceil(partySize / MAX_PER_TABLE);

    // ── แบบเลือกโต๊ะ: ไปขั้นตอน 2 ─────────────────────────────────────
    const handleNextStep = async () => {
        setLoadingTables(true);
        setSelectedTables([]);
        try {
            const res = await fetch(`/api/tables?date=${formData.date}`);
            const data = await res.json();
            setOccupiedTables(data.occupied || []);
        } catch {
            setOccupiedTables([]);
        } finally {
            setLoadingTables(false);
            setStep(2);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleToggleTable = (tableId: string) => {
        if (selectedTables.includes(tableId)) {
            const newSelection = selectedTables.filter(t => t !== tableId);
            if (newSelection.length > 1 && !isConnectedComponent(newSelection)) {
                toast.error("การยกเลิกโต๊ะนี้ทำให้กลุ่มโต๊ะไม่ติดกัน ระบบจึงยกเลิกการเลือกโต๊ะใหม่ทั้งหมด");
                setSelectedTables([]);
                return;
            }
            setSelectedTables(newSelection);
            return;
        }

        if (selectedTables.length === 0) {
            setSelectedTables([tableId]);
            return;
        }

        const isAdjacent = selectedTables.some(t => (ADJACENCY_MAP[t] || []).includes(tableId));
        if (!isAdjacent) {
            toast.error("กรุณาเลือกโต๊ะที่อยู่ติดกันตามข้อกำหนด (โซนธรรมดาต่อแนวนอน, โซน VIP ต่อแนวตั้ง)");
            return;
        }

        if (selectedTables.length >= maxTables) {
            const attemptSlice = [...selectedTables.slice(1), tableId];
            if (isConnectedComponent(attemptSlice)) {
                setSelectedTables(attemptSlice);
            } else {
                toast.error("เพื่อเลือกโต๊ะกลุ่มใหม่ กรุณายกเลิกโต๊ะที่เลือกไว้เดิมก่อน");
            }
            return;
        }

        setSelectedTables([...selectedTables, tableId]);
    };

    const canSubmit = selectedTables.length >= maxTables;

    // ── Submit แบบเลือกโต๊ะ ──────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setStatus("loading");

        try {
            const res = await fetch("/api/reservation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer_name: formData.customer_name,
                    phone: formData.phone,
                    date: formData.date,
                    time: `${formData.time}:00+07:00`,
                    party_size: partySize,
                    table_no: selectedTables,
                    booking_mode: "with-table",
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง");
            }

            setBookedTables(selectedTables);
            setStatus("success");
            setFormData({
                customer_name: session?.user?.name || "",
                phone: "",
                date: "",
                time: "",
                party_size: "2",
            });
            setSelectedTables([]);
            setStep(1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err: unknown) {
            setStatus("error");
            toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        }
    };

    // ── Submit แบบไม่เลือกโต๊ะ ──────────────────────────────────────────
    const handleWalkInSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const res = await fetch("/api/reservation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer_name: formData.customer_name,
                    phone: formData.phone,
                    date: formData.date,
                    time: `${formData.time}:00+07:00`,
                    party_size: partySize,
                    table_no: [],
                    booking_mode: "walk-in",
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง");
            }

            setBookedTables([]);
            setStatus("success");
            setFormData({
                customer_name: session?.user?.name || "",
                phone: "",
                date: "",
                time: "",
                party_size: "2",
            });
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err: unknown) {
            setStatus("error");
            toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        }
    };

    const handleReset = () => {
        setStatus("idle");
        setStep(1);
        setSelectedTables([]);
        setOccupiedTables([]);
        setBookedTables([]);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // ── Step 1 shared fields (ใช้ทั้ง 2 โหมด) ────────────────────────────
    const renderCommonFields = (times: string[], todayBlocked: boolean) => (
        <>
            <div className="res-form-group">
                <label htmlFor="customer_name">ชื่อผู้จอง</label>
                <input
                    id="customer_name"
                    name="customer_name"
                    type="text"
                    className="form-input"
                    placeholder="ระบุชื่อของคุณ"
                    value={formData.customer_name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="res-form-group">
                <label htmlFor="phone">เบอร์โทรติดต่อ</label>
                <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="form-input"
                    placeholder="08X-XXX-XXXX"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    maxLength={12}
                    pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                    required
                />
            </div>

            <div className="res-form-group">
                <label htmlFor="party_size">จำนวน (คน)</label>
                <input
                    id="party_size"
                    name="party_size"
                    type="text"
                    inputMode="numeric"
                    className="form-input"
                    placeholder="ตัวอย่าง: 2"
                    value={formData.party_size}
                    onChange={handlePartySizeChange}
                    required
                />
                {bookingMode === "with-table" && partySize > MAX_PER_TABLE && (
                    <span className="res-hint">
                        ⚠️ {partySize} คน ต้องเลือก {maxTables} โต๊ะ
                    </span>
                )}
            </div>

            <div className="res-form-group">
                <label htmlFor="date">วันที่จอง</label>
                <input
                    id="date"
                    name="date"
                    type="date"
                    className="form-input"
                    min={today}
                    max={maxDate}
                    value={formData.date}
                    onChange={handleChange}
                    required
                />
                {todayBlocked && formData.date === today && (
                    <span className="res-hint res-hint--error">
                        ⛔ ไม่สามารถจองสำหรับวันนี้ได้แล้ว กรุณาเลือกวันอื่น
                    </span>
                )}
            </div>

            <div className="res-form-group">
                <label htmlFor="time">เวลามารับโต๊ะ</label>
                <select
                    id="time"
                    name="time"
                    className="form-input"
                    value={formData.time}
                    onChange={handleChange}
                    disabled={todayBlocked && formData.date === today}
                    required
                >
                    <option value="" disabled>เลือกเวลา</option>
                    {times
                        .filter((t) => {
                            if (formData.date !== today) return true;
                            // กรองเฉพาะเวลาที่ยังไม่ผ่านมา (> nowMinutes)
                            const [h, m] = t.split(":").map(Number);
                            return h * 60 + m > nowMinutes;
                        })
                        .map((t) => (
                            <option key={t} value={t}>{t} น.</option>
                        ))}
                </select>
            </div>
        </>
    );

    // ── Step 1: โหมดเลือกโต๊ะ ─────────────────────────────────────────
    const renderStep1WithTable = () => (
        <form
            onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}
            className="res-form animate-fade-in-up"
        >
            {/* Step indicator */}
            <div className="res-step-indicator">
                <div className="res-step res-step--active">
                    <span className="res-step-num">1</span>
                    <span className="res-step-label">ข้อมูล</span>
                </div>
                <div className="res-step-line" />
                <div className="res-step res-step--inactive">
                    <span className="res-step-num">2</span>
                    <span className="res-step-label">เลือกโต๊ะ</span>
                </div>
            </div>

            {renderCommonFields(currentTableTimes, isTodayTableBlocked)}

            {isTodayTableBlocked && formData.date === today ? (
                <div className="alert alert-warning" style={{ marginBottom: "12px" }}>
                    ⏰ เลยเวลา {isWeekend ? "19:30" : "20:00"} น. แล้ว ไม่สามารถจองแบบเลือกโต๊ะสำหรับวันนี้ได้ กรุณาเลือกวันอื่น
                </div>
            ) : null}

            <button
                type="submit"
                className="btn btn-primary btn-full submit-res-btn"
                disabled={loadingTables || (isTodayTableBlocked && formData.date === today)}
            >
                {loadingTables ? "กำลังโหลด..." : "ถัดไป เลือกโต๊ะ →"}
            </button>
        </form>
    );

    // ── Step 1: โหมดไม่เลือกโต๊ะ ─────────────────────────────────────
    const renderStep1WalkIn = () => (
        <form
            onSubmit={handleWalkInSubmit}
            className="res-form animate-fade-in-up"
        >
            {renderCommonFields(WALK_IN_TIMES, isTodayWalkInBlocked)}

            {isTodayWalkInBlocked && formData.date === today ? (
                <div className="alert alert-warning" style={{ marginBottom: "12px" }}>
                    ⏰ เลย 22:00 น. แล้ว ปิดการจองสำหรับวันนี้แล้ว กรุณาเลือกวันอื่น
                </div>
            ) : null}

            <button
                type="submit"
                className="btn btn-primary btn-full submit-res-btn"
                disabled={status === "loading" || (isTodayWalkInBlocked && formData.date === today)}
            >
                {status === "loading" ? "กำลังทำรายการ..." : "ยืนยันการจอง"}
            </button>
        </form>
    );

    // ── Step 2: Floor plan ──────────────────────────────────────────────
    const renderStep2 = () => (
        <div className="res-form animate-fade-in-up">
            {/* Step indicator */}
            <div className="res-step-indicator">
                <div className="res-step res-step--done" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ cursor: "pointer" }}>
                    <span className="res-step-num">✓</span>
                    <span className="res-step-label">ข้อมูล</span>
                </div>
                <div className="res-step-line res-step-line--done" />
                <div className="res-step res-step--active">
                    <span className="res-step-num">2</span>
                    <span className="res-step-label">เลือกโต๊ะ</span>
                </div>
            </div>

            {/* Summary of step 1 */}
            <div className="res-summary-bar">
                <span>📅 {formData.date}</span>
                <span>🕐 {formData.time} น.</span>
                <span>👥 {formData.party_size} คน</span>
            </div>

            <FloorPlan
                occupiedTables={occupiedTables}
                selectedTables={selectedTables}
                onToggle={handleToggleTable}
                partySize={partySize}
                maxTables={maxTables}
            />

            <form onSubmit={handleSubmit} style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                <button
                    type="submit"
                    className="btn btn-primary submit-res-btn"
                    style={{ minWidth: "280px" }}
                    disabled={!canSubmit || status === "loading"}
                >
                    {status === "loading"
                        ? "กำลังทำรายการ..."
                        : canSubmit
                            ? `ยืนยันจองโต๊ะ ${selectedTables.join(", ")}`
                            : `เลือกโต๊ะอีก ${maxTables - selectedTables.length} โต๊ะ`
                    }
                </button>
            </form>

            <button
                type="button"
                className="res-back-btn"
                onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
                ← แก้ไขข้อมูล
            </button>
        </div>
    );

    return (
        <div className="reservation-page mobile-layout">
            <div className="res-header animate-fade-in-up">
                <h2>จองโต๊ะล่วงหน้า</h2>
                <p>ลงชื่อจองโต๊ะง่ายๆ เพื่อบรรยากาศชิลล์ๆ ของคุณ</p>
            </div>

            <div className={`res-content${step === 2 ? " res-content--wide" : ""}`}>
                {status === "success" ? (
                    <div className="res-success-card animate-fade-in-up">
                        <div className="res-success-icon">🎉</div>
                        <h3>จองโต๊ะสำเร็จ!</h3>
                        <p>ขอบคุณที่เลือก Longchill ทางเราได้รับข้อมูลการจองของคุณเรียบร้อยแล้ว</p>
                        {bookedTables.length > 0 && (
                            <div className="res-booked-tables">
                                🪑 โต๊ะของคุณ: <strong>{bookedTables.join(", ")}</strong>
                            </div>
                        )}
                        {bookedTables.length === 0 && (
                            <div className="res-booked-tables">
                                🪑 ทางร้านจะจัดโต๊ะให้ตามความเหมาะสม
                            </div>
                        )}
                        <div style={{ display: "flex", gap: "12px", width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <button
                                className="btn btn-primary btn-full res-btn-margin"
                                onClick={handleReset}
                            >
                                จองโต๊ะเพิ่ม
                            </button>
                            <button
                                className="btn btn-secondary btn-full res-btn-margin"
                                onClick={() => router.push("/history")}
                            >
                                รายการจองของฉัน
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Mode Selector — แสดงเฉพาะ Step 1 */}
                        {step === 1 && (
                            <div className="res-mode-selector animate-fade-in-up">
                                <button
                                    type="button"
                                    className={`res-mode-btn${bookingMode === "with-table" ? " res-mode-btn--active" : ""}`}
                                    onClick={() => { setBookingMode("with-table"); setFormData(prev => ({ ...prev, time: "" })); }}
                                >
                                    🪑 เลือกโต๊ะ
                                </button>
                                <button
                                    type="button"
                                    className={`res-mode-btn${bookingMode === "walk-in" ? " res-mode-btn--active" : ""}`}
                                    onClick={() => { setBookingMode("walk-in"); setFormData(prev => ({ ...prev, time: "" })); }}
                                >
                                    🚶 ไม่เลือกโต๊ะ
                                </button>
                            </div>
                        )}

                        {step === 1 && bookingMode === "with-table" && renderStep1WithTable()}
                        {step === 1 && bookingMode === "walk-in" && renderStep1WalkIn()}
                        {step === 2 && renderStep2()}
                    </>
                )}

                <div className="res-info-section animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <h4>ข้อมูลติดต่อ &amp; เงื่อนไข</h4>
                    <ul className="res-info-list">
                        <li>🕒 แนะนำให้มาตรงเวลา หากมาช้าเกิน 15 นาทีทางร้านขออนุญาตปล่อยโต๊ะตามคิว</li>
                        <li>🪑 แต่ละโต๊ะรองรับสูงสุด 5 ท่าน</li>
                        <li>📅 จองล่วงหน้าได้สูงสุด 7 วัน</li>
                        <li>🗓️ แบบเลือกโต๊ะ: วันจันทร์-พฤหัส จองได้ถึง 20:00 น. | ศุกร์-อาทิตย์ จองได้ถึง 19:30 น.</li>
                        <li>🚶 แบบไม่เลือกโต๊ะ: ปิดรับจองวันนี้เมื่อถึง 22:00 น.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
