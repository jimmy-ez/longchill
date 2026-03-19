"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "./page.css";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMsg("");

        try {
            const supabase = createClient();
            const { error } = await supabase.from("contact_messages").insert({
                name: formData.name,
                email: formData.email,
                subject: formData.subject || null,
                message: formData.message,
            });

            if (error) throw error;

            setStatus("success");
            setFormData({ name: "", email: "", subject: "", message: "" });
        } catch (err: unknown) {
            setStatus("error");
            setErrorMsg(
                err instanceof Error ? err.message : "Something went wrong. Please try again."
            );
        }
    };

    return (
        <div className="contact-page">
            <section className="page-header">
                <div className="container">
                    <div className="section-heading">
                        <div className="accent-line"></div>
                        <h1>Contact Us</h1>
                        <p>Have a question or feedback? We&apos;d love to hear from you.</p>
                    </div>
                </div>
            </section>

            <section className="contact-content">
                <div className="container">
                    <div className="contact-grid">
                        <div className="contact-form-wrapper">
                            {status === "success" ? (
                                <div className="success-card animate-fade-in-up">
                                    <div className="success-icon">📨</div>
                                    <h3>Message Sent!</h3>
                                    <p>We&apos;ll get back to you as soon as possible.</p>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setStatus("idle")}
                                    >
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="contact-form">
                                    {status === "error" && (
                                        <div className="alert alert-error">{errorMsg}</div>
                                    )}

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="name">Name *</label>
                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                className="form-input"
                                                placeholder="Your name"
                                                value={formData.name}
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
                                                placeholder="you@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="subject">Subject</label>
                                        <input
                                            id="subject"
                                            name="subject"
                                            type="text"
                                            className="form-input"
                                            placeholder="What is this about?"
                                            value={formData.subject}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="message">Message *</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            className="form-input"
                                            placeholder="Your message..."
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-full"
                                        disabled={status === "loading"}
                                    >
                                        {status === "loading" ? (
                                            <>
                                                <span className="spinner"></span> Sending...
                                            </>
                                        ) : (
                                            "Send Message"
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                        <div className="contact-info">
                            <div className="info-card contact-map-card">
                                <h3>📍 Find Us</h3>
                                <p>Longchill Bar & Restaurant</p>
                                <p className="text-muted">Your favorite spot to unwind.</p>
                            </div>
                            <div className="info-card">
                                <h3>📞 Call or Text</h3>
                                <p>(+66) 99-999-9999</p>
                            </div>
                            <div className="info-card">
                                <h3>✉️ Email</h3>
                                <p>hello@longchill.com</p>
                            </div>
                            <div className="info-card">
                                <h3>🕐 Hours</h3>
                                <p>Mon – Thu: 17:00 – 00:00</p>
                                <p>Fri – Sat: 17:00 – 02:00</p>
                                <p>Sun: 17:00 – 23:00</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
