import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { formatLKR } from "@/lib/format";
import { PageHeading } from "@/components/site/PageHeading";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { useSettings } from "@/context/settings";
import { fetchOrdersApi, type ApiOrder } from "@/services/api";
import {
  LogOut,
  ShieldCheck,
  User,
  Package,
  Clock,
  MapPin,
  Phone,
  Mail,
  Copy,
  Check,
  Eye,
  RefreshCw,
  ShoppingBag,
  MessageCircle,
  X,
  FileText,
  Search,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account & Orders — Asia Electronics" },
      { name: "description", content: "Customer account, profile details, and live order history." },
      { property: "og:title", content: "My Account & Orders — Asia Electronics" },
      { property: "og:description", content: "Customer account, profile details, and live order history." },
    ],
  }),
  component: Account,
});

// Status badge styling helper
function StatusBadge({ status }: { status: string }) {
  let bg = "bg-amber-500/10 text-amber-500 border-amber-500/20";
  if (status === "Delivered") {
    bg = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  } else if (status === "Shipped" || status === "Processing") {
    bg = "bg-blue-500/10 text-blue-500 border-blue-500/20";
  } else if (status === "Cancelled") {
    bg = "bg-rose-500/10 text-rose-500 border-rose-500/20";
  } else if (status === "Quotation Sent") {
    bg = "bg-purple-500/10 text-purple-500 border-purple-500/20";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg}`}>
      {status || "Quotation Requested"}
    </span>
  );
}

// ─── Order Details Modal ──────────────────────────────────────────────────────────
function OrderDetailsModal({
  order,
  onClose,
  whatsappDigits,
}: {
  order: ApiOrder;
  onClose: () => void;
  whatsappDigits: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    toast.success("Order ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  // Build WhatsApp inquiry link
  const waMessage = encodeURIComponent(
    `Hello Asia Electronics! I would like an update regarding my Order #${order.id} (${order.customerName}). Status: ${order.status}`
  );
  const waUrl = `https://wa.me/${whatsappDigits}?text=${waMessage}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card text-card-foreground shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-display font-extrabold text-xl text-foreground flex items-center gap-2">
                Order #{order.id}
              </h3>
              <button
                onClick={handleCopyId}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                title="Copy Order ID"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Placed on {formattedDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status & Actions Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-muted/40 border border-border">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Current Status
            </span>
            <StatusBadge status={order.status} />
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
          >
            <MessageCircle className="h-4 w-4" />
            Inquire on WhatsApp
          </a>
        </div>

        {/* Customer & Delivery Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg border border-border bg-card space-y-2">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5 border-b border-border pb-2">
              <User className="h-4 w-4 text-primary" /> Customer Details
            </h4>
            <p className="font-semibold text-foreground">{order.customerName}</p>
            {order.email && (
              <p className="text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {order.email}
              </p>
            )}
            <p className="text-muted-foreground flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {order.phone}
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card space-y-2">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5 border-b border-border pb-2">
              <MapPin className="h-4 w-4 text-primary" /> Delivery Destination
            </h4>
            <p className="text-foreground">{order.address || "Standard Store Delivery"}</p>
            <p className="text-muted-foreground font-medium">{order.city || "Sri Lanka"}</p>
            {order.notes && (
              <p className="text-muted-foreground italic text-[11px] pt-1">
                Note: &ldquo;{order.notes}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Items Breakdown */}
        <div className="space-y-3">
          <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" /> Ordered Items ({order.items?.length || 0})
          </h4>

          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border uppercase font-bold text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">Item</th>
                  <th className="px-4 py-2.5 text-center">SKU</th>
                  <th className="px-4 py-2.5 text-center">Qty</th>
                  <th className="px-4 py-2.5 text-right">Unit Price</th>
                  <th className="px-4 py-2.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {order.items && order.items.length > 0 ? (
                  order.items.map((it, idx) => {
                    const price = it.priceLKR || 0;
                    const subtotal = price * (it.qty || 1);
                    return (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{it.name}</td>
                        <td className="px-4 py-3 text-center font-mono text-muted-foreground">{it.sku}</td>
                        <td className="px-4 py-3 text-center font-bold">{it.qty}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {price > 0 ? formatLKR(price) : "Quote required"}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-foreground">
                          {subtotal > 0 ? formatLKR(subtotal) : "Quote"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-muted-foreground">
                      No item breakdown recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Summary */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
          <span className="font-bold text-foreground">Total Quotation Value</span>
          <span className="font-display font-extrabold text-xl text-primary">
            {order.totalLKR > 0 ? formatLKR(order.totalLKR) : "Subject to WhatsApp Quotation"}
          </span>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <Button onClick={onClose} variant="outline" className="rounded-none text-xs">
            Close Details
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Account Component ───────────────────────────────────────────────────────
function Account() {
  const { user, logout, isAdmin } = useAuth();
  const { whatsappDigits } = useSettings();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllStoreOrders, setShowAllStoreOrders] = useState(false);

  // Load orders from backend
  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchOrdersApi();
      if (data && Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.warn("Could not load orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter orders according to user context
  const filteredOrders = useMemo(() => {
    let result = orders;

    // If user is regular customer and not toggling all orders
    if (user && !isAdmin && !showAllStoreOrders) {
      const userEmail = (user.email || "").trim().toLowerCase();
      result = result.filter(
        (o) => (o.email && o.email.trim().toLowerCase() === userEmail) || (o.customerName && o.customerName.toLowerCase() === user.name?.toLowerCase())
      );
    }

    // Apply manual search query (Order ID, phone, customer name, sku)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (o) =>
          o.id?.toLowerCase().includes(q) ||
          o.phone?.includes(q) ||
          o.customerName?.toLowerCase().includes(q) ||
          o.email?.toLowerCase().includes(q) ||
          o.city?.toLowerCase().includes(q) ||
          o.items?.some((it) => it.name?.toLowerCase().includes(q) || it.sku?.toLowerCase().includes(q))
      );
    }

    return result;
  }, [orders, user, isAdmin, showAllStoreOrders, searchQuery]);

  return (
    <>
      <PageHeading title="My Account & Order History" />
      <div className="container-shop space-y-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* User Profile Card */}
          <div className="h-fit border border-border bg-tile p-6 rounded shadow-xs space-y-4">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-display font-extrabold text-foreground leading-tight">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Account Role:</span>
                  <span className="font-semibold uppercase tracking-wider text-primary">
                    {user.role || "Customer"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Total Orders:</span>
                  <span className="font-bold text-foreground">{filteredOrders.length}</span>
                </div>

                {isAdmin && (
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white rounded-none font-bold text-xs">
                    <Link to="/admin" className="flex items-center justify-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      Open Admin Portal
                    </Link>
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={async () => {
                    await logout();
                    navigate({ to: "/login" });
                  }}
                  className="w-full rounded-none text-xs font-semibold hover:text-destructive hover:border-destructive flex items-center justify-center gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-3 text-center">
                <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground mx-auto flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
                <p className="font-display font-bold">You are not signed in</p>
                <p className="text-xs text-muted-foreground">
                  Sign in or create an account to view your live orders and saved profile.
                </p>
                <div className="pt-2 space-y-2">
                  <Button asChild className="w-full rounded-none">
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full rounded-none">
                    <Link to="/register">Create Account</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Support Card */}
            <div className="pt-4 border-t border-border text-xs text-muted-foreground space-y-2">
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-emerald-500" /> Need Help with an Order?
              </p>
              <p className="text-[11px] leading-relaxed">
                Reach our customer desk directly on WhatsApp with your Order ID for rapid updates.
              </p>
              <a
                href={`https://wa.me/${whatsappDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-semibold flex items-center gap-1 text-[11px]"
              >
                Chat on WhatsApp <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* ── Order History Section ── */}
          <div className="min-w-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="section-title">Order History & Details</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAdmin
                    ? "Store administrator view: Displaying live customer quotation orders from Supabase"
                    : user
                    ? `Showing orders associated with ${user.email}`
                    : "Track recent customer quotation orders and live statuses"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadOrders}
                  disabled={loading}
                  className="rounded-none text-xs flex items-center gap-1.5"
                  title="Reload orders from database"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>

                {isAdmin && (
                  <Button
                    variant={showAllStoreOrders ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAllStoreOrders(!showAllStoreOrders)}
                    className="rounded-none text-xs"
                  >
                    {showAllStoreOrders ? "Showing All Orders" : "Filter Admin Orders"}
                  </Button>
                )}
              </div>
            </div>

            {/* Search Filter Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders by Order ID (e.g. AEC-...), customer name, phone, or SKU..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-border bg-card rounded focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Orders Table Container */}
            {loading ? (
              <div className="border border-border p-12 text-center bg-tile rounded space-y-3">
                <RefreshCw className="h-6 w-6 text-primary animate-spin mx-auto" />
                <p className="text-xs font-semibold text-muted-foreground">Loading orders from Supabase database...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="border border-border p-12 text-center bg-tile rounded space-y-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-display font-bold text-foreground">No Orders Found</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                    {searchQuery
                      ? "No orders match your search criteria. Try searching with a different Order ID or phone number."
                      : user
                      ? "You haven't requested any quotations yet. When you request a quotation through checkout, it will be listed here with live updates."
                      : "Sign in to see your account's order history, or search by your Order ID above."}
                  </p>
                </div>
                <Button asChild className="rounded-none text-xs font-bold bg-primary text-white">
                  <Link to="/shop">Browse Electronic Components</Link>
                </Button>
              </div>
            ) : (
              <div className="border border-border bg-card rounded shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-xs text-left">
                    <thead className="bg-muted/60 border-b border-border uppercase font-bold text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Order ID</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Items Summary</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Total (LKR)</th>
                        <th className="px-4 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredOrders.map((o) => {
                        const dateStr = o.createdAt
                          ? new Date(o.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—";

                        const itemsCount = o.items ? o.items.reduce((s, it) => s + (it.qty || 1), 0) : 0;
                        const firstItemName = o.items?.[0]?.name || "Component Item";

                        return (
                          <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-primary">
                              #{o.id}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                              {dateStr}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-foreground">{o.customerName}</p>
                              <p className="text-[11px] text-muted-foreground">{o.phone}</p>
                            </td>
                            <td className="px-4 py-3 max-w-[200px]">
                              <p className="truncate font-medium text-foreground">{firstItemName}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {itemsCount} {itemsCount === 1 ? "item" : "items"} total
                              </p>
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <StatusBadge status={o.status} />
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-foreground whitespace-nowrap">
                              {o.totalLKR > 0 ? formatLKR(o.totalLKR) : "Quotation"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedOrder(o)}
                                className="h-7 px-2.5 rounded-none text-xs flex items-center gap-1 font-semibold hover:bg-primary hover:text-white transition-colors"
                              >
                                <Eye className="h-3 w-3" />
                                Details
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 border-t border-border bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
                  <span>Showing {filteredOrders.length} order(s)</span>
                  <span className="text-[11px]">Click &ldquo;Details&rdquo; on any order to view full line-items & delivery address</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          whatsappDigits={whatsappDigits}
        />
      )}
    </>
  );
}
