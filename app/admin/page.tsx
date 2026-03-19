import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Admin Dashboard — Longchill",
};

export default async function AdminDashboard() {
    let reservationCount = 0;
    let pendingCount = 0;
    let messageCount = 0;
    let unreadCount = 0;
    let menuItemCount = 0;

    try {
        const supabase = await createClient();

        const { count: resCount } = await supabase
            .from("reservations")
            .select("*", { count: "exact", head: true });
        reservationCount = resCount || 0;

        const { count: penCount } = await supabase
            .from("reservations")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending");
        pendingCount = penCount || 0;

        const { count: msgCount } = await supabase
            .from("contact_messages")
            .select("*", { count: "exact", head: true });
        messageCount = msgCount || 0;

        const { count: unrCount } = await supabase
            .from("contact_messages")
            .select("*", { count: "exact", head: true })
            .eq("is_read", false);
        unreadCount = unrCount || 0;

        const { count: itemCount } = await supabase
            .from("menu_items")
            .select("*", { count: "exact", head: true });
        menuItemCount = itemCount || 0;
    } catch {
        // Database not connected yet
    }

    return (
        <div>
            <div className="admin-page-header">
                <h1>Dashboard</h1>
            </div>

            <div className="stats-grid">
                <Link href="/admin/reservations" style={{ textDecoration: "none" }}>
                    <div className="stat-card">
                        <div className="stat-icon">📅</div>
                        <div className="stat-value">{pendingCount}</div>
                        <div className="stat-label">Pending Reservations</div>
                    </div>
                </Link>

                <Link href="/admin/reservations" style={{ textDecoration: "none" }}>
                    <div className="stat-card">
                        <div className="stat-icon">📋</div>
                        <div className="stat-value">{reservationCount}</div>
                        <div className="stat-label">Total Reservations</div>
                    </div>
                </Link>

                <Link href="/admin/messages" style={{ textDecoration: "none" }}>
                    <div className="stat-card">
                        <div className="stat-icon">💬</div>
                        <div className="stat-value">{unreadCount}</div>
                        <div className="stat-label">Unread Messages</div>
                    </div>
                </Link>

                <Link href="/admin/menu" style={{ textDecoration: "none" }}>
                    <div className="stat-card">
                        <div className="stat-icon">🍽️</div>
                        <div className="stat-value">{menuItemCount}</div>
                        <div className="stat-label">Menu Items</div>
                    </div>
                </Link>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📨</div>
                    <div className="stat-value">{messageCount}</div>
                    <div className="stat-label">Total Messages</div>
                </div>
            </div>
        </div>
    );
}
