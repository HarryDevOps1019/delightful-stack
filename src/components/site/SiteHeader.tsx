import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Menu, Phone, Search, ShoppingCart, Truck, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { categories } from "@/data/catalog";
import { useCart } from "@/context/cart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { to: "/shop", label: "All Products" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex shrink-0 flex-col leading-none" aria-label="Asia Electronics home">
      <span className="font-display text-xl font-black tracking-tight sm:text-2xl">
        ASIA<span className="text-primary">ELECTRONICS</span>
      </span>
      <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.28em] text-muted-foreground">& Cellular Pvt Ltd</span>
    </Link>
  );
}

function SearchForm({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/shop", search: { q: q.trim() || undefined } });
  };
  return (
    <form onSubmit={submit} role="search" className={`flex h-11 border border-input ${className}`}>
      <label htmlFor="site-search" className="sr-only">Search products</label>
      <input
        id="site-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products, brands, models or part numbers"
        className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
      />
      <button type="submit" aria-label="Search" className="grid w-12 place-items-center text-muted-foreground hover:text-primary">
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}

export function SiteHeader() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header>
      <div className="border-b border-border text-xs">
        <div className="container-shop flex h-9 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4 text-muted-foreground">
            <Link to="/policy/$slug" params={{ slug: "delivery" }} className="flex items-center gap-1.5 hover:text-primary">
              <Truck className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">Island-wide delivery</span>
            </Link>
            <Link to="/policy/$slug" params={{ slug: "warranty" }} className="hidden hover:text-primary sm:inline">Warranty</Link>
            <Link to="/policy/$slug" params={{ slug: "returns" }} className="hidden hover:text-primary sm:inline">Returns</Link>
          </div>
          <Link to="/contact" className="flex shrink-0 items-center gap-1.5 font-semibold hover:text-primary">
            <Phone className="h-3.5 w-3.5" /> Contact us
          </Link>
        </div>
      </div>

      <div className="container-shop flex items-center gap-4 py-4 sm:gap-8 sm:py-5">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="grid h-10 w-10 place-items-center lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-left font-display">Menu</SheetTitle>
            </SheetHeader>
            <nav className="mt-4 flex flex-col px-4" onClick={() => setOpen(false)}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">Shop Categories</p>
              {categories.map((c) => (
                <Link key={c.slug} to="/shop" search={{ category: c.slug }} className="border-b border-border py-3 text-sm font-semibold">
                  {c.name}
                </Link>
              ))}
              <div className="mt-4" />
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} className="border-b border-border py-3 text-sm font-semibold">{l.label}</Link>
              ))}
              <Link to="/account" className="border-b border-border py-3 text-sm font-semibold">My Account</Link>
            </nav>
          </SheetContent>
        </Sheet>
        <Logo />
        <SearchForm className="hidden flex-1 lg:flex" />
        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <Link to="/account" aria-label="My account" className="grid h-10 w-10 place-items-center hover:text-primary">
            <User className="h-5 w-5" />
          </Link>
          <Link to="/cart" aria-label={`Cart, ${count} items`} className="relative grid h-10 w-10 place-items-center hover:text-primary">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
      <div className="container-shop pb-4 lg:hidden">
        <SearchForm className="flex" />
      </div>

      <nav className="hidden bg-ink text-ink-foreground lg:block" aria-label="Main">
        <div className="container-shop flex h-14 items-stretch">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-64 items-center justify-between bg-primary px-6 text-xs font-bold uppercase tracking-wider text-primary-foreground outline-none">
              Shop Categories <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 rounded-none p-0">
              {categories.map((c) => (
                <DropdownMenuItem key={c.slug} asChild className="rounded-none px-4 py-3 text-sm font-semibold">
                  <Link to="/shop" search={{ category: c.slug }}>{c.name}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="m-0" />
              <DropdownMenuItem asChild className="rounded-none px-4 py-3 text-sm font-bold text-primary">
                <Link to="/shop">View all products</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex items-center px-6 text-xs font-bold uppercase tracking-wider hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/shop" search={{ sort: "newest" }} className="flex items-center px-6 text-xs font-bold uppercase tracking-wider hover:text-primary">
            New Arrivals
          </Link>
        </div>
      </nav>
    </header>
  );
}
