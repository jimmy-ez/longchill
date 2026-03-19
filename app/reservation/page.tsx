"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "./page.css";

export default function ReservationPage() {
    const [formData, setFormData] = useState({
        customer_name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        party_size: "2",
        notes: "",
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMsg("");

        try {
            const supabase = createClient();
            const { error } = await supabase.from("reservations").insert({
                customer_name: formData.customer_name,
                email: formData.email,
                phone: formData.phone,
                date: formData.date,
                time: formData.time,
                party_size: parseInt(formData.party_size),
                notes: formData.notes || null,
            });

            if (error) throw error;

            setStatus("success");
            setFormData({
                customer_name: "",
                email: "",
                phone: "",
                date: "",
                time: "",
                party_size: "2",
                notes: "",
            });
        } catch (err: unknown) {
            setStatus("error");
            setErrorMsg(
                err instanceof Error ? err.message : "Something went wrong. Please try again."
            );
        }
    };

    // Get minimum date (today)
    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="reservation-page">
            <section className="page-header">
                <div className="container">
                    <div className="section-heading">
                        <div className="accent-line"></div>
                        <h1>Reserve a Table</h1>
                        <p>Book your spot and let the good times roll.</p>
                    </div>
                </div>
            </section>

            <section className="reservation-content">
                <div className="container">
                    <div className="reservation-grid">
                        <div className="reservation-form-wrapper">
                            {status === "success" ? (
                                <div className="success-card animate-fade-in-up">
                                    <div className="success-icon">✅</div>
                                    <h3>Reservation Submitted!</h3>
                                    <p>
                                        Thank you! We&apos;ll confirm your reservation shortly via
                                        email.
                                    </p>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setStatus("idle")}
                                    >
                                        Make Another Reservation
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="reservation-form">
                                    {status === "error" && (
                                        <div className="alert alert-error">{errorMsg}</div>
                                    )}

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="customer_name">Full Name *</label>
                                            <input
                                                id="customer_name"
                                                name="customer_name"
                                                type="text"
                                                className="form-input"
                                                placeholder="John Doe"
                                                value={formData.customer_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="email">Email *</label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                className="form-input"
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="phone">Phone</label>
                                            <input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                className="form-input"
                                                placeholder="(+66) 99-999-9999"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="party_size">Party Size *</label>
                                            <select
                                                id="party_size"
                                                name="party_size"
                                                className="form-input"
                                                value={formData.party_size}
                                                onChange={handleChange}
                                                required
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map((n) => (
                                                    <option key={n} value={n}>
                                                        {n} {n === 1 ? "Guest" : "Guests"}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="date">Date *</label>
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
                                        <div className="form-group">
                                            <label htmlFor="time">Time *</label>
                                            <select
                                                id="time"
                                                name="time"
                                                className="form-input"
                                                value={formData.time}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select time</option>
                                                {[
                                                    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
                                                    "20:00", "20:30", "21:00", "21:30", "22:00", "22:30",
                                                    "23:00", "23:30",
                                                ].map((t) => (
                                                    <option key={t} value={t}>
                                                        {t}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="notes">Special Requests</label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            className="form-input"
                                            placeholder="Any special requests or dietary requirements..."
                                            value={formData.notes}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-full"
                                        disabled={status === "loading"}
                                    >
                                        {status === "loading" ? (
                                            <>
                                                <span className="spinner"></span> Submitting...
                                            </>
                                        ) : (
                                            "Reserve Now"
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                        <div className="reservation-info">
                            <div className="info-card">
                                <h3>📍 Location</h3>
                                <p>Longchill Bar & Restaurant</p>
                            </div>
                            <div className="info-card">
                                <h3>🕐 Opening Hours</h3>
                                <p>Mon – Thu: 17:00 – 00:00</p>
                                <p>Fri – Sat: 17:00 – 02:00</p>
                                <p>Sun: 17:00 – 23:00</p>
                            </div>
                            <div className="info-card">
                                <h3>📞 Call Us</h3>
                                <p>(+66) 99-999-9999</p>
                            </div>
                            <div className="info-card">
                                <h3>💡 Good to Know</h3>
                                <p>
                                    Walk-ins are welcome but reservations are recommended for
                                    weekends and groups of 6+.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
