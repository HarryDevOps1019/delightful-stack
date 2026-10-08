import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, Plus, Download, Eye, Edit2, Trash2 } from "lucide-react";
import { products, categories } from "@/data/catalog";
import { formatLKR } from "@/lib/format";
import { StockBadge } from "@/components/admin/shared";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products — Admin" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (catFilter === "all" || p.category === catFilter) &&
          (p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase()))
      ),
    [search, catFilter]
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            id="products-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU…"
            className="admin-input w-full pl-9"
          />
        </div>
        <select
          id="products-category-filter"
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="admin-input min-w-[180px]"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.short}</option>
          ))}
        </select>
        <button id="products-add-btn" className="admin-btn-primary flex items-center gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left">
                <th className="px-5 py-3.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">SKU</th>
                <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Flags</th>
                <th className="px-4 py-3.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.map((p) => {
                const cat = categories.find((c) => c.slug === p.category);
                return (
                  <tr key={p.id} className="group hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-zinc-800">
                          <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate max-w-[200px]">{p.name}</p>
                          <p className="text-[10px] text-zinc-500">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <code className="text-[11px] text-zinc-400 bg-zinc-800/60 px-1.5 py-0.5 rounded">{p.sku}</code>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-zinc-300">{cat?.short}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-bold text-white">{formatLKR(p.priceCents)}</p>
                      {p.compareAtCents && (
                        <p className="text-[10px] text-zinc-500 line-through">{formatLKR(p.compareAtCents)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5"><StockBadge stock={p.stock} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1 flex-wrap">
                        {p.isNew && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-bold border border-blue-500/20">New</span>}
                        {p.featured && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 font-bold border border-orange-500/20">Featured</span>}
                        {!p.isNew && !p.featured && <span className="text-[10px] text-zinc-600">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to="/product/$slug" params={{ slug: p.slug }} className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors" title="View">
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <button className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors" title="Edit">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-zinc-500 text-sm">No products match your search.</div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</span>
          <button className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
