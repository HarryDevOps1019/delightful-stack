import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Minus, Plus, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { productQuery, relatedQuery, categories } from "@/services/catalog";
import { useCart } from "@/context/cart";
import { formatLKR } from "@/lib/format";
import { ProductGrid, StockBadge } from "@/components/site/ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

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
