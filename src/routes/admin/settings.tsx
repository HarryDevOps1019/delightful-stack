import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Store, Shield, Bell, Save, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [storeName, setStoreName] = useState("Asia Electronics & Cellular");
  const [email, setEmail] = useState("admin@asiaelectronics.lk");
  const [phone, setPhone] = useState("+94 11 234 5678");
  const [currency, setCurrency] = useState("LKR (Rs.)");
  const [taxRate, setTaxRate] = useState("0%");

  const [notifications, setNotifications] = useState({
    newOrders: true,
    lowStock: true,
    weeklyReport: false,
  });

  const handleSave = () => {
    setSaved(true);
    toast.success("Settings saved successfully!");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Store Info */}
      <div className="admin-card space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Store className="h-4 w-4 text-orange-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Store Profile Settings</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-400">Store Name</label>
            <input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="admin-input w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-zinc-400">Support Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-zinc-400">Contact Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="admin-input w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-zinc-400">Base Currency</label>
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="admin-input w-full"
            />
          </div>
        </div>
      </div>

      {/* Notifications Settings */}
      <div className="admin-card space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Bell className="h-4 w-4 text-orange-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Notification Preferences</h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-white">New Order Notifications</p>
              <p className="text-[10px] text-zinc-500">Receive instant alerts when a customer places an order</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.newOrders}
              onChange={(e) => setNotifications((n) => ({ ...n, newOrders: e.target.checked }))}
              className="accent-orange-500 h-4 w-4 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-white">Low Stock Alerts</p>
              <p className="text-[10px] text-zinc-500">Alert when product stock falls below 5 units</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.lowStock}
              onChange={(e) => setNotifications((n) => ({ ...n, lowStock: e.target.checked }))}
              className="accent-orange-500 h-4 w-4 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-white">Weekly Performance Digest</p>
              <p className="text-[10px] text-zinc-500">Receive a weekly summary email of store sales</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.weeklyReport}
              onChange={(e) => setNotifications((n) => ({ ...n, weeklyReport: e.target.checked }))}
              className="accent-orange-500 h-4 w-4 rounded"
            />
          </label>
        </div>
      </div>

      {/* Security */}
      <div className="admin-card space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Shield className="h-4 w-4 text-orange-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Security & Access Control</h2>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-900/50 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white">Admin Account Email</p>
            <p className="text-[10px] text-zinc-500">Currently logged in as admin@gmail.com</p>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Active Session
          </span>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="admin-btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-5"
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved Changes!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
