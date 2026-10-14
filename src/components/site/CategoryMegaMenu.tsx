import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Cpu,
  Headphones,
  Lightbulb,
  Smartphone,
  Tv,
  Package,
  Sparkles,
} from "lucide-react";
import type { Category } from "@/lib/types";

interface SubcategoryGroup {
  title: string;
  items: {
    label: string;
    searchParam?: string;
    query?: string;
  }[];
}

const CATEGORY_GROUPS: Record<string, SubcategoryGroup[]> = {
  components: [
    {
      title: "Passive Components",
      items: [
        { label: "Resistors (1/4W & Metal Film)", query: "resistor" },
        { label: "Electrolytic Capacitors 50V", query: "capacitor" },
        { label: "Multilayer Ceramic Capacitors", query: "ceramic capacitor" },
        { label: "Power Inductors SMD", query: "inductor" },
        { label: "Capacitor Assortment Kits", query: "capacitor kit" },
      ],
    },
    {
      title: "Semiconductors & ICs",
      items: [
        { label: "Fast Recovery Diodes (1N4007)", query: "diode" },
        { label: "Power MOSFETs (IRFZ44N / IRF3205)", query: "mosfet" },
        { label: "NPN / PNP Bipolar Transistors", query: "transistor" },
        { label: "Dual Op-Amp ICs (LM358)", query: "op-amp" },
        { label: "Linear Voltage Regulators (7805/LM317)", query: "regulator" },
        { label: "Precision Timers (NE555)", query: "timer" },
      ],
    },
    {
      title: "Dev Boards & Sensors",
      items: [
        { label: "Arduino Uno R3 Compatible", query: "arduino" },
        { label: "ESP32 WiFi & Bluetooth Boards", query: "esp32" },
        { label: "STM32 Development Boards", query: "stm32" },
        { label: "Temperature & Humidity Sensors", query: "sensor" },
        { label: "Ultrasonic Distance Modules", query: "ultrasonic" },
      ],
    },
    {
      title: "Tools & Equipment",
      items: [
        { label: "Soldering Stations (Hakko FX-888D)", query: "soldering station" },
        { label: "Soldering Tips 900M Series", query: "soldering tip" },
        { label: "Lead-Free Solder Wire (Kester)", query: "solder wire" },
        { label: "Desoldering Pumps & Braid", query: "desoldering" },
        { label: "Digital Multimeters & Probes", query: "multimeter" },
      ],
    },
    {
      title: "Connectors & Protection",
      items: [
        { label: "Screw Terminal Blocks 5.08mm", query: "terminal block" },
        { label: "Pin Header Strips 2.54mm", query: "pin header" },
        { label: "Slow-Blow Glass Fuses 250V", query: "fuse" },
        { label: "Miniature 12V Power Relays", query: "relay" },
      ],
    },
  ],
  audio: [
    {
      title: "Portable Audio",
      items: [
        { label: "Bluetooth Speakers 20W", query: "speaker" },
        { label: "Waterproof Outdoor Speakers", query: "waterproof speaker" },
        { label: "Wireless ANC Earbuds", query: "earbuds" },
        { label: "Over-Ear Studio Headphones", query: "headphones" },
      ],
    },
    {
      title: "Home Theater & Sound",
      items: [
        { label: "2.1 Soundbars with Subwoofer", query: "soundbar" },
        { label: "Powered Bookshelf Speakers (Edifier)", query: "bookshelf" },
        { label: "High-Power 330W Systems", query: "330W" },
        { label: "Home Audio Amplifiers", query: "amplifier" },
      ],
    },
    {
      title: "Cables & Connectivity",
      items: [
        { label: "High-Speed HDMI ARC Cables", query: "hdmi" },
        { label: "Digital Optical Audio Leads", query: "optical" },
        { label: "3.5mm Aux Audio Leads", query: "aux" },
        { label: "Dual RCA Phono Interconnects", query: "rca" },
      ],
    },
  ],
  lighting: [
    {
      title: "LED Bulbs",
      items: [
        { label: "9W E27 Screw Base Bulbs (Pack of 4)", query: "bulb" },
        { label: "B22 Pin Base Energy Savers", query: "b22" },
        { label: "Warm White (3000K)", query: "warm white" },
        { label: "Cool Daylight (6500K)", query: "cool daylight" },
      ],
    },
    {
      title: "LED Strips & Architectural",
      items: [
        { label: "5m SMD 2835 Flexible Strips", query: "strip" },
        { label: "12V 5A LED Power Supplies", query: "power supply" },
        { label: "RGB Color Changing Kits", query: "rgb" },
        { label: "RF Dimmer Controllers", query: "dimmer" },
      ],
    },
    {
      title: "Ceiling & Panels",
      items: [
        { label: "Square Slim Panel Lights 18W", query: "panel" },
        { label: "Round Recessed Downlights", query: "downlight" },
        { label: "Constant Current Drivers", query: "driver" },
      ],
    },
    {
      title: "Outdoor & Solar",
      items: [
        { label: "100W Solar Flood Lights", query: "solar flood" },
        { label: "Dusk-to-Dawn Motion Sensors", query: "sensor light" },
        { label: "IP65 Waterproof Garden Lights", query: "waterproof" },
      ],
    },
  ],
  mobile: [
    {
      title: "Displays & Screens",
      items: [
        { label: "Replacement OLED Displays (iPhone 12)", query: "oled" },
        { label: "Touch Screen Digitizers", query: "screen" },
        { label: "Samsung Galaxy Assemblies", query: "galaxy" },
        { label: "Tempered Glass Protectors", query: "tempered" },
      ],
    },
    {
      title: "Power & Charging",
      items: [
        { label: "4000mAh Replacement Batteries", query: "battery" },
        { label: "Samsung 25W Fast Chargers", query: "charger" },
        { label: "High-Drain 18650 Li-Ion Cells", query: "18650" },
        { label: "Multi-Port Desktop Chargers", query: "multi-port" },
      ],
    },
    {
      title: "Cables & Connectors",
      items: [
        { label: "Braided USB-C to Lightning Cables", query: "lightning" },
        { label: "USB-C Fast Charging 60W Cables", query: "usb-c" },
        { label: "Heavy-Duty Braided Leads", query: "braided" },
      ],
    },
    {
      title: "Internal Repair Parts",
      items: [
        { label: "Charging Port Flex Cables", query: "flex" },
        { label: "Earpiece & Loudspeakers", query: "speaker module" },
        { label: "Camera Glass Replacements", query: "camera" },
      ],
    },
  ],
  tv: [
    {
      title: "Smart TVs",
      items: [
        { label: "32\" HD LED TVs", query: "32" },
        { label: "43\" 4K UHD Smart TVs", query: "43" },
        { label: "55\" QLED Smart TVs", query: "55" },
        { label: "Google TV & Android Smart Sets", query: "smart tv" },
      ],
    },
    {
      title: "Projectors & Displays",
      items: [
        { label: "Portable 1080p LED Projectors", query: "projector" },
        { label: "Home Cinema Systems", query: "cinema" },
        { label: "Retractable Projector Screens", query: "screen" },
      ],
    },
    {
      title: "Mounts & Accessories",
      items: [
        { label: "Fixed & Tilting Wall Mounts", query: "mount" },
        { label: "Universal TV Remote Controls", query: "remote" },
        { label: "High-Speed HDMI 2.1 4K Leads", query: "hdmi" },
      ],
    },
  ],
};

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  components: Cpu,
  audio: Headphones,
  lighting: Lightbulb,
  mobile: Smartphone,
  tv: Tv,
};

interface CategoryMegaMenuProps {
  categories: Category[];
  onClose: () => void;
}

export function CategoryMegaMenu({ categories, onClose }: CategoryMegaMenuProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>(() => categories[0]?.slug ?? "components");

  const activeCategory = categories.find((c) => c.slug === selectedSlug) ?? categories[0];
  const subcategoryGroups = activeCategory ? (CATEGORY_GROUPS[activeCategory.slug] ?? []) : [];
  const ActiveIcon = activeCategory ? (CATEGORY_ICONS[activeCategory.slug] ?? Package) : Package;

  return (
    <div
      role="region"
      aria-label="Category navigation menu"
      className="flex shadow-2xl rounded-b-md border border-zinc-200/90 bg-white overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 w-[880px] xl:w-[960px] max-w-[calc(100vw-3.5rem)]"
    >
      {/* Left Column: Light-gray vertical panel */}
      <div className="w-64 shrink-0 bg-[#f8f8fa] border-r border-zinc-200 py-3 flex flex-col">
        {categories.map((c) => {
          const IconComponent = CATEGORY_ICONS[c.slug] ?? Package;
          const isSelected = c.slug === selectedSlug;
          return (
            <button
              key={c.slug}
              type="button"
              onMouseEnter={() => setSelectedSlug(c.slug)}
              onClick={() => setSelectedSlug(c.slug)}
              className={`flex items-center justify-between w-full px-4 py-3 text-xs font-semibold tracking-tight transition-colors text-left cursor-pointer ${
                isSelected
                  ? "bg-white text-primary shadow-xs font-bold border-l-4 border-primary"
                  : "text-zinc-700 hover:bg-zinc-200/60 hover:text-zinc-900 border-l-4 border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <IconComponent className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-zinc-500"}`} />
                <span className="truncate">{c.short || c.name}</span>
              </div>
              <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-primary" : "text-zinc-400"}`} />
            </button>
          );
        })}

        <div className="mt-auto pt-3 px-4 border-t border-zinc-200/60">
          <Link
            to="/shop"
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-bold text-primary hover:underline py-2"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>View All Products →</span>
          </Link>
        </div>
      </div>

      {/* Right Column: Multi-column subcategories panel */}
      <div className="flex-1 bg-white p-6 min-w-[580px] max-w-4xl flex flex-col">
        {activeCategory && (
          <>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <ActiveIcon className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-sm tracking-tight text-zinc-900">{activeCategory.name}</h3>
              </div>
              <Link
                to="/shop"
                search={{ category: activeCategory.slug }}
                onClick={onClose}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Explore all {activeCategory.short} →
              </Link>
            </div>

            {subcategoryGroups.length > 0 ? (
              <div className="grid grid-cols-3 gap-6 flex-1">
                {subcategoryGroups.map((group) => (
                  <div key={group.title} className="space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-1">
                      {group.title}
                    </h4>
                    <ul className="space-y-1">
                      {group.items.map((item) => (
                        <li key={item.label}>
                          <Link
                            to="/shop"
                            search={{
                              category: activeCategory.slug,
                              q: item.query,
                            }}
                            onClick={onClose}
                            className="text-xs text-zinc-600 hover:text-primary hover:font-medium py-0.5 block transition-colors leading-relaxed"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-500 text-xs">
                <p>Browse full selection in this category</p>
                <Link
                  to="/shop"
                  search={{ category: activeCategory.slug }}
                  onClick={onClose}
                  className="mt-3 inline-block rounded bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                >
                  View {activeCategory.name}
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
