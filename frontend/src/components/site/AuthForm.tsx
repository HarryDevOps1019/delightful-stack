import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, BadgeCheck, Headphones, LockKeyhole, Truck } from "lucide-react";
import { Field } from "./Field";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name").max(80),
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().min(6, "At least 6 characters"),
    confirm: z.string(),
  })
  .refine((value) => value.password === value.confirm, {
    path: ["confirm"],
    message: "Passwords don't match",
  });

type Values = { email: string; password: string; name?: string; confirm?: string };

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const { login, register: registerUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(mode === "login" ? loginSchema : registerSchema) as never,
  });

  const onSubmit = async (data: Values) => {
    if (mode === "login") {
      const signedIn = await login({ email: data.email, password: data.password });
      if (signedIn) {
        navigate({ to: signedIn.role === "admin" ? "/admin" : "/account" });
      }
      return;
    }

    const created = await registerUser({
      name: data.name || "",
      email: data.email,
      password: data.password,
    });
    if (created) navigate({ to: "/account" });
  };

  const isLogin = mode === "login";

  return (
    <main className="relative isolate min-h-[calc(100vh-7rem)] overflow-hidden bg-[#07111f] px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(240,0,63,0.26),transparent_27%),radial-gradient(circle_at_84%_76%,rgba(24,104,173,0.28),transparent_30%),linear-gradient(135deg,#07111f_0%,#0d1b2d_54%,#070b13_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="mx-auto grid min-h-[620px] max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-sm lg:grid-cols-[1.12fr_.88fr]">
        <section className="relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-[0.16em] text-white/90">
              <LockKeyhole className="h-3.5 w-3.5 text-primary" />
              SECURE CUSTOMER PORTAL
            </div>
            <h1 className="mt-8 max-w-xl text-4xl font-black leading-[1.07] tracking-tight xl:text-5xl">
              {isLogin
                ? "Welcome back to better electronics."
                : "Create your account. Shop with confidence."}
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
              {isLogin
                ? "Manage enquiries and keep your product journey in one secure place."
                : "Save time on future enquiries and receive support from our electronics specialists."}
            </p>
          </div>

          <div className="grid gap-3">
            <Feature
              icon={<BadgeCheck className="h-5 w-5" />}
              title="Genuine electronics"
              description="Quality products and trusted support"
            />
            <Feature
              icon={<Truck className="h-5 w-5" />}
              title="Islandwide service"
              description="Fast responses for every enquiry"
            />
            <Feature
              icon={<Headphones className="h-5 w-5" />}
              title="Expert help"
              description="Parts guidance when you need it"
            />
          </div>
        </section>

        <section className="flex items-center bg-white p-6 sm:p-10 lg:p-12">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full space-y-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
                Asia Electronics & Cellular
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground">
                {isLogin ? "Sign in to your account" : "Create an account"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {isLogin
                  ? "Enter your details to continue."
                  : "It takes less than a minute to get started."}
              </p>
            </div>

            {!isLogin && (
              <Field
                label="Full name"
                error={errors.name?.message}
                {...register("name")}
                autoComplete="name"
              />
            )}
            <Field
              label="Email address"
              type="email"
              error={errors.email?.message}
              {...register("email")}
              autoComplete="email"
            />
            <Field
              label="Password"
              type="password"
              error={errors.password?.message}
              {...register("password")}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            {!isLogin && (
              <Field
                label="Confirm password"
                type="password"
                error={errors.confirm?.message}
                {...register("confirm")}
                autoComplete="new-password"
              />
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-lg font-extrabold"
            >
              {isSubmitting ? "Please wait..." : isLogin ? "Sign in securely" : "Create my account"}
              {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? (
                <>
                  New here?{" "}
                  <Link to="/register" className="font-bold text-primary hover:underline">
                    Create an account
                  </Link>
                </>
              ) : (
                <>
                  Already registered?{" "}
                  <Link to="/login" className="font-bold text-primary hover:underline">
                    Sign in
                  </Link>
                </>
              )}
            </p>
            <div className="flex items-center justify-center gap-2 border-t border-border pt-5 text-xs text-muted-foreground">
              <LockKeyhole className="h-3.5 w-3.5 text-primary" />
              Your details are protected securely.
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <span className="shrink-0 text-primary">{icon}</span>
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-0.5 text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
}
