import { Link } from "@tanstack/react-router";
import { categories as defaultCategories } from "@/data/catalog";
import { Logo } from "./SiteHeader";

const policies = [
  { slug: "delivery", label: "Delivery information" },
  { slug: "returns", label: "Returns & refunds" },
  { slug: "warranty", label: "Warranty" },
  { slug: "privacy", label: "Privacy policy" },
  { slug: "terms", label: "Terms & conditions" },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="container-shop grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground">
            Demo storefront. Phone, address and opening hours are awaiting client confirmation.
          </p>
          <Link to="/contact" className="mt-3 inline-block text-sm font-bold text-primary hover:underline">
            Contact page →
          </Link>
        </div>
        <FooterCol title="Categories">
          {defaultCategories.map((c) => (
            <Link key={c.slug} to="/shop" search={{ category: c.slug }} className="hover:text-primary">{c.short}</Link>
          ))}
        </FooterCol>
        <FooterCol title="Customer service">
          <Link to="/account" className="hover:text-primary">My account</Link>
          <Link to="/cart" className="hover:text-primary">Cart</Link>
          <Link to="/contact" className="hover:text-primary">Contact us</Link>
          <Link to="/about" className="hover:text-primary">About us</Link>
        </FooterCol>
        <FooterCol title="Policies">
          {policies.map((p) => (
            <Link key={p.slug} to="/policy/$slug" params={{ slug: p.slug }} className="hover:text-primary">{p.label}</Link>
          ))}
        </FooterCol>
      </div>
      <div className="border-t border-border">
        <div className="container-shop flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© 2026 Asia Electronics and Cellular Pvt Ltd — demo build</p>
          <p>Sample products, prices and stock are illustrative only.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-extrabold uppercase tracking-wider">{title}</h3>
      <div className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
