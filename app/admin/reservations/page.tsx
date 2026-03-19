"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Reservation {
    id: string;
    customer_name: string;
    email: string;
    phone: string | null;
    date: string;
    time: string;
    party_size: number;
    notes: string | null;
    status: string;
    created_at: string;
}

export default function AdminReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [filter, setFilter] = useState("all");

    const supabase = createClient();

    const fetchReservations = useCallback(async () => {
        let query = supabase
            .from("reservations")
            .select("*")
            .order("date", { ascending: false });

        if (filter !== "all") {
            query = query.eq("status", filter);
        }

        const { data } = await query;
        setReservations(data || []);
    }, [supabase, filter]);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    const updateStatus = async (id: string, status: string) => {
        await supabase.from("reservations").update({ status }).eq("id", id);
        fetchReservations();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div>
            <div className="admin-page-header">
                <h1>Reservations</h1>
                <div style={{ display: "flex", gap: 8 }}>
                    {["all", "pending", "confirmed", "cancelled", "completed"].map(
                        (s) => (
                            <button
                                key={s}
                                className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-ghost"
                                    }`}
                                onClick={() => setFilter(s)}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        )
                    )}
                </div>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Guest</th>
                            <th>Date & Time</th>
                            <th>Party</th>
                            <th>Status</th>
                            <th>Notes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservations.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: "center", padding: 40 }}>
                                    No reservations found.
                                </td>
                            </tr>
                        ) : (
                            reservations.map((res) => (
                                <tr key={res.id}>
                                    <td>
                                        <strong>{res.customer_name}</strong>
                                        <div
                                            style={{
                                                fontSize: "0.8rem",
                                                color: "var(--text-muted)",
                                            }}
                                        >
                                            {res.email}
                                            {res.phone && <> · {res.phone}</>}
                                        </div>
                                    </td>
                                    <td>
                                        {formatDate(res.date)}
                                        <div
                                            style={{
                                                fontSize: "0.85rem",
                                                color: "var(--amber)",
                                            }}
                                        >
                                            {res.time}
                                        </div>
                                    </td>
                                    <td>{res.party_size} guests</td>
                                    <td>
                                        <span className={`badge badge-${res.status}`}>
                                            {res.status}
                                        </span>
                                    </td>
                                    <td
                                        style={{
                                            maxWidth: 200,
                                            fontSize: "0.85rem",
                                            color: "var(--text-secondary)",
                                        }}
                                    >
                                        {res.notes || "—"}
                                    </td>
                                    <td>
                                        <div className="admin-table-actions">
                                            {res.status === "pending" && (
                                                <>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => updateStatus(res.id, "confirmed")}
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => updateStatus(res.id, "cancelled")}
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            {res.status === "confirmed" && (
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => updateStatus(res.id, "completed")}
                                                >
                                                    Complete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
