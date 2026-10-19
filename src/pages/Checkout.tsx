import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Building2, CheckCircle2, Copy, CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardVisual } from "@/components/CardVisual";
import { MapPicker } from "@/components/MapPicker";
import { quote, type Coupon } from "@/commerce";
import { useApp } from "@/auth";
import { useCart } from "@/store";
import { useToast } from "@/toast";
import { cn, money2 } from "@/lib/utils";

const field = "mt-2 h-12 w-full rounded-2xl border border-sand bg-white px-4 text-sm outline-none focus:border-gold";
const luhn = (s: string) => { let sum = 0; let alt = false; for (let i = s.length - 1; i >= 0; i--) { let n = Number(s[i]); if (alt) { n *= 2; if (n > 9) n -= 9; } sum += n; alt = !alt; } return s.length >= 13 && sum % 10 === 0; };
const expiryOk = (v: string) => { const m = v.match(/^(\d{2})\/(\d{2})$/); return !!m && Number(m[1]) >= 1 && Number(m[1]) <= 12 && new Date(2000 + Number(m[2]), Number(m[1]), 1) > new Date(); };
const phoneOk = (v: string) => /^\+?[\d\s()-]{7,20}$/.test(v) && v.replace(/\D/g, "").length >= 7;
const postcodeOk = (v: string) => /^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/.test(v.trim());
const store = { holder: "SHOVID ATELIER LDA", number: "5300120000459021", expiry: "12/29", iban: "PT50 0002 0123 1234 5678 9015 4" };

export default function Checkout() {
  const { lines, clear } = useCart();
  const { user, plan, addresses, coupons, placeOrder, addAddress } = useApp();
  const toast = useToast();
  const first = addresses[0];
  const [f, setF] = useState({ name: user?.name ?? "", phone: first?.phone ?? "", email: "", postcode: first?.postcode ?? "", line: first?.line ?? "" });
  const [coord, setCoord] = useState<{ lat: number; lng: number }>();
  const [pay, setPay] = useState<"card" | "transfer">("card");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvc: "" });
  const [flip, setFlip] = useState(false);
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<Coupon>();
  const [save, setSave] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<{ id: string; points: number; pay: string } | null>(null);
  const q = quote(lines, plan, coupon);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  const apply = () => {
    const c = coupons.find((x) => x.code === code.trim().toUpperCase() && x.on);
    if (!c) { toast("Invalid or inactive code", "error"); return; }
    setCoupon(c); toast(`${c.code} applied`);
  };
  const copy = async (text: string) => { try { await navigator.clipboard.writeText(text); toast("Copied"); } catch { toast("Could not copy", "error"); } };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!f.name.trim()) er.name = "Required";
    if (!phoneOk(f.phone)) er.phone = "Enter a valid phone number";
    if (!postcodeOk(f.postcode)) er.postcode = "Enter a valid postal code";
    if (!f.line.trim()) er.line = "Required";
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) er.email = "Enter a valid email or leave it empty";
    if (pay === "card") {
      const digits = card.number.replace(/\D/g, "");
      if (!luhn(digits)) er.number = "Card number is not valid";
      if (!card.name.trim()) er.cname = "Required";
      if (!expiryOk(card.expiry)) er.expiry = "Use a future date, MM/YY";
      if (!/^\d{3,4}$/.test(card.cvc)) er.cvc = "3 or 4 digits";
    }
    setErrors(er);
    if (Object.keys(er).length || lines.length === 0) return;
    const method = pay === "card" ? `Card ending ${card.number.replace(/\D/g, "").slice(-4)}` : "Bank transfer, awaiting payment";
    const id = placeOrder({ items: lines.map((l) => `${l.product.name} x${l.qty}`), total: q.total, discount: q.promo + q.member + q.coupon, shipping: q.shipping, points: q.points, email: user?.email ?? f.email, customer: f.name, phone: f.phone, payment: method });
    if (save && user) addAddress({ label: "Saved", line: f.line, phone: f.phone, postcode: f.postcode, ...coord });
    clear();
    setDone({ id, points: q.points, pay: method });
  };

  if (done) {
    return (
      <section className="mx-auto max-w-xl px-6 py-32 text-center">
        <CheckCircle2 size={48} className="mx-auto text-mint" strokeWidth={1.25} />
        <h1 className="font-display mt-6 text-5xl">Order {done.id} placed</h1>
        <p className="mt-3 text-sm text-ink/70">{done.pay}. {user ? `You earned ${done.points} points.` : "Track it with your order number and phone."} This is a demo checkout: nothing was charged.</p>
        <div className="mt-8 flex justify-center gap-3"><Link to="/track"><Button variant="outline">Track order</Button></Link><Link to={user ? "/account/orders" : "/shop"}><Button>{user ? "View my orders" : "Keep shopping"}</Button></Link></div>
      </section>
    );
  }

  const err = (k: string) => errors[k] && <span role="alert" className="mt-1 block text-xs text-oxblood">{errors[k]}</span>;
  const rows: Array<[string, number]> = [["Subtotal", q.subtotal], ["Promotion", -q.promo], [`${plan.name} member discount`, -q.member], [`Coupon ${coupon?.code ?? ""}`, -q.coupon], ["Shipping", q.shipping]];

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 md:grid-cols-5 md:px-6">
      <form onSubmit={submit} noValidate className="space-y-5 md:col-span-3">
        <h1 className="font-display text-5xl">Checkout</h1>
        {!user && <p className="rounded-2xl bg-gold/10 p-4 text-sm">Have an account? <Link to="/login?next=/checkout" className="font-medium text-gold">Sign in</Link> for member pricing and points.</p>}
        <h2 className="pt-2 text-lg font-semibold">Delivery</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">Full name *<input value={f.name} onChange={set("name")} className={field} />{err("name")}</label>
          <label className="text-sm font-medium">Phone number *<input value={f.phone} onChange={set("phone")} inputMode="tel" placeholder="+351 912 345 678" className={field} />{err("phone")}</label>
          <label className="text-sm font-medium">Postal code *<input value={f.postcode} onChange={set("postcode")} className={field} />{err("postcode")}</label>
          <label className="text-sm font-medium">Email <span className="font-normal text-ink/50">(optional)</span><input type="email" value={f.email} onChange={set("email")} className={field} />{err("email")}</label>
        </div>
        {addresses.length > 0 && <label className="block text-sm font-medium">Saved addresses<select onChange={(e) => { const a = addresses.find((x) => String(x.id) === e.target.value); if (a) setF((s) => ({ ...s, line: a.line, phone: a.phone || s.phone, postcode: a.postcode || s.postcode })); }} className={field}><option value="">Choose an address</option>{addresses.map((a) => <option key={a.id} value={a.id}>{a.label}: {a.line}</option>)}</select></label>}
        <label className="block text-sm font-medium">Delivery address *<textarea value={f.line} onChange={set("line")} rows={2} className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-gold" />{err("line")}</label>
        <MapPicker onPick={(p) => { setF((s) => ({ ...s, line: p.line, postcode: p.postcode ?? s.postcode })); setCoord({ lat: p.lat, lng: p.lng }); }} />
        {user && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="accent-[#6c4bff]" /> Save this address</label>}

        <h2 className="pt-4 text-lg font-semibold">Payment</h2>
        <div className="grid grid-cols-2 gap-3">{([["card", "Pay by card", CreditCard], ["transfer", "Bank transfer", Building2]] as const).map(([k, l, Icon]) => <button type="button" key={k} onClick={() => setPay(k)} className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm font-medium", pay === k ? "border-gold bg-gold/10 text-gold" : "border-sand")}><Icon size={18} />{l}</button>)}</div>
        {pay === "card" ? (
          <div className="grid items-start gap-6 rounded-3xl bg-white p-5 ring-1 ring-sand sm:grid-cols-2">
            <CardVisual number={card.number} name={card.name} expiry={card.expiry} cvc={card.cvc} flipped={flip} />
            <div className="space-y-3">
              <label className="block text-sm font-medium">Card number<input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim() })} inputMode="numeric" placeholder="4242 4242 4242 4242" autoComplete="cc-number" className={field} />{err("number")}</label>
              <label className="block text-sm font-medium">Name on card<input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} autoComplete="cc-name" className={field} />{err("cname")}</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium">Expiry<input value={card.expiry} onChange={(e) => { const d = e.target.value.replace(/\D/g, "").slice(0, 4); setCard({ ...card, expiry: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }); }} placeholder="MM/YY" autoComplete="cc-exp" className={field} />{err("expiry")}</label>
                <label className="block text-sm font-medium">CVC<input value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })} onFocus={() => setFlip(true)} onBlur={() => setFlip(false)} inputMode="numeric" autoComplete="cc-csc" className={field} />{err("cvc")}</label>
              </div>
              <p className="flex items-start gap-2 text-xs text-ink/50"><Lock size={13} className="mt-0.5 shrink-0" /> Demo only. Try 4242 4242 4242 4242 with any future date. Only the last 4 digits are kept.</p>
            </div>
          </div>
        ) : (
          <div className="grid items-start gap-6 rounded-3xl bg-white p-5 ring-1 ring-sand sm:grid-cols-2">
            <CardVisual variant="store" number={store.number} name={store.holder} expiry={store.expiry} />
            <div className="space-y-3 text-sm"><p className="font-medium">Transfer {money2(q.total)} to the store account</p>
              {([["Account holder", store.holder], ["IBAN", store.iban], ["Reference", f.phone || "Your phone number"]] as const).map(([l, v]) => <div key={l} className="flex items-center justify-between gap-2 rounded-2xl bg-sand/50 px-4 py-2.5"><div><p className="text-[11px] text-ink/50">{l}</p><p className="font-mono text-xs">{v}</p></div><button type="button" aria-label={`Copy ${l}`} onClick={() => void copy(v)} className="cursor-pointer text-gold"><Copy size={15} /></button></div>)}
              <p className="text-xs text-ink/50">Your order is held until the transfer arrives. These are demo details.</p></div>
          </div>
        )}
        <Button type="submit" variant="gold" className="w-full sm:w-auto" disabled={lines.length === 0}>{pay === "card" ? `Pay ${money2(q.total)}` : `Place order, ${money2(q.total)}`}</Button>
      </form>
      <aside className="h-fit rounded-3xl bg-white p-6 ring-1 ring-sand md:sticky md:top-32 md:col-span-2">
        <h2 className="text-xl font-semibold">Summary</h2>
        {lines.length === 0 && <p className="mt-4 text-sm">Your bag is empty.</p>}
        {lines.map(({ product, qty }) => <p key={product.id} className="mt-3 flex justify-between text-sm"><span>{product.name} x{qty}</span><span>{money2(product.price * qty)}</span></p>)}
        <div className="mt-4 flex gap-2"><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" aria-label="Coupon code" className="h-10 flex-1 rounded-full border border-sand px-4 text-sm outline-none focus:border-gold" /><Button type="button" size="sm" className="h-10" onClick={apply}>Apply</Button></div>
        <div className="mt-5 space-y-1.5 border-t border-sand pt-4 text-sm">{rows.filter(([, n]) => n !== 0).map(([l, n]) => <p key={l} className="flex justify-between"><span className="text-ink/60">{l}</span><span className={n < 0 ? "text-mint" : ""}>{n < 0 ? "-" : ""}{money2(Math.abs(n))}</span></p>)}{q.shipping === 0 && lines.length > 0 && <p className="flex justify-between"><span className="text-ink/60">Shipping</span><span className="text-mint">Free</span></p>}</div>
        {q.capped && <p className="mt-2 text-xs text-ink/50">Discounts are capped at 40% of the subtotal.</p>}
        <p className="mt-4 flex justify-between border-t border-sand pt-4 text-lg font-semibold"><span>Total</span><span>{money2(q.total)}</span></p>
        <p className="mt-2 text-xs text-ink/50">You earn {q.points} points on this order ({plan.points}x with {plan.name}).</p>
      </aside>
    </section>
  );
}
