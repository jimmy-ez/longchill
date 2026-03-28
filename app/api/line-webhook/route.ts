import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("=== LINE Webhook ===");
        console.log(JSON.stringify(body, null, 2));

        // พิมพ์ groupId ออกมาตรงๆ ถ้ามี
        for (const event of body.events || []) {
            const source = event.source;
            if (source?.type === "group") {
                console.log("✅ GROUP ID:", source.groupId);
            }
        }

        // LINE ต้องการ 200 เสมอ
        return NextResponse.json({ status: "ok" });
    } catch {
        return NextResponse.json({ status: "ok" });
    }
}

// LINE จะ verify webhook ด้วย GET ด้วย
export async function GET() {
    return NextResponse.json({ status: "ok" });
}
