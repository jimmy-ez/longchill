"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

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
    is_available: boolean;
    display_order: number;
}

export default function AdminMenuPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<MenuItem | null>(null);
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        category_id: "",
        is_available: true,
    });

    const supabase = createClient();

    const fetchData = useCallback(async () => {
        const { data: cats } = await supabase
            .from("categories")
            .select("*")
            .order("display_order");
        const { data: items } = await supabase
            .from("menu_items")
            .select("*")
            .order("display_order");
        setCategories(cats || []);
        setMenuItems(items || []);
    }, [supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const openAddModal = () => {
        setEditItem(null);
        setForm({
            name: "",
            description: "",
            price: "",
            category_id: categories[0]?.id || "",
            is_available: true,
        });
        setShowModal(true);
    };

    const openEditModal = (item: MenuItem) => {
        setEditItem(item);
        setForm({
            name: item.name,
            description: item.description || "",
            price: item.price.toString(),
            category_id: item.category_id,
            is_available: item.is_available,
        });
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: form.name,
            description: form.description || null,
            price: parseFloat(form.price),
            category_id: form.category_id,
            is_available: form.is_available,
        };

        if (editItem) {
            await supabase.from("menu_items").update(payload).eq("id", editItem.id);
        } else {
            await supabase.from("menu_items").insert(payload);
        }

        setShowModal(false);
        fetchData();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        await supabase.from("menu_items").delete().eq("id", id);
        fetchData();
    };

    const getCategoryName = (id: string) => {
        return categories.find((c) => c.id === id)?.name || "—";
    };

    return (
        <div>
            <div className="admin-page-header">
                <h1>Menu Management</h1>
                <button className="btn btn-primary" onClick={openAddModal}>
                    + Add Item
                </button>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Available</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {menuItems.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: "center", padding: 40 }}>
                                    No menu items yet. Add your first item above.
                                </td>
                            </tr>
                        ) : (
                            menuItems.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <strong>{item.name}</strong>
                                        {item.description && (
                                            <div
                                                style={{
                                                    fontSize: "0.8rem",
                                                    color: "var(--text-muted)",
                                                    marginTop: 2,
                                                }}
                                            >
                                                {item.description}
                                            </div>
                                        )}
                                    </td>
                                    <td>{getCategoryName(item.category_id)}</td>
                                    <td style={{ color: "var(--amber)" }}>
                                        ฿{item.price.toFixed(0)}
                                    </td>
                                    <td>
                                        <span
                                            className={`badge ${item.is_available ? "badge-confirmed" : "badge-cancelled"
                                                }`}
                                        >
                                            {item.is_available ? "Yes" : "No"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="admin-table-actions">
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => openEditModal(item)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{editItem ? "Edit Menu Item" : "Add Menu Item"}</h2>
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Item Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, name: e.target.value }))
                                    }
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-input"
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, description: e.target.value }))
                                    }
                                />
                            </div>

                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    className="form-input"
                                    value={form.category_id}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, category_id: e.target.value }))
                                    }
                                    required
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Price (THB) *</label>
                                <input
                                    type="number"
                                    step="1"
                                    min="0"
                                    className="form-input"
                                    value={form.price}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, price: e.target.value }))
                                    }
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ display: "flex", alignItems: "center", gap: 8, textTransform: "none", letterSpacing: 0 }}>
                                    <input
                                        type="checkbox"
                                        checked={form.is_available}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, is_available: e.target.checked }))
                                        }
                                    />
                                    Available on menu
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editItem ? "Save Changes" : "Add Item"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
