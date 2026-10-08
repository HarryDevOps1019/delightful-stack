import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, Download, Filter, Eye, Clock, CheckCircle2, Zap } from "lucide-react";
import { formatLKR } from "@/lib/format";
import { mockOrders, StatusBadge } from "@/components/admin/shared";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredOrders = useMemo(() => {
    return mockOrders.filter((o) => {
      const matchSearch =
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.toLowerCase().includes(search.toLowerCase()) ||
        o.product.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const stats = useMemo(() => {
    const total = mockOrders.reduce((acc, o) => acc + o.total, 0);
    const processing = mockOrders.filter((o) => o.status === "Processing").length;
    const shipped = mockOrders.filter((o) => o.status === "Shipped").length;
    const delivered = mockOrders.filter((o) => o.status === "Delivered").length;
    return { total, processing, shipped, delivered };
  }, []);

  return (
    <div className="space-y-6">
      {/* Top summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="admin-card">
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Total Sales</p>
          <p className="text-xl font-black text-white mt-1">{formatLKR(stats.total * 100)}</p>
          <p className="text-xs text-zinc-400 mt-1">{mockOrders.length} total orders</p>
        </div>
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-amber-500/80 uppercase tracking-wider">Processing</p>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-amber-400 mt-1">{stats.processing}</p>
          <p className="text-xs text-zinc-400 mt-1">Needs fulfillment</p>
        </div>
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-blue-500/80 uppercase tracking-wider">In Transit</p>
            <Zap className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-xl font-black text-blue-400 mt-1">{stats.shipped}</p>
          <p className="text-xs text-zinc-400 mt-1">Shipped to customer</p>
        </div>
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-emerald-500/80 uppercase tracking-wider">Completed</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400 mt-1">{stats.delivered}</p>
          <p className="text-xs text-zinc-400 mt-1">Successfully delivered</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID, customer or item..."
              className="admin-input pl-8 w-full"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Filter className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            {["All", "Processing", "Shipped", "Delivered", "Cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                    : "bg-zinc-800/60 text-zinc-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}

            <button className="admin-btn-ghost flex items-center gap-1.5 ml-auto sm:ml-2 shrink-0">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-[10px] font-bold border-b border-zinc-800">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Date</th>
                <th className="p-3">Items / Product</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    No orders match your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-orange-400">{o.id}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-300">
                          {o.customer.charAt(0)}
                        </div>
                        <span className="text-white font-semibold">{o.customer}</span>
                      </div>
                    </td>
                    <td className="p-3 text-zinc-400">{o.date}</td>
                    <td className="p-3 text-zinc-300 max-w-xs truncate">{o.product}</td>
                    <td className="p-3 font-bold text-white">{formatLKR(o.total * 100)}</td>
                    <td className="p-3"><StatusBadge status={o.status} /></td>
                    <td className="p-3 text-right">
                      <button className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors" title="View details">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
