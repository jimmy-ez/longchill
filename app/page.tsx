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
        {events.length > 0 && (
          <div className="events-section animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="section-header">
              <h2>อีเว้นท์ที่กำลังจะมาถึง</h2>
              <Link href="/events" className="view-all">ดูทั้งหมด</Link>
            </div>

            <div className="events-scroll">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
