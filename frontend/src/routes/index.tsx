import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { brands, images } from "@/data/catalog";
import { useCatalog } from "@/services/catalog";
import { SpecialOfferBanner } from "@/components/site/SpecialOfferBanner";
import { CategoryProductSection } from "@/components/site/CategoryProductSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Asia Electronics & Cellular — Electronics, Parts & Accessories (Demo)" },
      { name: "description", content: "Shop electronic components, audio, lighting, mobile parts and TVs in Sri Lanka. Demo storefront with sample LKR prices." },
      { property: "og:title", content: "Asia Electronics & Cellular — Demo Store" },
      { property: "og:description", content: "Electronic components, audio, lighting, mobile parts and TVs — demo storefront." },
    ],
  }),
  component: Index,
});

const fade = { initial: { y: 12 }, animate: { y: 0 } };

function Index() {
  const { categories, products: allProducts } = useCatalog();

  return (
    <>
      {/* Special Offer Banners — shown at top when active */}
      <SpecialOfferBanner />

      {/* Promo grid */}
      <section className="container-shop pt-6 lg:pt-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left 2 columns */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <motion.div {...fade} transition={{ duration: 0.4 }} className="flex-1">
              <Link to="/shop" search={{ category: "audio" }} className="group relative flex h-full min-h-[240px] items-center overflow-hidden bg-tile">
                <div className="relative z-10 max-w-[55%] p-6 sm:p-8">
                  <span className="bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">SAMPLE OFFER</span>
                  <h2 className="mt-4 font-display text-xl font-extrabold uppercase sm:text-2xl">2.1 Soundbars & Home Audio</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Upgrade your TV sound. Illustrative demo pricing.</p>
                  <p className="mt-6 font-display font-extrabold">From Rs. 32,500</p>
                </div>
                <img src={images.promoSoundbar} alt="Soundbar with subwoofer" width={1024} height={768} className="absolute right-0 top-0 h-full w-1/2 object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
              </Link>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { cat: "mobile" as const, title: "Mobile Repair Parts", sub: "Screens, batteries, chargers", price: "From Rs. 3,200", img: images.catMobile },
                { cat: "lighting" as const, title: "LED Lighting", sub: "Bulbs, strips, panels", price: "From Rs. 2,400", img: images.catLighting },
              ].map((t, i) => (
                <motion.div key={t.cat} {...fade} transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}>
                  <Link to="/shop" search={{ category: t.cat }} className="group flex h-full min-h-[170px] items-center justify-between gap-2 overflow-hidden bg-tile p-6">
                    <div className="min-w-0">
                      <h3 className="font-display text-sm font-extrabold uppercase">{t.title}</h3>
                      <p className="mt-2 text-xs text-muted-foreground">{t.sub}</p>
                      <p className="mt-6 font-display text-sm font-extrabold">{t.price}</p>
                    </div>
                    <img src={t.img} alt="" width={816} height={816} loading="lazy" className="h-28 w-28 shrink-0 object-cover mix-blend-multiply transition-transform group-hover:scale-105 motion-reduce:transition-none" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right column: TV card */}
          <motion.div {...fade} transition={{ duration: 0.4, delay: 0.1 }} className="h-full">
            <Link to="/shop" search={{ category: "tv" }} className="group relative flex h-full min-h-[320px] flex-col overflow-hidden bg-tile">
              <div className="relative z-10 p-6 sm:p-8">
                <h2 className="font-display text-4xl font-black uppercase sm:text-5xl">Top</h2>
                <p className="mt-1 font-display text-sm font-extrabold uppercase">TVs & Projectors</p>
                <p className="mt-2 text-sm text-muted-foreground">4K smart TVs and portable projectors</p>
              </div>
              <img src={images.promoTv} alt="4K smart TV on stand" width={768} height={1152} loading="lazy" className="mt-auto w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Brands */}
      <section className="container-shop mt-16">
        <SectionHead title="Shop by Brand" to="/shop" cta="All brands" />
        <div className="mt-6 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
          {brands.slice(0, 12).map((b) => (
            <Link key={b} to="/shop" search={{ brands: b }} className="flex h-20 items-center justify-center bg-background px-3 text-center font-display text-sm font-extrabold uppercase text-muted-foreground transition-colors hover:text-primary">
              {b}
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-shop mt-16">
        <SectionHead title="Shop by Category" to="/shop" cta="All categories" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug }}
              className={`group flex h-28 items-center justify-between gap-3 overflow-hidden px-6 transition-colors ${i === 4 ? "bg-primary text-primary-foreground" : "bg-tile hover:bg-secondary"}`}
            >
              <span className="min-w-0 font-display text-xs font-extrabold uppercase leading-snug">{c.name}</span>
              <img
                src={c.image}
                alt=""
                width={816}
                height={816}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "/assets/imgs/electronic-components.png";
                }}
                className={`h-20 w-20 shrink-0 object-cover transition-transform group-hover:scale-110 motion-reduce:transition-none ${i === 4 ? "" : "mix-blend-multiply"}`}
              />
            </Link>
          ))}
          <Link to="/shop" className="flex h-28 items-center justify-between bg-ink px-6 text-ink-foreground">
            <span className="font-display text-xs font-extrabold uppercase">Browse everything</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ─── Category Product Carousel Sections (Matching Reference Screenshots) ─── */}
      <div className="mt-10 sm:mt-12">
        {categories.map((cat) => {
          const catProducts = allProducts.filter((p) => p.category === cat.slug);
          return (
            <CategoryProductSection
              key={cat.slug}
              category={cat}
              products={catProducts}
            />
          );
        })}
      </div>

      <section className="container-shop mt-16 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="section-title">About our store</h2>
          <p className="mt-5 font-semibold">Electronics, repair parts and accessories for homes, technicians and businesses across Sri Lanka.</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Asia Electronics and Cellular Pvt Ltd supplies components, audio, lighting, mobile parts and displays. This is a
            demonstration website — company history, certifications and contact details will be added once confirmed by the client.
          </p>
          <Link to="/about" className="mt-5 inline-flex items-center gap-2 border-2 border-primary px-4 py-2 text-xs font-bold uppercase text-primary hover:bg-primary hover:text-primary-foreground">
            Read more <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-px bg-border">
          {[["5", "Product categories"], [String(brands.length), "Sample brands"], ["LKR", "Local pricing"]].map(([n, l]) => (
            <div key={l} className="flex flex-col justify-center bg-tile p-6">
              <span className="font-display text-3xl font-black text-primary">{n}</span>
              <span className="mt-1 text-xs font-semibold uppercase text-muted-foreground">{l}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function SectionHead({ title, to, cta, search }: { title: string; to: "/shop"; cta: string; search?: { sort: "newest" } | undefined }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="section-title">{title}</h2>
      <Link to={to} search={search ?? {}} className="shrink-0 border-2 border-primary px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground">
        {cta}
      </Link>
    </div>
  );
}
