import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { CategoryProductCard, CategoryProductCardSkeleton } from "./CategoryProductCard";

interface CategoryProductSectionProps {
  category: Category;
  products: Product[];
  isLoading?: boolean;
}

export function CategoryProductSection({
  category,
  products,
  isLoading = false,
}: CategoryProductSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
    slidesToScroll: "auto",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect, products.length]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="container-shop py-6 sm:py-8" aria-labelledby={`cat-heading-${category.slug}`}>
      {/* ─── Section Header: Title on Left, VIEW ALL on Right ─── */}
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id={`cat-heading-${category.slug}`}
          className="font-display text-base sm:text-lg lg:text-xl font-bold tracking-tight text-foreground"
        >
          {category.name}
        </h2>
        <Link
          to="/shop"
          search={{ category: category.slug }}
          className="shrink-0 text-xs font-bold uppercase tracking-wider text-primary hover:underline transition-colors"
        >
          VIEW ALL
        </Link>
      </div>

      {/* Thin horizontal divider beneath heading */}
      <div className="border-b border-border/80 mt-2 mb-4" />

      {/* ─── Product Carousel Row with Prev/Next Controls ─── */}
      <div className="group/row relative">
        {/* Previous Navigation Arrow */}
        {canScrollPrev && (
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous products"
            className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-20 grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-border bg-white text-foreground shadow-md transition-all hover:bg-tile hover:text-primary cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}

        {/* Next Navigation Arrow */}
        {canScrollNext && (
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next products"
            className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-20 grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-border bg-white text-foreground shadow-md transition-all hover:bg-tile hover:text-primary cursor-pointer"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}

        {/* Carousel Viewport */}
        <div className="overflow-hidden border border-border/80 rounded-xs bg-card" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {isLoading
              ? Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="min-w-0 flex-[0_0_65%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_22%] xl:flex-[0_0_16.666%] border-r border-border last:border-r-0"
                  >
                    <CategoryProductCardSkeleton />
                  </div>
                ))
              : products.map((product) => (
                  <div
                    key={product.id}
                    className="min-w-0 flex-[0_0_65%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_22%] xl:flex-[0_0_16.666%] border-r border-border last:border-r-0"
                  >
                    <CategoryProductCard product={product} />
                  </div>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}
