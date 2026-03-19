import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        
        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        // Use service role key to bypass RLS, or anon key if service key is missing
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const { error } = await supabase.from("reservations").insert({
            customer_name: body.customer_name,
            phone: body.phone,
            date: body.date,
            time: body.time,
            party_size: body.party_size,
            status: body.status || "pending",
            uid: session.user.id
        });

        if (error) {
            console.error("Supabase insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
