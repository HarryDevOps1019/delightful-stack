import { Link } from "@tanstack/react-router";
import { Logo } from "./SiteHeader";
import { useSettings } from "@/context/settings";

const policies = [
  { slug: "delivery", label: "Delivery information" },
  { slug: "returns", label: "Returns & refunds" },
  { slug: "warranty", label: "Warranty" },
  { slug: "privacy", label: "Privacy policy" },
  { slug: "terms", label: "Terms & conditions" },
];

export function SiteFooter() {
  const { settings, whatsappDigits } = useSettings();

  return (
    <footer className="mt-12 border-t border-border sm:mt-16">
      <div className="container-shop grid gap-7 py-8 sm:grid-cols-2 sm:gap-8 sm:py-10 lg:grid-cols-4">
        <div>
          <Logo />
          <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
            <p>
              Email:{" "}
              <a
                href={`mailto:${settings.officeEmail}`}
                className="text-foreground hover:text-primary font-medium"
              >
                {settings.officeEmail}
              </a>
            </p>
            <p>
              WhatsApp:{" "}
              <a
                href={`https://wa.me/${whatsappDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] hover:underline font-mono font-medium"
              >
                {settings.whatsappNumber}
              </a>
            </p>
          </div>
          <Link
            to="/contact"
            className="mt-3 inline-block text-sm font-bold text-primary hover:underline"
          >
            Contact page →
          </Link>
        </div>
        <FooterCol title="Customer service">
          <Link to="/account" className="hover:text-primary">
            My account
          </Link>
          <Link to="/cart" className="hover:text-primary">
            Cart
          </Link>
          <Link to="/contact" className="hover:text-primary">
            Contact us
          </Link>
          <Link to="/about" className="hover:text-primary">
            About us
          </Link>
          <Link to="/wholesale" className="hover:text-primary">
            Wholesale & bulk orders
          </Link>
        </FooterCol>
        <FooterCol title="Policies">
          {policies.map((p) => (
            <Link
              key={p.slug}
              to="/policy/$slug"
              params={{ slug: p.slug }}
              className="hover:text-primary"
            >
              {p.label}
            </Link>
          ))}
        </FooterCol>
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider">Store location</h3>
          <div className="relative mt-3 h-28 overflow-hidden border border-border bg-tile transition-colors hover:border-primary">
            <iframe
              src="https://www.google.com/maps?q=29%2C+2nd+Rohini+Lane%2C+Colombo+01100%2C+Sri+Lanka&output=embed"
              title="Asia Electronics store location"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="pointer-events-none h-full w-full border-0"
            />
            <a
              href="https://www.google.com/maps/search/?api=1&query=29%2C+2nd+Rohini+Lane%2C+Colombo+01100%2C+Sri+Lanka"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0"
              aria-label="Open Asia Electronics store location in Google Maps"
            />
          </div>
          <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground">
            29, 2nd Rohini Lane, Colombo 01100
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-shop py-3.5 text-center text-[11px] text-muted-foreground">
          <p>© 2026 Asia Electronics and Cellular Pvt Ltd</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-extrabold uppercase tracking-wider">{title}</h3>
      <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
