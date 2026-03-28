import { createClient } from "@/lib/supabase/server";
import EventCard from "@/components/EventCard";
import "./page.css";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Events — Longchill",
    description: "อีเว้นท์และกิจกรรมสุดพิเศษที่ Longchill",
};

export default async function EventsPage() {
    let events: any[] = [];

    try {
        const supabase = await createClient();

        const { data } = await supabase
            .from("events")
            .select("*")
            .eq("is_visible", true)
            .order("event_date")
            .order("event_time");

        events = data || [];
    } catch (e) {
        // Silently fail
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = events.filter((e) => new Date(e.event_date) >= today);
    const past = events.filter((e) => new Date(e.event_date) < today);

    return (
        <div className="events-page mobile-layout">
            <div className="events-page-header animate-fade-in-up">
                <h2>อีเว้นท์ทั้งหมด</h2>
                <p>กิจกรรมสุดพิเศษที่ Longchill</p>
            </div>

            <div className="events-page-content">
                {upcoming.length === 0 && past.length === 0 ? (
                    <div className="empty-state animate-fade-in-up">
                        <div className="empty-icon">🎉</div>
                        <p>ยังไม่มีอีเว้นท์ในขณะนี้</p>
                    </div>
                ) : (
                    <>
                        {upcoming.length > 0 && (
                            <div className="events-group animate-fade-in-up">
                                <h3 className="events-group-title">กำลังจะมาถึง</h3>
                                <div className="events-list">
                                    {upcoming.map((event, index) => (
                                        <EventCard key={event.id} event={event} priority={index === 0} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {past.length > 0 && (
                            <div className="events-group animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                                <h3 className="events-group-title past">ผ่านไปแล้ว</h3>
                                <div className="events-list past-list">
                                    {past.map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
