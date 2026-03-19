import { createClient } from "@/lib/supabase/server";
import MenuSlider from "./MenuSlider";
import "./page.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface MenuItem {
    id: string;
    name: string;
    category: "food" | "drink";
    image_url: string | null;
    display_order: number;
    is_visible: boolean;
}

export const metadata = {
    title: "Menu — Longchill",
    description: "Explore our full menu of craft cocktails, fine food, and more.",
};

export default async function MenuPage() {
    let menuItems: MenuItem[] = [];

    try {
        const supabase = await createClient();

        const { data: items } = await supabase
            .from("menu_items")
            .select("*")
            .in("category", ["food", "drink"])
            .eq("is_visible", true)
            .order("display_order");

        menuItems = items || [];
    } catch (e: any) {
        // Skip errors on display, handled locally
    }

    const foodItems = menuItems.filter((item) => item.category === "food" && item.image_url);
    const drinkItems = menuItems.filter((item) => item.category === "drink" && item.image_url);

    return (
        <div className="menu-page">

            {/* Menu Content */}
            <section className="menu-content">
                <div className="container">
                    {menuItems.length === 0 ? (
                        <div className="empty-state">
                            <p>🍽️ Menu items will appear here once the database is set up.</p>
                            <p className="empty-hint">
                                Add some food and drink items with images to display them here.
                            </p>
                        </div>
                    ) : (
                        <MenuSlider foodItems={foodItems} drinkItems={drinkItems} />
                    )}
                </div>
            </section>
        </div>
    );
}
