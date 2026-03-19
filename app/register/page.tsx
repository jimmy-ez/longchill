"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import "../login/page.css";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMsg("");

        if (password !== confirmPassword) {
            setStatus("error");
            setErrorMsg("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setStatus("error");
            setErrorMsg("Password must be at least 6 characters.");
            return;
        }

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            setStatus("success");
        } catch (err: unknown) {
            setStatus("error");
            setErrorMsg(
                err instanceof Error ? err.message : "Registration failed. Please try again."
            );
        }
    };

    if (status === "success") {
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
                    <h1>Check Your Email</h1>
                    <p className="auth-subtitle" style={{ marginBottom: 24 }}>
                        We&apos;ve sent a confirmation link to <strong>{email}</strong>.
                        Please verify your email to continue.
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => router.push("/login")}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

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
                <h1>Create Account</h1>
                <p className="auth-subtitle">Register for admin access</p>

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
                            placeholder="Minimum 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="form-input"
                            placeholder="Repeat your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                                <span className="spinner"></span> Creating account...
                            </>
                        ) : (
                            "Register"
                        )}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link href="/login" className="auth-link">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
