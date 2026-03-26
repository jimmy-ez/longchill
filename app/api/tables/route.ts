import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date");

        if (!date) {
            return NextResponse.json({ error: "date is required" }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const supabaseServiceKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY ||
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
            "";

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data, error } = await supabase
            .from("reservations")
            .select("table_no")
            .eq("date", date)
            .neq("status", "cancelled");

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // table_no is stored as JSON string e.g. '["V1","T3"]'
        const occupied: string[] = [];
        for (const row of data || []) {
            if (!row.table_no) continue;
            try {
                const tables = JSON.parse(row.table_no);
                if (Array.isArray(tables)) {
                    occupied.push(...tables);
                }
            } catch {
                // legacy single table string
                occupied.push(row.table_no);
            }
        }

        return NextResponse.json({ occupied: [...new Set(occupied)] });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Internal Server Error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
