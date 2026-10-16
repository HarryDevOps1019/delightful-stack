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
  image       TEXT DEFAULT '/assets/cat-components.jpg',
  filter_key  TEXT DEFAULT 'Type'
);

-- ──────────────── ORDERS ────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              TEXT PRIMARY KEY,
  customer_name   TEXT NOT NULL,
  email           TEXT DEFAULT '',
  phone           TEXT NOT NULL,
  total_lkr       INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'Processing',
  items           JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ──────────────── ROW LEVEL SECURITY ────────────────
-- Disable RLS for server-side access via service role key
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders     ENABLE ROW LEVEL SECURITY;

-- Allow full access for service role (bypasses RLS automatically)
-- Allow anon read for storefront
CREATE POLICY "Public read products"  ON products  FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
