import catComponents from "@/assets/cat-components.jpg";
import catAudio from "@/assets/cat-audio.jpg";
import catLighting from "@/assets/cat-lighting.jpg";
import catMobile from "@/assets/cat-mobile.jpg";
import catTv from "@/assets/cat-tv.jpg";
import promoSoundbar from "@/assets/promo-soundbar.jpg";
import promoTv from "@/assets/promo-tv.jpg";
import type { Category, Product } from "@/lib/types";
import { lkr } from "@/lib/format";

export const images = { catComponents, catAudio, catLighting, catMobile, catTv, promoSoundbar, promoTv };

export const categories: Category[] = [
  { slug: "components", name: "Electronic Components & Repair Parts", short: "Components & Repair", image: catComponents, filterKey: "Type" },
  { slug: "audio", name: "Audio & Speakers", short: "Audio & Speakers", image: catAudio, filterKey: "Connectivity" },
  { slug: "lighting", name: "Lighting", short: "Lighting", image: catLighting, filterKey: "Wattage" },
  { slug: "mobile", name: "Mobile Parts & Accessories", short: "Mobile Parts", image: catMobile, filterKey: "Compatible with" },
  { slug: "tv", name: "TVs & Projectors", short: "TVs & Projectors", image: catTv, filterKey: "Screen size" },
];

type Seed = Omit<Product, "id" | "slug" | "images" | "priceCents" | "compareAtCents" | "createdAt"> & {
  price: number;
  was?: number;
  extra?: string[];
  daysAgo: number;
};

const catImg: Record<Product["category"], string> = {
  components: catComponents,
  audio: catAudio,
  lighting: catLighting,
  mobile: catMobile,
  tv: catTv,
};

const seeds: Seed[] = [
  { name: "Arduino-Compatible Uno R3 Board", sku: "AE-CMP-1001", brand: "Keyestudio", model: "UNO R3", category: "components", price: 3450, stock: 42, daysAgo: 40, featured: true, description: "ATmega328P development board for prototyping and repair projects.", specs: { MCU: "ATmega328P", "Operating voltage": "5V", "Digital I/O": "14 pins" }, attributes: { Type: "Dev boards" } },
  { name: "Electrolytic Capacitor Kit (120 pcs)", sku: "AE-CMP-1002", brand: "Nichicon", model: "CAP-KIT-120", category: "components", price: 1850, stock: 60, daysAgo: 12, isNew: true, description: "Assorted capacitors from 1µF to 1000µF for board-level repair.", specs: { Range: "1µF – 1000µF", Voltage: "16V – 50V", Pieces: "120" }, attributes: { Type: "Passive parts" } },
  { name: "Temperature Controlled Soldering Station", sku: "AE-CMP-1003", brand: "Hakko", model: "FX-888D", category: "components", price: 38900, was: 42500, stock: 4, daysAgo: 90, featured: true, description: "Digital soldering station for precise repair work.", specs: { Power: "70W", Range: "200–480°C", Display: "Digital" }, attributes: { Type: "Tools" }, variants: [{ name: "Plug", options: ["Type G (UK)", "Type D (Indian)"] }] },
  { name: "LM358 Op-Amp IC (10 pack)", sku: "AE-CMP-1004", brand: "Texas Instruments", model: "LM358P", category: "components", price: 650, stock: 0, daysAgo: 70, description: "Dual operational amplifier, DIP-8 package.", specs: { Package: "DIP-8", Channels: "2", Supply: "3–32V" }, attributes: { Type: "ICs" } },
  { name: "Lead-Free Solder Wire 0.8mm", sku: "AE-CMP-1005", brand: "Kester", model: "SN99-08", category: "components", price: 2200, stock: 25, daysAgo: 6, isNew: true, description: "Rosin-core solder wire for electronics repair.", specs: { Diameter: "0.8mm", Weight: "100g", Alloy: "Sn99.3/Cu0.7" }, attributes: { Type: "Tools" } },

  { name: "Portable Bluetooth Speaker 20W", sku: "AE-AUD-2001", brand: "JBL", model: "Flip 6", category: "audio", price: 38500, was: 41900, stock: 14, daysAgo: 30, featured: true, description: "Waterproof portable speaker with punchy bass.", specs: { Output: "20W", Battery: "12 hours", Rating: "IP67" }, attributes: { Connectivity: "Bluetooth" }, variants: [{ name: "Colour", options: ["Black", "Red", "Blue"] }] },
  { name: "2.1 Soundbar with Wireless Subwoofer", sku: "AE-AUD-2002", brand: "Sony", model: "HT-S400", category: "audio", price: 89900, stock: 6, daysAgo: 4, isNew: true, featured: true, description: "330W soundbar with wireless subwoofer and HDMI ARC.", specs: { Output: "330W", Channels: "2.1", Inputs: "HDMI ARC, Optical, BT" }, attributes: { Connectivity: "HDMI / Bluetooth" }, compatibility: ["Any TV with HDMI ARC or optical out"] },
  { name: "Bookshelf Speakers (Pair)", sku: "AE-AUD-2003", brand: "Edifier", model: "R1280T", category: "audio", price: 32500, stock: 9, daysAgo: 60, description: "Powered studio-style bookshelf speakers.", specs: { Output: "42W RMS", Inputs: "2x RCA", Driver: "4\" bass" }, attributes: { Connectivity: "Wired (RCA)" } },
  { name: "Wireless Earbuds ANC", sku: "AE-AUD-2004", brand: "Anker", model: "Soundcore Life P3", category: "audio", price: 17900, stock: 3, daysAgo: 9, isNew: true, description: "Active noise cancelling earbuds with charging case.", specs: { Battery: "35 hours with case", ANC: "Yes", Charging: "USB-C / Wireless" }, attributes: { Connectivity: "Bluetooth" }, variants: [{ name: "Colour", options: ["Black", "White"] }] },

  { name: "LED Bulb 9W E27 (Pack of 4)", sku: "AE-LGT-3001", brand: "Philips", model: "EcoBright 9W", category: "lighting", price: 2400, stock: 120, daysAgo: 50, featured: true, description: "Energy-efficient LED bulbs for home use.", specs: { Power: "9W", Base: "E27", Lumens: "806lm" }, attributes: { Wattage: "Under 10W" }, variants: [{ name: "Colour temperature", options: ["Warm white", "Cool daylight"] }] },
  { name: "LED Strip 5m SMD 2835", sku: "AE-LGT-3002", brand: "Orange Electric", model: "STRIP-5M", category: "lighting", price: 3950, stock: 35, daysAgo: 3, isNew: true, description: "Flexible LED strip with adhesive backing and adapter.", specs: { Length: "5m", LEDs: "60/m", Voltage: "12V" }, attributes: { Wattage: "10W – 30W" } },
  { name: "Square LED Panel Light 18W", sku: "AE-LGT-3003", brand: "Orange Electric", model: "PNL-18SQ", category: "lighting", price: 2850, stock: 0, daysAgo: 80, description: "Recessed slim panel for ceilings.", specs: { Power: "18W", Size: "225 x 225mm", Lumens: "1440lm" }, attributes: { Wattage: "10W – 30W" } },
  { name: "Solar Flood Light 100W", sku: "AE-LGT-3004", brand: "Philips", model: "SolarFlood 100", category: "lighting", price: 14500, was: 16900, stock: 11, daysAgo: 22, description: "Outdoor solar flood light with remote.", specs: { Power: "100W", Panel: "Polycrystalline", Rating: "IP65" }, attributes: { Wattage: "Over 30W" } },

  { name: "Replacement OLED Display Assembly", sku: "AE-MOB-4001", brand: "OEM Grade", model: "iPhone 12 Screen", category: "mobile", price: 24500, stock: 7, daysAgo: 14, featured: true, description: "Display assembly for screen replacement. Professional fitting recommended.", specs: { Type: "OLED", Size: "6.1\"", Warranty: "Demo: 3 months" }, attributes: { "Compatible with": "Apple" }, compatibility: ["iPhone 12", "iPhone 12 Pro"] },
  { name: "Replacement Battery 4000mAh", sku: "AE-MOB-4002", brand: "OEM Grade", model: "Galaxy A52 Battery", category: "mobile", price: 6900, stock: 18, daysAgo: 8, isNew: true, description: "High-capacity replacement battery.", specs: { Capacity: "4500mAh", Chemistry: "Li-ion", Voltage: "3.85V" }, attributes: { "Compatible with": "Samsung" }, compatibility: ["Samsung Galaxy A52", "Galaxy A52s"] },
  { name: "25W USB-C Fast Charger", sku: "AE-MOB-4003", brand: "Samsung", model: "EP-TA800", category: "mobile", price: 5400, stock: 50, daysAgo: 45, featured: true, description: "Super Fast Charging adapter with USB-C cable.", specs: { Output: "25W PD", Port: "USB-C", Cable: "1m included" }, attributes: { "Compatible with": "Universal" }, variants: [{ name: "Colour", options: ["White", "Black"] }] },
  { name: "Braided USB-C to Lightning Cable 1m", sku: "AE-MOB-4004", brand: "Anker", model: "PowerLine III", category: "mobile", price: 3200, stock: 2, daysAgo: 2, isNew: true, description: "Durable braided charging cable.", specs: { Length: "1m", Standard: "MFi", "Max power": "20W" }, attributes: { "Compatible with": "Apple" } },

  { name: "43\" 4K UHD Smart TV", sku: "AE-TV-5001", brand: "TCL", model: "43P635", category: "tv", price: 129900, was: 144900, stock: 5, daysAgo: 20, featured: true, description: "4K HDR smart TV with built-in streaming apps.", specs: { Resolution: "3840 x 2160", HDR: "HDR10", OS: "Google TV" }, attributes: { "Screen size": "40\" – 50\"" }, variants: [{ name: "Size", options: ["43\"", "50\""] }] },
  { name: "55\" QLED Smart TV", sku: "AE-TV-5002", brand: "Samsung", model: "QA55Q60C", category: "tv", price: 239900, stock: 2, daysAgo: 5, isNew: true, description: "Quantum dot colour with slim AirSlim design.", specs: { Resolution: "4K", Panel: "QLED", "Refresh rate": "60Hz" }, attributes: { "Screen size": "Over 50\"" } },
  { name: "Portable LED Projector 1080p", sku: "AE-TV-5003", brand: "XGIMI", model: "Elfin", category: "tv", price: 98500, stock: 8, daysAgo: 35, description: "Compact projector for home movie nights.", specs: { Resolution: "1080p", Brightness: "600 ANSI lm", Throw: "Up to 150\"" }, attributes: { "Screen size": "Projector" } },
  { name: "32\" HD LED TV", sku: "AE-TV-5004", brand: "Abans", model: "AB32HD", category: "tv", price: 54900, was: 64900, stock: 6, daysAgo: 100, description: "Affordable HD TV with USB media playback.", specs: { Resolution: "1366 x 768", Inputs: "2x HDMI, USB", Speakers: "2 x 8W" }, attributes: { "Screen size": "Under 40\"" } },
  { name: "Toshiba 43 Inch Ultra HD 4K Smart QLED TV", sku: "AE-TV-5005", brand: "Toshiba", model: "43C350LP", category: "tv", price: 149999, was: 199999, stock: 9, daysAgo: 15, isNew: true, description: "REGZA Engine 4K with Dolby Vision and Dolby Atmos.", specs: { Resolution: "3840 x 2160", Engine: "REGZA 4K", Audio: "Dolby Atmos" }, attributes: { "Screen size": "40\" – 50\"" } },
  { name: "Abans 65 Inch UHD Smart TV", sku: "AE-TV-5006", brand: "Abans", model: "AB65UHD", category: "tv", price: 249999, was: 269999, stock: 4, daysAgo: 10, isNew: true, description: "Frameless 65\" 4K screen with Android OS.", specs: { Resolution: "4K UHD", Size: "65\"", OS: "Android TV" }, attributes: { "Screen size": "Over 50\"" } },
  { name: "LG 43 Inch FHD Smart TV", sku: "AE-TV-5007", brand: "LG", model: "43LM6370", category: "tv", price: 139999, was: 149999, stock: 7, daysAgo: 8, description: "Dynamic color enhancer with active HDR.", specs: { Resolution: "1080p FHD", HDR: "Active HDR", OS: "webOS" }, attributes: { "Screen size": "40\" – 50\"" } },
  { name: "Xiaomi A 43 Inch FHD Smart TV", sku: "AE-TV-5008", brand: "Xiaomi", model: "L43M8-AFSR", category: "tv", price: 99999, was: 139999, stock: 12, daysAgo: 5, isNew: true, description: "Metallic bezel-less design with Google TV.", specs: { Resolution: "FHD", Bezel: "Bezel-less", OS: "Google TV" }, attributes: { "Screen size": "40\" – 50\"" } },

  { name: "JBL Charge 5 Portable Waterproof Speaker", sku: "AE-AUD-2005", brand: "JBL", model: "CHARGE5", category: "audio", price: 54900, was: 62900, stock: 15, daysAgo: 7, isNew: true, description: "IP67 waterproof and dustproof speaker with built-in powerbank.", specs: { Battery: "20 hours", Output: "30W RMS", Rating: "IP67" }, attributes: { Connectivity: "Bluetooth" } },
  { name: "Sony WH-1000XM5 Wireless ANC Headphones", sku: "AE-AUD-2006", brand: "Sony", model: "WH1000XM5", category: "audio", price: 119000, was: 135000, stock: 5, daysAgo: 12, description: "Industry-leading noise cancelling with Auto NC Optimizer.", specs: { Driver: "30mm", Battery: "30 hours", ANC: "Yes" }, attributes: { Connectivity: "Bluetooth" } },
  { name: "Edifier S350DB 2.1 Speaker System", sku: "AE-AUD-2007", brand: "Edifier", model: "S350DB", category: "audio", price: 89000, was: 99000, stock: 4, daysAgo: 18, description: "Bookshelf speakers with 8-inch wireless subwoofer.", specs: { Power: "150W RMS", Inputs: "Bluetooth, Optical, Coaxial, AUX" }, attributes: { Connectivity: "Wired / Bluetooth" } },

  { name: "Smart WiFi RGB LED Bulb 10W", sku: "AE-LGT-3005", brand: "Philips", model: "Wiz-RGB", category: "lighting", price: 4200, was: 5200, stock: 40, daysAgo: 9, isNew: true, description: "16 million colors with app control and Alexa compatibility.", specs: { Base: "E27", Power: "10W", Connectivity: "WiFi" }, attributes: { Wattage: "Under 10W" } },
  { name: "Orange Electric 10m RGB Strip with Remote", sku: "AE-LGT-3006", brand: "Orange Electric", model: "RGB-10M", category: "lighting", price: 6900, was: 8200, stock: 22, daysAgo: 14, description: "High-density color changing strip with 44-key IR remote.", specs: { Length: "10m", Adapter: "12V 3A included" }, attributes: { Wattage: "10W – 30W" } },
  { name: "Round Recessed Downlight 12W Warm White", sku: "AE-LGT-3007", brand: "Orange Electric", model: "DL-12W-WW", category: "lighting", price: 2150, was: 2600, stock: 85, daysAgo: 25, description: "Ultra-slim ceiling downlight with high CRI.", specs: { Power: "12W", Cutout: "120mm" }, attributes: { Wattage: "10W – 30W" } },

  { name: "Xiaomi Magnetic 5000mAh Power Bank", sku: "AE-MOB-4005", brand: "Xiaomi", model: "WPB05", category: "mobile", price: 21999, was: 26999, stock: 16, daysAgo: 6, isNew: true, description: "Ultra-slim wireless magnetic power bank with Type-C input/output.", specs: { Capacity: "5000mAh", Wireless: "15W", Wired: "20W" }, attributes: { "Compatible with": "Universal" } },
  { name: "vivo Y500 6GB + 256GB Pearl White", sku: "AE-MOB-4006", brand: "vivo", model: "Y500-256", category: "mobile", price: 144990, was: 169990, stock: 8, daysAgo: 4, isNew: true, description: "Sleek 5G smartphone with 50MP camera and 5000mAh battery.", specs: { Display: "6.64\" FHD+", RAM: "6GB", Storage: "256GB" }, attributes: { "Compatible with": "Universal" } },
  { name: "vivo Y11D 4GB + 128GB Sunrise Gold", sku: "AE-MOB-4007", brand: "vivo", model: "Y11D-128", category: "mobile", price: 71990, was: 84990, stock: 14, daysAgo: 11, description: "Long-lasting battery with HD+ display.", specs: { RAM: "4GB", Storage: "128GB", Battery: "5000mAh" }, attributes: { "Compatible with": "Universal" } },

  { name: "ESP32 WiFi + Bluetooth IoT Board", sku: "AE-CMP-1006", brand: "Espressif", model: "ESP32-DEV-30", category: "components", price: 1850, was: 2200, stock: 75, daysAgo: 5, isNew: true, description: "Dual-core 240MHz microcontroller with onboard antenna.", specs: { Flash: "4MB", GPIO: "30 pins" }, attributes: { Type: "Dev boards" } },
  { name: "16-Channel 12V Relay Interface Board", sku: "AE-CMP-1007", brand: "Keyestudio", model: "RELAY-16CH", category: "components", price: 4800, was: 5600, stock: 12, daysAgo: 16, description: "Optocoupler isolated relay board for industrial control.", specs: { Voltage: "12V DC", Current: "10A 250VAC" }, attributes: { Type: "Relays" } },
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/["']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const BASE_DATE = new Date("2026-10-01T00:00:00Z").getTime();

export const products: Product[] = seeds.map((s, i) => {
  const { price, was, daysAgo, extra, ...rest } = s;
  const gallery = [catImg[s.category], ...(extra ?? [])];
  if (s.category === "audio") gallery.push(promoSoundbar);
  if (s.category === "tv") gallery.push(promoTv);
  return {
    ...rest,
    id: `p${i + 1}`,
    slug: slugify(`${s.brand}-${s.name}`),
    priceCents: lkr(price),
    compareAtCents: was ? lkr(was) : undefined,
    images: gallery,
    createdAt: new Date(BASE_DATE - daysAgo * 86400000).toISOString(),
  };
});

export const brands = Array.from(new Set(products.map((p) => p.brand))).sort();

export const sampleOrders = [
  { id: "AE-DEMO-10231", date: "2026-09-12", status: "Delivered", total: lkr(41900), items: 2 },
  { id: "AE-DEMO-10187", date: "2026-08-28", status: "Delivered", total: lkr(5400), items: 1 },
  { id: "AE-DEMO-10302", date: "2026-10-02", status: "Processing", total: lkr(129900), items: 1 },
];
