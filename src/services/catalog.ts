/**
 * Mock catalogue service. Every function is async so it can be swapped for
 * Supabase (or any API) later without touching components.
 */
import { queryOptions } from "@tanstack/react-query";
import { brands, categories, products } from "@/data/catalog";
import type { ProductPage, ProductQuery, SortKey } from "@/lib/types";

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export async function listProducts(query: ProductQuery = {}): Promise<ProductPage> {
  await delay();
  const { q, category, brands: bs, min, max, inStock, attr, sort = "featured", page = 1, pageSize = 8 } = query;
  let items = products.slice();
  if (q) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    items = items.filter((p) => {
      const hay = `${p.name} ${p.sku} ${p.brand} ${p.model} ${(p.compatibility ?? []).join(" ")}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }
  if (category) items = items.filter((p) => p.category === category);
  if (bs?.length) items = items.filter((p) => bs.includes(p.brand));
  if (min != null) items = items.filter((p) => p.priceCents >= min * 100);
  if (max != null) items = items.filter((p) => p.priceCents <= max * 100);
  if (inStock) items = items.filter((p) => p.stock > 0);
  if (attr && category) {
    const key = categories.find((c) => c.slug === category)?.filterKey;
    if (key) items = items.filter((p) => p.attributes[key] === attr);
  }
  const sorters: Record<SortKey, (a: (typeof items)[0], b: (typeof items)[0]) => number> = {
    featured: (a, b) => Number(!!b.featured) - Number(!!a.featured),
    "price-asc": (a, b) => a.priceCents - b.priceCents,
    "price-desc": (a, b) => b.priceCents - a.priceCents,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    name: (a, b) => a.name.localeCompare(b.name),
  };
  items.sort(sorters[sort]);
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pages);
  return { items: items.slice((safePage - 1) * pageSize, safePage * pageSize), total, page: safePage, pages };
}

export async function getProduct(slug: string) {
  await delay(150);
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getRelated(slug: string) {
  await delay(150);
  const p = products.find((x) => x.slug === slug);
  if (!p) return [];
  return products.filter((x) => x.category === p.category && x.slug !== slug).slice(0, 4);
}

export function attributeOptions(category: string) {
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return { key: null as string | null, options: [] as string[] };
  const opts = Array.from(new Set(products.filter((p) => p.category === category).map((p) => p.attributes[cat.filterKey]).filter(Boolean)));
  return { key: cat.filterKey, options: opts.sort() };
}

export { brands, categories };

export const productsQuery = (q: ProductQuery) =>
  queryOptions({ queryKey: ["products", q], queryFn: () => listProducts(q) });
export const productQuery = (slug: string) =>
  queryOptions({ queryKey: ["product", slug], queryFn: () => getProduct(slug) });
export const relatedQuery = (slug: string) =>
  queryOptions({ queryKey: ["related", slug], queryFn: () => getRelated(slug) });
