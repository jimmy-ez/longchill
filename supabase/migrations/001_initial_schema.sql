-- =============================================
-- Longchill Bar & Restaurant — Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Categories (Food, Cocktails, Beer, etc.)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  party_size INT NOT NULL DEFAULT 2,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Categories: public read, auth write
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);
CREATE POLICY "Categories are editable by authenticated users" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Menu Items: public read, auth write
CREATE POLICY "Menu items are viewable by everyone" ON menu_items
  FOR SELECT USING (true);
CREATE POLICY "Menu items are editable by authenticated users" ON menu_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Reservations: public insert, auth manage
CREATE POLICY "Anyone can create a reservation" ON reservations
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view reservations" ON reservations
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update reservations" ON reservations
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete reservations" ON reservations
  FOR DELETE USING (auth.role() = 'authenticated');

-- Contact Messages: public insert, auth manage
CREATE POLICY "Anyone can send a contact message" ON contact_messages
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view messages" ON contact_messages
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update messages" ON contact_messages
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete messages" ON contact_messages
  FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- Seed Data
-- =============================================

INSERT INTO categories (name, slug, display_order) VALUES
  ('Appetizers', 'appetizers', 1),
  ('Main Course', 'main-course', 2),
  ('Cocktails', 'cocktails', 3),
  ('Mocktails', 'mocktails', 4),
  ('Beer', 'beer', 5),
  ('Wine', 'wine', 6),
  ('Desserts', 'desserts', 7);

-- Sample menu items
INSERT INTO menu_items (category_id, name, description, price, display_order) VALUES
  ((SELECT id FROM categories WHERE slug = 'appetizers'), 'Crispy Calamari', 'Golden fried squid rings with spicy aioli dip', 189.00, 1),
  ((SELECT id FROM categories WHERE slug = 'appetizers'), 'Truffle Fries', 'Hand-cut fries with truffle oil and parmesan', 159.00, 2),
  ((SELECT id FROM categories WHERE slug = 'appetizers'), 'Bruschetta', 'Toasted bread with fresh tomato, basil, and balsamic', 149.00, 3),
  ((SELECT id FROM categories WHERE slug = 'main-course'), 'Grilled Ribeye Steak', '250g premium ribeye with herb butter and seasonal vegetables', 590.00, 1),
  ((SELECT id FROM categories WHERE slug = 'main-course'), 'Pan-Seared Salmon', 'Norwegian salmon with lemon caper sauce and mashed potato', 450.00, 2),
  ((SELECT id FROM categories WHERE slug = 'main-course'), 'Truffle Mushroom Pasta', 'Fettuccine with mixed mushrooms in truffle cream sauce', 320.00, 3),
  ((SELECT id FROM categories WHERE slug = 'cocktails'), 'Longchill Sunset', 'House signature — rum, passion fruit, lime, and grenadine', 259.00, 1),
  ((SELECT id FROM categories WHERE slug = 'cocktails'), 'Smoky Old Fashioned', 'Bourbon, smoked maple syrup, Angostura bitters', 289.00, 2),
  ((SELECT id FROM categories WHERE slug = 'cocktails'), 'Espresso Martini', 'Vodka, fresh espresso, coffee liqueur, vanilla', 269.00, 3),
  ((SELECT id FROM categories WHERE slug = 'mocktails'), 'Virgin Mojito', 'Fresh mint, lime, soda water, and sugar syrup', 129.00, 1),
  ((SELECT id FROM categories WHERE slug = 'mocktails'), 'Tropical Paradise', 'Mango, pineapple, coconut cream, and lime', 139.00, 2),
  ((SELECT id FROM categories WHERE slug = 'beer'), 'Chang Draught', 'Thai classic lager, served ice cold', 119.00, 1),
  ((SELECT id FROM categories WHERE slug = 'beer'), 'Singha', 'Premium Thai beer with full-bodied flavor', 129.00, 2),
  ((SELECT id FROM categories WHERE slug = 'beer'), 'Asahi Super Dry', 'Japanese dry lager with crisp finish', 169.00, 3),
  ((SELECT id FROM categories WHERE slug = 'wine'), 'House Red — Cabernet Sauvignon', 'Medium body, notes of blackcurrant and oak', 199.00, 1),
  ((SELECT id FROM categories WHERE slug = 'wine'), 'House White — Sauvignon Blanc', 'Crisp and refreshing with citrus notes', 189.00, 2),
  ((SELECT id FROM categories WHERE slug = 'desserts'), 'Molten Chocolate Lava Cake', 'Warm dark chocolate cake with vanilla ice cream', 189.00, 1),
  ((SELECT id FROM categories WHERE slug = 'desserts'), 'Crème Brûlée', 'Classic French custard with caramelized sugar', 169.00, 2);
