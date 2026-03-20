import Link from "next/link";
import Image from "next/image";
import "./EventCard.css";

interface Event {
    id: string;
    name: string;
    image_url: string | null;
    event_date: string;
    event_time: string;
    description: string | null;
}

const THAI_MONTHS_SHORT = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

export default function EventCard({ event }: { event: Event }) {
    const d = new Date(event.event_date);
    const day = d.getDate();
    const month = THAI_MONTHS_SHORT[d.getMonth()];
    const timeStr = event.event_time ? event.event_time.slice(0, 5) : null;

    return (
        <Link href={`/events/${event.id}`} className="event-card">
            <div className="event-card-image">
                {event.image_url ? (
                    <Image
                        src={event.image_url}
                        alt={event.name}
                        fill
                        style={{ objectFit: "cover" }}
                        unoptimized
                    />
                ) : (
                    <div className="event-card-placeholder">
                        <span className="day">{day}</span>
                        <span className="month">{month}</span>
                    </div>
                )}
            </div>
            <div className="event-info">
                <h4>{event.name}</h4>
                <div className="event-meta-row">
                    <span>{day} {month}</span>
                    {timeStr && <span>{timeStr} น.</span>}
                </div>
                {event.description && <p>{event.description}</p>}
            </div>
        </Link>
    );
}
