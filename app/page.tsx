import Link from "next/link";
import Image from "next/image";
import "./page.css";

export default function Home() {
  return (
    <div className="mobile-home">
      {/* Background */}
      <div className="home-bg">
        <Image
          src="/hero-bg.jpg"
          alt="Longchill ambiance"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div className="home-overlay"></div>
      </div>

      <div className="home-content container">
        {/* Header / Brand */}
        <div className="home-brand animate-fade-in-up">
          <Image
            src="/logo-white.png"
            alt="Longchill"
            width={220}
            height={80}
            className="home-logo"
            priority
          />
          <p className="home-subtitle">
            ความอร่อย บรรยากาศดี ที่จะทำให้คุณชิลล์
          </p>
        </div>

        {/* Quick Actions (Grid) */}
        <div className="quick-actions stagger-children">
          <Link href="/reservation" className="action-card animate-fade-in-up">
            <div className="action-icon">📅</div>
            <h3>จองโต๊ะล่วงหน้า</h3>
          </Link>

          <div className="action-row">
            <Link href="/menu" className="action-card small animate-fade-in-up">
              <div className="action-icon">📖</div>
              <h3>รายการอาหาร</h3>
            </Link>

            <a href="https://share.google/s8apeow460rh3IEF9" target="_blank" rel="noopener noreferrer" className="action-card small animate-fade-in-up">
              <div className="action-icon">📍</div>
              <h3>โลเคชั่น</h3>
            </a>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="events-section animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <div className="section-header">
            <h2>อีเว้นท์ที่กำลังจะมาถึง</h2>
            <Link href="/events" className="view-all">ดูทั้งหมด</Link>
          </div>

          <div className="events-scroll">
            <div className="event-card">
              <div className="event-date">
                <span className="day">25</span>
                <span className="month">ต.ค.</span>
              </div>
              <div className="event-info">
                <h4>Live Band: The Chillers</h4>
                <p>ดนตรีสดสุดชิลล์ พร้อมโปรโมชั่นเครื่องดื่ม</p>
              </div>
            </div>

            <div className="event-card">
              <div className="event-date">
                <span className="day">31</span>
                <span className="month">ต.ค.</span>
              </div>
              <div className="event-info">
                <h4>Halloween Night Party</h4>
                <p>แต่งผีรับเครื่องดื่มฟรี 1 แก้ว พร้อมกิจกรรม</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
