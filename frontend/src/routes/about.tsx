import { createFileRoute, Link } from "@tanstack/react-router";
import { categories } from "@/data/catalog";
import { DemoNotice, PageHeading } from "@/components/site/PageHeading";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Asia Electronics & Cellular (Demo)" },
      { name: "description", content: "About Asia Electronics and Cellular Pvt Ltd, a Sri Lankan electronics store." },
      { property: "og:title", content: "About — Asia Electronics & Cellular" },
      { property: "og:description", content: "About Asia Electronics and Cellular Pvt Ltd." },
    ],
  }),
  component: () => (
    <>
      <PageHeading title="About Us" />
      <div className="container-shop max-w-3xl space-y-5 text-sm leading-relaxed">
        <DemoNotice>Company story, history and credentials are awaiting client content.</DemoNotice>
        <p className="text-base font-semibold">Asia Electronics and Cellular Pvt Ltd is a Sri Lankan electronics retailer.</p>
        <p className="text-muted-foreground">We plan to stock the following categories:</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {categories.map((c) => (
            <li key={c.slug}><Link to="/shop" search={{ category: c.slug }} className="block bg-tile px-4 py-3 font-bold hover:text-primary">{c.name}</Link></li>
          ))}
        </ul>
      </div>
    </>
  ),
});
