"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "./Navbar.css";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { data: session } = useSession();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);



    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const navLinks = [
        { href: "/", label: "หน้าแรก" },
        { href: "/menu", label: "รายการอาหาร" },
        { href: "/reservation", label: "จองโต๊ะล่วงหน้า" },
        { href: "/history", label: "รายการจองของฉัน" },
        { href: "/contact", label: "ติดต่อเรา" },
    ];

    const showBackBtn = ["/reservation", "/menu", "/history", "/contact"].includes(pathname);

    return (
        <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
            <div className="navbar-inner container">
                <div className="navbar-left">
                    {showBackBtn && (
                        <Link href="/" className="navbar-back" aria-label="กลับหน้าแรก">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </Link>
                    )}
                    <Link href="/" className="navbar-logo">
                        <Image
                            src="/logo-white.png"
                            alt="Longchill"
                            width={140}
                            height={50}
                            priority
                        />
                    </Link>
                </div>

                <div className={`navbar-links ${isOpen ? "navbar-links-open" : ""}`}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`navbar-link ${pathname === link.href ? "navbar-link-active" : ""
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="navbar-actions">
                        {session?.user ? (
                            <div className="user-profile">
                                {session.user.image && (
                                    <Image
                                        src={session.user.image}
                                        alt={session.user.name || "User"}
                                        width={32}
                                        height={32}
                                        className="user-avatar"
                                        unoptimized
                                    />
                                )}
                                <span className="user-name">{session.user.name}</span>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="btn btn-secondary btn-sm"
                                >
                                    ออกจากระบบ
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="btn btn-primary btn-sm">
                                เข้าสู่ระบบ
                            </Link>
                        )}
                    </div>
                </div>

                <button
                    className="navbar-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={`hamburger ${isOpen ? "hamburger-open" : ""}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>
            </div>
        </nav>
    );
}
