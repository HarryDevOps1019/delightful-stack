import type { Product, Category } from "@/lib/types";
import { toast } from "sonner";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost" && !window.location.hostname.includes("127.0.0.1")
    ? "/api"
    : "http://localhost:5000/api");

export interface ApiOrder {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  totalLKR: number;
  status: "Quotation Requested" | "Quotation Sent" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  items: Array<{
    sku: string;
    name: string;
    qty: number;
    priceLKR: number;
  }>;
  notes: string;
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
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.error || `Failed to save product to database (${res.status})`;
      console.error("Backend API createProduct error:", res.status, err);
      toast.error(msg);
      return null;
    }
    const json = await res.json();
    return json.data || null;
  } catch (err: any) {
    console.warn("Backend API createProduct network error:", err);
    toast.error("Network error: Could not reach backend server to save product");
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
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.error || `Failed to update product in database (${res.status})`;
      console.error("Backend API updateProduct error:", res.status, err);
      toast.error(msg);
      return null;
    }
    const json = await res.json();
    return json.data || null;
  } catch (err: any) {
    console.warn("Backend API updateProduct network error:", err);
    toast.error("Network error: Could not reach backend server to update product");
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

export async function clearAllProductsApi(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/products/clear-all`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (err) {
    console.warn("Backend API clearAllProducts error:", err);
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

export async function updateCategoryApi(slug: string, updates: Partial<Category>): Promise<Category | null> {
  try {
    const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(slug)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("Backend API updateCategory error:", err);
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
  address?: string;
  city?: string;
  notes?: string;
  items: Array<{ sku: string; name: string; qty: number; priceLKR: number }>;
}): Promise<ApiOrder | null> {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || `HTTP ${res.status}`);
    }
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("Backend API createOrder error:", err);
    throw err; // re-throw so the caller can handle failures
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

export async function updateOrderDetailsApi(
  id: string,
  details: {
    customerName?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    notes?: string;
  }
): Promise<{ success: boolean; data?: ApiOrder; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: json.error || `Failed to update order (HTTP ${res.status})` };
    }
    return { success: true, data: json.data };
  } catch (err: any) {
    console.warn("Backend API updateOrderDetails error:", err);
    return { success: false, error: err.message || "Network error" };
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

// ─── Settings API ──────────────────────────────────────────

export interface ApiSettings {
  id?: string;
  storeName: string;
  whatsappNumber: string;
  officeEmail: string;
  phone: string;
  currency: string;
  taxRate: string;
  address: string;
  notifications: {
    newOrders: boolean;
    lowStock: boolean;
    weeklyReport: boolean;
  };
  updatedAt?: string;
}

export const DEFAULT_SETTINGS: ApiSettings = {
  storeName: "Asia Electronics & Cellular",
  whatsappNumber: "+94 74 106 6017",
  officeEmail: "aecpvt60@gmail.com",
  phone: "+94 74 106 6017",
  currency: "LKR (Rs.)",
  taxRate: "0%",
  address: "Sri Lanka",
  notifications: {
    newOrders: true,
    lowStock: true,
    weeklyReport: false,
  },
};

export async function fetchSettingsApi(): Promise<ApiSettings> {
  try {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) return DEFAULT_SETTINGS;
    const json = await res.json();
    return json.data || DEFAULT_SETTINGS;
  } catch (err) {
    console.warn("Backend API fetchSettings error (using default):", err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettingsApi(settings: Partial<ApiSettings>): Promise<ApiSettings | null> {
  try {
    const res = await fetch(`${API_BASE}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn("Backend API updateSettings error:", err);
    return null;
  }
}

// ─── Authentication API (Supabase Auth) ───────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "customer";
}

export interface AuthResponse {
  success: boolean;
  user: AuthUser;
  token?: string | null;
  refreshToken?: string | null;
  message?: string;
  error?: string;
}

export async function loginApi(credentials: { email: string; password: string }): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Failed to sign in");
    }
    return json;
  } catch (err: any) {
    console.error("loginApi error:", err);
    throw err;
  }
}

export async function registerApi(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Failed to create account");
    }
    return json;
  } catch (err: any) {
    console.error("registerApi error:", err);
    throw err;
  }
}

export async function fetchCurrentUserApi(token: string): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.user || null;
  } catch (err) {
    return null;
  }
}

export async function logoutApi(token?: string | null): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (err) {
    console.warn("logoutApi error:", err);
  }
}


