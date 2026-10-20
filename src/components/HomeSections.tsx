import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Gem, Headphones, Instagram, Leaf, Quote, RefreshCw, Scissors, ShieldCheck, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { Countdown, Section } from "@/components/Ui";
import { DragScroll } from "@/components/DragScroll";
import { SaleSlider } from "@/components/SaleSlider";
import { categories, img, likesFor, products } from "@/data";

const trust = [[Truck, "Free shipping", "On orders over $150"], [RefreshCw, "Free returns", "Within 30 days"], [ShieldCheck, "Secure payment", "Encrypted checkout"], [Headphones, "Client advisors", "Reply in one day"]] as const;
const why = [[Scissors, "Cut in house", "Every pattern graded by hand and fitted three times.", "text-gold bg-gold/10"], [Leaf, "Natural fibres", "Wool, silk, linen and cotton from mills we know.", "text-mint bg-mint/10"], [Gem, "Lifetime repair", "Mending and re-lining for the life of the garment.", "text-oxblood bg-oxblood/10"], [Truck, "Insured delivery", "Tracked worldwide shipping, 2 to 8 working days.", "text-sky bg-sky/10"], [ShieldCheck, "Secure by default", "Encrypted payments and private order data.", "text-amber bg-amber/10"], [Headphones, "Human support", "Real advisors, not chatbots, six days a week.", "text-gold bg-gold/10"]] as const;
const stats = [["12k+", "Members", "from-gold to-sky"], ["4.8", "Average rating", "from-oxblood to-amber"], ["30", "Day free returns", "from-mint to-sky"], ["48", "Countries", "from-amber to-oxblood"]];
const press = ["Atelier Weekly", "The Cut Line", "Form Journal", "Mono Mag", "Thread & Co"];
const reviews = [["Clara W.", "The coat fits like it was made for me. Delivery took three days.", "bg-gold"], ["Omar H.", "Quiet, well cut, honest materials. I stopped shopping anywhere else.", "bg-mint"], ["Ines C.", "Alterations were free and the tailor called me personally.", "bg-oxblood"]];

export function Hero() {
  const stack = products.slice(0, 3);
  return (
    <section id="hero" className="relative snap-start overflow-hidden px-6 pb-24 pt-16 md:pt-24">
      {[["bg-gold/30 -left-20 top-0", 14], ["bg-oxblood/25 right-0 top-20", 18], ["bg-mint/25 bottom-0 left-1/3", 16]].map(([c, d]) => (
        <motion.div key={String(c)} aria-hidden className={`absolute h-96 w-96 rounded-full blur-3xl ${c}`} animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }} transition={{ duration: Number(d), repeat: Infinity }} />
      ))}
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-medium shadow-sm ring-1 ring-sand"><span className="h-2 w-2 rounded-full bg-mint" /> Autumn Winter 2026 is here</motion.span>
          <h1 className="font-display mt-6 text-5xl leading-[1.02] md:text-7xl">Hoodies and sneakers, <span className="font-serif bg-gradient-to-r from-gold via-oxblood to-amber bg-clip-text italic text-transparent">refined</span> to the essentials.</h1>
          <p className="mt-6 max-w-lg text-lg text-ink/60">Heavyweight hoodies and sport sneakers made in small runs. Delivered worldwide in days.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link to="/shop"><Button variant="gold">Shop the collection <ArrowRight size={16} /></Button></Link><Link to="/lookbook"><Button variant="outline">View lookbook</Button></Link></div>
        </div>
        <div className="relative mx-auto grid max-w-md grid-cols-2 gap-4">
          {stack.map((p, i) => (
            <motion.img key={p.id} src={img(p.id, 400, 520)} alt={p.name} width={400} height={520} animate={{ y: [0, i % 2 ? 14 : -14, 0] }} transition={{ duration: 6 + i, repeat: Infinity }} className={`rounded-3xl object-cover shadow-2xl ${i === 0 ? "row-span-2 h-full" : "aspect-[4/5]"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function Trust() {
  return (
    <Section id="trust" className="pt-6 md:pt-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {trust.map(([Icon, t, s]) => <div key={t} className="flex items-center gap-4 rounded-3xl bg-white p-5 ring-1 ring-sand"><Icon className="text-gold" /><div><p className="text-sm font-semibold">{t}</p><p className="text-xs text-ink/50">{s}</p></div></div>)}
      </div>
    </Section>
  );
}

export function Categories() {
  return (
    <Section id="categories" eyebrow="Browse" title="Shop by category">
      <div className="grid auto-rows-[220px] grid-cols-2 gap-4 md:grid-cols-4">
        {categories.slice(1).map((c, i) => {
          const p = products.find((x) => x.category === c)!;
          return (
            <motion.div key={c} whileHover={{ scale: 1.02 }} className={i === 0 ? "col-span-2 row-span-2" : ""}>
              <Link to={`/shop?c=${c}`} className="group relative block h-full overflow-hidden rounded-3xl">
                <img src={img(p.id, 800, 800)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-5 left-5 text-2xl font-semibold text-white">{c}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

export function Arrivals() {
  return (
    <Section id="arrivals" eyebrow="Just in" title="New arrivals">
      <DragScroll label="New arrivals">
        {products.slice(-8).reverse().map((p, i) => <div key={p.id} className="w-64 shrink-0 snap-start md:w-72"><ProductCard product={p} index={i} /></div>)}
      </DragScroll>
    </Section>
  );
}

export function SaleBanner() {
  return (
    <Section id="sale">
      <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-oxblood via-gold to-sky p-8 text-white md:p-16">
        <p className="text-sm font-semibold">Members week</p>
        <h2 className="font-display mt-2 max-w-xl text-4xl md:text-6xl">Up to 30% off hoodies</h2>
        <div className="mt-8"><Countdown /></div>
        <Link to="/sale"><Button className="mt-8 bg-white !text-ink hover:bg-white/90">Shop the sale <ArrowRight size={16} /></Button></Link>
      </div>
      <div className="mt-8"><SaleSlider /></div>
    </Section>
  );
}

export function Why() {
  return (
    <Section id="why" eyebrow="Why Shovid" title="Everything a considered wardrobe needs">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {why.map(([Icon, t, s, tone], i) => (
          <motion.div key={t} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="rounded-3xl bg-white p-8 ring-1 ring-sand">
            <span className={`grid h-12 w-12 place-items-center rounded-2xl ${tone}`}><Icon size={22} /></span>
            <h3 className="mt-6 text-xl font-semibold">{t}</h3><p className="mt-2 text-sm text-ink/60">{s}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

export function Lookbook() {
  return (
    <Section id="lookbook" eyebrow="Editorial" title="The Autumn lookbook">
      <div className="grid gap-4 md:grid-cols-3">
        {["l1", "l2", "l3"].map((k, i) => (
          <Link to="/lookbook" key={k} className={`group relative overflow-hidden rounded-3xl ${i === 1 ? "md:mt-12" : ""}`}>
            <img src={img(k, 600, 800)} alt="" loading="lazy" className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute bottom-4 left-4 rounded-full bg-white/85 px-4 py-1.5 text-sm font-medium backdrop-blur">Look 0{i + 1}</span>
          </Link>
        ))}
      </div>
    </Section>
  );
}

export function Bestsellers() {
  const top = [...products].sort((a, b) => likesFor(b) - likesFor(a)).slice(0, 4);
  return (
    <Section id="best" eyebrow="Most loved" title="Bestsellers">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">{top.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
    </Section>
  );
}

export function Stats() {
  return (
    <Section id="stats">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(([v, l, g]) => <div key={l} className={`rounded-3xl bg-gradient-to-br ${g} p-8 text-white`}><p className="font-display text-5xl" data-count={parseFloat(v)} data-decimals={v.includes(".") ? 1 : 0} data-suffix={v.replace(/[\d.]/g, "")}>{v}</p><p className="mt-1 text-sm text-white/85">{l}</p></div>)}
      </div>
      <div className="mt-12 overflow-hidden"><div className="animate-marquee flex w-max gap-16 text-2xl font-semibold text-ink/25">{[...press, ...press].map((p, i) => <span key={i}>{p}</span>)}</div></div>
    </Section>
  );
}

export function Reviews() {
  return (
    <Section id="reviews" eyebrow="Loved by members" title="Reviews that read like friends">
      <div className="grid gap-4 md:grid-cols-3">
        {reviews.map(([who, text, bg]) => (
          <figure key={who} className="rounded-3xl bg-white p-8 ring-1 ring-sand">
            <Quote className="text-gold" size={22} />
            <div className="mt-3 flex">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} className="fill-amber text-amber" />)}</div>
            <blockquote className="mt-4 text-lg leading-snug">{text}</blockquote>
            <figcaption className="mt-6 flex items-center gap-3 text-sm font-medium"><span className={`grid h-9 w-9 place-items-center rounded-full text-white ${bg}`}>{who[0]}</span>{who}</figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

export function Social() {
  return (
    <Section id="social" eyebrow="@shovid" title="Worn by you">
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
          <a key={k} href="#" className="group relative aspect-square overflow-hidden rounded-2xl">
            <img src={img(k, 300, 300)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <span className="absolute inset-0 grid place-items-center bg-gold/60 text-white opacity-0 transition-opacity group-hover:opacity-100"><Instagram /></span>
          </a>
        ))}
      </div>
    </Section>
  );
}

export function Newsletter() {
  const [sent, setSent] = useState(false);
  return (
    <Section id="join">
      <div className="rounded-[2.5rem] bg-ink p-8 text-center text-white md:p-16">
        <h2 className="font-display text-4xl md:text-5xl">Get 10% off your first order</h2>
        <p className="mt-3 text-sm text-white/60">New arrivals and private sales, once a month.</p>
        {sent ? <p className="mt-8 text-mint">Subscribed. Thank you.</p> : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <input type="email" required aria-label="Email address" placeholder="Email address" className="h-12 flex-1 rounded-full bg-white/10 px-5 outline-none placeholder:text-white/40 focus:bg-white/20" />
            <Button type="submit" variant="gold">Subscribe</Button>
          </form>
        )}
      </div>
    </Section>
  );
}

export function Satisfaction() {
  const bars = [["5 stars", 78], ["4 stars", 16], ["3 stars", 4], ["2 stars", 1], ["1 star", 1]] as const;
  const c = 2 * Math.PI * 52;
  return (
    <Section id="happy" eyebrow="Customer satisfaction" title="96% of customers would buy again">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex items-center gap-6 rounded-3xl bg-white p-8 ring-1 ring-sand">
          <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90" role="img" aria-label="96 percent satisfied">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-sand)" strokeWidth="10" />
            <motion.circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-mint)" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} whileInView={{ strokeDashoffset: c * 0.04 }} viewport={{ once: true }} transition={{ duration: 1.4 }} />
          </svg>
          <div><p className="font-display text-5xl">4.8</p><div className="flex">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} className="fill-amber text-amber" />)}</div><p className="mt-1 text-xs text-ink/50">2,481 verified reviews</p></div>
        </div>
        <div className="rounded-3xl bg-white p-8 ring-1 ring-sand">
          {bars.map(([l, v]) => <div key={l} className="mb-3 flex items-center gap-3 text-xs"><span className="w-12">{l}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-sand"><motion.div className="h-full rounded-full bg-amber" initial={{ width: 0 }} whileInView={{ width: `${v}%` }} viewport={{ once: true }} transition={{ duration: 1 }} /></div><span className="w-8 text-right">{v}%</span></div>)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[["92%", "Fit as expected", "from-gold to-sky"], ["98%", "Arrived on time", "from-mint to-sky"], ["89%", "Repeat buyers", "from-oxblood to-amber"], ["24h", "Support reply", "from-amber to-gold"]].map(([v, l, g]) => <div key={l} className={`rounded-3xl bg-gradient-to-br ${g} p-5 text-white`}><p className="font-display text-3xl">{v}</p><p className="text-xs text-white/85">{l}</p></div>)}
        </div>
      </div>
    </Section>
  );
}

export function Manifesto() {
  return (
    <Section id="manifesto">
      <p className="text-sm font-semibold text-gold">Our belief</p>
      <p data-split className="font-serif mt-4 max-w-5xl text-4xl leading-[1.1] md:text-7xl">We make fewer garments, from better fibres, cut by people who care, so that you can wear them for decades instead of seasons.</p>
    </Section>
  );
}
