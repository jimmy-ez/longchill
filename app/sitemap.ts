import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://longchill.co";

    // Static routes
    const staticRoutes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/menu`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/events`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/reservation`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.5,
        },
        {
            url: `${baseUrl}/history`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.3,
        },
    ];

    // Dynamic event routes
    let eventRoutes: MetadataRoute.Sitemap = [];
    try {
        const supabase = await createClient();
        const { data: events } = await supabase
            .from("events")
            .select("id, updated_at")
            .eq("is_visible", true);

        if (events) {
            eventRoutes = events.map((event) => ({
                url: `${baseUrl}/events/${event.id}`,
                lastModified: event.updated_at ? new Date(event.updated_at) : new Date(),
                changeFrequency: "weekly" as const,
                priority: 0.7,
            }));
        }
    } catch (error) {
        console.error("Sitemap: Failed to fetch events:", error);
    }

    return [...staticRoutes, ...eventRoutes];
}
