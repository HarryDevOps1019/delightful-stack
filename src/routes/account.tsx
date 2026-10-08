import { createFileRoute, Link } from "@tanstack/react-router";
import { sampleOrders } from "@/data/catalog";
import { formatLKR } from "@/lib/format";
import { DemoNotice, PageHeading } from "@/components/site/PageHeading";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Asia Electronics (Demo)" },
      { name: "description", content: "Sample customer account and order history." },
      { property: "og:title", content: "My Account — Asia Electronics (Demo)" },
      { property: "og:description", content: "Sample customer account and order history." },
    ],
  }),
  component: Account,
});

function Account() {
  return (
    <>
      <PageHeading title="My Account" />
      <div className="container-shop space-y-8">
        <DemoNotice>This is a sample account with example orders. <Link to="/login" className="font-bold text-primary hover:underline">Sign-in</Link> is not connected yet.</DemoNotice>
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="h-fit border border-border bg-tile p-6">
            <p className="font-display font-extrabold">Sample Customer</p>
            <p className="text-sm text-muted-foreground">customer@example.lk</p>
            <Button asChild variant="outline" className="mt-5 w-full rounded-none"><Link to="/login">Sign in (demo)</Link></Button>
          </div>
          <div className="min-w-0">
            <h2 className="section-title">Order history</h2>
            <div className="mt-4 overflow-x-auto border border-border">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="bg-tile text-left text-xs uppercase"><tr>{["Order", "Date", "Items", "Status", "Total"].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-border">
                  {sampleOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="px-4 py-3 font-semibold">{o.id}</td>
                      <td className="px-4 py-3">{o.date}</td>
                      <td className="px-4 py-3">{o.items}</td>
                      <td className="px-4 py-3"><span className={o.status === "Delivered" ? "text-success" : "text-warning"}>{o.status}</span></td>
                      <td className="px-4 py-3 font-bold">{formatLKR(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
