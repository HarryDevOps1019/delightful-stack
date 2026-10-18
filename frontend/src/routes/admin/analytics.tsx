import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  DollarSign,
  PackageCheck,
  PieChart as PieChartIcon,
  ShoppingBag,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatLKR } from "@/lib/format";
import { useCatalog } from "@/services/catalog";
import { fetchOrdersApi, type ApiOrder } from "@/services/api";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics - Admin" }] }),
  component: AdminAnalytics,
});

const STATUS_COLORS = ["#f59e0b", "#38bdf8", "#8b5cf6", "#ec4899", "#22c55e", "#ef4444"];
const CATEGORY_COLOR = "#f97316";

function AdminAnalytics() {
  const { products, categories } = useCatalog();
  const [orders, setOrders] = useState<ApiOrder[]>([]);

  useEffect(() => {
    void fetchOrdersApi().then((data) => {
      if (data) setOrders(data);
    });
  }, []);

  const validOrders = useMemo(
    () => orders.filter((order) => order.status !== "Cancelled"),
    [orders],
  );
  const totalRevenueLKR = validOrders.reduce(
    (sum, order) => sum + (Number(order.totalLKR) || 0),
    0,
  );
  const lowStockCount = products.filter(
    (product) => product.stock > 0 && product.stock <= 5,
  ).length;

  const statusData = useMemo(() => {
    const counts = orders.reduce<Record<string, number>>((result, order) => {
      result[order.status] = (result[order.status] || 0) + 1;
      return result;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const categoryData = useMemo(
    () =>
      categories
        .map((category) => ({
          name: category.name,
          products: products.filter((product) => product.category === category.slug).length,
        }))
        .filter((category) => category.products > 0)
        .sort((a, b) => b.products - a.products),
    [categories, products],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Sales revenue"
          value={formatLKR(totalRevenueLKR * 100)}
          note="Cancelled orders excluded"
          icon={<DollarSign className="h-4 w-4 text-orange-400" />}
        />
        <MetricCard
          label="Valid orders"
          value={String(validOrders.length)}
          note={`${orders.length} total orders`}
          icon={<ShoppingBag className="h-4 w-4 text-sky-400" />}
        />
        <MetricCard
          label="Low-stock alerts"
          value={String(lowStockCount)}
          note={`${products.length} products in catalog`}
          icon={<AlertTriangle className="h-4 w-4 text-amber-400" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="admin-card">
          <ChartHeading
            icon={<PieChartIcon className="h-4 w-4 text-orange-400" />}
            title="Order status"
            description="Current distribution of all orders"
          />
          {statusData.length ? (
            <div className="mt-5 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={98}
                    paddingAngle={3}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#18181b" }} />
                  <Legend wrapperStyle={{ color: "#a1a1aa", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart message="Order data will appear here once you receive orders." />
          )}
        </section>

        <section className="admin-card">
          <ChartHeading
            icon={<BarChart3 className="h-4 w-4 text-orange-400" />}
            title="Products by category"
            description="Catalog size for each active category"
          />
          {categoryData.length ? (
            <div className="mt-5 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 8, right: 8, left: -18, bottom: 42 }}>
                  <CartesianGrid stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="name"
                    angle={-32}
                    textAnchor="end"
                    interval={0}
                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis allowDecimals={false} tick={{ fill: "#a1a1aa", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#18181b" }} cursor={{ fill: "#27272a" }} />
                  <Bar dataKey="products" name="Products" fill={CATEGORY_COLOR} radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart message="Add products to see category data." />
          )}
        </section>
      </div>
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid #d4d4d8",
  background: "#ffffff",
  fontSize: 12,
};

function MetricCard({ label, value, note, icon }: { label: string; value: string; note: string; icon: React.ReactNode }) {
  return (
    <div className="admin-card">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{label}</p>
        {icon}
      </div>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
      <p className="mt-2 text-[11px] font-semibold text-zinc-400">{note}</p>
    </div>
  );
}

function ChartHeading({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5">{icon}</span>
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-white">{title}</h2>
        <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
      </div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="mt-5 grid h-[280px] place-items-center rounded-lg border border-dashed border-zinc-700 text-center text-sm text-zinc-500">
      <div>
        <PackageCheck className="mx-auto mb-2 h-5 w-5" />
        {message}
      </div>
    </div>
  );
}