import { useEffect, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Common { label: string; error?: string; hint?: ReactNode; optional?: boolean; className?: string }

const control = "mt-2 w-full rounded-2xl border bg-white px-4 text-sm outline-none transition-colors focus:border-gold";
const describe = (id: string, error?: string, hint?: ReactNode) => [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;

function Shell({ id, label, error, hint, optional, required, className, children }: Common & { id: string; required?: boolean; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span aria-hidden="true"> *</span>}
        {optional && <span className="font-normal text-ink/70"> (optional)</span>}
      </label>
      {children}
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs text-ink/70">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-oxblood">{error}</p>}
    </div>
  );
}

export function Field({ label, error, hint, optional, className, ...rest }: Common & Omit<InputHTMLAttributes<HTMLInputElement>, "className">) {
  const id = useId();
  return (
    <Shell id={id} label={label} error={error} hint={hint} optional={optional} required={rest.required} className={className}>
      <input id={id} aria-invalid={error ? true : undefined} aria-describedby={describe(id, error, hint)} {...rest} className={cn(control, "h-12", error ? "border-oxblood" : "border-sand")} />
    </Shell>
  );
}

export function TextArea({ label, error, hint, optional, className, ...rest }: Common & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className">) {
  const id = useId();
  return (
    <Shell id={id} label={label} error={error} hint={hint} optional={optional} required={rest.required} className={className}>
      <textarea id={id} aria-invalid={error ? true : undefined} aria-describedby={describe(id, error, hint)} {...rest} className={cn(control, "py-3", error ? "border-oxblood" : "border-sand")} />
    </Shell>
  );
}

// Moves keyboard focus to the first invalid field after a failed submit.
export function useFocusFirstError(errors: Record<string, string>) {
  useEffect(() => {
    if (Object.keys(errors).length) document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [errors]);
}
