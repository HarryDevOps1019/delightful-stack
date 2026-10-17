import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string | undefined };

export const Field = forwardRef<HTMLInputElement, Props>(function Field({ label, error, className, ...rest }, ref) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold uppercase tracking-wider">{label}</label>
      <input
        id={id}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={cn("h-11 w-full border bg-background px-3 text-sm outline-none focus:border-primary", error ? "border-destructive" : "border-input")}
        {...rest}
      />
      {error && <p id={`${id}-err`} role="alert" className="mt-1 text-xs font-semibold text-destructive">{error}</p>}
    </div>
  );
});
