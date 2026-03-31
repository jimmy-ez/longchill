import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import EventCard from "@/components/EventCard";
import "./page.css";

export const dynamic = "force-dynamic";

export default async function Home() {
  let events: any[] = [];

  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("is_visible", true)
      .gte("event_date", today)
      .order("event_date")
      .order("event_time")
      .limit(4);

    events = data || [];
  } catch (e) {
    // Silently fail — homepage still renders
  }

  return (
    <div className="mobile-home">
      {/* Background */}
      <div className="home-bg">
        <Image
          src="/hero-bg-1.png"
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
            style={{ width: "auto", height: "auto" }}
          />
          <p style={{ fontSize: "20px", color: "#9d9999ff", fontStyle: "italic" }}>Long Nights Chill Vibes</p>
          <p style={{ fontSize: "16px", color: "#9d9999ff", fontStyle: "italic" }}>หม่าล่า เครื่องดื่ม ดนตรีสด</p>
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

            <a href="https://maps.app.goo.gl/W33qzcK1kzxWtqnv6?g_st=il" target="_blank" rel="noopener noreferrer" className="action-card small animate-fade-in-up">
              <div className="action-icon">📍</div>
              <h3>โลเคชั่น</h3>
            </a>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "0.5rem" }} className="animate-fade-in-up">
          <a
            href="https://maps.app.goo.gl/W33qzcK1kzxWtqnv6?g_st=il"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#bbb", textDecoration: "underline", fontSize: "14px" }}
          >
            รีวิวจากลูกค้าบน Google
          </a>
        </div>

        {/* Upcoming Events */}
        {events.length > 0 && (
          <div className="events-section animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="section-header">
              <h2>อีเว้นท์ที่กำลังจะมาถึง</h2>
              <Link href="/events" className="view-all">ดูทั้งหมด</Link>
            </div>

            <div className="events-scroll">
              {events.map((event, index) => (
                <EventCard key={event.id} event={event} priority={index === 0} />
              ))}
            </div>
          </div>
        )}

        {/* Social Media Section */}
        <div className="social-section animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <div className="section-header" style={{ justifyContent: "center" }}>
            <h2>ติดตามเรา</h2>
          </div>
          <div className="social-links-row">
            <a href="https://lin.ee/QbUYUCS" target="_blank" rel="noopener noreferrer" className="social-link">
              <Image src="/icons/line.png" alt="LINE OA" width={42} height={42} className="social-img" />
            </a>
            <a href="https://www.facebook.com/Longchillbar" target="_blank" rel="noopener noreferrer" className="social-link">
              <Image src="/icons/facebook.png" alt="Facebook" width={42} height={42} className="social-img" />
            </a>
            <a href="https://www.instagram.com/longchill.bar" target="_blank" rel="noopener noreferrer" className="social-link">
              <Image src="/icons/ig.png" alt="Instagram" width={42} height={42} className="social-img" />
            </a>
            <a href="https://www.tiktok.com/@longchill.bar" target="_blank" rel="noopener noreferrer" className="social-link">
              <Image src="/icons/tiktok.png" alt="TikTok" width={42} height={42} className="social-img" />
            </a>
          </div>
        </div>

        {/* Hidden H1 for SEO */}
        <h1 className="sr-only">{"Longchill Mala & Bar (ลองชิลล์) — บาร์ ถนนติวานนท์ ปทุมธานี ที่ชิลล์ที่สุด พบกับหม่าล่ารสเด็ด เครื่องดื่มหลากหลาย และดนตรีสดในบรรยากาศสุดชิลล์"}</h1>
      </div>
    </div>
  );
}
