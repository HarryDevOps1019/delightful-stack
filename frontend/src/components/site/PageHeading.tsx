import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function PageHeading({
  title,
  crumb,
  children,
}: {
  title: string;
  crumb?: string;
  children?: ReactNode;
}) {
  return (
    <div className="container-shop pt-2 sm:pt-6 lg:pt-8 pb-4 sm:pb-6">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>{" "}
        <span aria-hidden>/</span> <span>{crumb ?? title}</span>
      </nav>
      <h1 className="mt-2 font-display text-2xl font-extrabold uppercase sm:text-3xl">{title}</h1>
      {children}
    </div>
  );
}

export function DemoNotice({ children }: { children: ReactNode }) {
  return (
    <div role="note" className="border-l-4 border-primary bg-tile px-4 py-3 text-sm">
      <strong className="font-bold">Demo only. </strong>
      {children}
    </div>
  );
}
