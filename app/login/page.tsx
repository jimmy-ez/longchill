"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./page.css";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleLogin = async (provider: string) => {
        setIsLoading(provider);
        await signIn(provider, { callbackUrl: '/reservation' });
    };

    return (
        <div className="login-container">
            <div className="login-card animate-fade-in-up">
                <Link href="/" className="login-logo-link">
                    <Image
                        src="/logo-white.png"
                        alt="Longchill"
                        width={200}
                        height={70}
                        priority
                    />
                </Link>
                <div className="login-header">
                    <h1>เข้าสู่ระบบ</h1>
                    <p>เพื่อดำเนินการจองโต๊ะล่วงหน้าและรับสิทธิพิเศษต่างๆ</p>
                </div>

                <div className="social-login-grid">
                    <button
                        className="social-btn line-btn"
                        onClick={() => handleLogin('line')}
                        disabled={isLoading !== null}
                    >
                        {isLoading === 'line' ? (
                            <span className="spinner small"></span>
                        ) : (
                            <>
                                <Image src="/icons/line.png" alt="LINE" width={24} height={24} className="social-icon" />
                                ดำเนินการต่อด้วย LINE
                            </>
                        )}
                    </button>

                    <button
                        className="social-btn facebook-btn"
                        onClick={() => handleLogin('facebook')}
                        disabled={isLoading !== null}
                    >
                        {isLoading === 'facebook' ? (
                            <span className="spinner small"></span>
                        ) : (
                            <>
                                <Image src="/icons/facebook.png" alt="Facebook" width={24} height={24} className="social-icon" />
                                ดำเนินการต่อด้วย Facebook
                            </>
                        )}
                    </button>

                    {/* <button
                        className="social-btn google-btn"
                        onClick={() => handleLogin('google')}
                        disabled={isLoading !== null}
                    >
                        {isLoading === 'google' ? (
                            <span className="spinner small login-spinner-dark"></span>
                        ) : (
                            <>
                                <Image src="/icons/google.png" alt="Google" width={24} height={24} className="social-icon" />
                                ดำเนินการต่อด้วย Google
                            </>
                        )}
                    </button> */}
                </div>

                <div className="login-footer">
                    <p>การเข้าสู่ระบบเป็นการยอมรับเงื่อนไขและนโยบายความเป็นส่วนตัวของเรา</p>
                    <Link href="/" className="back-link">
                        กลับสู่หน้าแรก
                    </Link>
                </div>
            </div>
        </div>
    );
}
