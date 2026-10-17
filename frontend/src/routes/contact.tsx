import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PageHeading } from "@/components/site/PageHeading";
import { Field } from "@/components/site/Field";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/context/settings";
import { Mail, Phone, MessageSquare, MapPin } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email"),
  message: z.string().trim().min(10, "At least 10 characters").max(1000),
});
type V = z.infer<typeof schema>;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Asia Electronics & Cellular" },
      { name: "description", content: "Get in touch with Asia Electronics and Cellular via official WhatsApp or email." },
      { property: "og:title", content: "Contact Us — Asia Electronics & Cellular" },
      { property: "og:description", content: "Get in touch with Asia Electronics and Cellular." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { settings, whatsappDigits } = useSettings();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<V>({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 500));
    reset();
    toast.success("Thank you! For quickest response, please chat with us on WhatsApp.");
  };

  return (
    <>
      <PageHeading title="Contact Us" />
      <div className="container-shop grid gap-10 lg:grid-cols-2 pb-16">
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Official AEC Business Inquiries
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Reach our customer service and parts specialists directly via official WhatsApp or office email.
            </p>

            <dl className="divide-y divide-border border border-border text-sm">
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="font-bold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#25D366]" />
                  Official WhatsApp
                </dt>
                <dd>
                  <a
                    href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent("Hello Asia Electronics, I would like to inquire about parts.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-primary font-bold hover:underline"
                  >
                    {settings.whatsappNumber}
                  </a>
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="font-bold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-orange-500" />
                  Office Email
                </dt>
                <dd>
                  <a
                    href={`mailto:${settings.officeEmail}`}
                    className="font-mono text-primary font-bold hover:underline"
                  >
                    {settings.officeEmail}
                  </a>
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="font-bold flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Voice Hotline
                </dt>
                <dd className="font-mono text-muted-foreground">
                  {settings.phone}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="font-bold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Location
                </dt>
                <dd className="text-muted-foreground">
                  {settings.address || "Sri Lanka"}
                </dd>
              </div>
            </dl>
          </div>
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
