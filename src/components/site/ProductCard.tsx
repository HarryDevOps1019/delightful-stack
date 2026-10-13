import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useCart } from "@/context/cart";
import { formatLKR, stockLabel } from "@/lib/format";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StockBadge({ stock }: { stock: number }) {
  const s = stockLabel(stock);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold",
        s.tone === "in" && "text-success",
        s.tone === "low" && "text-warning",
        s.tone === "out" && "text-muted-foreground",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {s.text}
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const remaining = cart.remainingFor(product.id);
  const disabled = product.stock <= 0 || remaining <= 0;
  const needsVariant = !!product.variants?.length;

  return (
    <motion.article
      initial={{ y: 8 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="group flex flex-col border border-border bg-card p-4 transition-colors hover:border-foreground/30"
    >
      <div className="flex items-center justify-between">
        <StockBadge stock={product.stock} />
        {product.compareAtCents && (
          <span className="bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
            -{Math.round((1 - product.priceCents / product.compareAtCents) * 100)}%
          </span>
        )}
      </div>
      <Link to="/product/$slug" params={{ slug: product.slug }} className="mt-3 block">
        <div className="aspect-square overflow-hidden bg-tile">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            width={816}
            height={816}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
          />
        </div>
        <h3 className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-tight text-foreground">{product.name}</h3>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {product.brand} · {product.model}
        </p>
      </Link>
      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
        <div className="min-w-0">
          <p className="font-display text-base font-extrabold">{formatLKR(product.priceCents)}</p>
          {product.compareAtCents && (
            <p className="text-xs text-muted-foreground line-through">{formatLKR(product.compareAtCents)}</p>
          )}
        </div>
        {needsVariant ? (
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            aria-label={`Choose options for ${product.name}`}
            className="grid h-10 w-10 shrink-0 place-items-center border-2 border-primary text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <ShoppingCart className="h-4 w-4" />
          </Link>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              cart.add(product.id, 1);
              toast.success(`${product.name} added to cart`);
            }}
            aria-label={disabled ? `${product.name} unavailable` : `Add ${product.name} to cart`}
            className="grid h-10 w-10 shrink-0 place-items-center border-2 border-primary text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-border p-4">
          <div className="aspect-square animate-pulse bg-tile" />
          <div className="mt-3 h-4 w-3/4 animate-pulse bg-tile" />
          <div className="mt-2 h-3 w-1/2 animate-pulse bg-tile" />
        </div>
      ))}
    </div>
  );
}
