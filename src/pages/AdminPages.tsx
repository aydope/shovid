import { useState, type FormEvent, type ReactNode } from "react";
import { Switch } from "@mui/material";
import { ArrowDownRight, ArrowUpRight, Boxes, Check, DollarSign, Plus, Search, ShoppingCart, Trash2, Users, X } from "lucide-react";
import { useApp } from "@/auth";
import { categories, img, products as seed, reviewsFor, weeklyRevenue, type Category, type OrderStatus, type Product } from "@/data";
import { useToast } from "@/toast";
import { cn, money } from "@/lib/utils";

export const Panel = ({ title, children, className }: { title?: string; children: ReactNode; className?: string }) => (
  <div className={cn("rounded-3xl bg-white p-6 ring-1 ring-sand", className)}>{title && <h2 className="mb-4 text-lg font-semibold">{title}</h2>}{children}</div>
);
const Title = ({ children }: { children: ReactNode }) => <h1 className="font-display mb-6 text-4xl">{children}</h1>;
const field = "h-11 w-full rounded-2xl border border-sand bg-white px-4 text-sm outline-none focus:border-gold";
const statuses: OrderStatus[] = ["Processing", "Shipped", "Delivered", "Refunded"];
const tone: Record<OrderStatus, string> = { Processing: "bg-amber/15 text-amber", Shipped: "bg-sky/15 text-sky", Delivered: "bg-mint/15 text-mint", Refunded: "bg-oxblood/15 text-oxblood" };
const names = ["Amara Voss", "Luca Bianchi", "Mei Tanaka", "Jonas Keller", "Sofia Marin", "Daniel Reis", "Ines Costa", "Omar Haddad"];

export function AdminOverview() {
  const { orders: allOrders } = useApp();
  const [range, setRange] = useState<7 | 30>(7);
  const data = range === 7 ? weeklyRevenue.map((d) => d.value) : Array.from({ length: 30 }, (_, i) => 6000 + ((i * 7919) % 15000));
  const max = Math.max(...data);
  const kpis = [["Revenue", money(data.reduce((a, b) => a + b, 0)), "+12.4%", DollarSign, true], ["Orders", String(allOrders.length * (range === 7 ? 9 : 38)), "+8.1%", ShoppingCart, true], ["Customers", "1,284", "+3.2%", Users, true], ["Returns", "2.1%", "-0.4%", Boxes, false]] as const;
  return (
    <>
      <Title>Dashboard</Title>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">{kpis.map(([l, v, d, Icon, up]) => <Panel key={l}><Icon size={18} className="text-gold" /><p className="font-display mt-3 text-3xl">{v}</p><p className="flex items-center justify-between text-xs text-ink/50">{l}<span className={cn("flex items-center", up ? "text-mint" : "text-oxblood")}>{up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{d}</span></p></Panel>)}</div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Revenue" className="xl:col-span-2">
          <div className="mb-4 flex gap-2">{([7, 30] as const).map((r) => <button key={r} onClick={() => setRange(r)} className={cn("cursor-pointer rounded-full px-4 py-1.5 text-xs", range === r ? "bg-ink text-white" : "bg-sand/60")}>{r} days</button>)}</div>
          <div className="flex h-56 items-end gap-1.5">{data.map((v, i) => <div key={i} title={money(v)} className="flex-1 rounded-t-lg bg-linear-to-t from-gold to-sky transition-all hover:from-oxblood hover:to-amber" style={{ height: `${(v / max) * 100}%` }} />)}</div>
        </Panel>
        <Panel title="Top products">{seed.slice(0, 5).map((p, i) => <div key={p.id} className="flex items-center gap-3 py-2"><span className="w-4 text-xs text-ink/40">{i + 1}</span><img src={img(p.id, 80, 80)} alt="" className="h-10 w-10 rounded-xl object-cover" /><p className="flex-1 truncate text-sm">{p.name}</p><p className="text-sm font-medium">{money(p.price)}</p></div>)}</Panel>
      </div>
      <Panel title="Recent activity" className="mt-4">{["New order SH-10482 from Amara Voss", "Review awaiting approval on Nova Runner", "Atelier Leather Sneaker is running low", "Coupon WELCOME10 used 14 times today"].map((a) => <p key={a} className="border-b border-sand py-3 text-sm last:border-0">{a}</p>)}</Panel>
    </>
  );
}

export function AdminOrders() {
  const toast = useToast();
  const { orders: rows, setOrderStatus } = useApp();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"All" | OrderStatus>("All");
  const shown = rows.filter((o) => (filter === "All" || o.status === filter) && `${o.id} ${o.customer}`.toLowerCase().includes(q.toLowerCase()));
  const change = (id: string, status: OrderStatus) => { setOrderStatus(id, status); toast(`${id} marked ${status}`); };
  return (
    <>
      <Title>Orders</Title>
      <Panel>
        <div className="mb-4 flex flex-wrap gap-3"><label className="relative flex-1"><Search size={15} className="absolute left-4 top-3.5 text-ink/40" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search orders" aria-label="Search orders" className={cn(field, "pl-10")} /></label>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">{(["All", ...statuses] as const).map((s) => <button key={s} onClick={() => setFilter(s)} className={cn("shrink-0 cursor-pointer rounded-full border px-4 text-sm", filter === s ? "border-ink bg-ink text-white" : "border-sand")}>{s}</button>)}</div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead><tr className="text-xs text-ink/50"><th className="py-2">Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>{shown.map((o) => <tr key={o.id} className="border-t border-sand"><td className="py-3 font-medium">{o.id}</td><td>{o.customer}</td><td>{o.date}</td><td>{money(o.total)}</td><td><select value={o.status} onChange={(e) => change(o.id, e.target.value as OrderStatus)} aria-label={`Status for ${o.id}`} className={cn("cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium", tone[o.status])}>{statuses.map((s) => <option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table></div>
      </Panel>
    </>
  );
}

export function AdminProducts() {
  const toast = useToast();
  const [rows, setRows] = useState<Array<Product & { live: boolean }>>(seed.map((p) => ({ ...p, live: true })));
  const [draft, setDraft] = useState({ name: "", price: "", category: "Lifestyle" as Category });
  const add = (e: FormEvent) => {
    e.preventDefault();
    const price = Number(draft.price);
    if (!draft.name.trim() || !(price > 0)) { toast("Enter a name and a valid price", "error"); return; }
    setRows((r) => [{ id: `p${100 + r.length}`, name: draft.name.trim(), price, category: draft.category, tone: "#6c4bff", stock: 10, note: "New product", live: false }, ...r]);
    setDraft({ name: "", price: "", category: "Lifestyle" });
    toast("Product added as draft");
  };
  return (
    <>
      <Title>Products ({rows.length})</Title>
      <Panel title="Add product"><form onSubmit={add} className="grid gap-3 sm:grid-cols-4"><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Name" aria-label="Product name" className={field} /><input value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} placeholder="Price" inputMode="numeric" aria-label="Price" className={field} /><select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })} aria-label="Category" className={field}>{categories.slice(1).map((c) => <option key={c}>{c}</option>)}</select><button className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-ink text-sm text-white"><Plus size={16} /> Add</button></form></Panel>
      <Panel className="mt-4"><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead><tr className="text-xs text-ink/50"><th className="py-2">Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Live</th><th /></tr></thead>
        <tbody>{rows.map((p) => <tr key={p.id} className="border-t border-sand"><td className="flex items-center gap-3 py-2"><img src={img(p.id, 80, 80)} alt="" className="h-10 w-10 rounded-xl object-cover" />{p.name}</td><td>{p.category}</td><td>{money(p.price)}</td>
          <td><input type="number" min={0} value={p.stock} aria-label={`Stock for ${p.name}`} onChange={(e) => setRows((r) => r.map((x) => (x.id === p.id ? { ...x, stock: Math.max(0, Number(e.target.value)) } : x)))} className={cn("w-20 rounded-xl border px-2 py-1.5", p.stock < 15 ? "border-oxblood text-oxblood" : "border-sand")} /></td>
          <td><Switch size="small" color="secondary" checked={p.live} onChange={() => { setRows((r) => r.map((x) => (x.id === p.id ? { ...x, live: !x.live } : x))); toast(p.live ? "Unpublished" : "Published", "info"); }} slotProps={{ input: { "aria-label": `Publish ${p.name}` } }} /></td>
          <td><button aria-label={`Delete ${p.name}`} onClick={() => { setRows((r) => r.filter((x) => x.id !== p.id)); toast("Product deleted", "info"); }} className="cursor-pointer text-oxblood"><Trash2 size={16} /></button></td></tr>)}</tbody></table></div></Panel>
    </>
  );
}

export function AdminCustomers() {
  const [q, setQ] = useState("");
  const rows = names.map((n, i) => ({ n, email: `${n.split(" ")[0].toLowerCase()}@mail.example`, orders: 2 + i * 3, spent: 640 + i * 1150, tier: ["Silver", "Gold", "Noir"][i % 3] }));
  return (
    <>
      <Title>Customers</Title>
      <Panel><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers" aria-label="Search customers" className={cn(field, "mb-4 max-w-sm")} />
        <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead><tr className="text-xs text-ink/50"><th className="py-2">Customer</th><th>Email</th><th>Orders</th><th>Spent</th><th>Tier</th></tr></thead>
          <tbody>{rows.filter((r) => r.n.toLowerCase().includes(q.toLowerCase())).map((r) => <tr key={r.n} className="border-t border-sand"><td className="flex items-center gap-3 py-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-linear-to-br from-gold to-oxblood text-xs text-white">{r.n[0]}</span>{r.n}</td><td>{r.email}</td><td>{r.orders}</td><td>{money(r.spent)}</td><td><span className="rounded-full bg-gold/10 px-3 py-1 text-xs text-gold">{r.tier}</span></td></tr>)}</tbody></table></div></Panel>
    </>
  );
}

export function AdminReviews() {
  const toast = useToast();
  const [pending, setPending] = useState(seed.slice(0, 6).flatMap((p) => reviewsFor(p).slice(0, 1).map((r) => ({ ...r, product: p.name }))));
  const act = (id: string, ok: boolean) => { setPending((l) => l.filter((r) => r.id !== id)); toast(ok ? "Review approved" : "Review rejected", ok ? "success" : "info"); };
  return (
    <>
      <Title>Review moderation</Title>
      <div className="space-y-3">{pending.map((r) => <Panel key={r.id}><div className="flex flex-wrap items-center gap-4"><div className="min-w-0 flex-1"><p className="text-xs text-ink/50">{r.product}, {r.author}, {r.rating} stars</p><p className="mt-1 font-medium">{r.title}</p><p className="text-sm text-ink/60">{r.body}</p></div><button onClick={() => act(r.id, true)} aria-label="Approve" className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-mint/15 text-mint"><Check size={18} /></button><button onClick={() => act(r.id, false)} aria-label="Reject" className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-oxblood/15 text-oxblood"><X size={18} /></button></div></Panel>)}{pending.length === 0 && <Panel>All caught up.</Panel>}</div>
    </>
  );
}

export function AdminCoupons() {
  const toast = useToast();
  const { coupons: list, setCoupons: setList } = useApp();
  const [code, setCode] = useState("");
  const [off, setOff] = useState("10");
  const add = (e: FormEvent) => { e.preventDefault(); const n = Number(off); if (!code.trim() || !(n > 0 && n <= 90)) { toast("Enter a code and a discount from 1 to 90", "error"); return; } setList((l) => [{ code: code.trim().toUpperCase(), off: n, on: true }, ...l]); setCode(""); toast("Coupon created"); };
  return (
    <>
      <Title>Coupons</Title>
      <Panel><form onSubmit={add} className="flex flex-wrap gap-3"><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CODE" aria-label="Coupon code" className={cn(field, "w-48")} /><input value={off} onChange={(e) => setOff(e.target.value)} aria-label="Percent off" inputMode="numeric" className={cn(field, "w-28")} /><button className="h-11 cursor-pointer rounded-full bg-gold px-6 text-sm text-white">Create</button></form></Panel>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{list.map((c) => <Panel key={c.code}><div className="flex items-center justify-between"><div><p className="font-mono font-semibold">{c.code}</p><p className="text-sm text-ink/50">{c.off}% off</p></div><Switch color="secondary" checked={c.on} onChange={() => setList((l) => l.map((x) => (x.code === c.code ? { ...x, on: !x.on } : x)))} slotProps={{ input: { "aria-label": `Enable ${c.code}` } }} /></div></Panel>)}</div>
    </>
  );
}

export function AdminSettings() {
  const toast = useToast();
  const [on, setOn] = useState({ lowStock: true, newOrder: true, weekly: false, guest: true });
  const labels: Record<keyof typeof on, string> = { lowStock: "Low stock alerts", newOrder: "New order emails", weekly: "Weekly summary", guest: "Allow guest checkout" };
  return (
    <>
      <Title>Settings</Title>
      <Panel title="Store"><div className="grid gap-3 sm:grid-cols-2"><input defaultValue="Shovid" aria-label="Store name" className={field} /><input defaultValue="hello@shovid.example" aria-label="Support email" className={field} /></div></Panel>
      <Panel title="Notifications and policy" className="mt-4">{(Object.keys(on) as Array<keyof typeof on>).map((k) => <div key={k} className="flex items-center justify-between border-b border-sand py-2 last:border-0"><span className="text-sm">{labels[k]}</span><Switch color="secondary" checked={on[k]} onChange={() => setOn({ ...on, [k]: !on[k] })} slotProps={{ input: { "aria-label": labels[k] } }} /></div>)}</Panel>
      <button onClick={() => toast("Settings saved")} className="mt-4 h-12 cursor-pointer rounded-full bg-ink px-8 text-sm text-white">Save changes</button>
    </>
  );
}
