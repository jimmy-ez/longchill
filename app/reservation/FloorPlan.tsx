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

            {/* ══════════════════ MAP LAYOUT ══════════════════ */}
            <div className="fp-board">
                {/* ── Top Area ── */}
                <div className="fp-top-area">
                    <div className="fp-left-col">
                        <div className="fp-box fp-bar-nam">
                            <span className="fp-text-vertical">ทางเข้า</span>
                        </div>
                        <div className="fp-wall-line"></div>
                    </div>

                    <div className="fp-main-area">
                        <div className="fp-top-headers">
                            <div className="fp-box fp-counter">เคาน์เตอร์</div>
                            <div className="fp-box fp-restroom">ห้องน้ำ</div>
                        </div>

                        <div className="fp-top-tables">
                            <div className="fp-t-grid">
                                <div className="fp-col">{T("T5")}{T("T4")}{T("T3")}{T("T2")}{T("T1")}</div>
                                <div className="fp-col">{T("T10")}{T("T9")}{T("T8")}{T("T7")}{T("T6")}</div>
                                <div className="fp-col">{T("T15")}{T("T14")}{T("T13")}{T("T12")}{T("T11")}</div>
                                <div className="fp-col">{T("T20")}{T("T19")}{T("T18")}{T("T17")}{T("T16")}</div>
                            </div>

                            <div className="fp-t-right">
                                <div className="fp-t-right-top">
                                    <div className="fp-col">{T("T24")}{T("T23")}</div>
                                    <div className="fp-box fp-tv">ทีวี</div>
                                </div>
                                <div className="fp-box fp-stage">เวที</div>
                                <div className="fp-t-right-bottom">
                                    {T("T21")}{T("T22")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Middle Divider ── */}
                <div className="fp-divider">
                    <div className="fp-hatch"></div>
                    <div className="fp-box fp-stairs">บันได</div>
                    <div className="fp-hatch"></div>
                </div>

                {/* ── Bottom Area ── */}
                <div className="fp-bottom-area">
                    <div className="fp-left-col">
                        <div className="fp-wall-line fp-wall-line-bottom"></div>
                    </div>

                    <div className="fp-main-area fp-v-grid-wrapper">
                        <div className="fp-v-grid">
                            <div className="fp-col">
                                {T("V4")}{T("V3")}{T("V2")}{T("V1")}
                            </div>
                            <div className="fp-col">
                                {T("V8")}{T("V7")}{T("V6")}{T("V5")}
                            </div>
                            <div className="fp-col fp-col-v11">
                                <div className="fp-v11-wrapper">{T("V11")}</div>
                                <div className="fp-v-bottom-two">
                                    {T("V10")}{T("V9")}
                                </div>
                            </div>
                            <div className="fp-col">
                                {T("V15")}{T("V14")}{T("V13")}{T("V12")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
