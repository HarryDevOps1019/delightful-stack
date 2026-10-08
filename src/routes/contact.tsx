import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { DemoNotice, PageHeading } from "@/components/site/PageHeading";
import { Field } from "@/components/site/Field";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email"),
  message: z.string().trim().min(10, "At least 10 characters").max(1000),
});
type V = z.infer<typeof schema>;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Asia Electronics (Demo)" },
      { name: "description", content: "Get in touch with Asia Electronics and Cellular. Contact details awaiting confirmation." },
      { property: "og:title", content: "Contact — Asia Electronics (Demo)" },
      { property: "og:description", content: "Get in touch with Asia Electronics and Cellular." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<V>({ resolver: zodResolver(schema) });
  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 500));
    reset();
    toast.success("Thanks! (Demo — your message was not sent.)");
  };
  return (
    <>
      <PageHeading title="Contact Us" />
      <div className="container-shop grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <DemoNotice>Phone, email, address and opening hours are awaiting client confirmation.</DemoNotice>
          <dl className="divide-y divide-border border border-border text-sm">
            {[["Phone", "To be confirmed"], ["Email", "To be confirmed"], ["Address", "Sri Lanka — to be confirmed"], ["Hours", "To be confirmed"]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-3"><dt className="font-bold">{k}</dt><dd className="text-muted-foreground">{v}</dd></div>
            ))}
          </dl>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field label="Name" error={errors.name?.message} {...register("name")} autoComplete="name" />
          <Field label="Email" type="email" error={errors.email?.message} {...register("email")} autoComplete="email" />
          <div>
            <label htmlFor="msg" className="mb-1.5 block text-xs font-bold uppercase tracking-wider">Message</label>
            <textarea id="msg" rows={5} {...register("message")} aria-invalid={!!errors.message} className={`w-full border bg-background p-3 text-sm outline-none focus:border-primary ${errors.message ? "border-destructive" : "border-input"}`} />
            {errors.message && <p role="alert" className="mt-1 text-xs font-semibold text-destructive">{errors.message.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="h-12 rounded-none px-10 font-bold uppercase">{isSubmitting ? "Sending…" : "Send message"}</Button>
        </form>
      </div>
    </>
  );
}
