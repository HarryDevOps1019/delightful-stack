import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { formatLKR } from "@/lib/format";
import { Button } from "@/components/ui/button";

interface S { order?: string | undefined; total?: number | undefined; items?: number | undefined; payment?: string }

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: (s: Partial<Record<keyof S, unknown>>): S => ({
    order: typeof s.order === "string" ? s.order : undefined,
    total: Number.isFinite(Number(s.total)) ? Number(s.total) : undefined,
    items: Number.isFinite(Number(s.items)) ? Number(s.items) : undefined,
    payment: typeof s.payment === "string" ? s.payment : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Demo Order Confirmed — Asia Electronics" },
      { name: "description", content: "Simulated order confirmation. No payment was taken." },
      { property: "og:title", content: "Demo Order Confirmed — Asia Electronics" },
      { property: "og:description", content: "Simulated order confirmation." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Confirm,
});

const payLabel: Record<string, string> = { card: "Card payment (PayHere — coming later)", bank: "Bank transfer", cod: "Cash on delivery" };

function Confirm() {
  const s = Route.useSearch();
  if (!s.order) {
    return (
      <div className="container-shop py-20 text-center">
        <h1 className="font-display text-2xl font-extrabold">No order to show</h1>
        <Button asChild className="mt-5 rounded-none"><Link to="/shop">Go shopping</Link></Button>
      </div>
    );
  }
  return (
    <div className="container-shop max-w-xl py-16 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
      <h1 className="mt-4 font-display text-2xl font-extrabold uppercase">Demo order placed</h1>
      <p className="mt-2 text-sm text-muted-foreground">This is a simulation — no payment was taken and nothing will be delivered.</p>
      <dl className="mt-8 divide-y divide-border border border-border text-left text-sm">
        <Row k="Reference" v={s.order} />
        <Row k="Items" v={String(s.items ?? 0)} />
        <Row k="Total" v={formatLKR(s.total ?? 0)} />
        <Row k="Payment" v={payLabel[s.payment ?? ""] ?? "—"} />
      </dl>
      <Button asChild className="mt-8 rounded-none"><Link to="/shop">Continue shopping</Link></Button>
    </div>
  );
}
const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-muted-foreground">{k}</dt><dd className="font-bold">{v}</dd></div>
);
