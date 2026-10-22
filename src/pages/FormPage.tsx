import { useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, TextArea, useFocusFirstError } from "@/components/Field";
import { PageShell } from "@/components/PageShell";

interface FieldDef { name: string; label: string; type?: string; textarea?: boolean }
interface Props { title: string; lead: string; fields: FieldDef[]; cta: string; success: string; intro?: ReactNode; footer?: ReactNode }

export function FormPage({ title, lead, fields, cta, success, intro, footer }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  useFocusFirstError(errors);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    for (const f of fields) {
      const v = (values[f.name] ?? "").trim();
      if (!v) next[f.name] = `Enter ${f.label.toLowerCase()}`;
      else if (f.type === "email" && !/^\S+@\S+\.\S+$/.test(v)) next[f.name] = "Enter an email like name@example.com";
      else if (f.type === "password" && v.length < 8) next[f.name] = "Use at least 8 characters";
    }
    setErrors(next);
    setDone(Object.keys(next).length === 0);
  };

  return (
    <PageShell title={title} lead={lead}>
      {intro}
      {done ? (
        <p role="status" className="flex items-center gap-3 text-lg"><CheckCircle2 className="text-mint-ink" /> {success}</p>
      ) : (
        <form onSubmit={submit} noValidate className="max-w-xl space-y-6">
          <p className="text-sm text-ink/70">Fields marked * are required.</p>
          {fields.map((f) => {
            const common = { label: f.label, required: true, value: values[f.name] ?? "", error: errors[f.name], onChange: (e: { target: { value: string } }) => setValues((s) => ({ ...s, [f.name]: e.target.value })) };
            return f.textarea ? <TextArea key={f.name} rows={4} {...common} /> : <Field key={f.name} type={f.type ?? "text"} {...common} />;
          })}
          <Button type="submit">{cta}</Button>
          {footer}
        </form>
      )}
    </PageShell>
  );
}
