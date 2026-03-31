import { createClient } from "@/lib/supabase/server";
import MenuSlider from "./MenuSlider";
import "./page.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface MenuItem {
    id: string;
    name: string;
    category: "mala" | "food" | "drink";
    image_url: string | null;
    display_order: number;
    is_visible: boolean;
}

export const metadata = {
    description: "เลือกชมเมนูอาหาร หม่าล่า และเครื่องดื่มสุดพิเศษจาก Longchill บาร์ที่ชิลล์ที่สุดในย่านนนทบุรี ติวานนท์",
};

export default async function MenuPage() {
    let menuItems: MenuItem[] = [];

    try {
        const supabase = await createClient();

        const { data: items } = await supabase
            .from("menu_items")
            .select("*")
            .in("category", ["mala", "food", "drink"])
            .eq("is_visible", true)
            .order("display_order");

        menuItems = items || [];
    } catch (e: any) {
        // Skip errors on display, handled locally
    }

    const foodItems = menuItems.filter((item) => item.category === "food" && item.image_url);
    const drinkItems = menuItems.filter((item) => item.category === "drink" && item.image_url);
    const malaItems = menuItems.filter((item) => item.category === "mala" && item.image_url);

    return (
        <div className="menu-page mobile-layout">
            <div className="menu-header animate-fade-in-up">
                <h2>เมนูอาหารและเครื่องดื่ม</h2>
                <p>เลือกชมเมนูสุดพิเศษจาก Longchill</p>
            </div>

            <section className="menu-content">
                {menuItems.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🍽️</div>
                        <p>ยังไม่มีเมนูในขณะนี้</p>
                    </div>
                ) : (
                    <MenuSlider foodItems={foodItems} drinkItems={drinkItems} malaItems={malaItems} />
                )}
            </section>
        </div>
    );
}
