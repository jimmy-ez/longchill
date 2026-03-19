"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "next-auth/react";
import "./page.css";

export default function ReservationPage() {
    const { data: session } = useSession();

    const [formData, setFormData] = useState({
        customer_name: "",
        phone: "",
        date: "",
        time: "",
        party_size: "2",
    });

    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    // Pre-fill name if logged in
    const [hasPrefilled, setHasPrefilled] = useState(false);
    useEffect(() => {
        if (session?.user?.name && !hasPrefilled) {
            setFormData(prev => ({ ...prev, customer_name: session.user!.name || "" }));
            setHasPrefilled(true);
        }
    }, [session, hasPrefilled]);

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

    const handleSubmit = async (e: React.FormEvent) => {
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
                    party_size: parseInt(formData.party_size),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง");
            }


            setStatus("success");
            setFormData({
                customer_name: session?.user?.name || "",
                phone: "",
                date: "",
                time: "",
                party_size: "2",
            });
        } catch (err: unknown) {
            setStatus("error");
            setErrorMsg(
                err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
            );
        }
    };

    const [today, setToday] = useState("");
    useEffect(() => {
        setToday(new Date().toLocaleDateString("en-CA")); // e.g. "2026-03-19" locally
    }, []);

    return (
        <div className="reservation-page mobile-layout">
            <div className="res-header animate-fade-in-up">
                <h2>จองโต๊ะล่วงหน้า</h2>
                <p>ลงชื่อจองโต๊ะง่ายๆ เพื่อบรรยากาศชิลล์ๆ ของคุณ</p>
            </div>

            <div className="res-content">
                {status === "success" ? (
                    <div className="res-success-card animate-fade-in-up">
                        <div className="res-success-icon">🎉</div>
                        <h3>จองโต๊ะสำเร็จ!</h3>
                        <p>ขอบคุณที่เลือก Longchill ทางเราได้รับข้อมูลการจองของคุณเรียบร้อยแล้ว</p>
                        <button
                            className="btn btn-primary btn-full res-btn-margin"
                            onClick={() => setStatus("idle")}
                        >
                            จองโต๊ะเพิ่ม
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="res-form animate-fade-in-up">
                        {status === "error" && (
                            <div className="alert alert-error">{errorMsg}</div>
                        )}

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
                        </div>

                        <div className="res-form-group">
                            <label htmlFor="date">วันที่จอง</label>
                            <input
                                id="date"
                                name="date"
                                type="date"
                                className="form-input"
                                min={today}
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="res-form-group">
                            <label htmlFor="time">เวลามารับโต๊ะ</label>
                            <select
                                id="time"
                                name="time"
                                className="form-input"
                                value={formData.time}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>เลือกเวลา</option>
                                {[
                                    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
                                    "20:00", "20:30", "21:00", "21:30", "22:00", "22:30",
                                    "23:00", "23:30",
                                ].map((t) => (
                                    <option key={t} value={t}>
                                        {t} น.
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full submit-res-btn"
                            disabled={status === "loading"}
                        >
                            {status === "loading" ? "กำลังทำรายการ..." : "ยืนยันการจองโต๊ะ"}
                        </button>
                    </form>
                )}

                <div className="res-info-section animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <h4>ข้อมูลติดต่อ & เงื่อนไข</h4>
                    <ul className="res-info-list">
                        <li>🕒 แนะนำให้มาตรงเวลา หากมาช้าเกิน 30 นาทีทางร้านขออนุญาตปล่อยโต๊ะตามคิว</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
