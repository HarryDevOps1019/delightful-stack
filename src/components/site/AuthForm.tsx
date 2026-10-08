import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Field } from "./Field";
import { DemoNotice } from "./PageHeading";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, "Enter your name").max(80),
  confirm: z.string(),
}).refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });

type Values = { email: string; password: string; name?: string; confirm?: string };

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(mode === "login" ? loginSchema : registerSchema) as never,
  });
  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 500)); // future: Supabase auth
    reset();
    toast.info(mode === "login" ? "Demo only — sign-in isn't connected yet." : "Demo only — no account was created.");
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mx-auto max-w-md space-y-4 border border-border p-6 sm:p-8">
      <DemoNotice>Accounts aren't active yet. Nothing you enter is stored.</DemoNotice>
      {mode === "register" && <Field label="Full name" error={errors.name?.message} {...register("name")} autoComplete="name" />}
      <Field label="Email" type="email" error={errors.email?.message} {...register("email")} autoComplete="email" />
      <Field label="Password" type="password" error={errors.password?.message} {...register("password")} autoComplete={mode === "login" ? "current-password" : "new-password"} />
      {mode === "register" && <Field label="Confirm password" type="password" error={errors.confirm?.message} {...register("confirm")} autoComplete="new-password" />}
      <Button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-none font-bold uppercase">
        {isSubmitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>New here? <Link to="/register" className="font-bold text-primary hover:underline">Create an account</Link></>
        ) : (
          <>Already registered? <Link to="/login" className="font-bold text-primary hover:underline">Sign in</Link></>
        )}
      </p>
      <p className="text-center text-xs"><Link to="/account" className="text-muted-foreground hover:text-primary">Preview sample account page →</Link></p>
    </form>
  );
}
