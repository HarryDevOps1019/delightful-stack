import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TrendingUp, Users, ShoppingBag, DollarSign, Award, Layers, Package, AlertTriangle } from "lucide-react";
import { formatLKR } from "@/lib/format";
import { useCatalog } from "@/services/catalog";
import { fetchOrdersApi, fetchAnalyticsApi, type ApiOrder, type ApiAnalytics } from "@/services/api";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Admin" }] }),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const { products, categories } = useCatalog();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [analytics, setAnalytics] = useState<ApiAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [ords, anl] = await Promise.all([
        fetchOrdersApi(),
        fetchAnalyticsApi(),
      ]);
      if (ords) setOrders(ords);
      if (anl) setAnalytics(anl);
      setLoading(false);
    }
    void loadData();
  }, []);

  const validOrders = orders.filter((o) => o.status !== "Cancelled");
  const totalRevenueLKR = validOrders.reduce((a, o) => a + (Number(o.totalLKR) || 0), 0);

  const avgOrderValueLKR = validOrders.length > 0 ? Math.round(totalRevenueLKR / validOrders.length) : 0;
  const inStockCount = products.filter((p) => p.stock > 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const totalInventoryValueLKR = products.reduce((sum, p) => sum + (p.priceCents * p.stock) / 100, 0);

  // Category shares from real DB products
  const categoryStats = categories.map((cat) => {
    const prods = products.filter((p) => p.category === cat.slug);
    const count = prods.length;
    const pct = products.length > 0 ? Math.round((count / products.length) * 100) : 0;
    const invValue = prods.reduce((sum, p) => sum + (p.priceCents * p.stock) / 100, 0);
    return {
      name: cat.name,
      slug: cat.slug,
      count,
      pct,
      invValueLKR: Math.round(invValue),
    };
  });

  // Top products from actual database catalog
  const featuredOrHighValueProducts = products
    .filter((p) => p.featured || p.stock > 0)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Total Sales Revenue</p>
            <DollarSign className="h-4 w-4 text-orange-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{formatLKR(totalRevenueLKR * 100)}</p>
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-semibold mt-2">
            <span>
              {validOrders.length} valid orders
              {orders.filter((o) => o.status === "Cancelled").length > 0
                ? ` (${orders.filter((o) => o.status === "Cancelled").length} cancelled excluded)`
                : ""}
            </span>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Avg Order Value</p>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{formatLKR(avgOrderValueLKR * 100)}</p>
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-semibold mt-2">
            <span>Calculated from live orders</span>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Total Inventory Value</p>
            <Package className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{formatLKR(totalInventoryValueLKR * 100)}</p>
          <div className="flex items-center gap-1 text-[11px] text-blue-400 font-semibold mt-2">
            <span>{products.length} live SKUs in catalog</span>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Stock Availability Rate</p>
            <ShoppingBag className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">
            {products.length > 0 ? ((inStockCount / products.length) * 100).toFixed(1) : "0"}%
          </p>
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-semibold mt-2">
            <span>{inStockCount} of {products.length} items in stock</span>
          </div>
        </div>
      </div>

      {/* Real Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-orange-400" /> Category Breakdown in Supabase
            </h2>
            <span className="text-xs font-mono text-zinc-500">{categories.length} categories</span>
          </div>

          <div className="space-y-4 pt-2">
            {categoryStats.map((cat) => (
              <div key={cat.slug} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white">{cat.name}</span>
                  <span className="text-orange-400">{cat.count} items ({cat.pct}%)</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Stock value: {formatLKR(cat.invValueLKR * 100)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Catalog Highlights */}
        <div className="admin-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" /> Key Catalog SKUs
            </h2>
            <span className="text-xs text-zinc-500 font-mono">Live Products</span>
          </div>

          <div className="space-y-2.5">
            {featuredOrHighValueProducts.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="h-6 w-6 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">{p.sku} • {p.brand}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs font-bold text-emerald-400">{formatLKR(p.priceCents)}</p>
                  <p className="text-[10px] text-zinc-500">{p.stock} units in stock</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
