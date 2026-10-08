import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/context/cart";
import { formatLKR } from "@/lib/format";
import { OrderSummary } from "./cart";
import { PageHeading, DemoNotice } from "@/components/site/PageHeading";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/site/Field";

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().regex(/^(?:\+94|0)7\d{8}$/, "Enter a Sri Lankan mobile number, e.g. 0771234567"),
  address: z.string().trim().min(5, "Enter your delivery address").max(200),
  city: z.string().trim().min(2, "Enter your city").max(60),
  payment: z.enum(["card", "bank", "cod"], { errorMap: () => ({ message: "Choose a payment option" }) }),
  notes: z.string().max(300).optional(),
});
type Values = z.infer<typeof schema>;

const PAYMENTS = [
  { value: "card", label: "Card payment", note: "Will be handled by PayHere later. No card details are collected here." },
  { value: "bank", label: "Bank transfer", note: "Bank details will be provided after confirmation (placeholder)." },
  { value: "cod", label: "Cash on delivery", note: "Availability depends on delivery area (to be confirmed)." },
] as const;

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Asia Electronics (Demo)" },
      { name: "description", content: "Demo checkout. No payment is taken." },
      { property: "og:title", content: "Checkout — Asia Electronics (Demo)" },
      { property: "og:description", content: "Demo checkout. No payment is taken." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });
  const payment = watch("payment");

  const onSubmit = async (v: Values) => {
    await new Promise((r) => setTimeout(r, 700)); // simulated request — future: create order + PayHere session
    const order = `AE-DEMO-${Math.floor(10000 + Math.random() * 89999)}`;
    const total = cart.total;
    const items = cart.count;
    cart.clear();
    navigate({ to: "/order-confirmation", search: { order, total, items, payment: v.payment } });
  };

  if (cart.lines.length === 0) {
    return (
      <>
        <PageHeading title="Checkout" />
        <div className="container-shop border border-border p-12 text-center">
          <p className="font-display text-lg font-extrabold">Your cart is empty</p>
          <Button asChild className="mt-5 rounded-none"><Link to="/shop">Browse products</Link></Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeading title="Checkout" />
      <div className="container-shop grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
          <DemoNotice>No payment is taken and details you enter are not saved or sent anywhere.</DemoNotice>
          <section className="grid gap-4 sm:grid-cols-2">
            <h2 className="font-display text-sm font-extrabold uppercase sm:col-span-2">Delivery details</h2>
            <Field label="Full name" error={errors.fullName?.message} {...register("fullName")} autoComplete="name" />
            <Field label="Mobile number" error={errors.phone?.message} {...register("phone")} autoComplete="tel" inputMode="tel" />
            <Field label="Email" type="email" error={errors.email?.message} {...register("email")} autoComplete="email" className="sm:col-span-2" />
            <Field label="Address" error={errors.address?.message} {...register("address")} autoComplete="street-address" className="sm:col-span-2" />
            <Field label="City" error={errors.city?.message} {...register("city")} autoComplete="address-level2" />
            <Field label="Order notes (optional)" error={errors.notes?.message} {...register("notes")} />
          </section>
          <fieldset>
            <legend className="font-display text-sm font-extrabold uppercase">Payment method (provisional)</legend>
            <div className="mt-4 space-y-3">
              {PAYMENTS.map((p) => (
                <label key={p.value} className={`flex cursor-pointer gap-3 border-2 p-4 ${payment === p.value ? "border-primary" : "border-border"}`}>
                  <input type="radio" value={p.value} {...register("payment")} className="mt-1 accent-primary" />
                  <span>
                    <span className="block font-bold">{p.label}</span>
                    <span className="text-xs text-muted-foreground">{p.note}</span>
                  </span>
                </label>
              ))}
            </div>
            {errors.payment && <p className="mt-2 text-xs font-semibold text-destructive" role="alert">{errors.payment.message}</p>}
          </fieldset>
          <Button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-none font-bold uppercase sm:w-auto sm:px-10">
            {isSubmitting ? "Placing demo order…" : "Place Demo Order"}
          </Button>
        </form>
        <OrderSummary>
          <ul className="mt-4 space-y-2 border-t border-border pt-4 text-xs">
            {cart.lines.map((l) => (
              <li key={l.key} className="flex justify-between gap-3"><span className="min-w-0 truncate">{l.qty} × {l.product.name}</span><span className="shrink-0">{formatLKR(l.lineTotal)}</span></li>
            ))}
          </ul>
        </OrderSummary>
      </div>
    </>
  );
}
