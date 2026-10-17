import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Field } from "./Field";
import { DemoNotice } from "./PageHeading";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  confirm: z.string(),
}).refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });

type Values = { email: string; password: string; name?: string; confirm?: string };

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(mode === "login" ? loginSchema : registerSchema) as never,
  });

  const fillAdmin = () => {
    setValue("email", "admin@gmail.com");
    setValue("password", "12345");
    toast.info("Admin credentials auto-filled!");
  };

  const onSubmit = async (data: Values) => {
    await new Promise((r) => setTimeout(r, 400));
    if (mode === "login" && data.email.toLowerCase().trim() === "admin@gmail.com" && data.password === "12345") {
      toast.success("Welcome Admin! Accessing Admin Portal...");
      navigate({ to: "/admin" });
      return;
    }

    if (mode === "login") {
      toast.success("Signed in successfully.");
      navigate({ to: "/account" });
    } else {
      toast.success("Account created successfully.");
      navigate({ to: "/account" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mx-auto max-w-md space-y-4 border border-border p-6 sm:p-8">
      <DemoNotice>
        {mode === "login" ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span>
              <strong>Admin Access:</strong> <code className="bg-muted px-1.5 py-0.5 rounded font-mono">admin@gmail.com</code> / <code className="bg-muted px-1.5 py-0.5 rounded font-mono">12345</code>
            </span>
            <button
              type="button"
              onClick={fillAdmin}
              className="text-primary hover:underline font-semibold text-xs whitespace-nowrap"
            >
              Auto-fill Admin
            </button>
          </div>
        ) : (
          "Accounts aren't active yet. Nothing you enter is stored."
        )}
      </DemoNotice>
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

