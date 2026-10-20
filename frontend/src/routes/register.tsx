import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/site/AuthForm";
import { PageHeading } from "@/components/site/PageHeading";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account — Asia Electronics (Demo)" },
      { name: "description", content: "Demo customer registration." },
      { property: "og:title", content: "Create Account — Asia Electronics (Demo)" },
      { property: "og:description", content: "Demo customer registration." },
    ],
  }),
  component: () => (
    <>
      <PageHeading title="Create Account" />
      <div className="container-shop">
        <AuthForm mode="register" />
      </div>
    </>
  ),
});
