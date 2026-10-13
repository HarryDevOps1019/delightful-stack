import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Download,
  Upload,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Sparkles,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Package,
  Layers,
  Check,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCatalog,
  type CreateProductInput,
} from "@/services/catalog";
import { images } from "@/data/catalog";
import { formatLKR } from "@/lib/format";
import { StockBadge } from "@/components/admin/shared";
import type { Category, Product } from "@/lib/types";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products & 800+ SKUs — Admin" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const {
    products,
    categories,
    brands,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    deleteCategory,
    generate800SKUs,
    resetCatalogToDefault,
  } = useCatalog();

  // Search, filter & sorting state
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "low" | "out">("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"sku-asc" | "sku-desc" | "name" | "price-asc" | "price-desc" | "stock" | "newest">("newest");

  // Pagination state (critical for 800+ SKUs)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);

  // Filtered & sorted products
  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const matchCat = catFilter === "all" || p.category === catFilter;
      const matchBrand = brandFilter === "all" || p.brand === brandFilter;

      let matchStock = true;
      if (stockFilter === "in") matchStock = p.stock > 5;
      else if (stockFilter === "low") matchStock = p.stock > 0 && p.stock <= 5;
      else if (stockFilter === "out") matchStock = p.stock === 0;

      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q);

      return matchCat && matchBrand && matchStock && matchSearch;
    });

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "sku-asc":
          return a.sku.localeCompare(b.sku);
        case "sku-desc":
          return b.sku.localeCompare(a.sku);
        case "name":
          return a.name.localeCompare(b.name);
        case "price-asc":
          return a.priceCents - b.priceCents;
        case "price-desc":
          return b.priceCents - a.priceCents;
        case "stock":
          return b.stock - a.stock;
        case "newest":
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });

    return result;
  }, [products, search, catFilter, brandFilter, stockFilter, sortBy]);

  // Pagination calculation
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setProductModalOpen(true);
  };

  const handleDuplicate = (p: Product) => {
    const duplicateSku = `${p.sku}-CP${Math.floor(Math.random() * 900 + 100)}`;
    createProduct({
      name: `${p.name} (Copy)`,
      sku: duplicateSku,
      brand: p.brand,
      model: p.model,
      category: p.category,
      priceLKR: p.priceCents / 100,
      compareAtLKR: p.compareAtCents ? p.compareAtCents / 100 : undefined,
      stock: p.stock,
      description: p.description,
      image: p.images[0] ?? images.catComponents,
      featured: false,
      isNew: true,
      specs: p.specs,
      attributes: p.attributes,
    });
    toast.success(`Duplicated ${p.name} as ${duplicateSku}`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProduct(id);
      toast.success(`Deleted "${name}"`);
    }
  };

  const handleGenerate800 = () => {
    const res = generate800SKUs();
    setPage(1);
    toast.success(`Catalog populated with ${res.total} total SKUs (${res.count} new items added)!`);
  };

  const handleResetCatalog = () => {
    if (confirm("Reset catalog back to initial demonstration products?")) {
      resetCatalogToDefault();
      setPage(1);
      toast.success("Catalog reset to initial sample items.");
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "SKU", "Name", "Brand", "Model", "Category", "PriceLKR", "CompareAtLKR", "Stock", "Featured", "IsNew", "Description"];
    const rows = filtered.map((p) => [
      p.id,
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.brand.replace(/"/g, '""')}"`,
      `"${p.model.replace(/"/g, '""')}"`,
      p.category,
      (p.priceCents / 100).toFixed(2),
      p.compareAtCents ? (p.compareAtCents / 100).toFixed(2) : "",
      p.stock,
      p.featured ? "1" : "0",
      p.isNew ? "1" : "0",
      `"${p.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `products_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filtered.length} products to CSV`);
  };

  // Stock summary counts
  const inStockCount = products.filter((p) => p.stock > 5).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Stat summary */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-white tracking-tight">Product & SKU Management</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
              <Package className="h-3.5 w-3.5" />
              {products.length} {products.length >= 800 ? "800+ SKUs" : "SKUs"}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Easily add products, create categories, and manage large-scale 800+ component inventory.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="admin-btn-ghost flex items-center gap-1.5 text-xs font-bold"
            title="Manage and create categories"
          >
            <Layers className="h-3.5 w-3.5 text-orange-400" />
            Categories ({categories.length})
          </button>

          <button
            onClick={handleGenerate800}
            className="admin-btn-ghost flex items-center gap-1.5 text-xs font-bold text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
            title="Populate catalog with 800+ realistic electronics and repair SKUs"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Generate 800+ SKUs
          </button>

          <button
            onClick={() => setCsvModalOpen(true)}
            className="admin-btn-ghost flex items-center gap-1.5 text-xs font-bold"
            title="Import products via CSV"
          >
            <Upload className="h-3.5 w-3.5 text-zinc-400" />
            Import CSV
          </button>

          <button
            onClick={handleExportCSV}
            className="admin-btn-ghost flex items-center gap-1.5 text-xs font-bold"
            title="Export products to CSV"
          >
            <Download className="h-3.5 w-3.5 text-zinc-400" />
            Export CSV
          </button>

          <button
            id="products-add-btn"
            onClick={handleOpenAdd}
            className="admin-btn-primary flex items-center gap-2 shrink-0 text-xs font-bold shadow-lg"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Quick Stock Status Pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => { setStockFilter("all"); setPage(1); }}
          className={`px-3 py-1 rounded-full font-bold transition-all ${
            stockFilter === "all"
              ? "bg-zinc-100 text-zinc-950 font-black shadow-sm"
              : "bg-zinc-800/60 text-zinc-400 hover:text-white"
          }`}
        >
          All Items ({products.length})
        </button>
        <button
          onClick={() => { setStockFilter("in"); setPage(1); }}
          className={`px-3 py-1 rounded-full font-bold transition-all ${
            stockFilter === "in"
              ? "bg-emerald-500 text-white font-black shadow-sm"
              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
          }`}
        >
          In Stock ({inStockCount})
        </button>
        <button
          onClick={() => { setStockFilter("low"); setPage(1); }}
          className={`px-3 py-1 rounded-full font-bold transition-all ${
            stockFilter === "low"
              ? "bg-amber-500 text-white font-black shadow-sm"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
          }`}
        >
          Low Stock ≤5 ({lowStockCount})
        </button>
        <button
          onClick={() => { setStockFilter("out"); setPage(1); }}
          className={`px-3 py-1 rounded-full font-bold transition-all ${
            stockFilter === "out"
              ? "bg-red-500 text-white font-black shadow-sm"
              : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
          }`}
        >
          Out of Stock ({outOfStockCount})
        </button>

        {products.length > 20 && (
          <button
            onClick={handleResetCatalog}
            className="ml-auto text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
            title="Reset catalog back to sample data"
          >
            <RotateCcw className="h-3 w-3" /> Reset default
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card p-3 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            id="products-search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Instant search by product name, SKU, brand, model..."
            className="admin-input w-full pl-9 text-xs"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category filter */}
          <select
            id="products-category-filter"
            value={catFilter}
            onChange={(e) => {
              setCatFilter(e.target.value);
              setPage(1);
            }}
            className="admin-input text-xs min-w-[150px]"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => {
              const count = products.filter((p) => p.category === c.slug).length;
              return (
                <option key={c.slug} value={c.slug}>
                  {c.short} ({count})
                </option>
              );
            })}
          </select>

          {/* Brand filter */}
          <select
            value={brandFilter}
            onChange={(e) => {
              setBrandFilter(e.target.value);
              setPage(1);
            }}
            className="admin-input text-xs min-w-[130px]"
          >
            <option value="all">All Brands ({brands.length})</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="admin-input text-xs min-w-[140px]"
          >
            <option value="newest">Newest First</option>
            <option value="name">Name A–Z</option>
            <option value="sku-asc">SKU (Ascending)</option>
            <option value="sku-desc">SKU (Descending)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="stock">Stock (High to Low)</option>
          </select>

          {/* Per Page Selector */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="admin-input text-xs"
            title="Rows per page"
          >
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left bg-zinc-900/60">
                <th className="px-5 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">SKU</th>
                <th className="px-4 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Price (LKR)</th>
                <th className="px-4 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Badges</th>
                <th className="px-4 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {paginatedProducts.map((p) => {
                const cat = categories.find((c) => c.slug === p.category);
                return (
                  <tr key={p.id} className="group hover:bg-zinc-800/30 transition-colors">
                    {/* Product Image & Name */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-zinc-800 border border-zinc-700/50">
                          <img
                            src={p.images[0] || images.catComponents}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = images.catComponents;
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate max-w-[220px]" title={p.name}>
                            {p.name}
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            {p.brand} {p.model && `· ${p.model}`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(p.sku);
                          toast.success(`Copied SKU: ${p.sku}`);
                        }}
                        className="group/sku inline-flex items-center gap-1 text-[11px] font-mono text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700 px-2 py-0.5 rounded transition-colors"
                        title="Click to copy SKU"
                      >
                        <span>{p.sku}</span>
                        <Copy className="h-2.5 w-2.5 opacity-0 group-hover/sku:opacity-100 text-zinc-400" />
                      </button>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-zinc-300 font-medium bg-zinc-800/40 px-2 py-0.5 rounded border border-zinc-700/30">
                        {cat?.short || p.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-white">{formatLKR(p.priceCents)}</p>
                      {p.compareAtCents && (
                        <p className="text-[10px] text-zinc-500 line-through">
                          {formatLKR(p.compareAtCents)}
                        </p>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <StockBadge stock={p.stock} />
                    </td>

                    {/* Flags */}
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {p.featured && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/15 text-orange-400 font-bold border border-orange-500/30">
                            Featured
                          </span>
                        )}
                        {p.isNew && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-400 font-bold border border-blue-500/30">
                            New
                          </span>
                        )}
                        {!p.featured && !p.isNew && <span className="text-[10px] text-zinc-600">—</span>}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to="/product/$slug"
                          params={{ slug: p.slug }}
                          target="_blank"
                          className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                          title="View on storefront"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(p)}
                          className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                          title="Duplicate SKU"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                          title="Delete product"
                        >
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
            <div className="py-16 text-center text-zinc-500 text-sm space-y-2">
              <Package className="h-8 w-8 mx-auto text-zinc-600" />
              <p className="font-semibold text-zinc-300">No products match your filters</p>
              <p className="text-xs text-zinc-500">Try adjusting your search query or reset filters.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setCatFilter("all");
                  setBrandFilter("all");
                  setStockFilter("all");
                }}
                className="admin-btn-ghost text-xs mt-2"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination & Footer Controls */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <div>
            Showing{" "}
            <span className="font-bold text-white">
              {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-white">
              {Math.min(currentPage * pageSize, totalItems)}
            </span>{" "}
            of <span className="font-bold text-white">{totalItems}</span> products
            {totalItems !== products.length && ` (filtered from ${products.length} total)`}
          </div>

          {/* Pagination Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent text-zinc-400 hover:text-white"
                title="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent text-zinc-400 hover:text-white"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="px-2 py-0.5 rounded bg-zinc-800 text-xs font-bold text-white">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent text-zinc-400 hover:text-white"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent text-zinc-400 hover:text-white"
                title="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Add / Edit Product Modal ─── */}
      {productModalOpen && (
        <ProductFormModal
          isOpen={productModalOpen}
          onClose={() => setProductModalOpen(false)}
          editingProduct={editingProduct}
          categories={categories}
          brands={brands}
          onSave={(data) => {
            if (editingProduct) {
              updateProduct(editingProduct.id, data);
              toast.success(`Updated "${data.name}" successfully!`);
            } else {
              createProduct(data as CreateProductInput);
              toast.success(`Created product "${data.name}" (${data.sku})!`);
            }
            setProductModalOpen(false);
          }}
          onOpenCategories={() => setCategoryModalOpen(true)}
        />
      )}

      {/* ─── Category Manager Modal ─── */}
      {categoryModalOpen && (
        <CategoryManagerModal
          isOpen={categoryModalOpen}
          onClose={() => setCategoryModalOpen(false)}
          categories={categories}
          productsCount={products}
          onCreate={(cat) => {
            createCategory(cat);
            toast.success(`Category "${cat.name}" created!`);
          }}
          onDelete={(slug) => {
            const count = products.filter((p) => p.category === slug).length;
            if (count > 0 && !confirm(`Category has ${count} product(s) assigned. Delete anyway?`)) {
              return;
            }
            deleteCategory(slug);
            toast.success("Category deleted.");
          }}
        />
      )}

      {/* ─── CSV Import Modal ─── */}
      {csvModalOpen && (
        <CsvImportModal
          isOpen={csvModalOpen}
          onClose={() => setCsvModalOpen(false)}
          categories={categories}
          onImport={(items) => {
            let count = 0;
            items.forEach((item) => {
              createProduct(item);
              count++;
            });
            toast.success(`Successfully imported ${count} SKUs!`);
            setCsvModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── Modal 1: Product Add / Edit Form Modal ──────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  categories,
  brands,
  onSave,
  onOpenCategories,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  categories: Category[];
  brands: string[];
  onSave: (data: Partial<CreateProductInput> & { name: string; sku: string; category: string; priceLKR: number; stock: number }) => void;
  onOpenCategories: () => void;
}) {
  const isEditing = !!editingProduct;

  const [name, setName] = useState(editingProduct?.name || "");
  const [sku, setSku] = useState(editingProduct?.sku || "");
  const [brand, setBrand] = useState(editingProduct?.brand || "");
  const [model, setModel] = useState(editingProduct?.model || "");
  const [category, setCategory] = useState(editingProduct?.category || categories[0]?.slug || "components");
  const [priceLKR, setPriceLKR] = useState(editingProduct ? String(editingProduct.priceCents / 100) : "2500");
  const [compareAtLKR, setCompareAtLKR] = useState(editingProduct?.compareAtCents ? String(editingProduct.compareAtCents / 100) : "");
  const [stock, setStock] = useState(editingProduct ? String(editingProduct.stock) : "25");
  const [description, setDescription] = useState(editingProduct?.description || "");
  const [image, setImage] = useState(editingProduct?.images[0] || images.catComponents);
  const [featured, setFeatured] = useState(!!editingProduct?.featured);
  const [isNew, setIsNew] = useState(editingProduct?.isNew !== undefined ? editingProduct.isNew : true);

  if (!isOpen) return null;

  // SKU generator helper
  const handleAutoGenerateSku = () => {
    const catCode = category.slice(0, 3).toUpperCase();
    const rnd = Math.floor(Math.random() * 8999 + 1000);
    setSku(`AE-${catCode}-${rnd}`);
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a product name");
      return;
    }
    if (!sku.trim()) {
      toast.error("Please enter or generate a SKU");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    const numPrice = Number(priceLKR);
    if (isNaN(numPrice) || numPrice < 0) {
      toast.error("Please enter a valid price in LKR");
      return;
    }

    onSave({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      brand: brand.trim() || "Generic",
      model: model.trim() || "Standard",
      category,
      priceLKR: numPrice,
      compareAtLKR: compareAtLKR ? Number(compareAtLKR) : undefined,
      stock: Math.max(0, parseInt(stock, 10) || 0),
      description: description.trim() || undefined,
      image,
      featured,
      isNew,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in-0">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-extrabold text-white">
              {isEditing ? `Edit Product: ${editingProduct?.sku}` : "Add New Product / SKU"}
            </h2>
            <p className="text-xs text-zinc-400">
              {isEditing ? "Update product specifications and live storefront inventory" : "Fill details below to publish to the store catalog immediately"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Row 1: Name */}
          <div>
            <label className="block font-bold text-zinc-300 mb-1">
              Product Name <span className="text-orange-500">*</span>
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ESP32-WROOM-32D Development Board or 100uF 50V Capacitor"
              className="admin-input w-full text-xs"
            />
          </div>

          {/* Row 2: SKU with Auto-generate + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-zinc-300">
                  SKU Code <span className="text-orange-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateSku}
                  className="text-[10px] text-orange-400 hover:text-orange-300 font-bold underline"
                >
                  Generate SKU
                </button>
              </div>
              <input
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. AE-CMP-1049"
                className="admin-input w-full font-mono text-xs uppercase"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-zinc-300">
                  Category <span className="text-orange-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={onOpenCategories}
                  className="text-[10px] text-orange-400 hover:text-orange-300 font-bold underline"
                >
                  + Add Category
                </button>
              </div>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="admin-input w-full text-xs"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name} ({c.short})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Brand & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Brand Name</label>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Texas Instruments, Nichicon, Hakko"
                className="admin-input w-full text-xs"
                list="brand-suggestions"
              />
              <datalist id="brand-suggestions">
                {brands.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">Model / Spec Code</label>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. FX-888D, UNO R3, LM358"
                className="admin-input w-full text-xs"
              />
            </div>
          </div>

          {/* Row 4: Price & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-zinc-300 mb-1">
                Price in LKR <span className="text-orange-500">*</span>
              </label>
              <input
                required
                type="number"
                min="0"
                step="any"
                value={priceLKR}
                onChange={(e) => setPriceLKR(e.target.value)}
                placeholder="e.g. 2450"
                className="admin-input w-full text-xs font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">Original Price (Discount)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={compareAtLKR}
                onChange={(e) => setCompareAtLKR(e.target.value)}
                placeholder="e.g. 2900 (optional)"
                className="admin-input w-full text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-300 mb-1">
                Stock Quantity <span className="text-orange-500">*</span>
              </label>
              <input
                required
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="e.g. 45"
                className="admin-input w-full text-xs font-bold"
              />
            </div>
          </div>

          {/* Image Presets & Custom URL */}
          <div>
            <label className="block font-bold text-zinc-300 mb-1">Product Image URL</label>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Paste image URL..."
              className="admin-input w-full text-xs font-mono mb-2"
            />
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500 font-semibold">Quick image preset:</span>
              <button
                type="button"
                onClick={() => setImage(images.catComponents)}
                className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 hover:text-white"
              >
                Components
              </button>
              <button
                type="button"
                onClick={() => setImage(images.catAudio)}
                className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 hover:text-white"
              >
                Audio
              </button>
              <button
                type="button"
                onClick={() => setImage(images.catLighting)}
                className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 hover:text-white"
              >
                Lighting
              </button>
              <button
                type="button"
                onClick={() => setImage(images.catMobile)}
                className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 hover:text-white"
              >
                Mobile Parts
              </button>
              <button
                type="button"
                onClick={() => setImage(images.catTv)}
                className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 hover:text-white"
              >
                TVs
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-zinc-300 mb-1">Description & Specs</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description, technical details, pinout or compatibility..."
              className="admin-input w-full text-xs"
            />
          </div>

          {/* Checkboxes: Featured & New */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-300">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded accent-orange-500 h-4 w-4"
              />
              Feature on Homepage
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-300">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="rounded accent-orange-500 h-4 w-4"
              />
              Mark as New Arrival
            </label>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button type="button" onClick={onClose} className="admin-btn-ghost text-xs">
              Cancel
            </button>
            <button type="submit" className="admin-btn-primary flex items-center gap-2 text-xs">
              <Check className="h-4 w-4" />
              {isEditing ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── Modal 2: Category Manager Modal ─────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  productsCount,
  onCreate,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  productsCount: Product[];
  onCreate: (cat: { name: string; short: string; slug?: string; filterKey?: string }) => void;
  onDelete: (slug: string) => void;
}) {
  const [newCatName, setNewCatName] = useState("");
  const [newCatShort, setNewCatShort] = useState("");
  const [newFilterKey, setNewFilterKey] = useState("Type");

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    onCreate({
      name: newCatName.trim(),
      short: newCatShort.trim() || newCatName.trim(),
      filterKey: newFilterKey.trim() || "Type",
    });
    setNewCatName("");
    setNewCatShort("");
    setNewFilterKey("Type");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in-0">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-orange-400" /> Category Management
            </h2>
            <p className="text-xs text-zinc-400">
              Manage product categories and add new departments for your 800+ SKUs.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Add Category Section */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/40">
          <form onSubmit={handleAdd} className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Add New Category</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Full Name (e.g. Batteries & Cells)"
                className="admin-input text-xs"
              />
              <input
                value={newCatShort}
                onChange={(e) => setNewCatShort(e.target.value)}
                placeholder="Short Label (e.g. Batteries)"
                className="admin-input text-xs"
              />
              <input
                value={newFilterKey}
                onChange={(e) => setNewFilterKey(e.target.value)}
                placeholder="Filter Key (e.g. Chemistry)"
                className="admin-input text-xs"
              />
            </div>
            <button type="submit" className="admin-btn-primary text-xs flex items-center gap-1.5 w-full justify-center">
              <Plus className="h-3.5 w-3.5" /> Create Category
            </button>
          </form>
        </div>

        {/* Existing Categories List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Active Categories ({categories.length})
          </p>
          {categories.map((c) => {
            const count = productsCount.filter((p) => p.category === c.slug).length;
            return (
              <div
                key={c.slug}
                className="p-3 rounded-lg bg-zinc-800/40 border border-zinc-800 flex items-center justify-between gap-3 hover:bg-zinc-800/60 transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-white">{c.name}</p>
                  <p className="text-[10px] text-zinc-500">
                    Slug: <code className="text-zinc-400">{c.slug}</code> · Short: "{c.short}" · Filter: {c.filterKey}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                    {count} products
                  </span>
                  <button
                    onClick={() => onDelete(c.slug)}
                    className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-zinc-800 text-right">
          <button onClick={onClose} className="admin-btn-ghost text-xs">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── Modal 3: CSV Import Modal ───────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function CsvImportModal({
  isOpen,
  onClose,
  categories,
  onImport,
}: {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onImport: (items: CreateProductInput[]) => void;
}) {
  const sampleTemplate = `sku,name,brand,model,category,price,stock,description
AE-CMP-2001,High Voltage Ceramic Cap 10nF 1kV,Murata,CAP-10N,components,45,200,High voltage ceramic capacitor for repair
AE-AUD-3001,Dual Balanced Armature Driver,Knowles,BA-300,audio,4800,15,Precision in-ear earphone audio driver
AE-LGT-4001,SMD 5050 LED Module 12V Warm,Orange Electric,SMD-5050,lighting,180,95,High output LED module for signage
AE-MOB-5001,iPhone 13 Battery Replacement 3227mAh,OEM Grade,IP13-BAT,mobile,7400,12,High-capacity replacement battery cell`;

  const [csvText, setCsvText] = useState(sampleTemplate);

  if (!isOpen) return null;

  const handleParseAndImport = (): void => {
    try {
      const lines = csvText.trim().split("\n");
      const headerLine = lines[0];
      if (!headerLine || lines.length <= 1) {
        toast.error("CSV text is empty or missing headers");
        return;
      }

      const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());
      const skuIdx = headers.indexOf("sku");
      const nameIdx = headers.indexOf("name");
      const brandIdx = headers.indexOf("brand");
      const modelIdx = headers.indexOf("model");
      const catIdx = headers.indexOf("category");
      const priceIdx = headers.indexOf("price");
      const stockIdx = headers.indexOf("stock");
      const descIdx = headers.indexOf("description");

      if (skuIdx === -1 || nameIdx === -1 || priceIdx === -1) {
        toast.error("CSV must contain at least 'sku', 'name', and 'price' columns");
        return;
      }

      const parsed: CreateProductInput[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]?.trim();
        if (!line) continue;
        const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));

        const colSku = cols[skuIdx];
        const colName = cols[nameIdx];
        if (!colName) continue;

        const sku = colSku || `AE-IMP-${1000 + i}`;
        const name = colName;
        const brand = brandIdx !== -1 && cols[brandIdx] ? (cols[brandIdx] ?? "Generic") : "Generic";
        const model = modelIdx !== -1 && cols[modelIdx] ? (cols[modelIdx] ?? "Standard") : "Standard";
        const cat = catIdx !== -1 && cols[catIdx] ? (cols[catIdx] ?? "components") : (categories[0]?.slug ?? "components");
        const price = (priceIdx !== -1 && cols[priceIdx] ? parseFloat(cols[priceIdx] ?? "100") : 100) || 100;
        const stock = stockIdx !== -1 && cols[stockIdx] ? parseInt(cols[stockIdx] ?? "10", 10) || 10 : 10;
        const desc = descIdx !== -1 && cols[descIdx] ? (cols[descIdx] ?? "Imported product item") : "Imported product item";

        parsed.push({
          sku,
          name,
          brand,
          model,
          category: cat,
          priceLKR: price,
          stock,
          description: desc,
          featured: false,
          isNew: true,
        });
      }

      if (parsed.length === 0) {
        toast.error("No valid products found in CSV");
        return;
      }
      onImport(parsed);
    } catch (e) {
      console.error(e);
      toast.error("Failed to parse CSV. Please check formatting.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in-0">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Upload className="h-4 w-4 text-orange-400" /> Bulk Import Products / SKUs
            </h2>
            <p className="text-xs text-zinc-400">
              Paste CSV text to quickly add tens or hundreds of SKUs to your catalog.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-3 text-xs">
          <p className="text-zinc-300 font-semibold">
            CSV Format: <code className="text-orange-400 font-mono">sku,name,brand,model,category,price,stock,description</code>
          </p>
          <textarea
            rows={10}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="admin-input w-full font-mono text-[11px]"
            placeholder="Paste your CSV data here..."
          />
        </div>

        <div className="p-4 border-t border-zinc-800 flex items-center justify-end gap-3">
          <button onClick={onClose} className="admin-btn-ghost text-xs">
            Cancel
          </button>
          <button onClick={handleParseAndImport} className="admin-btn-primary text-xs flex items-center gap-1.5">
            <Upload className="h-3.5 w-3.5" /> Parse & Import
          </button>
        </div>
      </div>
    </div>
  );
}

