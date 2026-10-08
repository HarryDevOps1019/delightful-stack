import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, Users, ShoppingBag, DollarSign, Award, ArrowUpRight } from "lucide-react";
import { formatLKR } from "@/lib/format";
import {
  topProducts,
  categoryRevenue,
  revenueData,
} from "@/components/admin/shared";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalytics,
});

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function AdminAnalytics() {
  const maxRev = Math.max(...revenueData);

  return (
    <div className="space-y-6">
      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Avg Order Value</p>
            <DollarSign className="h-4 w-4 text-orange-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{formatLKR(5673500)}</p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-2">
            <ArrowUpRight className="h-3 w-3" /> +5.4% vs last month
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Conversion Rate</p>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">3.45%</p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-2">
            <ArrowUpRight className="h-3 w-3" /> +0.8% increase
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Repeat Customers</p>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">42.8%</p>
          <div className="flex items-center gap-1 text-[11px] text-blue-400 font-semibold mt-2">
            High customer retention
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Order Fulfillment Rate</p>
            <ShoppingBag className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">98.2%</p>
          <div className="flex items-center gap-1 text-[11px] text-purple-400 font-semibold mt-2">
            Optimal logistics
          </div>
        </div>
      </div>

      {/* Annual Revenue Bar Chart */}
      <div className="admin-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">12-Month Revenue & Sales Growth</h2>
            <p className="text-xs text-zinc-500">Monthly revenue trends for the current fiscal year</p>
          </div>
          <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
            Total: {formatLKR(revenueData.reduce((a, b) => a + b, 0) * 1000000)}
          </span>
        </div>

        <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-zinc-800">
          {revenueData.map((val, i) => {
            const pct = (val / maxRev) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-zinc-800 text-white text-[10px] font-bold py-1 px-2 rounded pointer-events-none shadow-lg whitespace-nowrap z-10">
                  {formatLKR(val * 1000000)}
                </div>
                {/* Bar */}
                <div className="w-full bg-zinc-800/80 rounded-t-sm relative flex items-end overflow-hidden h-full">
                  <div
                    className="w-full bg-gradient-to-t from-orange-600 to-amber-400 group-hover:brightness-125 transition-all duration-300 rounded-t-sm"
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 group-hover:text-white transition-colors">
                  {months[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performing Products & Category Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="admin-card space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Top Performing Products</h2>
          </div>
          <div className="space-y-3">
            {topProducts.map((tp, idx) => (
              <div key={tp.name} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-amber-400">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">{tp.name}</p>
                    <p className="text-[10px] text-zinc-500">{tp.units} units sold</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400">{formatLKR(tp.revenue * 100)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Share */}
        <div className="admin-card space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Revenue by Category Share</h2>
          <div className="space-y-4 pt-2">
            {categoryRevenue.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white">{cat.name}</span>
                  <span className="text-orange-400">{cat.pct}% ({formatLKR(cat.revenue * 100)})</span>
                </div>
                <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
