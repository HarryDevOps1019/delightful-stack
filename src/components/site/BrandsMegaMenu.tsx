import { Link } from "@tanstack/react-router";
import { TOP_BRANDS } from "./brandLogos";

interface BrandsMegaMenuProps {
  allBrands: string[];
  onClose: () => void;
}

export function BrandsMegaMenu({ allBrands, onClose }: BrandsMegaMenuProps) {
  // Comprehensive alphabetical list of brands including catalog brands and reference brands
  const extendedBrandsList = Array.from(
    new Set([
      ...allBrands,
      "Electrolux", "Oppo", "Elba", "Ignis", "Meyer", "Philips", "Premier", "Pyrex", "Realme",
      "Vivo", "Acer", "Beats", "Harman Kardon", "Mistral", "Orient", "Pureit", "Tecno", "Tefal",
      "Russell Hobbs", "Remington", "Electrique", "Joyroom", "Infinix", "Flamingo", "Stihl",
      "Calvin Klein", "Boss", "Coach", "Marshall", "Bright", "Sudio", "Borosil", "Stahl",
      "Dollor", "Aviator", "Whirlpool", "Motorola", "Miniso", "Baseus", "Toshiba", "Lenovo",
      "Haier", "Apple", "Samsung", "Sony", "JBL", "TCL", "Anker", "Hakko", "Nichicon",
      "Texas Instruments", "Kester", "Orange Electric", "Keyestudio", "Edifier"
    ])
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div
      role="region"
      aria-label="Brands directory"
      className="w-full bg-white border border-zinc-200/90 shadow-2xl rounded-b-md overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200"
    >
      <div className="w-full max-w-[1920px] mx-auto p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Side: Top Brands (4-column grid of bordered logo tiles) */}
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
              {TOP_BRANDS.map(({ name, component: LogoComponent }) => (
                <Link
                  key={name}
                  to="/shop"
                  search={{ brands: name }}
                  onClick={onClose}
                  title={`Shop ${name}`}
                  className="group relative flex h-14 sm:h-15 items-center justify-center rounded border border-zinc-200 bg-white p-2 transition-all hover:border-primary hover:shadow-sm"
                >
                  <LogoComponent className="max-h-7 max-w-[85%] object-contain transition-transform duration-200 group-hover:scale-105" />
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side: Brands List (arranged in 4 columns) */}
          <div className="lg:col-span-7 xl:col-span-7 lg:border-l lg:border-zinc-100 lg:pl-8">
            <div className="flex items-center justify-between mb-4 pb-1 border-b border-zinc-100">
              <h3 className="font-bold text-sm tracking-tight text-zinc-900">Brands</h3>
              <span className="text-xs text-zinc-400 font-medium">{extendedBrandsList.length} brands</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 max-h-[380px] overflow-y-auto pr-2">
              {extendedBrandsList.map((brand) => (
                <Link
                  key={brand}
                  to="/shop"
                  search={{ brands: brand }}
                  onClick={onClose}
                  className="text-xs font-medium text-zinc-700 hover:text-primary hover:font-semibold py-1 transition-colors truncate block"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
