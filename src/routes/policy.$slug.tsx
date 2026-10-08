import { createFileRoute, notFound } from "@tanstack/react-router";
import { DemoNotice, PageHeading } from "@/components/site/PageHeading";

const POLICIES: Record<string, string> = {
  delivery: "Delivery Information",
  returns: "Returns & Refunds",
  warranty: "Warranty",
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
};

export const Route = createFileRoute("/policy/$slug")({
  loader: ({ params }) => {
    const title = POLICIES[params.slug];
    if (!title) throw notFound();
    return { title };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Asia Electronics (Demo)` },
          { name: "description", content: `${loaderData.title} for Asia Electronics — awaiting client content.` },
          { property: "og:title", content: `${loaderData.title} — Asia Electronics` },
          { property: "og:description", content: "Policy page awaiting client content." },
        ]
      : [{ title: "Page not found" }, { name: "robots", content: "noindex" }],
  }),
  component: Policy,
});

function Policy() {
  const { title } = Route.useLoaderData();
  return (
    <>
      <PageHeading title={title} />
      <div className="container-shop max-w-3xl space-y-4 text-sm">
        <DemoNotice>This policy is awaiting client content. Nothing here is a binding term.</DemoNotice>
        <p className="text-muted-foreground">The final {title.toLowerCase()} text will be supplied by Asia Electronics and Cellular Pvt Ltd before launch.</p>
      </div>
    </>
  );
}
