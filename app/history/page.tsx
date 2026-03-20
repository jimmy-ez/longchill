import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import HistoryList from "./HistoryList";
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
                    <HistoryList reservations={reservations} />
                )}
            </div>
        </div>
    );
}
