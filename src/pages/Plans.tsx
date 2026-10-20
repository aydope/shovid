import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Crown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { planList, plans, type Cycle, type PlanId } from "@/commerce";
import { useApp } from "@/auth";
import { useToast } from "@/toast";
import { cn } from "@/lib/utils";

const rows: Array<[string, (id: PlanId) => string | boolean]> = [
  ["Member discount", (id) => `${plans[id].discount}%`], ["Points per $1", (id) => `${plans[id].points}x`],
  ["Free shipping from", (id) => (plans[id].freeShipAt ? `$${plans[id].freeShipAt}` : "Always")], ["Free repairs", (id) => (plans[id].alterations > 50 ? "Unlimited" : String(plans[id].alterations))],
  ["Support", (id) => plans[id].support], ["Early access to sales", (id) => plans[id].early], ["Private styling session", (id) => plans[id].styling],
];

export function Plans() {
  const { user, sub, subscribe } = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const [cycle, setCycle] = useState<Cycle>("month");
  const current = sub?.plan ?? "silver";

  const choose = (id: PlanId) => {
    if (!user) { toast("Sign in to choose a plan", "info"); navigate("/login?next=/membership"); return; }
    if (user.role === "admin") { toast("Admin accounts cannot subscribe", "info"); return; }
    subscribe(id, cycle);
    toast(`You are now on ${plans[id].name}`);
    navigate("/account/subscription");
  };

  return (
    <PageShell title="Shovid Membership" lead="Pick a plan and its benefits switch on immediately: discounts, shipping, points and services.">
      <div className="mb-8 inline-flex rounded-full bg-sand/70 p-1">{(["month", "year"] as const).map((c) => <button key={c} onClick={() => setCycle(c)} className={cn("cursor-pointer rounded-full px-5 py-2 text-sm", cycle === c ? "bg-ink text-white" : "")}>{c === "month" ? "Monthly" : "Yearly, 2 months free"}</button>)}</div>
      <div className="grid gap-4 md:grid-cols-3">
        {planList.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={cn("flex flex-col rounded-3xl p-8", p.id === "silver" ? "bg-white ring-1 ring-sand" : `bg-gradient-to-br ${p.color} text-white`)}>
            <p className="flex items-center gap-2 text-sm font-semibold">{p.id !== "silver" && <Crown size={15} />}{p.name}{current === p.id && <span className="rounded-full bg-white/25 px-2 py-0.5 text-[11px]">Current</span>}</p>
            <p className="font-display mt-3 text-5xl">{p.price[cycle] ? `$${p.price[cycle]}` : "Free"}<span className="text-base font-normal opacity-70">{p.price[cycle] ? `/${cycle}` : ""}</span></p>
            <ul className="mt-6 flex-1 space-y-2 text-sm">{p.perks.map((x) => <li key={x} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0" />{x}</li>)}</ul>
            <Button className={cn("mt-8", p.id !== "silver" && "bg-white !text-ink hover:bg-white/90")} disabled={current === p.id} onClick={() => choose(p.id)}>{current === p.id ? "Your plan" : `Choose ${p.name}`}</Button>
          </motion.div>
        ))}
      </div>
      <div className="mt-12 overflow-x-auto rounded-3xl bg-white ring-1 ring-sand">
        <table className="w-full min-w-[520px] text-left text-sm"><thead><tr className="text-xs text-ink/50"><th className="p-4">Compare</th>{planList.map((p) => <th key={p.id} className="p-4">{p.name}</th>)}</tr></thead>
          <tbody>{rows.map(([label, get]) => <tr key={label} className="border-t border-sand"><td className="p-4 font-medium">{label}</td>{planList.map((p) => { const v = get(p.id); return <td key={p.id} className="p-4">{typeof v === "boolean" ? (v ? <Check size={16} className="text-mint" /> : <Minus size={16} className="text-ink/30" />) : v}</td>; })}</tr>)}</tbody></table>
      </div>
      <p className="mt-4 text-xs text-ink/50">Demo billing: no payment is taken. Your plan is saved in this browser.</p>
    </PageShell>
  );
}
