import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Minus, Plus, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { productQuery, relatedQuery, categories } from "@/services/catalog";
import { useCart } from "@/context/cart";
import { BUSINESS_WHATSAPP_NUMBER } from "@/lib/config";
import { formatLKR } from "@/lib/format";
import { ProductGrid, StockBadge } from "@/components/site/ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Inline WhatsApp SVG icon (brand logo — not available in lucide)   */
/* ------------------------------------------------------------------ */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function buildWhatsAppUrl(productName: string, quantity: number): string {
  const message = [
    "Hello, I would like to inquire about the following product:",
    "",
    `Product: ${productName}`,
    `Requested Quantity: ${quantity}`,
    "",
    "Could you please confirm availability and pricing for this quantity?",
    "Thank you.",
  ].join("\n");
  return `https://web.whatsapp.com/send?phone=${BUSINESS_WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
}

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const p = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!p) throw notFound();
    context.queryClient.ensureQueryData(relatedQuery(params.slug));
    return { name: p.name, description: p.description };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.name} — Asia Electronics (Demo)` },
            { name: "description", content: loaderData.description },
            { property: "og:title", content: loaderData.name },
            { property: "og:description", content: loaderData.description },
            { property: "og:type", content: "product" },
          ],
        }
      : { meta: [{ title: "Product not found" }, { name: "robots", content: "noindex" }] },
  notFoundComponent: ProductNotFound,
  component: ProductPage,
});

function ProductNotFound() {
  return (
    <div className="container-shop py-20 text-center">
      <h1 className="font-display text-2xl font-extrabold">Product not found</h1>
      <Link to="/shop" className="mt-4 inline-block font-bold text-primary hover:underline">Back to shop</Link>
    </div>
  );
}

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQuery(slug));
  const { data: related } = useSuspenseQuery(relatedQuery(slug));
  const cart = useCart();
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState<Record<string, string>>({});
  if (!product) return <ProductNotFound />;

  const cat = categories.find((c) => c.slug === product.category);
  const remaining = cart.remainingFor(product.id);
  const missing = (product.variants ?? []).filter((v) => !variant[v.name]);
  const canAdd = product.stock > 0 && remaining > 0 && missing.length === 0;
  const variantLabel = product.variants?.map((v) => `${v.name}: ${variant[v.name]}`).join(", ");

  const add = () => {
    if (missing.length) return toast.error(`Please choose ${missing.map((m) => m.name.toLowerCase()).join(" and ")}`);
    const q = Math.min(qty, remaining);
    cart.add(product.id, q, variantLabel || undefined);
    toast.success(`Added ${q} × ${product.name}`);
    setQty(1);
  };

  return (
    <div className="container-shop pt-8">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link> /{" "}
        <Link to="/shop" search={{ category: product.category }} className="hover:text-primary">{cat?.short}</Link> / <span>{product.name}</span>
      </nav>
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden bg-tile">
            <img src={product.images[img]} alt={product.name} width={816} height={816} className="h-full w-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((src, i) => (
                <button key={src} type="button" onClick={() => setImg(i)} aria-label={`Show image ${i + 1}`} aria-pressed={img === i}
                  className={`h-20 w-20 overflow-hidden border-2 ${img === i ? "border-primary" : "border-transparent"}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <StockBadge stock={product.stock} />
          <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">{product.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {product.brand} · Model {product.model} · SKU {product.sku}
          </p>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl font-black">{formatLKR(product.priceCents)}</span>
            {product.compareAtCents && <span className="text-muted-foreground line-through">{formatLKR(product.compareAtCents)}</span>}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Sample price for demonstration only.</p>
          <p className="mt-5 text-sm leading-relaxed">{product.description}</p>

          {product.variants?.map((v) => (
            <fieldset key={v.name} className="mt-6">
              <legend className="mb-2 text-xs font-extrabold uppercase tracking-wider">{v.name}</legend>
              <div className="flex flex-wrap gap-2">
                {v.options.map((o) => (
                  <button key={o} type="button" aria-pressed={variant[v.name] === o} onClick={() => setVariant((s) => ({ ...s, [v.name]: o }))}
                    className={`min-h-10 border-2 px-4 text-sm font-semibold ${variant[v.name] === o ? "border-primary text-primary" : "border-border hover:border-foreground"}`}>
                    {o}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex h-12 items-center border border-input" role="group" aria-label="Quantity">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-full w-12 place-items-center"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center font-bold" aria-live="polite">{qty}</span>
              <button type="button" aria-label="Increase quantity" disabled={qty >= remaining} onClick={() => setQty((q) => Math.min(remaining, q + 1))} className="grid h-full w-12 place-items-center disabled:opacity-40"><Plus className="h-4 w-4" /></button>
            </div>
            <Button onClick={add} disabled={product.stock <= 0 || remaining <= 0} className="h-12 flex-1 rounded-none text-sm font-bold uppercase tracking-wider sm:flex-none sm:px-10">
              <ShoppingCart className="h-4 w-4" /> {product.stock <= 0 ? "Out of stock" : remaining <= 0 ? "Max in cart" : "Add to cart"}
            </Button>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={buildWhatsAppUrl(product.name, qty)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Request ${product.name} on WhatsApp`}
                    className="grid h-12 w-12 shrink-0 place-items-center border-2 border-[#25D366] text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Request on WhatsApp</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {product.stock > 0 && remaining < product.stock && (
            <p className="mt-2 text-xs text-muted-foreground">{product.stock - remaining} already in your cart · {remaining} more available</p>
          )}
          {!canAdd && missing.length > 0 && product.stock > 0 && <p className="mt-2 text-xs text-muted-foreground">Select options above to add to cart.</p>}

          <div className="mt-8 grid gap-3 border-t border-border pt-6 text-sm sm:grid-cols-2">
            <Link to="/policy/$slug" params={{ slug: "delivery" }} className="flex items-center gap-2 hover:text-primary"><Truck className="h-4 w-4 text-primary" /> Delivery info (demo)</Link>
            <Link to="/policy/$slug" params={{ slug: "warranty" }} className="flex items-center gap-2 hover:text-primary"><ShieldCheck className="h-4 w-4 text-primary" /> Warranty terms (pending)</Link>
          </div>
        </div>
      </div>

      <Tabs defaultValue="specs" className="mt-14">
        <TabsList className="h-auto rounded-none bg-transparent p-0">
          <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent px-5 py-3 font-bold data-[state=active]:border-primary data-[state=active]:shadow-none">Specifications</TabsTrigger>
          <TabsTrigger value="compat" className="rounded-none border-b-2 border-transparent px-5 py-3 font-bold data-[state=active]:border-primary data-[state=active]:shadow-none">Compatibility</TabsTrigger>
        </TabsList>
        <TabsContent value="specs" className="mt-4">
          <dl className="divide-y divide-border border border-border text-sm">
            {Object.entries({ Brand: product.brand, Model: product.model, SKU: product.sku, ...product.specs }).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4 px-4 py-3">
                <dt className="font-semibold text-muted-foreground">{k}</dt><dd>{v}</dd>
              </div>
            ))}
          </dl>
        </TabsContent>
        <TabsContent value="compat" className="mt-4 text-sm">
          {product.compatibility?.length ? (
            <ul className="list-inside list-disc space-y-1">{product.compatibility.map((c) => <li key={c}>{c}</li>)}</ul>
          ) : (
            <p className="text-muted-foreground">No specific compatibility notes. Contact us to confirm fit for your device.</p>
          )}
        </TabsContent>
      </Tabs>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title">Related Products</h2>
          <div className="mt-6"><ProductGrid products={related} /></div>
        </section>
      )}
    </div>
  );
}
