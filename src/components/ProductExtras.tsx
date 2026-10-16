import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ChevronUp, HelpCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DragScroll } from "@/components/DragScroll";
import { ProductCard } from "@/components/ProductCard";
import { img, products, type Product } from "@/data";
import { getRecent, track } from "@/recent";
import { useCart } from "@/store";
import { useToast } from "@/toast";
import { money } from "@/lib/utils";

export { track };

const day = (n: number) => new Date(Date.now() + n * 864e5).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

export function DeliveryEstimate() {
  return <p className="mt-4 flex items-center gap-2 rounded-2xl bg-mint/10 px-4 py-3 text-sm text-ink/70"><Calendar size={16} className="text-mint" /> Order today for delivery {day(3)} to {day(5)}</p>;
}

export function FitMeter({ id }: { id: string }) {
  const pos = 42 + ((Number(id.slice(1)) * 11) % 20);
  return (
    <div className="mt-6">
      <div className="flex justify-between text-xs text-ink/50"><span>Runs small</span><span>True to size</span><span>Runs large</span></div>
      <div className="relative mt-2 h-1.5 rounded-full bg-sand"><motion.span initial={{ left: "50%" }} animate={{ left: `${pos}%` }} transition={{ type: "spring", stiffness: 80 }} className="absolute -top-1.5 h-4 w-4 -translate-x-1/2 rounded-full bg-gold ring-4 ring-white" /></div>
      <p className="mt-2 text-xs text-ink/60">92% of buyers say this fits true to size.</p>
    </div>
  );
}

export function CompleteLook({ product }: { product: Product }) {
  const { add } = useCart();
  const picks = [product, ...products.filter((p) => p.category !== product.category).slice(0, 2)];
  const total = picks.reduce((s, p) => s + p.price, 0);
  return (
    <section data-reveal className="mt-24 rounded-[2rem] bg-white p-6 ring-1 ring-sand md:p-10">
      <h2 className="font-display text-3xl">Complete the look</h2>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        {picks.map((p, i) => <div key={p.id} className="flex items-center gap-4">{i > 0 && <Plus className="text-ink/30" />}<Link to={`/product/${p.id}`} className="block w-28"><img src={img(p.id, 220, 280)} alt={p.name} loading="lazy" className="aspect-[4/5] rounded-2xl object-cover" /><p className="mt-1 truncate text-xs">{p.name}</p></Link></div>)}
        <div className="ml-auto text-right"><p className="text-xs text-ink/50">Bundle total</p><p className="text-2xl font-semibold">{money(total)}</p><Button size="sm" className="mt-2" variant="gold" onClick={() => picks.forEach(add)}>Add all 3</Button></div>
      </div>
    </section>
  );
}

const seedQs = [{ id: 1, q: "Is the lining removable?", a: "No, it is fully sewn in, but it can be re-lined by our atelier.", votes: 12 }, { id: 2, q: "Can I get it hemmed?", a: "Yes, hemming is free in any store within 60 days.", votes: 8 }, { id: 3, q: "Is it true to colour in the photos?", a: "Photos are taken in daylight and match closely.", votes: 5 }];

export function QnA() {
  const toast = useToast();
  const [list, setList] = useState(seedQs);
  const [q, setQ] = useState("");
  const submit = (e: FormEvent) => { e.preventDefault(); if (!q.trim()) return; setList((l) => [{ id: Date.now(), q: q.trim(), a: "", votes: 0 }, ...l]); setQ(""); toast("Question submitted, an advisor will reply soon"); };
  return (
    <section data-reveal className="mt-24">
      <h2 className="font-display flex items-center gap-3 text-3xl md:text-4xl"><HelpCircle /> Questions and answers</h2>
      <form onSubmit={submit} className="mt-6 flex max-w-xl gap-3"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask a question" aria-label="Ask a question" className="h-11 flex-1 rounded-full border border-sand bg-white px-5 text-sm outline-none focus:border-gold" /><Button type="submit" size="sm" className="h-11">Ask</Button></form>
      <div className="mt-6 space-y-3">{list.map((x) => <div key={x.id} className="flex gap-4 rounded-3xl bg-white p-5 ring-1 ring-sand"><button onClick={() => setList((l) => l.map((y) => (y.id === x.id ? { ...y, votes: y.votes + 1 } : y)))} aria-label="Upvote question" className="flex h-fit cursor-pointer flex-col items-center rounded-2xl bg-sand/60 px-3 py-2 text-xs hover:text-gold"><ChevronUp size={14} />{x.votes}</button><div><p className="font-medium">{x.q}</p><p className="mt-1 text-sm text-ink/60">{x.a || "Awaiting an answer from our advisors."}</p></div></div>)}</div>
    </section>
  );
}

export function RecentlyViewed({ exclude }: { exclude: string }) {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => { setIds(getRecent().filter((i) => i !== exclude)); }, [exclude]);
  const list = ids.map((i) => products.find((p) => p.id === i)).filter((p): p is Product => Boolean(p));
  if (!list.length) return null;
  return (
    <section className="mt-24"><h2 className="font-display mb-8 text-3xl md:text-4xl">Recently viewed</h2>
      <DragScroll label="Recently viewed products">{list.map((p, i) => <div key={p.id} className="w-56 shrink-0 snap-start"><ProductCard product={p} index={i} /></div>)}</DragScroll>
    </section>
  );
}

export function StickyBar({ product }: { product: Product }) {
  const { add } = useCart();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-sand bg-white/90 px-4 py-3 pl-24 pr-24 backdrop-blur-xl lg:hidden">
      <img src={img(product.id, 80, 100)} alt="" className="h-11 w-9 rounded-lg object-cover" />
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{product.name}</p><p className="text-xs">{money(product.price)}</p></div>
      <Button size="sm" variant="gold" onClick={() => add(product)}>Add</Button>
    </div>
  );
}
