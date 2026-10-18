import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Tag, Zap } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { activePromos, promos } from "@/commerce";
import { useApp } from "@/auth";

export function Promotions() {
  const { coupons } = useApp();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const live = new Set(activePromos(now).map((p) => p.id));
  const midnight = new Date(now); midnight.setHours(24, 0, 0, 0);
  const s = Math.floor((midnight.getTime() - now.getTime()) / 1000);
  const left = `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <PageShell title="Promotions" lead="Recurring offers apply automatically at checkout. They stack with your member discount, capped at 40% in total.">
      <div className="grid gap-4 md:grid-cols-2">
        {promos.map((p) => (
          <div key={p.id} className="rounded-3xl bg-white p-6 ring-1 ring-sand">
            <div className="flex items-center justify-between"><p className="flex items-center gap-2 font-semibold"><Zap size={16} className={live.has(p.id) ? "text-mint" : "text-ink/30"} />{p.name}</p><span className={live.has(p.id) ? "rounded-full bg-mint/15 px-3 py-1 text-xs text-mint" : "rounded-full bg-sand px-3 py-1 text-xs text-ink/50"}>{live.has(p.id) ? `Live, ends in ${left}` : "Not today"}</span></div>
            <p className="font-display mt-3 text-4xl text-gold">{p.percent}% off</p>
            <p className="mt-1 text-sm text-ink/60">{p.scope === "all" ? "Everything" : p.scope}</p>
            <p className="mt-3 flex items-center gap-2 text-xs text-ink/50"><CalendarClock size={13} /> {p.schedule}</p>
          </div>
        ))}
      </div>
      <h2 className="font-display mb-4 mt-12 text-3xl">Coupon codes</h2>
      <div className="flex flex-wrap gap-3">{coupons.filter((c) => c.on && c.code !== "VIP30").map((c) => <span key={c.code} className="flex items-center gap-2 rounded-full border border-dashed border-gold px-5 py-2 text-sm"><Tag size={14} className="text-gold" /><b className="font-mono">{c.code}</b> {c.off}% off</span>)}</div>
      <p className="mt-6 text-sm text-ink/60">Subscribers get an extra discount on every order. <Link to="/membership" className="text-gold">See membership plans</Link></p>
    </PageShell>
  );
}
