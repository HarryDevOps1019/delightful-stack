import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/site/AuthForm";
import { PageHeading } from "@/components/site/PageHeading";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Asia Electronics (Demo)" },
      { name: "description", content: "Demo customer sign-in." },
      { property: "og:title", content: "Sign In — Asia Electronics (Demo)" },
      { property: "og:description", content: "Demo customer sign-in." },
    ],
  }),
  component: () => (
    <>
      <PageHeading title="Sign In" />
      <div className="container-shop">
        <AuthForm mode="login" />
      </div>
    </>
  ),
});
