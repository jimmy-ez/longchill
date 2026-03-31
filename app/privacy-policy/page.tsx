import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "นโยบายความเป็นส่วนตัว — Longchill Mala & Bar",
    description: "นโยบายความเป็นส่วนตัวของ Longchill Mala & Bar",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="privacy-page">
            <div className="container">
                <div className="privacy-content animate-fade-in-up">
                    <h1>นโยบายความเป็นส่วนตัว</h1>
                    <p className="last-updated">อัปเดตล่าสุด: มีนาคม 2568</p>

                    <section>
                        <h2>1. ข้อมูลที่เราเก็บรวบรวม</h2>
                        <p>
                            เมื่อคุณเข้าสู่ระบบด้วย LINE, Facebook หรือ Google เราจะรับข้อมูลพื้นฐาน
                            ได้แก่ ชื่อ รูปโปรไฟล์ และ ID ของบัญชีจากผู้ให้บริการนั้นๆ
                            เพื่อใช้ในการยืนยันตัวตนและการจองโต๊ะ
                        </p>
                    </section>

                    <section>
                        <h2>2. วัตถุประสงค์ในการใช้ข้อมูล</h2>
                        <p>เราใช้ข้อมูลของคุณเพื่อ:</p>
                        <ul>
                            <li>ยืนยันตัวตนและจัดการบัญชีผู้ใช้</li>
                            <li>รับและจัดการการจองโต๊ะล่วงหน้า</li>
                            <li>ส่งการแจ้งเตือนที่เกี่ยวข้องกับการจองของคุณ</li>
                            <li>ปรับปรุงคุณภาพการให้บริการ</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. การแชร์ข้อมูล</h2>
                        <p>
                            เราไม่ขาย แลกเปลี่ยน หรือถ่ายโอนข้อมูลส่วนบุคคลของคุณให้บุคคลภายนอก
                            ยกเว้นในกรณีที่จำเป็นตามกฎหมายหรือเพื่อให้บริการแก่คุณโดยตรง
                        </p>
                    </section>

                    <section>
                        <h2>4. การเก็บรักษาข้อมูล</h2>
                        <p>
                            ข้อมูลของคุณจะถูกเก็บรักษาไว้ตลอดระยะเวลาที่คุณมีบัญชีกับเรา
                            หากคุณต้องการลบบัญชีและข้อมูลทั้งหมด กรุณาติดต่อเราผ่านช่องทางด้านล่าง
                        </p>
                    </section>

                    <section>
                        <h2>5. ความปลอดภัยของข้อมูล</h2>
                        <p>
                            เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลของคุณ
                            รวมถึงการเข้ารหัสข้อมูลและการจำกัดการเข้าถึงของบุคลากรภายใน
                        </p>
                    </section>

                    <section>
                        <h2>6. สิทธิ์ของคุณ</h2>
                        <p>คุณมีสิทธิ์:</p>
                        <ul>
                            <li>ขอดูข้อมูลส่วนบุคคลที่เราเก็บไว้</li>
                            <li>ขอแก้ไขข้อมูลที่ไม่ถูกต้อง</li>
                            <li>ขอลบข้อมูลส่วนบุคคลของคุณ</li>
                        </ul>
                    </section>

                    <section id="data-deletion">
                        <h2>7. การลบข้อมูลส่วนบุคคล</h2>
                        <p>
                            หากคุณต้องการลบข้อมูลส่วนบุคคลทั้งหมดที่เราเก็บไว้ สามารถดำเนินการได้ดังนี้:
                        </p>
                        <ul>
                            <li>ส่งคำขอมาที่อีเมล longchillowner3@gmail.com พร้อมระบุชื่อบัญชีและ provider ที่ใช้เข้าสู่ระบบ (LINE / Facebook / Google)</li>
                            <li>เราจะดำเนินการลบข้อมูลของคุณภายใน 30 วันทำการ</li>
                            <li>หลังจากลบข้อมูลแล้ว คุณจะไม่สามารถเข้าถึงประวัติการจองได้อีก</li>
                        </ul>
                    </section>

                    <section>
                        <h2>8. ติดต่อเรา</h2>
                        <p>
                            หากมีคำถามหรือต้องการใช้สิทธิ์เกี่ยวกับข้อมูลส่วนบุคคล กรุณาติดต่อ:
                        </p>
                        <p className="contact-info">
                            <strong>Longchill Mala & Bar</strong><br />
                        </p>
                    </section>

                    <Link href="/" className="btn btn-secondary back-btn">
                        ← กลับสู่หน้าแรก
                    </Link>
                </div>
            </div>

            <style>{`
                .privacy-page {
                    padding: calc(var(--nav-height) + 60px) 0 80px;
                    min-height: 100vh;
                }
                .privacy-content {
                    max-width: 760px;
                    margin: 0 auto;
                }
                .privacy-content h1 {
                    font-size: clamp(1.8rem, 4vw, 2.5rem);
                    margin-bottom: 8px;
                }
                .last-updated {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    margin-bottom: 48px;
                }
                .privacy-content section {
                    margin-bottom: 36px;
                }
                .privacy-content h2 {
                    font-size: 1.2rem;
                    color: var(--amber);
                    margin-bottom: 12px;
                }
                .privacy-content p {
                    color: var(--text-secondary);
                    line-height: 1.8;
                    margin-bottom: 12px;
                }
                .privacy-content ul {
                    color: var(--text-secondary);
                    padding-left: 24px;
                    line-height: 2;
                }
                .contact-info {
                    background: var(--bg-card);
                    border: 1px solid var(--border-subtle);
                    border-radius: 8px;
                    padding: 20px 24px;
                    line-height: 2 !important;
                }
                .back-btn {
                    margin-top: 16px;
                }
            `}</style>
        </div>
    );
}
