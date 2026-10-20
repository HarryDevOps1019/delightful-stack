import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/site/AuthForm";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account — Asia Electronics (Demo)" },
      { name: "description", content: "Demo customer registration." },
      { property: "og:title", content: "Create Account — Asia Electronics (Demo)" },
      { property: "og:description", content: "Demo customer registration." },
    ],
  }),
  component: () => <AuthForm mode="register" />,
});
