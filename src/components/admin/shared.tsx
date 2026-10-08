import { AlertTriangle, CheckCircle2, Clock, XCircle, Zap } from "lucide-react";

// ─── Shared CSS ───────────────────────────────────────────────────────────────

export const adminStyles = `
  .admin-card {
    background: oklch(0.13 0.004 270);
    border: 1px solid oklch(0.22 0.004 270);
    border-radius: 12px;
    padding: 1.25rem;
  }
  .admin-input {
    background: oklch(0.17 0.004 270);
    border: 1px solid oklch(0.25 0.004 270);
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
    color: white;
    outline: none;
    transition: border-color 0.15s;
  }
  .admin-input:focus { border-color: oklch(0.58 0.235 22); }
  .admin-btn-primary {
    background: oklch(0.58 0.235 22);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 700;
    transition: opacity 0.15s;
  }
  .admin-btn-primary:hover { opacity: 0.9; }
  .admin-btn-ghost {
    background: oklch(0.2 0.004 270);
    border: 1px solid oklch(0.27 0.004 270);
    color: oklch(0.65 0.004 270);
    padding: 0.5rem 0.875rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 600;
    transition: all 0.15s;
  }
  .admin-btn-ghost:hover { color: white; background: oklch(0.25 0.004 270); }
`;

// ─── Sparkline ────────────────────────────────────────────────────────────────

export function Sparkline({ data, color = "#f97316" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120, h = 40;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts.join(" ")} stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={`0,${h} ${pts.join(" ")} ${w},${h}`} fill={`${color}18`} stroke="none" />
    </svg>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; icon: React.ReactNode }> = {
    Processing: { cls: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: <Clock className="h-3 w-3" /> },
    Shipped:    { cls: "bg-blue-500/15 text-blue-400 border-blue-500/30",   icon: <Zap className="h-3 w-3" /> },
    Delivered:  { cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: <CheckCircle2 className="h-3 w-3" /> },
    Cancelled:  { cls: "bg-red-500/15 text-red-400 border-red-500/30",      icon: <XCircle className="h-3 w-3" /> },
  };
  const { cls, icon } = cfg[status] ?? { cls: "bg-zinc-700 text-zinc-300 border-zinc-600", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[11px] font-semibold rounded-full ${cls}`}>
      {icon} {status}
    </span>
  );
}

// ─── Stock Badge ──────────────────────────────────────────────────────────────

export function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400"><XCircle className="h-3 w-3" /> Out of stock</span>;
  if (stock <= 5)
    return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400"><AlertTriangle className="h-3 w-3" /> Low ({stock})</span>;
  return <span className="text-[11px] font-semibold text-emerald-400">{stock} in stock</span>;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

export type OrderStatus = "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface OrderLineItem {
  name: string;
  sku: string;
  qty: number;
  unitPrice: number;
}

export interface MockOrder {
  id: string;
  customer: string;
  email: string;
  phone: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: number;
  product: string;
  address: string;
  city: string;
  district: string;
  paymentMethod: string;
  trackingNumber?: string;
  notes?: string;
  lineItems: OrderLineItem[];
}

export const mockOrders: MockOrder[] = [
  {
    id: "AE-10431", customer: "Kasun Perera", email: "kasun.perera@gmail.com", phone: "+94 71 234 5678",
    date: "2026-10-07", status: "Processing", total: 129900, items: 1, product: "43\" 4K UHD Smart TV",
    address: "45/3 Galle Road", city: "Colombo", district: "Colombo", paymentMethod: "Card (Visa ****4321)",
    notes: "Please deliver after 5 PM.",
    lineItems: [{ name: "43\" 4K UHD Smart TV", sku: "AE-TV-5001", qty: 1, unitPrice: 129900 }],
  },
  {
    id: "AE-10430", customer: "Nimali Silva", email: "nimali.silva@yahoo.com", phone: "+94 77 345 6789",
    date: "2026-10-07", status: "Shipped", total: 38500, items: 1, product: "Portable Bluetooth Speaker 20W",
    address: "12 Temple Road", city: "Kandy", district: "Kandy", paymentMethod: "Cash on Delivery",
    trackingNumber: "SL-TRK-88123456",
    lineItems: [{ name: "Portable Bluetooth Speaker 20W", sku: "AE-AUD-2001", qty: 1, unitPrice: 38500 }],
  },
  {
    id: "AE-10429", customer: "Amal Fernando", email: "amal.fernando@hotmail.com", phone: "+94 76 456 7890",
    date: "2026-10-06", status: "Delivered", total: 56350, items: 3, product: "Capacitor Kit + Solder + Op-Amp",
    address: "78/A Peradeniya Road", city: "Kandy", district: "Kandy", paymentMethod: "Bank Transfer",
    trackingNumber: "SL-TRK-88109872",
    lineItems: [
      { name: "Electrolytic Capacitor Kit (120 pcs)", sku: "AE-CMP-1002", qty: 2, unitPrice: 1850 },
      { name: "Lead-Free Solder Wire 0.8mm", sku: "AE-CMP-1005", qty: 1, unitPrice: 2200 },
      { name: "LM358 Op-Amp IC (10 pack)", sku: "AE-CMP-1004", qty: 1, unitPrice: 650 },
    ],
  },
  {
    id: "AE-10428", customer: "Dilini Rajapaksa", email: "dilini.r@gmail.com", phone: "+94 70 567 8901",
    date: "2026-10-06", status: "Delivered", total: 24500, items: 1, product: "OLED Display Assembly",
    address: "No. 5, Sea View Lane", city: "Galle", district: "Galle", paymentMethod: "Card (Mastercard ****9871)",
    trackingNumber: "SL-TRK-88099231",
    lineItems: [{ name: "Replacement OLED Display Assembly", sku: "AE-MOB-4001", qty: 1, unitPrice: 24500 }],
  },
  {
    id: "AE-10427", customer: "Chamara Jayawardena", email: "chamara.j@gmail.com", phone: "+94 71 678 9012",
    date: "2026-10-05", status: "Cancelled", total: 89900, items: 1, product: "2.1 Soundbar with Wireless Subwoofer",
    address: "34 Hill Street", city: "Matara", district: "Matara", paymentMethod: "Card (Visa ****2201)",
    notes: "Customer requested cancellation due to change of mind.",
    lineItems: [{ name: "2.1 Soundbar with Wireless Subwoofer", sku: "AE-AUD-2002", qty: 1, unitPrice: 89900 }],
  },
  {
    id: "AE-10426", customer: "Ishara Bandara", email: "ishara.bandara@gmail.com", phone: "+94 75 789 0123",
    date: "2026-10-05", status: "Delivered", total: 17900, items: 1, product: "Wireless Earbuds ANC",
    address: "221 Flower Road", city: "Colombo", district: "Colombo", paymentMethod: "Cash on Delivery",
    trackingNumber: "SL-TRK-88087654",
    lineItems: [{ name: "Wireless Earbuds ANC", sku: "AE-AUD-2004", qty: 1, unitPrice: 17900 }],
  },
  {
    id: "AE-10425", customer: "Ruwan Dissanayake", email: "ruwan.d@outlook.com", phone: "+94 78 890 1234",
    date: "2026-10-04", status: "Processing", total: 239900, items: 1, product: "55\" QLED Smart TV",
    address: "88/2 Negombo Road", city: "Negombo", district: "Gampaha", paymentMethod: "Card (Visa ****7654)",
    notes: "Requires ground floor delivery, no elevator.",
    lineItems: [{ name: "55\" QLED Smart TV", sku: "AE-TV-5002", qty: 1, unitPrice: 239900 }],
  },
  {
    id: "AE-10424", customer: "Thilini Wickramasinghe", email: "thilini.w@gmail.com", phone: "+94 72 901 2345",
    date: "2026-10-04", status: "Shipped", total: 14500, items: 2, product: "Solar Flood Light 100W",
    address: "15/B Battaramulla Road", city: "Battaramulla", district: "Colombo", paymentMethod: "Cash on Delivery",
    trackingNumber: "SL-TRK-88076543",
    lineItems: [{ name: "Solar Flood Light 100W", sku: "AE-LGT-3004", qty: 2, unitPrice: 7250 }],
  },
  {
    id: "AE-10423", customer: "Pradeep Kumara", email: "pradeep.k@gmail.com", phone: "+94 77 012 3456",
    date: "2026-10-03", status: "Delivered", total: 38900, items: 1, product: "Soldering Station FX-888D",
    address: "56 Main Street", city: "Kurunegala", district: "Kurunegala", paymentMethod: "Bank Transfer",
    trackingNumber: "SL-TRK-88065432",
    lineItems: [{ name: "Temperature Controlled Soldering Station", sku: "AE-CMP-1003", qty: 1, unitPrice: 38900 }],
  },
  {
    id: "AE-10422", customer: "Sanduni Herath", email: "sanduni.h@gmail.com", phone: "+94 76 123 4567",
    date: "2026-10-03", status: "Delivered", total: 6900, items: 1, product: "Replacement Battery Galaxy A52",
    address: "9 Lake Drive", city: "Ratnapura", district: "Ratnapura", paymentMethod: "Cash on Delivery",
    trackingNumber: "SL-TRK-88054321",
    lineItems: [{ name: "Replacement Battery 4000mAh", sku: "AE-MOB-4002", qty: 1, unitPrice: 6900 }],
  },
];

export const revenueData  = [42, 58, 51, 67, 73, 65, 80, 88, 76, 92, 85, 98];
export const ordersData   = [8, 12, 9, 15, 18, 13, 21, 24, 19, 28, 22, 31];
export const visitorsData = [320, 480, 410, 550, 620, 490, 710, 760, 640, 820, 730, 890];

export const categoryRevenue = [
  { name: "TVs & Projectors", revenue: 523200, pct: 38 },
  { name: "Audio & Speakers", revenue: 289400, pct: 27 },
  { name: "Mobile Parts",     revenue: 198600, pct: 18 },
  { name: "Components",       revenue: 143200, pct: 11 },
  { name: "Lighting",         revenue:  82700, pct:  6 },
];

export const topProducts = [
  { name: "55\" QLED Smart TV",           units: 12, revenue: 2878800 },
  { name: "43\" 4K UHD Smart TV",         units: 18, revenue: 2338200 },
  { name: "2.1 Soundbar",                 units: 24, revenue: 2157600 },
  { name: "Portable Bluetooth Speaker",   units: 45, revenue: 1732500 },
  { name: "Soldering Station FX-888D",    units: 22, revenue:  855800 },
  { name: "OLED Display Assembly",        units: 31, revenue:  759500 },
];
