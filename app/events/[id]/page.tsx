import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import "./page.css";

export const dynamic = "force-dynamic";

const THAI_MONTHS = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const supabase = await createClient();
    const { data: event, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .eq("is_visible", true)
        .maybeSingle();

    if (error || !event) {
        notFound();
    }

    const d = new Date(event.event_date);
    const day = d.getDate();
    const month = THAI_MONTHS[d.getMonth()];
    const year = d.getFullYear() + 543;
    const timeStr = event.event_time ? event.event_time.slice(0, 5) : null;

    return (
        <div className="event-detail-page mobile-layout">
            {event.image_url && (
                <div className="event-detail-hero">
                    <Image
                        src={event.image_url}
                        alt={event.name}
                        fill
                        style={{ objectFit: "cover" }}
                        priority
                        unoptimized
                    />
                    <div className="event-detail-hero-overlay" />
                </div>
            )}

            <div className="event-detail-content animate-fade-in-up">
                <h1>{event.name}</h1>

                <div className="event-detail-meta">
                    <div className="meta-item">
                        <span className="meta-icon">📅</span>
                        <span>{day} {month} {year}</span>
                    </div>
                    {timeStr && (
                        <div className="meta-item">
                            <span className="meta-icon">🕒</span>
                            <span>{timeStr} น.</span>
                        </div>
                    )}
                </div>

                {event.description && (
                    <div className="event-detail-description">
                        <p>{event.description}</p>
                    </div>
                )}

                <div className="event-detail-actions">
                    <Link href="/reservation" className="btn btn-primary btn-full">
                        จองโต๊ะสำหรับอีเว้นท์นี้
                    </Link>
                    <Link href="/events" className="btn btn-secondary btn-full">
                        ดูอีเว้นท์ทั้งหมด
                    </Link>
                </div>
            </div>
        </div>
    );
}
