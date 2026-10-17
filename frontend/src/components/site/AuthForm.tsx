import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Field } from "./Field";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
  confirm: z.string(),
}).refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });

type Values = { email: string; password: string; name?: string; confirm?: string };

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const { login, register: registerUser } = useAuth();
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(mode === "login" ? loginSchema : registerSchema) as never,
  });

  const fillAdmin = () => {
    setValue("email", "admin@gmail.com");
    setValue("password", "12345");
    toast.info("Admin credentials auto-filled!");
  };

  const onSubmit = async (data: Values) => {
    if (mode === "login") {
      const ok = await login({ email: data.email, password: data.password });
      if (ok) {
        if (data.email.toLowerCase().trim() === "admin@gmail.com") {
          navigate({ to: "/admin" });
        } else {
          navigate({ to: "/account" });
        }
      }
    } else {
      const ok = await registerUser({
        name: data.name || "",
        email: data.email,
        password: data.password,
      });
      if (ok) {
        navigate({ to: "/account" });
      }
    }
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mx-auto max-w-md space-y-4 border border-border p-6 sm:p-8">
      <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded text-xs text-amber-200">
        {mode === "login" ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span>
              <strong>Admin Access:</strong> <code className="bg-black/40 px-1.5 py-0.5 rounded font-mono">admin@gmail.com</code> / <code className="bg-black/40 px-1.5 py-0.5 rounded font-mono">12345</code>
            </span>
            <button
              type="button"
              onClick={fillAdmin}
              className="text-amber-400 hover:underline font-bold text-xs whitespace-nowrap"
            >
              Auto-fill Admin
            </button>
          </div>
        ) : (
          <span>✨ Create your account for fast checkout, saved orders, and direct support. Live Supabase Authentication.</span>
        )}
      </div>

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

