"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import "./admin.css";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    const navItems = [
        { href: "/admin", label: "Dashboard", icon: "📊" },
        { href: "/admin/menu", label: "Menu", icon: "🍽️" },
        { href: "/admin/reservations", label: "Reservations", icon: "📅" },
        { href: "/admin/messages", label: "Messages", icon: "💬" },
    ];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <Link href="/">
                        <Image
                            src="/logo-white.png"
                            alt="Longchill"
                            width={120}
                            height={42}
                        />
                    </Link>
                    <span className="admin-badge-label">Admin</span>
                </div>

                <nav className="admin-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`admin-nav-link ${pathname === item.href ? "admin-nav-link-active" : ""
                                }`}
                        >
                            <span className="admin-nav-icon">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <Link href="/" className="admin-nav-link">
                        <span className="admin-nav-icon">🌐</span>
                        View Site
                    </Link>
                    <button onClick={handleSignOut} className="admin-nav-link admin-logout">
                        <span className="admin-nav-icon">🚪</span>
                        Sign Out
                    </button>
                </div>
            </aside>

            <div className="admin-main">
                {children}
            </div>
        </div>
    );
}
