import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { activeBannersQuery } from "@/services/banners";
import type { Banner } from "@/lib/bannerTypes";

// ─── Single banner slide ──────────────────────────────────────────────────────

function BannerSlide({ banner }: { banner: Banner }) {
  const hasCta = banner.ctaText && banner.ctaLink;

  const inner = (
    <div className="relative w-full overflow-hidden" style={{ minHeight: 220 }}>
      {/* Desktop image */}
      <picture>
        {banner.mobileImageUrl && (
          <source media="(max-width: 639px)" srcSet={banner.mobileImageUrl} />
        )}
        <img
          src={banner.imageUrl}
          alt={banner.altText || banner.title}
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
      </picture>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)",
        }}
      />

      {/* Text content */}
      <div className="relative z-10 flex h-full flex-col justify-center px-6 py-10 sm:px-10 lg:px-16">
        {banner.subtitle && (
          <span
            className="mb-3 inline-block w-fit bg-primary px-2.5 py-0.5 text-[11px] font-black uppercase tracking-widest text-primary-foreground"
            style={{ letterSpacing: "0.14em" }}
          >
            {banner.subtitle}
          </span>
        )}
        <h2
          className="font-display text-2xl font-black uppercase leading-tight text-white sm:text-3xl lg:text-4xl"
          style={{ maxWidth: "55ch", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
        >
          {banner.title}
        </h2>

        {hasCta && (
          <span className="mt-6 inline-flex w-fit items-center gap-2 border-2 border-primary bg-primary px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest text-primary-foreground transition-all hover:bg-transparent hover:text-white">
            {banner.ctaText}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </div>
  );

  if (hasCta) {
    const isExternal =
      banner.ctaLink!.startsWith("http://") ||
      banner.ctaLink!.startsWith("https://");
    if (isExternal) {
      return (
        <a
          href={banner.ctaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
          style={{ minHeight: 220 }}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link to={banner.ctaLink as never} className="block w-full" style={{ minHeight: 220 }}>
        {inner}
      </Link>
    );
  }

  return <div className="block w-full" style={{ minHeight: 220 }}>{inner}</div>;
}

// ─── Carousel wrapper ─────────────────────────────────────────────────────────

function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const go = useCallback(
    (delta: 1 | -1) => {
      setDir(delta);
      setIdx((i) => (i + delta + banners.length) % banners.length);
    },
    [banners.length]
  );

  // Auto-advance every 6 s when multiple banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => go(1), 6000);
    return () => clearInterval(id);
  }, [banners.length, go]);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: "0%", opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div className="relative overflow-hidden" style={{ minHeight: 220 }}>
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div
          key={banners[idx].id}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "tween", duration: 0.4, ease: "easeInOut" }}
          className="w-full"
        >
          <BannerSlide banner={banners[idx]} />
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next arrows — only if >1 banners */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous offer"
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/70"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next offer"
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/70"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                onClick={() => {
                  setDir(i > idx ? 1 : -1);
                  setIdx(i);
                }}
                aria-label={`Go to offer ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? "w-5 bg-primary" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

/**
 * Renders active special offer banners at the top of the homepage.
 * Fetches from banners service; hides itself when no active banners exist.
 */
export function SpecialOfferBanner() {
  const { data: banners } = useQuery({
    ...activeBannersQuery,
    // Don't throw — just return empty on error
    throwOnError: false,
  });

  if (!banners || banners.length === 0) return null;

  return (
    <section aria-label="Special offers" className="w-full">
      <BannerCarousel banners={banners} />
    </section>
  );
}
