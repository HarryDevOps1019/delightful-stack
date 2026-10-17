import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/context/settings";

interface S { order?: string; items?: number }

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: (s: Record<string, unknown>): S => ({
    order: typeof s.order === "string" ? s.order : undefined,
    items:  Number.isFinite(Number(s.items))  ? Number(s.items)  : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Quotation Submitted — Asia Electronics & Cellular" },
      { name: "description", content: "Your quotation request has been saved. AEC will contact you via WhatsApp." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Confirm,
});

function Confirm() {
  const s = Route.useSearch();
  const { whatsappDigits } = useSettings();

  if (!s.order) {
    return (
      <div className="container-shop py-20 text-center">
        <h1 className="font-display text-2xl font-extrabold">No quotation to show</h1>
        <Button asChild className="mt-5 rounded-none"><Link to="/shop">Go shopping</Link></Button>
      </div>
    );
  }

  const waText = encodeURIComponent(
    `Hi AEC, I just submitted quotation request #${s.order}. Could you please confirm availability and pricing? Thank you.`
  );
  const waLink = `https://wa.me/${whatsappDigits}?text=${waText}`;

  return (
    <div className="container-shop max-w-xl py-16 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
      <h1 className="mt-4 font-display text-2xl font-extrabold uppercase">
        Quotation Request Submitted!
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your request has been saved to our system. Our team will reach out to you via
        WhatsApp with pricing and availability shortly.
      </p>

      <dl className="mt-8 divide-y divide-border border border-border text-left text-sm">
        <Row k="Order / Quotation ID" v={s.order} highlight />
        <Row k="Items Requested" v={String(s.items ?? 0)} />
        <Row k="Status" v="Quotation Requested" />
        <Row k="What's next?" v="AEC will contact you on WhatsApp to confirm pricing & availability." />
      </dl>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-none font-bold text-sm bg-[#25D366] text-white hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="h-4 w-4" />
          Open WhatsApp
        </a>
        <Button asChild variant="outline" className="rounded-none">
          <Link to="/shop">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}

const Row = ({ k, v, highlight = false }: { k: string; v: string; highlight?: boolean }) => (
  <div className="flex justify-between gap-4 px-4 py-3">
    <dt className="text-muted-foreground">{k}</dt>
    <dd className={`font-bold text-right ${highlight ? "text-primary" : ""}`}>{v}</dd>
  </div>
);
