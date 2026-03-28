"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FloorPlan from "./FloorPlan";
import "./page.css";

const MAX_PER_TABLE = 4;

// เวลาที่เลือกได้ แบบเลือกโต๊ะ: 17:00–20:00
const TABLE_TIMES = ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];
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
    const [errorMsg, setErrorMsg] = useState("");
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

    // แบบเลือกโต๊ะ: ถ้าวันนี้ ต้องจองก่อน 17:00 (1020 นาที)
    const tableBookingCutoffMinutes = 17 * 60; // 17:00 = 1020
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
        setSelectedTables(prev => {
            if (prev.includes(tableId)) {
                return prev.filter(t => t !== tableId);
            }
            if (prev.length >= maxTables) {
                return [...prev.slice(1), tableId];
            }
            return [...prev, tableId];
        });
    };

    const canSubmit = selectedTables.length >= maxTables;

    // ── Submit แบบเลือกโต๊ะ ──────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setStatus("loading");
        setErrorMsg("");

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
            setErrorMsg(
                err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
            );
        }
    };

    // ── Submit แบบไม่เลือกโต๊ะ ──────────────────────────────────────────
    const handleWalkInSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMsg("");

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
            setErrorMsg(
                err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
            );
        }
    };

    const handleReset = () => {
        setStatus("idle");
        setStep(1);
        setSelectedTables([]);
        setOccupiedTables([]);
        setBookedTables([]);
        setErrorMsg("");
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

            {renderCommonFields(TABLE_TIMES, isTodayTableBlocked)}

            {isTodayTableBlocked && formData.date === today ? (
                <div className="alert alert-warning" style={{ marginBottom: "12px" }}>
                    ⏰ เลย 17:00 น. แล้ว ไม่สามารถจองแบบเลือกโต๊ะสำหรับวันนี้ได้ กรุณาเลือกวันอื่น
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
            {status === "error" && (
                <div className="alert alert-error" style={{ marginBottom: "12px" }}>{errorMsg}</div>
            )}

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

            {status === "error" && (
                <div className="alert alert-error">{errorMsg}</div>
            )}

            <FloorPlan
                occupiedTables={occupiedTables}
                selectedTables={selectedTables}
                onToggle={handleToggleTable}
                partySize={partySize}
                maxTables={maxTables}
            />

            <form onSubmit={handleSubmit}>
                <button
                    type="submit"
                    className="btn btn-primary btn-full submit-res-btn"
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
                        <li>🪑 แต่ละโต๊ะรองรับสูงสุด 4 ท่าน</li>
                        <li>📅 จองล่วงหน้าได้สูงสุด 7 วัน</li>
                        <li>🗓️ แบบเลือกโต๊ะ: จองวันนี้ต้องทำก่อน 17:00 น.</li>
                        <li>🚶 แบบไม่เลือกโต๊ะ: ปิดรับจองวันนี้เมื่อถึง 22:00 น.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
