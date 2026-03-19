"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Message {
    id: string;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    is_read: boolean;
    created_at: string;
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    const supabase = createClient();

    const fetchMessages = useCallback(async () => {
        const { data } = await supabase
            .from("contact_messages")
            .select("*")
            .order("created_at", { ascending: false });
        setMessages(data || []);
    }, [supabase]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const markAsRead = async (msg: Message) => {
        if (!msg.is_read) {
            await supabase
                .from("contact_messages")
                .update({ is_read: true })
                .eq("id", msg.id);
        }
        setSelectedMessage({ ...msg, is_read: true });
        fetchMessages();
    };

    const deleteMessage = async (id: string) => {
        if (!confirm("Delete this message?")) return;
        await supabase.from("contact_messages").delete().eq("id", id);
        setSelectedMessage(null);
        fetchMessages();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div>
            <div className="admin-page-header">
                <h1>Messages</h1>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    {messages.filter((m) => !m.is_read).length} unread
                </span>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>From</th>
                            <th>Subject</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {messages.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: "center", padding: 40 }}>
                                    No messages yet.
                                </td>
                            </tr>
                        ) : (
                            messages.map((msg) => (
                                <tr
                                    key={msg.id}
                                    style={{
                                        fontWeight: msg.is_read ? "normal" : "600",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => markAsRead(msg)}
                                >
                                    <td style={{ width: 20 }}>
                                        {!msg.is_read && (
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: "50%",
                                                    background: "var(--amber)",
                                                }}
                                            ></span>
                                        )}
                                    </td>
                                    <td>
                                        <strong>{msg.name}</strong>
                                        <div
                                            style={{
                                                fontSize: "0.8rem",
                                                color: "var(--text-muted)",
                                                fontWeight: "normal",
                                            }}
                                        >
                                            {msg.email}
                                        </div>
                                    </td>
                                    <td>{msg.subject || "No subject"}</td>
                                    <td style={{ whiteSpace: "nowrap" }}>
                                        {formatDate(msg.created_at)}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteMessage(msg.id);
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Message Detail Modal */}
            {selectedMessage && (
                <div
                    className="modal-overlay"
                    onClick={() => setSelectedMessage(null)}
                >
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "start",
                                marginBottom: 20,
                            }}
                        >
                            <div>
                                <h2 style={{ marginBottom: 4 }}>
                                    {selectedMessage.subject || "No Subject"}
                                </h2>
                                <p
                                    style={{
                                        color: "var(--text-secondary)",
                                        fontSize: "0.85rem",
                                    }}
                                >
                                    From <strong>{selectedMessage.name}</strong> (
                                    {selectedMessage.email}) ·{" "}
                                    {formatDate(selectedMessage.created_at)}
                                </p>
                            </div>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setSelectedMessage(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <div
                            style={{
                                background: "var(--bg-secondary)",
                                borderRadius: 8,
                                padding: 20,
                                lineHeight: 1.7,
                                color: "var(--text-primary)",
                                whiteSpace: "pre-wrap",
                            }}
                        >
                            {selectedMessage.message}
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => deleteMessage(selectedMessage.id)}
                            >
                                Delete
                            </button>
                            <a
                                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || "Your message to Longchill"
                                    }`}
                                className="btn btn-primary btn-sm"
                            >
                                Reply via Email
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
