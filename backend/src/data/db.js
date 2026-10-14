import { supabase } from "./supabase.js";

// ─── Column mapping helpers ────────────────────────────────
// JS camelCase ↔ Postgres snake_case
function toDbProduct(p) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    brand: p.brand,
    model: p.model,
    category: p.category,
    price_cents: p.priceCents,
    compare_at_cents: p.compareAtCents ?? null,
    stock: p.stock,
    images: p.images,
    description: p.description,
    specs: p.specs,
    attributes: p.attributes,
    featured: p.featured,
    is_new: p.isNew,
    created_at: p.createdAt,
    updated_at: p.updatedAt ?? null,
  };
}

function fromDbProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sku: row.sku,
    brand: row.brand,
    model: row.model,
    category: row.category,
    priceCents: row.price_cents,
    compareAtCents: row.compare_at_cents ?? undefined,
    stock: row.stock,
    images: row.images,
    description: row.description,
    specs: row.specs,
    attributes: row.attributes,
    featured: row.featured,
    isNew: row.is_new,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
  };
}

function toDbCategory(c) {
  return {
    slug: c.slug,
    name: c.name,
    short: c.short,
    image: c.image,
    filter_key: c.filterKey,
  };
}

function fromDbCategory(row) {
  return {
    slug: row.slug,
    name: row.name,
    short: row.short,
    image: row.image,
    filterKey: row.filter_key,
  };
}

function toDbOrder(o) {
  return {
    id: o.id,
    customer_name: o.customerName,
    email: o.email,
    phone: o.phone,
    total_lkr: o.totalLKR,
    status: o.status,
    items: o.items,
    created_at: o.createdAt,
    updated_at: o.updatedAt ?? null,
  };
}

function fromDbOrder(row) {
  return {
    id: row.id,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    totalLKR: row.total_lkr,
    status: row.status,
    items: row.items,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
  };
}

// ─── Default starter categories ────────────────────────────
const defaultCategories = [
  { slug: "components", name: "Electronic Components & Repair Parts", short: "Components", image: "/assets/cat-components.jpg", filterKey: "Component Type" },
  { slug: "audio", name: "Audio & Speakers", short: "Audio", image: "/assets/cat-audio.jpg", filterKey: "Connectivity" },
  { slug: "lighting", name: "Lighting", short: "Lighting", image: "/assets/cat-lighting.jpg", filterKey: "Power" },
  { slug: "mobile", name: "Mobile Parts & Accessories", short: "Mobile Parts", image: "/assets/cat-mobile.jpg", filterKey: "Compatibility" },
  { slug: "tv", name: "TVs & Projectors", short: "TVs", image: "/assets/cat-tv.jpg", filterKey: "Screen Size" },
];

// ─── Seed generator for 850 realistic electronics SKUs ─────
export function generate850Products() {
  const subcats = [
    { prefix: "RES", cat: "components", type: "Resistor", count: 120, brand: "Vishay", priceRange: [15, 60] },
    { prefix: "CAP", cat: "components", type: "Capacitor", count: 120, brand: "Nichicon", priceRange: [25, 350] },
    { prefix: "DIO", cat: "components", type: "Diode", count: 60, brand: "Vishay", priceRange: [20, 180] },
    { prefix: "TRN", cat: "components", type: "Transistor", count: 70, brand: "STMicroelectronics", priceRange: [50, 450] },
    { prefix: "IC",  cat: "components", type: "Integrated Circuit", count: 90, brand: "Texas Instruments", priceRange: [180, 2400] },
    { prefix: "REG", cat: "components", type: "Voltage Regulator", count: 50, brand: "STMicroelectronics", priceRange: [90, 650] },
    { prefix: "MCU", cat: "components", type: "Microcontroller Board", count: 40, brand: "Keyestudio", priceRange: [1200, 8500] },
    { prefix: "AUD", cat: "audio",      type: "Audio Cable & Driver", count: 70, brand: "JBL", priceRange: [650, 42000] },
    { prefix: "LGT", cat: "lighting",   type: "LED Strip & Driver", count: 80, brand: "Philips", priceRange: [350, 14500] },
    { prefix: "MOB", cat: "mobile",     type: "Phone Screen & Cable", count: 90, brand: "OEM Grade", priceRange: [450, 28000] },
    { prefix: "TV",  cat: "tv",         type: "TV Board & Backlight", count: 60, brand: "Samsung", priceRange: [1200, 185000] },
  ];

  const prods = [];
  let idCounter = 1;

  for (const group of subcats) {
    for (let i = 1; i <= group.count; i++) {
      const sku = `AE-${group.prefix}-${String(i).padStart(3, "0")}`;
      const name = `${group.type} ${group.prefix}-${i * 10} Series (Grade A)`;
      const priceLKR = Math.round(group.priceRange[0] + Math.random() * (group.priceRange[1] - group.priceRange[0]));
      const compareLKR = Math.random() > 0.4 ? Math.round(priceLKR * 1.15) : undefined;
      const stock = Math.floor(Math.random() * 85);

      prods.push({
        id: `prod_${idCounter++}`,
        slug: `ae-${group.prefix.toLowerCase()}-${i}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name,
        sku,
        brand: group.brand,
        model: `${group.prefix}-${i * 10}`,
        category: group.cat,
        priceCents: priceLKR * 100,
        compareAtCents: compareLKR ? compareLKR * 100 : undefined,
        stock,
        images: ["/assets/cat-components.jpg"],
        description: `Industrial grade ${group.type.toLowerCase()} engineered for electronics repair, manufacturing, and maintenance. Tested and quality-assured by Asia Electronics.`,
        specs: {
          "Standard": "RoHS Compliant",
          "Tolerance": "±1% / Grade A",
          "SKU Code": sku,
          "Operating Range": "-40°C to +85°C",
        },
        attributes: {
          "Component Type": group.type,
          "Mounting": i % 2 === 0 ? "SMD / SMT" : "Through-Hole",
        },
        featured: i <= 2,
        isNew: i % 15 === 0,
        createdAt: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
      });
    }
  }

  return prods;
}

// ─── PRODUCTS ──────────────────────────────────────────────
export async function readProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase readProducts error:", error.message);
    return [];
  }

  return data.map(fromDbProduct);
}

export async function writeProducts(prods) {
  // Full replace: delete all, then batch-insert
  const { error: delError } = await supabase.from("products").delete().neq("id", "");
  if (delError) console.error("Supabase deleteProducts error:", delError.message);

  if (prods.length === 0) return;

  // Supabase has a row-limit per insert; batch in chunks of 500
  const rows = prods.map(toDbProduct);
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error } = await supabase.from("products").insert(chunk);
    if (error) console.error(`Supabase insertProducts batch ${i} error:`, error.message);
  }
}

export async function insertProduct(prod) {
  const { data, error } = await supabase
    .from("products")
    .insert(toDbProduct(prod))
    .select()
    .single();

  if (error) throw new Error(error.message);
  return fromDbProduct(data);
}

export async function updateProduct(id, updates) {
  const dbUpdates = {};
  if (updates.name !== undefined)         dbUpdates.name = updates.name;
  if (updates.sku !== undefined)          dbUpdates.sku = updates.sku;
  if (updates.brand !== undefined)        dbUpdates.brand = updates.brand;
  if (updates.model !== undefined)        dbUpdates.model = updates.model;
  if (updates.category !== undefined)     dbUpdates.category = updates.category;
  if (updates.priceLKR !== undefined)     dbUpdates.price_cents = Math.round(Number(updates.priceLKR) * 100);
  if (updates.priceCents !== undefined)   dbUpdates.price_cents = updates.priceCents;
  if (updates.compareAtCents !== undefined) dbUpdates.compare_at_cents = updates.compareAtCents;
  if (updates.stock !== undefined)        dbUpdates.stock = Number(updates.stock);
  if (updates.images !== undefined)       dbUpdates.images = updates.images;
  if (updates.description !== undefined)  dbUpdates.description = updates.description;
  if (updates.specs !== undefined)        dbUpdates.specs = updates.specs;
  if (updates.attributes !== undefined)   dbUpdates.attributes = updates.attributes;
  if (updates.featured !== undefined)     dbUpdates.featured = updates.featured;
  if (updates.isNew !== undefined)        dbUpdates.is_new = updates.isNew;
  if (updates.slug !== undefined)         dbUpdates.slug = updates.slug;
  dbUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("products")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return fromDbProduct(data);
}

export async function deleteProduct(id) {
  const { error, count } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  return true;
}

export async function findProduct(identifier) {
  // Try by id first
  let { data } = await supabase
    .from("products")
    .select("*")
    .or(`id.eq.${identifier},slug.eq.${identifier},sku.ilike.${identifier}`)
    .limit(1)
    .maybeSingle();

  return data ? fromDbProduct(data) : null;
}

// ─── CATEGORIES ────────────────────────────────────────────
export async function readCategories() {
  const { data, error } = await supabase.from("categories").select("*");

  if (error) {
    console.error("Supabase readCategories error:", error.message);
    return defaultCategories;
  }

  if (data.length === 0) {
    // Auto-seed defaults
    await writeCategories(defaultCategories);
    return defaultCategories;
  }

  return data.map(fromDbCategory);
}

export async function writeCategories(cats) {
  const { error: delError } = await supabase.from("categories").delete().neq("slug", "");
  if (delError) console.error("Supabase deleteCategories error:", delError.message);

  if (cats.length === 0) return;

  const rows = cats.map(toDbCategory);
  const { error } = await supabase.from("categories").insert(rows);
  if (error) console.error("Supabase insertCategories error:", error.message);
}

export async function insertCategory(cat) {
  const { data, error } = await supabase
    .from("categories")
    .insert(toDbCategory(cat))
    .select()
    .single();

  if (error) throw new Error(error.message);
  return fromDbCategory(data);
}

export async function deleteCategory(slug) {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("slug", slug);

  if (error) throw new Error(error.message);
  return true;
}

// ─── ORDERS ────────────────────────────────────────────────
export async function readOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase readOrders error:", error.message);
    return [];
  }

  return data.map(fromDbOrder);
}

export async function writeOrders(orders) {
  const { error: delError } = await supabase.from("orders").delete().neq("id", "");
  if (delError) console.error("Supabase deleteOrders error:", delError.message);

  if (orders.length === 0) return;

  const rows = orders.map(toDbOrder);
  const { error } = await supabase.from("orders").insert(rows);
  if (error) console.error("Supabase insertOrders error:", error.message);
}

export async function insertOrder(order) {
  const { data, error } = await supabase
    .from("orders")
    .insert(toDbOrder(order))
    .select()
    .single();

  if (error) throw new Error(error.message);
  return fromDbOrder(data);
}

export async function updateOrderStatus(id, status) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return fromDbOrder(data);
}
