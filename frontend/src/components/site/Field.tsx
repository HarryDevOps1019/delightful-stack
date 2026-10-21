import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string | undefined };

export const Field = forwardRef<HTMLInputElement, Props>(function Field(
  { label, error, className, ...rest },
  ref,
) {
  const id = useId();
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase tracking-wider">
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={cn(
          "h-12 w-full min-w-0 max-w-full border bg-background px-3.5 text-base outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm",
          error ? "border-destructive" : "border-input",
        )}
        {...rest}
      />
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1 text-xs font-semibold text-destructive">
          {error}
        </p>
      )}
    </div>
  );
});
