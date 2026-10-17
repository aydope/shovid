import { useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";

interface FieldDef { name: string; label: string; type?: string; textarea?: boolean }
interface Props { title: string; lead: string; fields: FieldDef[]; cta: string; success: string; intro?: ReactNode; footer?: ReactNode }

export function FormPage({ title, lead, fields, cta, success, intro, footer }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    for (const f of fields) {
      const v = String(data.get(f.name) ?? "").trim();
      if (!v) next[f.name] = "Required";
      else if (f.type === "email" && !/^\S+@\S+\.\S+$/.test(v)) next[f.name] = "Enter a valid email";
      else if (f.type === "password" && v.length < 8) next[f.name] = "Use at least 8 characters";
    }
    setErrors(next);
    setDone(Object.keys(next).length === 0);
  };

  return (
    <PageShell title={title} lead={lead}>
      {intro}
      {done ? (
        <p className="flex items-center gap-3 text-lg"><CheckCircle2 className="text-gold" /> {success}</p>
      ) : (
        <form onSubmit={submit} noValidate className="max-w-xl space-y-6">
          {fields.map((f) => (
            <label key={f.name} className="block text-xs uppercase tracking-widest">
              {f.label}
              {f.textarea
                ? <textarea name={f.name} rows={4} className="mt-2 w-full border border-ink bg-transparent p-3 text-sm normal-case tracking-normal outline-none focus:border-gold" />
                : <input name={f.name} type={f.type ?? "text"} className="mt-2 w-full border-b border-ink bg-transparent py-2 text-sm normal-case tracking-normal outline-none focus:border-gold" />}
              {errors[f.name] && <span className="text-oxblood">{errors[f.name]}</span>}
            </label>
          ))}
          <Button type="submit">{cta}</Button>
          {footer}
        </form>
      )}
    </PageShell>
  );
}
