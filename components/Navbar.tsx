"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "./Navbar.css";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<unknown>(null);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const navLinks = [
        { href: "/", label: "หน้าแรก" },
        { href: "/menu", label: "รายการอาหาร" },
        { href: "/reservation", label: "จองโต๊ะล่วงหน้า" },
        { href: "/contact", label: "ติดต่อเรา" },
    ];

    return (
        <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
            <div className="navbar-inner container">
                <Link href="/" className="navbar-logo">
                    <Image
                        src="/logo-white.png"
                        alt="Longchill"
                        width={140}
                        height={50}
                        priority
                    />
                </Link>

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
                        {user ? (
                            <Link href="/admin" className="btn btn-primary btn-sm">
                                Dashboard
                            </Link>
                        ) : (
                            <Link href="/login" className="btn btn-secondary btn-sm">
                                Login
                            </Link>
                        )}
                    </div>
                </div>

                <button
                    className="navbar-toggle show-mobile"
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
