-- ============================================================
-- Asia Electronics & Cellular — Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ──────────────── PRODUCTS ────────────────
CREATE TABLE IF NOT EXISTS products (
  id              TEXT PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  sku             TEXT UNIQUE NOT NULL,
  brand           TEXT NOT NULL DEFAULT 'Generic',
  model           TEXT DEFAULT 'Standard',
  category        TEXT NOT NULL,
  subcategory     TEXT,
  price_cents     INTEGER NOT NULL DEFAULT 0,
  compare_at_cents INTEGER,
  stock           INTEGER NOT NULL DEFAULT 0,
  images          JSONB NOT NULL DEFAULT '[]'::jsonb,
  description     TEXT DEFAULT '',
  specs           JSONB NOT NULL DEFAULT '{}'::jsonb,
  attributes      JSONB NOT NULL DEFAULT '{}'::jsonb,
  featured        BOOLEAN NOT NULL DEFAULT false,
  is_new          BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku      ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_brand    ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_stock    ON products(stock);

-- ──────────────── CATEGORIES ────────────────
CREATE TABLE IF NOT EXISTS categories (
  slug        TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  short       TEXT DEFAULT '',
  image       TEXT DEFAULT '/assets/imgs/electronic-components.png',
  filter_key  TEXT DEFAULT 'Type'
);

-- ───────────────── BRANDS ─────────────────
CREATE TABLE IF NOT EXISTS brands (
  slug        TEXT PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL,
  image_url   TEXT DEFAULT '',
  image_path  TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);

-- Register brands that already exist on products.
INSERT INTO brands (slug, name)
SELECT
  trim(both '-' from regexp_replace(lower(trim(brand)), '[^a-z0-9]+', '-', 'g')),
  trim(brand)
FROM products
WHERE trim(coalesce(brand, '')) <> ''
ON CONFLICT DO NOTHING;

-- ──────────────── ORDERS ────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              TEXT PRIMARY KEY,
  customer_name   TEXT NOT NULL,
  email           TEXT DEFAULT '',
  phone           TEXT NOT NULL,
  address         TEXT DEFAULT '',
  city            TEXT DEFAULT '',
  total_lkr       INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'Quotation Requested',
  items           JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes           TEXT DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ
);

-- ──────────────── STORE SETTINGS ────────────────
CREATE TABLE IF NOT EXISTS store_settings (
  id              TEXT PRIMARY KEY DEFAULT 'default',
  store_name      TEXT NOT NULL DEFAULT 'Asia Electronics & Cellular',
  whatsapp_number TEXT NOT NULL DEFAULT '+94 74 106 6017',
  office_email    TEXT NOT NULL DEFAULT 'aecpvt60@gmail.com',
  phone           TEXT NOT NULL DEFAULT '+94 74 106 6017',
  address         TEXT NOT NULL DEFAULT '29, 2nd Rohini Lane, Colombo 01100, Sri Lanka',
  currency        TEXT NOT NULL DEFAULT 'LKR (Rs.)',
  tax_rate        TEXT NOT NULL DEFAULT '0%',
  notifications   JSONB NOT NULL DEFAULT '{"newOrders":true,"lowStock":true,"weeklyReport":false}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Run these ALTER statements if tables already exist (idempotent):
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory TEXT;
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);
ALTER TABLE products ADD COLUMN IF NOT EXISTS show_price BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS show_quantity BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS show_availability BOOLEAN NOT NULL DEFAULT true;

-- Add missing columns to orders table:
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Insert default store settings if not already present:
INSERT INTO store_settings (id, store_name, whatsapp_number, office_email, phone, address, currency, tax_rate, notifications)
VALUES (
  'default',
  'Asia Electronics & Cellular',
  '+94 74 106 6017',
  'aecpvt60@gmail.com',
  '+94 74 106 6017',
  '29, 2nd Rohini Lane, Colombo 01100, Sri Lanka',
  'LKR (Rs.)',
  '0%',
  '{"newOrders":true,"lowStock":true,"weeklyReport":false}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ──────────────── ROW LEVEL SECURITY ────────────────
-- Fix for: "new row violates row-level security policy for table products"
-- Run this in your Supabase Dashboard -> SQL Editor:

-- Option 1 (Recommended for simple e-commerce backend): Disable RLS
ALTER TABLE products       DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories     DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders         DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE brands         DISABLE ROW LEVEL SECURITY;

-- Public bucket used by the admin Brand Manager. Writes still go through the
-- backend service-role client; public access is read-only.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-images',
  'brand-images',
  true,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Option 2 (If you prefer RLS enabled, run these permissive policies):
-- ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- DROP POLICY IF EXISTS "Public access products"       ON products;
-- DROP POLICY IF EXISTS "Public access categories"     ON categories;
-- DROP POLICY IF EXISTS "Public access orders"         ON orders;
-- DROP POLICY IF EXISTS "Public access store_settings" ON store_settings;

-- CREATE POLICY "Public access products"       ON products       FOR ALL TO public USING (true) WITH CHECK (true);
-- CREATE POLICY "Public access categories"     ON categories     FOR ALL TO public USING (true) WITH CHECK (true);
-- CREATE POLICY "Public access orders"         ON orders         FOR ALL TO public USING (true) WITH CHECK (true);
-- CREATE POLICY "Public access store_settings" ON store_settings FOR ALL TO public USING (true) WITH CHECK (true);



