import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { MessageCircle, ShieldCheck, Loader2 } from "lucide-react";
import { useCart } from "@/context/cart";
import { Field } from "@/components/site/Field";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "./cart";
import { PageHeading } from "@/components/site/PageHeading";
import { createOrderApi } from "@/services/api";
import { toast } from "sonner";
import { useSettings } from "@/context/settings";
import { useAuth } from "@/context/auth";

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+94|0094|0)?[1-9]\d{8}$/,
      "Enter a valid phone number, e.g. 0771234567"
    ),
  email: z.string().trim().email("Enter a valid email").or(z.literal("")).optional(),
  address: z.string().trim().min(3, "Enter your delivery address").max(200),
  city: z.string().trim().min(2, "Enter your city").max(60),
  notes: z.string().max(500).optional(),
});

type Values = z.infer<typeof schema>;

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Request Quotation — Asia Electronics & Cellular" },
      {
        name: "description",
        content:
          "Fill your details to request a quotation. AEC will respond via WhatsApp with pricing and availability.",
      },
    ],
  }),
  component: CheckoutPage,
});

// ─── WhatsApp message builder ──────────────────────────────────────────────────
function buildWhatsAppMessage(
  orderId: string,
  customerName: string,
  items: Array<{ name: string; sku: string; qty: number }>
): string {
  const itemLines = items
    .map(
      (it, i) =>
        `${i + 1}. ${it.name}\n   Item Code: ${it.sku}\n   Qty: ${it.qty}`
    )
    .join("\n\n");

  return (
    `*Quotation Request*\n\n` +
    `Order ID: #${orderId}\n` +
    `Customer: ${customerName}\n\n` +
    `*Items:*\n${itemLines}\n\n` +
    `Please confirm the availability and quotation for these items.`
  );
}

function openWhatsApp(
  orderId: string,
  customerName: string,
  cartItems: Array<{ name: string; sku: string; qty: number }>,
  whatsappDigits: string
) {
  const message = buildWhatsAppMessage(orderId, customerName, cartItems);
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${whatsappDigits}?text=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

// ─── Page ──────────────────────────────────────────────────────────────────────
function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { whatsappDigits } = useSettings();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    values: {
      fullName: user?.name || "",
      email: user?.email || "",
      phone: "",
      address: "",
      city: "",
      notes: "",
    },
  });

  const onSubmit = async (v: Values) => {
    if (submitting) return; // prevent double-submit
    setSubmitting(true);

    try {
      // Build items payload from cart
      const items = cart.lines.map((l) => ({
        sku: l.product.sku,
        name: l.product.name,
        qty: l.qty,
        priceLKR: l.product.showPrice !== false ? Math.round(l.product.priceCents / 100) : 0, // Quotation-based
      }));

      const saved = await createOrderApi({
        customerName: v.fullName,
        phone: v.phone,
        email: v.email || "",
        address: v.address,
        city: v.city,
        notes: v.notes || "",
        items,
      });

      if (!saved) {
        toast.error("Could not save your quotation request. Please try again.");
        setSubmitting(false);
        return;
      }

      // DB confirmed — clear cart and open WhatsApp
      cart.clear();
      toast.success(`Quotation #${saved.id} submitted! Opening WhatsApp…`);

      openWhatsApp(
        saved.id,
        v.fullName,
        items.map((it) => ({ name: it.name, sku: it.sku, qty: it.qty })),
        whatsappDigits
      );

      navigate({
        to: "/order-confirmation",
        search: { order: saved.id, items: cart.count },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to submit quotation: ${msg}`);
      setSubmitting(false);
    }
  };

  if (cart.lines.length === 0) {
    return (
      <>
        <PageHeading title="Request Quotation" />
        <div className="container-shop border border-border p-12 text-center">
          <p className="font-display text-lg font-extrabold">Your cart is empty</p>
          <Button asChild className="mt-5 rounded-none">
            <Link to="/shop">Browse products</Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeading title="Request Quotation" />
      <div className="container-shop grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">

        {/* ── Customer Details Form ── */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">

          {/* Info banner */}
          <div className="flex items-start gap-3 rounded border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-950/30">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-bold text-green-800 dark:text-green-300">
                Quotation-based ordering
              </p>
              <p className="mt-0.5 text-xs text-green-700 dark:text-green-400">
                Fill your details and click <strong>"Place Order / Request Quotation"</strong>.
                Your request will be saved and we'll contact you via WhatsApp with pricing
                and availability. No payment is collected online.
              </p>
            </div>
          </div>

          <section className="grid gap-4 sm:grid-cols-2">
            <h2 className="font-display text-sm font-extrabold uppercase sm:col-span-2">
              Customer Details
            </h2>

            <Field
              label="Full name *"
              error={errors.fullName?.message}
              {...register("fullName")}
              autoComplete="name"
              placeholder="e.g. Kasun Perera"
            />

            <Field
              label="Mobile number *"
              error={errors.phone?.message}
              {...register("phone")}
              autoComplete="tel"
              inputMode="tel"
              placeholder="e.g. 0771234567"
            />

            <Field
              label="Email (optional)"
              type="email"
              error={errors.email?.message}
              {...register("email")}
              autoComplete="email"
              className="sm:col-span-2"
              placeholder="your@email.com"
            />

            <Field
              label="Delivery address *"
              error={errors.address?.message}
              {...register("address")}
              autoComplete="street-address"
              className="sm:col-span-2"
              placeholder="No. 45, Galle Road"
            />

            <Field
              label="City *"
              error={errors.city?.message}
              {...register("city")}
              autoComplete="address-level2"
              placeholder="Colombo"
            />

            <Field
              label="Special notes (optional)"
              error={errors.notes?.message}
              {...register("notes")}
              placeholder="Any special requirements or notes for AEC…"
            />
          </section>

          <Button
            type="submit"
            disabled={submitting}
            id="place-quotation-btn"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-none font-bold uppercase sm:w-auto sm:px-10"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4" />
                Place Order / Request Quotation
              </>
            )}
          </Button>
        </form>

        {/* ── Order Summary ── */}
        <OrderSummary>
          <ul className="mt-4 space-y-2 border-t border-border pt-4 text-xs">
            {cart.lines.map((l) => (
              <li key={l.key} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">
                  {l.qty} × {l.product.name}
                </span>
                <span className="shrink-0 text-muted-foreground italic">
                  Price TBD
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            AEC will confirm pricing via WhatsApp after you submit your request.
          </p>
        </OrderSummary>
      </div>
    </>
  );
}
