import { useState, type FormEvent } from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { useApp, type StoredOrder } from "@/auth";
import { cn, fmtDate, money2 } from "@/lib/utils";

const steps = ["Processing", "Shipped", "Delivered"] as const;
const field = "mt-2 h-12 w-full rounded-2xl border border-sand bg-white px-4 text-sm outline-none focus:border-gold";

export function Track() {
  const { orders } = useApp();
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [found, setFound] = useState<StoredOrder | null | undefined>();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const key = email.trim().toLowerCase();
    const digits = key.replace(/\D/g, "");
    setFound(orders.find((o) => o.id.toLowerCase() === id.trim().toLowerCase() && (o.email === key || (digits.length >= 7 && (o.phone ?? "").replace(/\D/g, "") === digits))) ?? null);
  };
  const at = found ? Math.max(0, steps.indexOf(found.status as (typeof steps)[number])) : 0;

  return (
    <PageShell title="Track your order" lead="Enter your order number and the email or phone used at checkout.">
      <form onSubmit={submit} className="grid max-w-xl gap-4">
        <label className="text-sm font-medium">Order number<input value={id} onChange={(e) => setId(e.target.value)} placeholder="SH-10482" className={field} /></label>
        <label className="text-sm font-medium">Email or phone used at checkout<input value={email} onChange={(e) => setEmail(e.target.value)} className={field} /></label>
        <Button type="submit" className="w-fit">Track order</Button>
      </form>
      {found === null && <p role="alert" className="mt-8 text-oxblood">No order matches those details.</p>}
      {found && (
        <div className="mt-10 max-w-xl rounded-3xl bg-white p-6 ring-1 ring-sand">
          <p className="flex items-center gap-2 font-semibold"><Package size={18} className="text-gold" /> {found.id}, {fmtDate(found.date)}</p>
          {found.status === "Refunded" ? <p className="mt-4 text-sm text-oxblood">This order was refunded.</p> : <ol className="mt-5 grid grid-cols-3 gap-2">{steps.map((s, i) => <li key={s} className="text-xs"><div className={cn("h-1.5 rounded-full", i <= at ? "bg-mint" : "bg-sand")} /><p className={cn("mt-2", i <= at ? "font-medium" : "text-ink/40")}>{s}</p></li>)}</ol>}
          <ul className="mt-5 space-y-1 text-sm text-ink/70">{found.items.map((x) => <li key={x}>{x}</li>)}</ul>
          <p className="mt-4 font-semibold">Total {money2(found.total)}</p>
        </div>
      )}
    </PageShell>
  );
}
