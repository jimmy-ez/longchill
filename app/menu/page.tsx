import { createClient } from "@/lib/supabase/server";
import "./page.css";

export const dynamic = "force-dynamic";

interface Category {
    id: string;
    name: string;
    slug: string;
    display_order: number;
}

interface MenuItem {
    id: string;
    category_id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_available: boolean;
    display_order: number;
}

export const metadata = {
    title: "Menu — Longchill",
    description: "Explore our full menu of craft cocktails, fine food, and more.",
};

export default async function MenuPage() {
    let categories: Category[] = [];
    let menuItems: MenuItem[] = [];

    try {
        const supabase = await createClient();
        const { data: cats } = await supabase
            .from("categories")
            .select("*")
            .order("display_order");
        const { data: items } = await supabase
            .from("menu_items")
            .select("*")
            .eq("is_available", true)
            .order("display_order");

        categories = cats || [];
        menuItems = items || [];
    } catch {
        // Database not yet set up — show empty state
    }

    return (
        <div className="menu-page">
            {/* Page Header */}
            <section className="page-header">
                <div className="container">
                    <div className="section-heading">
                        <div className="accent-line"></div>
                        <h1>Our Menu</h1>
                        <p>
                            From signature cocktails to chef-crafted dishes — discover your
                            new favorites.
                        </p>
                    </div>
                </div>
            </section>

            {/* Menu Content */}
            <section className="menu-content">
                <div className="container">
                    {categories.length === 0 ? (
                        <div className="empty-state">
                            <p>🍽️ Menu items will appear here once the database is set up.</p>
                            <p className="empty-hint">
                                Run the SQL migration in your Supabase dashboard to seed sample
                                data.
                            </p>
                        </div>
                    ) : (
                        categories.map((category) => {
                            const items = menuItems.filter(
                                (item) => item.category_id === category.id
                            );
                            if (items.length === 0) return null;
                            return (
                                <div key={category.id} className="menu-category" id={category.slug}>
                                    <h2 className="category-title">{category.name}</h2>
                                    <div className="menu-items-grid">
                                        {items.map((item) => (
                                            <div key={item.id} className="menu-item-card">
                                                <div className="menu-item-info">
                                                    <h3 className="menu-item-name">{item.name}</h3>
                                                    {item.description && (
                                                        <p className="menu-item-desc">{item.description}</p>
                                                    )}
                                                </div>
                                                <div className="menu-item-price">
                                                    ฿{item.price.toFixed(0)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>
        </div>
    );
}
