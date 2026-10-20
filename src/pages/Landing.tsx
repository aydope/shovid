import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Clock, Gift, Leaf, MapPin, Phone, Recycle, Sparkles, Users, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { Countdown, Section } from "@/components/Ui";
import { img, likesFor, products } from "@/data";
import { useCart } from "@/store";
import { money } from "@/lib/utils";

type Feature = [Icon: LucideIcon, title: string, text: string];

interface LandingProps { eyebrow: string; title: string; lead: string; from: string; to: string; features?: Feature[]; cta?: [string, string]; children?: ReactNode; extra?: ReactNode }

function Landing({ eyebrow, title, lead, from, to, features, cta, children, extra }: LandingProps) {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
        <div className="rounded-[2.5rem] p-8 text-white md:p-20" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
          <p className="text-sm font-semibold text-white/80">{eyebrow}</p>
          <h1 className="font-display mt-3 max-w-3xl text-5xl md:text-7xl">{title}</h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">{lead}</p>
          {extra && <div className="mt-8">{extra}</div>}
          {cta && <Link to={cta[1]}><Button className="mt-8 bg-white !text-ink hover:bg-white/90">{cta[0]}</Button></Link>}
        </div>
      </section>
      {features && (
        <Section id="features" className="pt-16 md:pt-20">
          <div className="grid gap-4 md:grid-cols-3">
            {features.map(([Icon, t, s]) => <div key={t} className="rounded-3xl bg-white p-8 ring-1 ring-sand"><Icon className="text-gold" /><h2 className="mt-5 text-xl font-semibold">{t}</h2><p className="mt-2 text-sm text-ink/60">{s}</p></div>)}
          </div>
        </Section>
      )}
      {children && <Section id="content" className="pt-16 md:pt-20">{children}</Section>}
    </>
  );
}

const grid = (list: typeof products) => <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">{list.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>;

export const NewArrivals = () => <Landing eyebrow="Just landed" title="New arrivals" lead="The latest pieces from our Porto atelier." from="#6c4bff" to="#0a84ff">{grid(products.slice(-12).reverse())}</Landing>;

export const Sale = () => <Landing eyebrow="Members week" title="Up to 30% off" lead="Our biggest seasonal event. Ends when the clock does." from="#ff3b6b" to="#ffb020" extra={<Countdown />}>{grid([...products].sort((a, b) => likesFor(b) - likesFor(a)).slice(0, 8))}</Landing>;

export const Lookbook = () => (
  <Landing eyebrow="Editorial" title="Autumn Winter lookbook" lead="Six looks shot on location in Porto." from="#14c8a0" to="#0a84ff">
    <div className="columns-2 gap-4 md:columns-3">{["a", "b", "c", "d", "e", "f"].map((k, i) => <img key={k} src={img(`look-${k}`, 600, i % 2 ? 800 : 600)} alt={`Look ${i + 1}`} loading="lazy" className="mb-4 w-full rounded-3xl object-cover" />)}</div>
  </Landing>
);

function GiftPicker() {
  const { add } = useCart();
  const [amount, setAmount] = useState(100);
  return (
    <div className="max-w-xl rounded-3xl bg-white p-8 ring-1 ring-sand">
      <p className="text-sm font-medium">Choose an amount</p>
      <div className="mt-4 flex flex-wrap gap-3">{[50, 100, 250, 500].map((a) => <button key={a} onClick={() => setAmount(a)} className={`cursor-pointer rounded-full border px-6 py-3 text-sm ${amount === a ? "border-ink bg-ink text-white" : "border-sand"}`}>{money(a)}</button>)}</div>
      <Button className="mt-6 w-full" variant="gold" onClick={() => add({ id: `gift-${amount}`, name: `Gift card ${money(amount)}`, category: "Lifestyle", price: amount, tone: "#6c4bff", stock: 999, note: "Digital gift card" })}>Add gift card to bag</Button>
    </div>
  );
}

export const GiftCards = () => <Landing eyebrow="Gift cards" title="Give the gift of choice" lead="Delivered by email instantly, valid for two years." from="#ffb020" to="#ff3b6b" features={[[Gift, "Instant delivery", "Sent by email within a minute."], [Clock, "Valid two years", "No fees, no expiry surprises."], [Sparkles, "Personal note", "Add a message at checkout."]]}><GiftPicker /></Landing>;

const stores = [["Porto Flagship", "Rua das Flores 28, Porto", "Mon to Sat, 10:00 to 19:00", "+351 220 000 000"], ["Lisbon Chiado", "Rua Garrett 40, Lisbon", "Mon to Sat, 10:00 to 20:00", "+351 210 000 000"], ["Berlin Mitte", "Torstrasse 100, Berlin", "Tue to Sat, 11:00 to 19:00", "+49 30 000000"], ["Paris Marais", "Rue de Bretagne 12, Paris", "Tue to Sun, 11:00 to 19:00", "+33 1 00 00 00 00"]];

export const Stores = () => (
  <Landing eyebrow="Visit us" title="Find a Shovid store" lead="Fittings are free and take thirty minutes." from="#0a84ff" to="#14c8a0">
    <div className="grid gap-4 md:grid-cols-2">{stores.map(([n, a, h, p]) => <div key={n} className="rounded-3xl bg-white p-8 ring-1 ring-sand"><h2 className="text-2xl font-semibold">{n}</h2><ul className="mt-4 space-y-2 text-sm text-ink/60"><li className="flex gap-2"><MapPin size={16} /> {a}</li><li className="flex gap-2"><Clock size={16} /> {h}</li><li className="flex gap-2"><Phone size={16} /> {p}</li></ul></div>)}</div>
  </Landing>
);

export const Sustainability = () => <Landing eyebrow="Responsibility" title="Made to be kept" lead="Small runs, premium materials and repairs for life." from="#14c8a0" to="#6c4bff" features={[[Leaf, "Premium materials", "92% of our uppers are leather, suede or recycled mesh."], [Recycle, "Repair program", "Free resoling and cleaning for the life of every pair."], [Users, "Fair production", "Family-run workshops within 40 km of our atelier."]]} />;

const roles = [["Footwear Designer", "Porto", "Full time"], ["Client Advisor", "Berlin", "Full time"], ["Frontend Engineer", "Remote", "Full time"], ["Visual Merchandiser", "Paris", "Part time"]];

export const Careers = () => (
  <Landing eyebrow="Join us" title="Build Shovid with us" lead="A small team making clothing and software with care." from="#ff3b6b" to="#6c4bff">
    <div className="divide-y divide-sand rounded-3xl bg-white ring-1 ring-sand">{roles.map(([r, l, t]) => <div key={r} className="flex flex-wrap items-center gap-4 p-6"><Briefcase size={20} className="text-gold" /><p className="flex-1 font-medium">{r}</p><p className="text-sm text-ink/50">{l}, {t}</p><Link to="/contact"><Button size="sm" variant="outline">Apply</Button></Link></div>)}</div>
  </Landing>
);
