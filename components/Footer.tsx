import Link from "next/link";
import "./Footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">

                    <div className="footer-col">
                        <h4>เมนู</h4>
                        <ul>
                            <li><Link href="/">หน้าแรก</Link></li>
                            <li><Link href="/menu">รายการอาหาร</Link></li>
                            <li><Link href="/reservation">จองโต๊ะล่วงหน้า</Link></li>
                            <li><Link href="/contact">ติดต่อเรา</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>เวลาเปิดบริการ</h4>
                        <ul className="hours-list">
                            <li>
                                <span>จันทร์ - ศุกร์</span>
                                <span>17:00 – 00:00</span>
                            </li>
                            <li>
                                <span>เสาร์ - อาทิตย์</span>
                                <span>17:00 – 02:00</span>
                            </li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>ติดต่อเรา</h4>
                        <ul>
                            <li>📍 Longchill Bar & Restaurant</li>
                            <li>📞 (+66) 99-999-9999</li>
                            <li>✉️ hello@longchill.com</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} Power by J126s. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
