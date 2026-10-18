import { Link } from "@tanstack/react-router";
import { TOP_BRANDS } from "./brandLogos";

interface BrandsMegaMenuProps {
  allBrands: string[];
  brandLogos: Record<string, string>;
  onClose: () => void;
}

export function BrandsMegaMenu({ allBrands, brandLogos, onClose }: BrandsMegaMenuProps) {
  const existingBrands = Array.from(new Set(allBrands)).sort((a, b) => a.localeCompare(b));
  const existingBrandNames = new Set(existingBrands.map((brand) => brand.toLowerCase()));
  const topBrands = TOP_BRANDS.filter(({ name }) => existingBrandNames.has(name.toLowerCase()));

  // Case-insensitive lookups for uploaded logo images and built-in SVG logos
  const logoByName = new Map(
    Object.entries(brandLogos).map(([name, url]) => [name.toLowerCase(), url] as const),
  );
  const svgByName = new Map(TOP_BRANDS.map((b) => [b.name.toLowerCase(), b.component] as const));

  return (
    <div
      role="region"
      aria-label="Brands directory"
      className="w-full bg-white border border-zinc-200/90 shadow-2xl rounded-b-md overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200"
    >
      <div className="w-full max-w-[1920px] mx-auto p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Side: Top Brands (4-column grid of bordered logo tiles) */}
          {topBrands.length > 0 && (
            <div className="lg:col-span-5 xl:col-span-5">
              <div className="flex items-center justify-between mb-4 pb-1 border-b border-zinc-100">
                <h3 className="font-bold text-sm tracking-tight text-zinc-900">Top Brands</h3>
                <Link
                  to="/shop"
                  onClick={onClose}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View all →
                </Link>
              </div>

              <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                {topBrands.map(({ name, component: LogoComponent }) => (
                  <Link
                    key={name}
                    to="/shop"
                    search={{ brands: name }}
                    onClick={onClose}
                    title={`Shop ${name}`}
                    className="group relative flex h-14 sm:h-15 items-center justify-center rounded border border-zinc-200 bg-white p-2 transition-all hover:border-primary hover:shadow-sm"
                  >
                    {brandLogos[name] ? (
                      <img
                        src={brandLogos[name]}
                        alt={name}
                        className="max-h-9 max-w-[85%] object-contain transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <LogoComponent className="max-h-7 max-w-[85%] object-contain transition-transform duration-200 group-hover:scale-105" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Right Side: Brands List (arranged in 4 columns) */}
          <div
            className={
              topBrands.length > 0
                ? "lg:col-span-7 xl:col-span-7 lg:border-l lg:border-zinc-100 lg:pl-8"
                : "lg:col-span-12"
            }
          >
            <div className="flex items-center justify-between mb-4 pb-1 border-b border-zinc-100">
              <h3 className="font-bold text-sm tracking-tight text-zinc-900">Brands</h3>
              <span className="text-xs text-zinc-400 font-medium">
                {existingBrands.length} {existingBrands.length === 1 ? "brand" : "brands"}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 max-h-[380px] overflow-y-auto pr-2">
              {existingBrands.map((brand) => {
                const logoUrl = logoByName.get(brand.toLowerCase());
                const SvgLogo = svgByName.get(brand.toLowerCase());
                return (
                  <Link
                    key={brand}
                    to="/shop"
                    search={{ brands: brand }}
                    onClick={onClose}
                    title={`Shop ${brand}`}
                    aria-label={`Shop ${brand}`}
                    className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-white p-1.5 transition-all hover:border-primary hover:shadow-md"
                  >
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={brand}
                        loading="lazy"
                        className="h-full w-full rounded object-contain transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : SvgLogo ? (
                      <SvgLogo className="h-auto w-full max-h-full object-contain transition-transform duration-200 group-hover:scale-105" />
                    ) : (
                      <span className="line-clamp-2 text-center text-[11px] font-extrabold uppercase leading-tight tracking-wide text-zinc-700 transition-colors group-hover:text-primary">
                        {brand}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
