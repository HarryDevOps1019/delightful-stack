import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useCatalog } from "@/services/catalog";
import { formatLKR } from "@/lib/format";
import { StockBadge } from "@/components/admin/shared";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({ meta: [{ title: "Inventory & Stock — Admin" }] }),
  component: AdminInventory,
});

function AdminInventory() {
  const { products, categories, updateProduct } = useCatalog();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [page, setPage] = useState(1);
  const pageSize = 30;

  const stockStats = useMemo(() => {
    const totalItems = products.length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5);
    const outOfStock = products.filter((p) => p.stock === 0);
    const totalInventoryValue = products.reduce((sum, p) => sum + p.priceCents * p.stock, 0);
    return { totalItems, lowStock, outOfStock, totalInventoryValue };
  }, [products]);

  const categoryStock = useMemo(() => {
    return categories.map((cat) => {
      const catProducts = products.filter((p) => p.category === cat.slug);
      const totalStock = catProducts.reduce((sum, p) => sum + p.stock, 0);
      const lowCount = catProducts.filter((p) => p.stock <= 5).length;
      return { ...cat, count: catProducts.length, totalStock, lowCount };
    });
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);
      const matchFilter =
        filter === "all" ||
        (filter === "low" && p.stock > 0 && p.stock <= 5) ||
        (filter === "out" && p.stock === 0);
      return matchSearch && matchFilter;
    });
  }, [products, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const handleQuickRestock = (id: string, name: string, currentStock: number) => {
    const newStock = currentStock + 10;
    updateProduct(id, { stock: newStock });
    toast.success(`Restocked ${name} (+10 units). New stock: ${newStock}`);
  };

  return (
    <div className="space-y-6">
      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Total SKUs</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{stockStats.totalItems}</p>
          <p className="text-xs text-zinc-400 mt-1">
            Across {categories.length} active departments
          </p>
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
          <p className="text-xs text-zinc-400 mt-1">Current total stock valuation</p>
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
                  className={`h-full rounded-full ${cat.lowCount > 0 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{
                    width: `${Math.min(100, Math.max(10, (cat.totalStock / Math.max(1, stockStats.totalItems * 10)) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span>{cat.count} SKUs</span>
                {cat.lowCount > 0 && <span className="text-amber-400 font-semibold">{cat.lowCount} low stock</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="admin-card p-0 overflow-hidden space-y-0">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/40">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by product name, SKU or brand..."
              className="admin-input pl-8 w-full text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFilter("all");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                filter === "all" ? "bg-orange-500/20 text-orange-400 border border-orange-500/40" : "bg-zinc-800/60 text-zinc-400"
              }`}
            >
              All Items ({products.length})
            </button>
            <button
              onClick={() => {
                setFilter("low");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                filter === "low" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-zinc-800/60 text-zinc-400"
              }`}
            >
              Low Stock ({stockStats.lowStock.length})
            </button>
            <button
              onClick={() => {
                setFilter("out");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                filter === "out" ? "bg-red-500/20 text-red-400 border border-red-500/40" : "bg-zinc-800/60 text-zinc-400"
              }`}
            >
              Out of Stock ({stockStats.outOfStock.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
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
              {paginated.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt={p.name} className="h-8 w-8 rounded object-cover bg-zinc-800 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-white font-semibold truncate max-w-[240px]">{p.name}</p>
                        <p className="text-[10px] text-zinc-500">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-zinc-400">{p.sku}</td>
                  <td className="p-3 font-bold text-white">{formatLKR(p.priceCents)}</td>
                  <td className="p-3 font-bold text-white">{p.stock} units</td>
                  <td className="p-3"><StockBadge stock={p.stock} /></td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleQuickRestock(p.id, p.name, p.stock)}
                      className="admin-btn-ghost text-[11px] inline-flex items-center gap-1 hover:border-emerald-500/40 hover:text-emerald-400"
                      title="Add 10 units to stock"
                    >
                      <Plus className="h-3 w-3" /> +10 Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No products match your inventory filter.
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between text-xs text-zinc-400">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length} items
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30 text-zinc-400 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-xs font-bold text-white">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30 text-zinc-400 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
