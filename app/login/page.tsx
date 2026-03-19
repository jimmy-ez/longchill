"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import "./page.css";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMsg("");

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            router.push("/admin");
            router.refresh();
        } catch (err: unknown) {
            setStatus("error");
            setErrorMsg(
                err instanceof Error ? err.message : "Invalid email or password."
            );
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card animate-fade-in-up">
                <div className="auth-logo">
                    <Image
                        src="/logo-white.png"
                        alt="Longchill"
                        width={160}
                        height={56}
                    />
                </div>
                <h1>Welcome Back</h1>
                <p className="auth-subtitle">Sign in to your admin dashboard</p>

                {status === "error" && (
                    <div className="alert alert-error">{errorMsg}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="admin@longchill.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                                <span className="spinner"></span> Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <p className="auth-footer">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="auth-link">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
