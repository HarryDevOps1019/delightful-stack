import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Search, Download, Filter, Eye, Clock, CheckCircle2, Zap,
  X, MapPin, Phone, Mail, CreditCard, Package, Truck,
  FileText, ChevronRight, Save,
} from "lucide-react";
import { formatLKR } from "@/lib/format";
import { mockOrders, StatusBadge, type MockOrder, type OrderStatus } from "@/components/admin/shared";
import { fetchOrdersApi, updateOrderStatusApi } from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

// ── Order Detail Modal ────────────────────────────────────────────────────────

const STATUS_OPTIONS: OrderStatus[] = ["Processing", "Shipped", "Delivered", "Cancelled"];

const STATUS_COLORS: Record<OrderStatus, string> = {
  Processing: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  Shipped:    "bg-blue-500/20 text-blue-400 border-blue-500/40",
  Delivered:  "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  Cancelled:  "bg-red-500/20 text-red-400 border-red-500/40",
};

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
}: {
  order: MockOrder;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    onStatusChange(order.id, selectedStatus);
    toast.success(`Order ${order.id} status updated to "${selectedStatus}"`);
    setSaving(false);
    onClose();
  };

  const deliveryFee = 500;
  const subtotal = order.lineItems.reduce((s, l) => s + l.qty * l.unitPrice, 0);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{
          background: "oklch(0.12 0.004 270)",
          border: "1px solid oklch(0.22 0.004 270)",
          fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
          style={{
            background: "oklch(0.12 0.004 270)",
            borderColor: "oklch(0.22 0.004 270)",
          }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-orange-400 text-sm">{order.id}</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
              <span className="text-xs text-zinc-400 font-semibold">Order Details</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5">Placed on {order.date}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* ── Status Changer ── */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: "oklch(0.15 0.004 270)", border: "1px solid oklch(0.25 0.004 270)" }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Order Status</p>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    selectedStatus === s
                      ? STATUS_COLORS[s]
                      : "bg-zinc-800/60 text-zinc-500 border-zinc-700 hover:text-zinc-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {selectedStatus !== order.status && (
              <p className="text-[11px] text-orange-400 font-semibold">
                ⚠ Status will change from <strong>{order.status}</strong> → <strong>{selectedStatus}</strong>
              </p>
            )}
          </div>

          {/* ── Customer Details ── */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: "oklch(0.15 0.004 270)", border: "1px solid oklch(0.25 0.004 270)" }}
          >
            <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Customer Information</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-sm font-black text-white shrink-0">
                {order.customer.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{order.customer}</p>
                <p className="text-[10px] text-zinc-400">{order.items} item{order.items > 1 ? "s" : ""} ordered</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <InfoRow icon={<Mail className="h-3.5 w-3.5 text-orange-400" />} label="Email" value={order.email} />
              <InfoRow icon={<Phone className="h-3.5 w-3.5 text-orange-400" />} label="Phone" value={order.phone} />
              <InfoRow
                icon={<MapPin className="h-3.5 w-3.5 text-orange-400" />}
                label="Delivery Address"
                value={`${order.address}, ${order.city}, ${order.district}`}
                className="sm:col-span-2"
              />
              <InfoRow icon={<CreditCard className="h-3.5 w-3.5 text-orange-400" />} label="Payment Method" value={order.paymentMethod} />
              {order.trackingNumber && (
                <InfoRow icon={<Truck className="h-3.5 w-3.5 text-blue-400" />} label="Tracking Number" value={order.trackingNumber} />
              )}
            </div>
          </div>

          {/* ── Order Line Items ── */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid oklch(0.25 0.004 270)" }}
          >
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ background: "oklch(0.15 0.004 270)", borderBottom: "1px solid oklch(0.22 0.004 270)" }}
            >
              <Package className="h-3.5 w-3.5 text-orange-400" />
              <p className="text-xs font-bold text-white uppercase tracking-wider">Order Items</p>
            </div>
            <div style={{ background: "oklch(0.13 0.004 270)" }}>
              {order.lineItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 text-xs"
                  style={{ borderBottom: i < order.lineItems.length - 1 ? "1px solid oklch(0.20 0.004 270)" : "none" }}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="h-6 w-6 rounded flex items-center justify-center shrink-0 text-[10px] font-black text-orange-400"
                      style={{ background: "oklch(0.18 0.004 270)", border: "1px solid oklch(0.25 0.004 270)" }}
                    >
                      {item.qty}×
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">{item.sku}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-bold text-white">{formatLKR(item.qty * item.unitPrice * 100)}</p>
                    <p className="text-[10px] text-zinc-500">{formatLKR(item.unitPrice * 100)} each</p>
                  </div>
                </div>
              ))}

              {/* Totals */}
              <div
                className="px-4 py-3 space-y-1.5 text-xs"
                style={{ borderTop: "1px solid oklch(0.22 0.004 270)", background: "oklch(0.14 0.004 270)" }}
              >
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span>{formatLKR(subtotal * 100)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Delivery fee</span>
                  <span>{formatLKR(deliveryFee * 100)}</span>
                </div>
                <div className="flex justify-between font-black text-white text-sm pt-1.5" style={{ borderTop: "1px solid oklch(0.25 0.004 270)" }}>
                  <span>Total</span>
                  <span className="text-orange-400">{formatLKR(order.total * 100)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Notes ── */}
          {order.notes && (
            <div
              className="rounded-xl p-4 flex gap-3"
              style={{ background: "oklch(0.58 0.235 22 / 8%)", border: "1px solid oklch(0.58 0.235 22 / 25%)" }}
            >
              <FileText className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-orange-400 mb-1">Customer Note</p>
                <p className="text-xs text-zinc-300">{order.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className="sticky bottom-0 flex items-center justify-between gap-3 px-6 py-4 border-t"
          style={{
            background: "oklch(0.12 0.004 270)",
            borderColor: "oklch(0.22 0.004 270)",
          }}
        >
          <button
            onClick={onClose}
            className="admin-btn-ghost text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || selectedStatus === order.status}
            className="admin-btn-primary text-xs flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Update Status
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-2 text-xs ${className}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-zinc-200 font-medium">{value}</p>
      </div>
    </div>
  );
}

// ── Main Orders Page ──────────────────────────────────────────────────────────

function AdminOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [orders, setOrders] = useState<MockOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<MockOrder | null>(null);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      const liveOrders = await fetchOrdersApi();
      if (liveOrders) {
        const mapped: MockOrder[] = liveOrders.map((o) => ({
          id: o.id,
          customer: o.customerName,
          email: o.email || "customer@example.com",
          phone: o.phone,
          product: o.items?.[0]?.name || "Electronics Component",
          items: o.items?.reduce((s, it) => s + (it.qty || 1), 0) || 1,
          total: o.totalLKR,
          status: o.status,
          date: new Date(o.createdAt).toLocaleDateString(),
          paymentMethod: "Direct / WhatsApp",
          shippingAddress: "Colombo, Sri Lanka",
          lineItems: (o.items || []).map((it) => ({
            name: it.name,
            sku: it.sku,
            qty: it.qty,
            unitPrice: it.priceLKR,
          })),
        }));
        setOrders(mapped);
      }
      setLoading(false);
    }
    void loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.toLowerCase().includes(search.toLowerCase()) ||
        o.product.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, orders]);

  const stats = useMemo(() => {
    const total = orders.reduce((acc, o) => acc + o.total, 0);
    const processing = orders.filter((o) => o.status === "Processing").length;
    const shipped = orders.filter((o) => o.status === "Shipped").length;
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    return { total, processing, shipped, delivered };
  }, [orders]);

  const handleStatusChange = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    void updateOrderStatusApi(id, status);
  };

  return (
    <>
      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      <div className="space-y-6">
        {/* Top summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="admin-card">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Total Sales</p>
            <p className="text-xl font-black text-white mt-1">{formatLKR(stats.total * 100)}</p>
            <p className="text-xs text-zinc-400 mt-1">{orders.length} total orders</p>
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-zinc-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                        <span>Loading live orders from Supabase...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-zinc-500">
                      No orders found in database. Customer orders will appear here in real-time.
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
                          <div>
                            <p className="text-white font-semibold">{o.customer}</p>
                            <p className="text-[10px] text-zinc-500">{o.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-zinc-400">{o.date}</td>
                      <td className="p-3 text-zinc-300 max-w-xs truncate">{o.product}</td>
                      <td className="p-3 font-bold text-white">{formatLKR(o.total * 100)}</td>
                      <td className="p-3"><StatusBadge status={o.status} /></td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-1.5 text-zinc-400 hover:text-orange-400 rounded hover:bg-orange-500/10 transition-colors"
                          title="View order details"
                        >
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
    </>
  );
}
