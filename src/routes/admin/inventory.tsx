import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, AlertTriangle, CheckCircle2, XCircle, Plus, RefreshCw } from "lucide-react";
import { products, categories } from "@/data/catalog";
import { formatLKR } from "@/lib/format";
import { StockBadge } from "@/components/admin/shared";

export const Route = createFileRoute("/admin/inventory")({
  component: AdminInventory,
});

function AdminInventory() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");

  const stockStats = useMemo(() => {
    const totalItems = products.length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5);
    const outOfStock = products.filter((p) => p.stock === 0);
    const totalInventoryValue = products.reduce((sum, p) => sum + p.priceCents * p.stock, 0);
    return { totalItems, lowStock, outOfStock, totalInventoryValue };
  }, []);

  const categoryStock = useMemo(() => {
    return categories.map((cat) => {
      const catProducts = products.filter((p) => p.category === cat.slug);
      const totalStock = catProducts.reduce((sum, p) => sum + p.stock, 0);
      const lowCount = catProducts.filter((p) => p.stock <= 5).length;
      return { ...cat, count: catProducts.length, totalStock, lowCount };
    });
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === "all" ||
        (filter === "low" && p.stock > 0 && p.stock <= 5) ||
        (filter === "out" && p.stock === 0);
      return matchSearch && matchFilter;
    });
  }, [search, filter]);

  return (
    <div className="space-y-6">
      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Total Products</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{stockStats.totalItems}</p>
          <p className="text-xs text-zinc-400 mt-1">Across all categories</p>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Low Stock</p>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-1">{stockStats.lowStock.length}</p>
          <p className="text-xs text-zinc-400 mt-1">Items ≤ 5 units left</p>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider">Out of Stock</p>
            <XCircle className="h-4 w-4 text-red-400" />
          </div>
          <p className="text-2xl font-black text-red-400 mt-1">{stockStats.outOfStock.length}</p>
          <p className="text-xs text-zinc-400 mt-1">Immediate restock required</p>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Inventory Valuation</p>
            <RefreshCw className="h-4 w-4 text-orange-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{formatLKR(stockStats.totalInventoryValue)}</p>
          <p className="text-xs text-zinc-400 mt-1">Current total stock value</p>
        </div>
      </div>

      {/* Category Stock Level Breakdown */}
      <div className="admin-card space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Category Stock Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStock.map((cat) => (
            <div key={cat.slug} className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{cat.name}</span>
                <span className="text-[10px] font-semibold text-zinc-400">{cat.totalStock} units</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    cat.lowCount > 0 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, (cat.totalStock / 150) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span>{cat.count} product types</span>
                {cat.lowCount > 0 && (
                  <span className="text-amber-400 font-semibold">{cat.lowCount} low stock</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="admin-card space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, SKU or brand..."
              className="admin-input pl-8 w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                filter === "all" ? "bg-orange-500/20 text-orange-400 border border-orange-500/40" : "bg-zinc-800/60 text-zinc-400"
              }`}
            >
              All Items ({products.length})
            </button>
            <button
              onClick={() => setFilter("low")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                filter === "low" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-zinc-800/60 text-zinc-400"
              }`}
            >
              Low Stock ({stockStats.lowStock.length})
            </button>
            <button
              onClick={() => setFilter("out")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                filter === "out" ? "bg-red-500/20 text-red-400 border border-red-500/40" : "bg-zinc-800/60 text-zinc-400"
              }`}
            >
              Out of Stock ({stockStats.outOfStock.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-[10px] font-bold border-b border-zinc-800">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Unit Price</th>
                <th className="p-3">Stock Count</th>
                <th className="p-3">Stock Status</th>
                <th className="p-3 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt={p.name} className="h-8 w-8 rounded object-cover bg-zinc-800" />
                      <div>
                        <p className="text-white font-semibold">{p.name}</p>
                        <p className="text-[10px] text-zinc-500">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-zinc-400">{p.sku}</td>
                  <td className="p-3 font-bold text-white">{formatLKR(p.priceCents)}</td>
                  <td className="p-3 font-bold text-white">{p.stock}</td>
                  <td className="p-3"><StockBadge stock={p.stock} /></td>
                  <td className="p-3 text-right">
                    <button className="admin-btn-ghost text-[11px] inline-flex items-center gap-1">
                      <Plus className="h-3 w-3" /> +10 Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
