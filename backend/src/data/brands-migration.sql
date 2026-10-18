-- Run once in Supabase Dashboard -> SQL Editor.
-- Creates persistent brand records and the public logo bucket.

CREATE TABLE IF NOT EXISTS public.brands (
  slug        TEXT PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL,
  image_url   TEXT DEFAULT '',
  image_path  TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brands_name ON public.brands(name);

INSERT INTO public.brands (slug, name)
SELECT
  trim(both '-' from regexp_replace(lower(trim(brand)), '[^a-z0-9]+', '-', 'g')),
  trim(brand)
FROM public.products
WHERE trim(coalesce(brand, '')) <> ''
ON CONFLICT DO NOTHING;

-- All brand writes go through the backend's Supabase service-role client.
ALTER TABLE public.brands DISABLE ROW LEVEL SECURITY;

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
