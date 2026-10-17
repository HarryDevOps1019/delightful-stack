import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { sampleOrders } from "@/data/catalog";
import { formatLKR } from "@/lib/format";
import { PageHeading } from "@/components/site/PageHeading";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { LogOut, ShieldCheck, User } from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Asia Electronics" },
      { name: "description", content: "Customer account, profile details, and order history." },
      { property: "og:title", content: "My Account — Asia Electronics" },
      { property: "og:description", content: "Customer account, profile details, and order history." },
    ],
  }),
  component: Account,
});

function Account() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <PageHeading title="My Account" />
      <div className="container-shop space-y-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* User Profile Card */}
          <div className="h-fit border border-border bg-tile p-6 rounded shadow-xs">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-display font-extrabold text-foreground leading-tight">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Account Type:</span>
                  <span className="font-semibold uppercase tracking-wider text-primary">
                    {user.role || "Customer"}
                  </span>
                </div>

                {isAdmin && (
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white rounded-none font-bold text-xs">
                    <Link to="/admin" className="flex items-center justify-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      Open Admin Portal
                    </Link>
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={async () => {
                    await logout();
                    navigate({ to: "/login" });
                  }}
                  className="w-full rounded-none text-xs font-semibold hover:text-destructive hover:border-destructive flex items-center justify-center gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-3 text-center">
                <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground mx-auto flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
                <p className="font-display font-bold">You are not signed in</p>
                <p className="text-xs text-muted-foreground">
                  Sign in or create an account to view your live orders and saved profile.
                </p>
                <div className="pt-2 space-y-2">
                  <Button asChild className="w-full rounded-none">
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full rounded-none">
                    <Link to="/register">Create Account</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order history */}
          <div className="min-w-0">
            <h2 className="section-title">Order History</h2>
            <div className="mt-4 overflow-x-auto border border-border">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="bg-tile text-left text-xs uppercase">
                  <tr>
                    {["Order", "Date", "Items", "Status", "Total"].map((h) => (
                      <th key={h} className="px-4 py-3 font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sampleOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="px-4 py-3 font-semibold">{o.id}</td>
                      <td className="px-4 py-3 text-muted-foreground">{o.date}</td>
                      <td className="px-4 py-3">{o.items}</td>
                      <td className="px-4 py-3">
                        <span className={o.status === "Delivered" ? "text-success font-semibold" : "text-warning font-semibold"}>
                          {o.status}
                        </span>
                      </td>
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

