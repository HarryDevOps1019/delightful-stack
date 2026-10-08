import { createFileRoute } from "@tanstack/react-router";
import { DollarSign, ShoppingCart, Package, Users, ArrowUpRight, Layers, ShoppingBag, AlertTriangle } from "lucide-react";
import { products } from "@/data/catalog";
import { formatLKR } from "@/lib/format";
import {
  Sparkline, StatusBadge, StockBadge,
  mockOrders, revenueData, ordersData, visitorsData, categoryRevenue,
} from "@/components/admin/shared";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Overview — Admin" }] }),
  component: OverviewPage,
});

const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5);
const outOfStock = products.filter(p => p.stock === 0);

function OverviewPage() {
  const totalRevenue = mockOrders
    .filter(o => o.status !== "Cancelled")
    .reduce((a, o) => a + o.total, 0);

  const kpis = [
    {
      label: "Total Revenue", value: formatLKR(totalRevenue * 100),
      change: "+18.4%", up: true, sub: "vs last month",
      icon: <DollarSign className="h-5 w-5" />,
      color: "from-orange-500 to-pink-600", spark: revenueData, sparkColor: "#f97316",
    },
    {
      label: "Orders This Month", value: String(mockOrders.length),
      change: "+12.1%", up: true, sub: "vs last month",
      icon: <ShoppingCart className="h-5 w-5" />,
      color: "from-violet-500 to-indigo-600", spark: ordersData, sparkColor: "#8b5cf6",
    },
    {
      label: "Active Products", value: String(products.length),
      change: "+3", up: true, sub: "added this month",
      icon: <Package className="h-5 w-5" />,
      color: "from-cyan-500 to-blue-600",
      spark: [14, 16, 14, 18, 20, 18, 22, 21, 20, 22, 21, 23], sparkColor: "#06b6d4",
    },
    {
      label: "Unique Visitors", value: "2,840",
      change: "+9.7%", up: true, sub: "vs last month",
      icon: <Users className="h-5 w-5" />,
      color: "from-emerald-500 to-teal-600", spark: visitorsData, sparkColor: "#10b981",
    },
  ];

  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="admin-card group relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${k.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{k.label}</p>
                <p className="mt-1.5 text-2xl font-black text-white tracking-tight">{k.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${k.color} shadow-lg`}>
                <span className="text-white">{k.icon}</span>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`flex items-center gap-0.5 text-xs font-bold ${k.up ? "text-emerald-400" : "text-red-400"}`}>
                  <ArrowUpRight className="h-3.5 w-3.5" /> {k.change}
                </span>
                <span className="text-zinc-500 text-xs">{k.sub}</span>
              </div>
              <Sparkline data={k.spark} color={k.sparkColor} />
            </div>
          </div>
        ))}
      </div>

      {/* Category revenue + recent orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="admin-card xl:col-span-1">
          <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
            <Layers className="h-4 w-4 text-orange-500" /> Revenue by Category
          </h3>
          <div className="space-y-4">
            {categoryRevenue.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 font-semibold">{c.name}</span>
                  <span className="text-zinc-400">{formatLKR(c.revenue * 100)}</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-700"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
                <div className="text-right text-[10px] text-zinc-500 mt-0.5">{c.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-violet-400" /> Recent Orders
            </h3>
            <span className="text-[11px] text-violet-400 font-semibold cursor-pointer hover:text-violet-300">View all →</span>
          </div>
          <div className="space-y-3">
            {mockOrders.slice(0, 6).map((o) => (
              <div key={o.id} className="flex items-center gap-3 py-2 border-b border-zinc-800/60 last:border-0">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center text-[10px] font-black text-violet-400 shrink-0">
                  {o.customer.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{o.customer}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{o.product}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-white">{formatLKR(o.total * 100)}</p>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock alerts */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="admin-card border-l-2 border-amber-500">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" /> Stock Alerts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...outOfStock, ...lowStock].slice(0, 6).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-3 bg-zinc-800/40 rounded-lg">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                  <p className="text-[10px] text-zinc-500">{p.sku}</p>
                </div>
                <StockBadge stock={p.stock} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
