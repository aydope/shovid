import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Accordion, AccordionDetails, AccordionSummary, Rating } from "@mui/material";
import { ChevronDown, Heart, MessageCircle, RefreshCw, ShieldCheck, ThumbsUp, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { CompleteLook, DeliveryEstimate, FitMeter, QnA, RecentlyViewed, StickyBar, track } from "@/components/ProductExtras";
import { discountFor, img, likesFor, products, reviewsFor, sizes, type Review } from "@/data";
import { usePageTitle } from "@/lib/titles";
import { useCart } from "@/store";
import { cn, money } from "@/lib/utils";

const details = [["Details", "Made in Portugal and finished by hand. Includes a dust bag, spare laces and a care card."], ["Shipping", "Free insured delivery over $500. EU in 2 to 4 days, worldwide in 4 to 8."], ["Care", "Brush off dirt, clean with a damp cloth and air dry away from heat. Use shoe trees to hold the shape."]];

function ProductView({ id }: { id?: string }) {
  const { add, wish, toggleWish } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const sizesRef = useRef<HTMLDivElement>(null);
  const [shot, setShot] = useState(0);
  const [added, setAdded] = useState<Review[]>([]);
  const [liked, setLiked] = useState<string[]>([]);
  const [draft, setDraft] = useState({ author: "", body: "", rating: 5 });
  const [origin, setOrigin] = useState("50% 50%");
  useEffect(() => { if (id) track(id); }, [id]);
  const product = products.find((p) => p.id === id);
  usePageTitle(product?.name);

  if (!product) return <p className="py-40 text-center text-5xl font-semibold">Product not found</p>;

  const addToBag = () => {
    if (!size) {
      setSizeError(true);
      sizesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      sizesRef.current?.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
      return;
    }
    add(product, size);
  };
  const reviews = [...added, ...reviewsFor(product)];
  const average = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const shots = [...new Set([0, 1, 2, 3].map((n) => img(`${product.id}-${n}`, 800, 1000)))];

  const post = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.author.trim() || !draft.body.trim()) return;
    setAdded((cur) => [{ id: `new-${cur.length}`, author: draft.author.trim(), rating: draft.rating, title: "Verified buyer", body: draft.body.trim(), likes: 0, date: new Date().toISOString().slice(0, 10) }, ...cur]);
    setDraft({ author: "", body: "", rating: 5 });
  };

  return (
    <section className="mx-auto max-w-7xl px-6 pt-10">
      <nav aria-label="Breadcrumb" className="text-xs text-ink/70"><Link to="/" className="hover:text-ink">Home</Link> / <Link to={`/shop?c=${product.category}`} className="hover:text-ink">{product.category}</Link> / {product.name}</nav>
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="group relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-3xl bg-linear-to-b from-[#f4f1ea] to-[#e4ddd0]" onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`); }}>
            <AnimatePresence mode="wait"><motion.img key={shot} src={shots[shot]} alt={product.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ transformOrigin: origin }} className="h-full w-full object-cover transition-transform duration-300 md:group-hover:scale-[1.8]" /></AnimatePresence>
          </div>
          <div className={cn("mt-4 grid grid-cols-4 gap-3", shots.length < 2 && "hidden")}>{shots.map((s, i) => <button key={`${i}-${s}`} onClick={() => setShot(i)} aria-label={`View photo ${i + 1}`} className={cn("cursor-pointer overflow-hidden rounded-2xl ring-2 transition", shot === i ? "ring-gold" : "ring-transparent")}><img src={s} alt="" loading="lazy" className="aspect-square w-full object-cover" /></button>)}</div>
        </div>
        <div className="lg:sticky lg:top-32 lg:h-fit">
          <p className="text-sm font-semibold text-gold">{product.category}</p>
          <h1 className="font-display mt-2 text-4xl md:text-5xl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-3 text-sm"><Rating value={average} precision={0.1} readOnly size="small" /> {average.toFixed(1)} ({reviews.length} reviews) <span className="flex items-center gap-1 text-ink/70"><Heart size={14} /> {likesFor(product)}</span></div>
          <p className="mt-6 flex flex-wrap items-baseline gap-3 text-3xl font-semibold">{discountFor(product) ? <><span>{money(Math.round(product.price * (1 - discountFor(product) / 100)))}</span><s className="text-lg font-normal text-ink/70">{money(product.price)}</s><span className="rounded-full bg-oxblood px-2.5 py-1 text-xs font-medium text-white">-{discountFor(product)}%</span></> : money(product.price)}</p>
          <p className="mt-4 text-ink/70">{product.note}.</p>
          <p id="size-label" className="mt-8 text-sm font-medium">Size (EU) <span className="font-normal text-ink/70">Required</span></p>
          <div ref={sizesRef} role="radiogroup" aria-labelledby="size-label" aria-describedby={sizeError ? "size-error" : undefined} className="mt-3 flex flex-wrap gap-2">{sizes.map((s) => <button key={s} role="radio" aria-checked={size === s} onClick={() => { setSize(s); setSizeError(false); }} className={cn("h-12 min-w-12 cursor-pointer rounded-2xl border px-3 text-sm transition", size === s ? "border-ink bg-ink text-white" : "border-sand hover:border-ink")}>{s}</button>)}</div>
          {sizeError && <p id="size-error" role="alert" className="mt-2 text-sm text-oxblood">Choose a size to add this pair to your bag.</p>}
          <FitMeter id={product.id} />
          <div className="mt-8 flex gap-3"><Button className="flex-1" variant="gold" onClick={addToBag}>Add to bag</Button><Button variant="outline" size="icon" onClick={() => toggleWish(product.id)} aria-label="Save to wishlist"><Heart size={18} className={cn(wish.includes(product.id) && "fill-oxblood text-oxblood")} /></Button></div>
          <ul className="mt-6 space-y-2 text-sm text-ink/70"><li className="flex gap-2"><Truck size={16} /> Ships in 2 days, {product.stock} in stock</li><li className="flex gap-2"><RefreshCw size={16} /> Free returns for 30 days</li><li className="flex gap-2"><ShieldCheck size={16} /> Secure checkout</li></ul>
          <DeliveryEstimate />
          <div className="mt-8">{details.map(([t, b]) => <Accordion key={t} disableGutters><AccordionSummary expandIcon={<ChevronDown size={16} />}><span className="font-medium">{t}</span></AccordionSummary><AccordionDetails><p className="text-sm text-ink/70">{b}</p></AccordionDetails></Accordion>)}</div>
        </div>
      </div>

      <CompleteLook product={product} />
      <h2 className="font-display mt-24 flex items-center gap-3 text-3xl md:text-4xl"><MessageCircle /> Reviews and comments</h2>
      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 ring-1 ring-sand">
          <p className="font-display text-6xl">{average.toFixed(1)}</p>
          {[5, 4, 3, 2, 1].map((n) => { const c = reviews.filter((r) => r.rating === n).length; return <div key={n} className="mt-2 flex items-center gap-2 text-xs"><span className="w-3">{n}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-sand"><div className="h-full rounded-full bg-amber" style={{ width: `${(c / reviews.length) * 100}%` }} /></div></div>; })}
          <form onSubmit={post} className="mt-6 space-y-3">
            <Rating value={draft.rating} onChange={(_, v) => setDraft({ ...draft, rating: v ?? 5 })} />
            <input value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} placeholder="Your name" aria-label="Your name" className="w-full rounded-2xl border border-sand px-4 py-3 text-sm outline-none focus:border-gold" />
            <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={3} placeholder="Share your thoughts" aria-label="Comment" className="w-full rounded-2xl border border-sand px-4 py-3 text-sm outline-none focus:border-gold" />
            <Button type="submit" className="w-full">Post comment</Button>
          </form>
        </div>
        <div className="space-y-4 lg:col-span-2">
          {reviews.map((r) => (
            <motion.article layout key={r.id} className="rounded-3xl bg-white p-6 ring-1 ring-sand">
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-linear-to-br from-gold to-oxblood font-semibold text-white">{r.author[0]}</span><div><p className="text-sm font-medium">{r.author}</p><p className="text-xs text-ink/70">{r.date}</p></div><Rating className="!ml-auto" value={r.rating} readOnly size="small" /></div>
              <h3 className="mt-4 font-semibold">{r.title}</h3><p className="mt-1 text-sm text-ink/70">{r.body}</p>
              <button onClick={() => setLiked((l) => (l.includes(r.id) ? l.filter((x) => x !== r.id) : [...l, r.id]))} className={cn("mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs ring-1 ring-sand", liked.includes(r.id) && "bg-gold/10 text-gold ring-gold")}><ThumbsUp size={13} /> Helpful ({r.likes + (liked.includes(r.id) ? 1 : 0)})</button>
            </motion.article>
          ))}
        </div>
      </div>

      <QnA />
      <h2 className="font-display mb-8 mt-24 text-3xl md:text-4xl">You may also like</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">{related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
      <RecentlyViewed exclude={product.id} />
      <StickyBar product={product} onAdd={addToBag} />
    </section>
  );
}

// A new instance per product so size, photo, comments and likes never leak between products.
export default function Product() {
  const { id } = useParams();
  return <ProductView key={id} id={id} />;
}
