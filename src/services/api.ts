import type { Product, Category } from "@/lib/types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface ApiOrder {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  totalLKR: number;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  items: Array<{
    sku: string;
    name: string;
    qty: number;
    priceLKR: number;
  }>;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiAnalytics {
  totalRevenueLKR: number;
  totalOrders: number;
  completedOrders: number;
  processingOrders: number;
  activeProducts: number;
  inStockProducts: number;
  lowStockAlerts: number;
  categoryBreakdown: Array<{
    category: string;
    slug: string;
    productCount: number;
    estimatedRevenueLKR: number;
  }>;
}

// ─── Products API ──────────────────────────────────────────

export async function fetchProductsApi(params?: {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<{ products: Product[]; total: number; pages: number } | null> {
  try {
    const url = new URL(`${API_BASE}/products`);
    if (params) {
      if (params.search) url.searchParams.set("search", params.search);
      if (params.category && params.category !== "all") url.searchParams.set("category", params.category);
      if (params.brand && params.brand !== "all") url.searchParams.set("brand", params.brand);
      if (params.minPrice != null) url.searchParams.set("minPrice", String(params.minPrice));
      if (params.maxPrice != null) url.searchParams.set("maxPrice", String(params.maxPrice));
      if (params.inStock) url.searchParams.set("inStock", "true");
      if (params.sort) url.searchParams.set("sort", params.sort);
      if (params.page) url.searchParams.set("page", String(params.page));
      if (params.limit) url.searchParams.set("limit", String(params.limit));
    }

    const res = await fetch(url.toString(), {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return {
      products: json.data || [],
      total: json.pagination?.total || (json.data || []).length,
      pages: json.pagination?.pages || 1,
    };
  } catch (err) {
    console.warn("Backend API fetchProducts error (will use fallback):", err);
    return null;
  }
}

export async function createProductApi(data: Partial<Product> & { priceLKR?: number }): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        priceLKR: data.priceLKR ?? (data.priceCents ? data.priceCents / 100 : 0),
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("Backend API createProduct error:", err);
    return null;
  }
}

export async function updateProductApi(id: string, updates: Partial<Product> & { priceLKR?: number }): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("Backend API updateProduct error:", err);
    return null;
  }
}

export async function deleteProductApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (err) {
    console.warn("Backend API deleteProduct error:", err);
    return false;
  }
}

// ─── Categories API ────────────────────────────────────────

export async function fetchCategoriesApi(): Promise<Category[] | null> {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("Backend API fetchCategories error:", err);
    return null;
  }
}

export async function createCategoryApi(category: Partial<Category>): Promise<Category | null> {
  try {
    const res = await fetch(`${API_BASE}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("Backend API createCategory error:", err);
    return null;
  }
}

export async function deleteCategoryApi(slug: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (err) {
    console.warn("Backend API deleteCategory error:", err);
    return false;
  }
}

// ─── Orders API ────────────────────────────────────────────

export async function fetchOrdersApi(): Promise<ApiOrder[] | null> {
  try {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("Backend API fetchOrders error:", err);
    return null;
  }
}

export async function createOrderApi(order: {
  customerName: string;
  phone: string;
  email?: string;
  items: Array<{ sku: string; name: string; qty: number; priceLKR: number }>;
  totalLKR?: number;
}): Promise<ApiOrder | null> {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("Backend API createOrder error:", err);
    return null;
  }
}

export async function updateOrderStatusApi(id: string, status: string): Promise<ApiOrder | null> {
  try {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("Backend API updateOrderStatus error:", err);
    return null;
  }
}

// ─── Analytics API ─────────────────────────────────────────

export async function fetchAnalyticsApi(): Promise<ApiAnalytics | null> {
  try {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("Backend API fetchAnalytics error:", err);
    return null;
  }
}
