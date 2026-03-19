import Link from "next/link";
import "./Footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <h3 className="footer-logo-text">Longchill</h3>
                        <p className="footer-tagline">ลองชิลล์</p>
                        <p className="footer-desc">
                            Where great food meets good vibes. Unwind with craft cocktails,
                            delicious bites, and the perfect chill atmosphere.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/menu">Menu</Link></li>
                            <li><Link href="/reservation">Reservation</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Opening Hours</h4>
                        <ul className="hours-list">
                            <li>
                                <span>Monday – Thursday</span>
                                <span>17:00 – 00:00</span>
                            </li>
                            <li>
                                <span>Friday – Saturday</span>
                                <span>17:00 – 02:00</span>
                            </li>
                            <li>
                                <span>Sunday</span>
                                <span>17:00 – 23:00</span>
                            </li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Contact</h4>
                        <ul>
                            <li>📍 Longchill Bar & Restaurant</li>
                            <li>📞 (+66) 99-999-9999</li>
                            <li>✉️ hello@longchill.com</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} Longchill. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
