import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import "./page.css";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        redirect("/login");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    // Using SERVICE_ROLE_KEY enables the server component to safely fetch data across RLS policies if necessary,
    // though fetching via anon key is fine if RLS allows it.
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: reservations, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("uid", session.user.id)
        .order("date", { ascending: false })
        .order("time", { ascending: false });

    if (error) {
        console.error("Error fetching reservations:", error);
    }

    // Using Thai format
    const getStatusText = (status: string) => {
        switch (status) {
            case "pending": return "รอยืนยัน";
            case "confirmed": return "ยืนยันแล้ว";
            case "cancelled": return "ยกเลิกแล้ว";
            default: return status;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case "pending": return "status-pending";
            case "confirmed": return "status-confirmed";
            case "cancelled": return "status-cancelled";
            default: return "";
        }
    };

    return (
        <div className="history-page mobile-layout">
            <div className="history-header animate-fade-in-up">
                <h2>รายการจองของฉัน</h2>
                <p>ประวัติการจองโต๊ะทั้งหมดของคุณ</p>
            </div>

            <div className="history-content">
                {!reservations || reservations.length === 0 ? (
                    <div className="empty-state animate-fade-in-up">
                        <div className="empty-icon">📝</div>
                        <p>คุณยังไม่มีประวัติการจองโต๊ะ</p>
                    </div>
                ) : (
                    <ul className="history-list">
                        {reservations.map((res: any, index: number) => (
                            <li
                                key={res.id}
                                className="history-card animate-fade-in-up"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="card-header">
                                    <span className="res-date">
                                        {new Date(res.date).toLocaleDateString("th-TH", {
                                            year: "numeric", month: "long", day: "numeric"
                                        })}
                                    </span>
                                    <span className={`res-status ${getStatusClass(res.status)}`}>
                                        {getStatusText(res.status)}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <div className="detail-row">
                                        <span className="label">เวลา:</span>
                                        <span className="value">{res.time ? res.time.slice(0, 5) : "-"} น.</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">จำนวน:</span>
                                        <span className="value">{res.party_size} ท่าน</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">ชื่อผู้จอง:</span>
                                        <span className="value">{res.customer_name}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">เบอร์ติดต่อ:</span>
                                        <span className="value">{res.phone}</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
