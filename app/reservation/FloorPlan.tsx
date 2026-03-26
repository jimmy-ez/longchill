"use client";

import React from "react";

// ── Reusable Table Button ──────────────────────────────────────────────
interface TableBtnProps {
    id: string;
    occupied: boolean;
    selected: boolean;
    onToggle: (id: string) => void;
}

function TableBtn({ id, occupied, selected, onToggle }: TableBtnProps) {
    const status = occupied ? "occupied" : selected ? "selected" : "available";
    return (
        <button
            type="button"
            className={`fp-table fp-table--${status}`}
            onClick={() => !occupied && onToggle(id)}
            disabled={occupied}
            aria-label={`โต๊ะ ${id} – ${occupied ? "จองแล้ว" : selected ? "เลือกอยู่" : "ว่าง"}`}
        >
            <span className="fp-table-id">{id}</span>
            {occupied && <span className="fp-table-icon">🔒</span>}
            {selected && <span className="fp-table-icon">✓</span>}
        </button>
    );
}

// ── Props ──────────────────────────────────────────────────────────────
interface FloorPlanProps {
    occupiedTables: string[];
    selectedTables: string[];
    onToggle: (tableId: string) => void;
    partySize: number;
    maxTables: number;
}

// ── Component ──────────────────────────────────────────────────────────
export default function FloorPlan({
    occupiedTables,
    selectedTables,
    onToggle,
    partySize,
    maxTables,
}: FloorPlanProps) {
    const isOccupied = (id: string) => occupiedTables.includes(id);
    const isSelected = (id: string) => selectedTables.includes(id);
    const T = (id: string) => (
        <TableBtn
            key={id}
            id={id}
            occupied={isOccupied(id)}
            selected={isSelected(id)}
            onToggle={onToggle}
        />
    );

    const selected = selectedTables.length;

    return (
        <div className="fp-wrapper">

            {/* ── Counter ── */}
            <div className="fp-counter">
                <span className={selected >= maxTables ? "fp-counter--ok" : "fp-counter--warn"}>
                    เลือกแล้ว {selected}/{maxTables} โต๊ะ
                    {partySize > 4 && ` (สำหรับ ${partySize} คน)`}
                </span>
            </div>

            {/* ── Legend ── */}
            <div className="fp-legend">
                <span className="fp-legend-item"><span className="fp-dot fp-dot--available" />ว่าง</span>
                <span className="fp-legend-item"><span className="fp-dot fp-dot--selected" />เลือก</span>
                <span className="fp-legend-item"><span className="fp-dot fp-dot--occupied" />จองแล้ว</span>
            </div>

            {/* ══════════════════ Standard Zone (ชั้นล่าง) ══════════════════ */}
            <div className="fp-zone fp-zone--std">

                {/* Header row: zone label + WELCOME sign */}
                <div className="fp-std-topbar">
                    <div className="fp-zone-header fp-zone-header--std">Standard Zone</div>
                    <div className="fp-welcome-badge">🚪 WELCOME</div>
                </div>

                {/* Main layout: tables + sidebar */}
                <div className="fp-std-layout">

                    {/* ── Table area ── */}
                    <div className="fp-std-main">

                        {/* T1–T20: 4 rows × 5 cols */}
                        <div className="fp-grid fp-grid--5">
                            {T("T1")}{T("T2")}{T("T3")}{T("T4")}{T("T5")}
                            {T("T6")}{T("T7")}{T("T8")}{T("T9")}{T("T10")}
                            {T("T11")}{T("T12")}{T("T13")}{T("T14")}{T("T15")}
                            {T("T16")}{T("T17")}{T("T18")}{T("T19")}{T("T20")}
                        </div>

                        {/*
                         * Bottom row (matches image):
                         *  [T21]  [             Stage (arch)            ]  [T23][T24]
                         *  [T22]                                             [Monitor]
                         */}
                        <div className="fp-bottom-area">

                            {/* T21, T22 stacked */}
                            <div className="fp-vert-pair">
                                {T("T21")}
                                {T("T22")}
                            </div>

                            {/* Stage — arch / dome shape */}
                            <div className="fp-stage">
                                <span className="fp-stage-text">Stage</span>
                            </div>

                            {/* T23, T24 side-by-side, Monitor below */}
                            <div className="fp-bottom-right">
                                <div className="fp-horiz-pair">
                                    {T("T23")}{T("T24")}
                                </div>
                                <div className="fp-monitor">📺 Monitor</div>
                            </div>

                        </div>
                    </div>

                    {/* ── Right sidebar: Cashier (top) + WC (bottom) ── */}
                    <div className="fp-sidebar">
                        <div className="fp-sidebar-item fp-sidebar--cashier">
                            <span>🖥️</span>
                            <span>แคช<br/>เชียร์</span>
                        </div>
                        <div className="fp-sidebar-item fp-sidebar--wc">
                            <span>🚻</span>
                            <span>WC</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* ══════════════════ Staircase Divider ══════════════════════ */}
            <div className="fp-stair-divider">
                <div className="fp-stair-line" />
                <div className="fp-stair-badge">
                    🪜 บันไดขึ้น VIP Zone (ชั้นลอย)
                </div>
                <div className="fp-stair-line" />
            </div>

            {/* ══════════════════ VIP Zone (ชั้นลอย) ════════════════════ */}
            <div className="fp-zone fp-zone--vip">

                {/* Plants + header */}
                <div className="fp-vip-header">
                    <span className="fp-plant">🌿</span>
                    <div className="fp-zone-header fp-zone-header--vip">VIP Zone — ชั้นลอย</div>
                    <span className="fp-plant">🌿</span>
                </div>

                {/* Row 1: V1 V2 V3 V4 */}
                <div className="fp-grid fp-grid--4">
                    {T("V1")}{T("V2")}{T("V3")}{T("V4")}
                </div>

                {/* Row 2: V5 V6 V7 V8 */}
                <div className="fp-grid fp-grid--4">
                    {T("V5")}{T("V6")}{T("V7")}{T("V8")}
                </div>

                {/*
                 * Row 3 (matches image):
                 *   V9 [empty gap] V10 V11
                 * The staircase access is from Standard zone below.
                 */}
                <div className="fp-grid fp-grid--4">
                    {T("V9")}
                    <div className="fp-empty-cell" />
                    {T("V10")}
                    {T("V11")}
                </div>

                {/*
                 * Row 4 (matches image):
                 *   [V12 V13] ··· gap ··· [V14 V15]
                 */}
                <div className="fp-vip-split">
                    <div className="fp-grid fp-grid--2">
                        {T("V12")}{T("V13")}
                    </div>
                    <div className="fp-grid fp-grid--2">
                        {T("V14")}{T("V15")}
                    </div>
                </div>

            </div>

        </div>
    );
}
