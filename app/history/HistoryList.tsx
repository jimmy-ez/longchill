"use client";

import { useState } from "react";

interface Reservation {
    id: string;
    date: string;
    time: string;
    party_size: number;
    customer_name: string;
    phone: string;
    status: string;
    table_no: string;
}

const getStatusText = (status: string) => {
    switch (status) {
        case "pending": return "รอยืนยัน";
        case "confirmed": return "ยืนยันแล้ว";
        case "cancelled": return "ยกเลิกแล้ว";
        default: return status;
    }
};

const getStatusClass = (status: string) => {
    switch (status) {
        case "pending": return "status-pending";
        case "confirmed": return "status-confirmed";
        case "cancelled": return "status-cancelled";
        default: return "";
    }
};

const renderTableBadges = (tableStr: string | null | undefined) => {
    if (!tableStr || tableStr === "-") return "-";
    try {
        const parsed = JSON.parse(tableStr);
        if (Array.isArray(parsed)) {
            return (
                <div className="table-badges-container">
                    {parsed.map((t, i) => (
                        <span key={i} className="table-badge">{t}</span>
                    ))}
                </div>
            );
        }
    } catch {
        // Not a JSON array, fallback below
    }
    return <span className="table-badge">{tableStr}</span>;
};

export default function HistoryList({ reservations }: { reservations: Reservation[] }) {
    const [showPast, setShowPast] = useState(false);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = showPast
        ? reservations
        : reservations.filter((res) => new Date(res.date) >= today);

    return (
        <>
            <div className="history-toggle">
                <label className="toggle-label">
                    <span>แสดงการจองที่ผ่านมาแล้ว</span>
                    <button
                        type="button"
                        className={`toggle-switch ${showPast ? "toggle-on" : ""}`}
                        onClick={() => setShowPast(!showPast)}
                        aria-pressed={showPast}
                    >
                        <span className="toggle-knob" />
                    </button>
                </label>
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state animate-fade-in-up">
                    <div className="empty-icon">📝</div>
                    <p>{showPast ? "คุณยังไม่มีประวัติการจองโต๊ะ" : "ไม่มีรายการจองที่กำลังจะมาถึง"}</p>
                </div>
            ) : (
                <ul className="history-list">
                    {filtered.map((res, index) => (
                        <li
                            key={res.id}
                            className="history-card animate-fade-in-up"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="card-header">
                                <span className="res-date">
                                    {new Date(res.date).toLocaleDateString("th-TH", {
                                        year: "numeric", month: "long", day: "numeric"
                                    })}
                                </span>
                                <span className={`res-status ${getStatusClass(res.status)}`}>
                                    {getStatusText(res.status)}
                                </span>
                            </div>
                            <div className="card-body">
                                <div className="detail-row">
                                    <span className="label">เวลา:</span>
                                    <span className="value">{res.time ? res.time.slice(0, 5) : "-"} น.</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">จำนวน:</span>
                                    <span className="value">{res.party_size} ท่าน</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">โต๊ะ:</span>
                                    <div className="value">
                                        {renderTableBadges(res.table_no)}
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <span className="label">ชื่อผู้จอง:</span>
                                    <span className="value">{res.customer_name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">เบอร์ติดต่อ:</span>
                                    <span className="value">{res.phone}</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
