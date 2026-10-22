import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Drawer, Slider } from "@mui/material";
import { LayoutGrid, Grid3x3, SlidersHorizontal, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { categories, discountFor, products, ratingOf } from "@/data";
import { cn } from "@/lib/utils";

interface Filters { cats: string[]; max: number; rating: number; stock: boolean; sale: boolean }
const start: Filters = { cats: [], max: 300, rating: 0, stock: false, sale: false };
const PAGE = 12;

function Panel({ f, set }: { f: Filters; set: (f: Filters) => void }) {
  const toggle = (c: string) => set({ ...f, cats: f.cats.includes(c) ? f.cats.filter((x) => x !== c) : [...f.cats, c] });
  return (
    <div className="space-y-8 text-sm">
      <fieldset><legend className="mb-3 font-semibold">Category</legend>
        {categories.slice(1).map((c) => (
          <label key={c} className="flex cursor-pointer items-center justify-between py-1.5"><span className="flex items-center gap-3"><input type="checkbox" checked={f.cats.includes(c)} onChange={() => toggle(c)} className="h-4 w-4 accent-[#6c4bff]" />{c}</span><span className="text-xs text-ink/40">{products.filter((p) => p.category === c).length}</span></label>
        ))}
      </fieldset>
      <div><p className="mb-1 font-semibold">Price up to ${f.max}</p><Slider size="small" color="secondary" min={100} max={300} step={10} value={f.max} onChange={(_, v) => set({ ...f, max: v as number })} aria-label="Maximum price" /></div>
      <div><p className="mb-3 font-semibold">Rating</p><div className="flex gap-2">{[0, 4, 5].map((r) => <button key={r} onClick={() => set({ ...f, rating: r })} className={cn("flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-xs", f.rating === r ? "border-ink bg-ink text-white" : "border-sand")}>{r ? <>{r}+ <Star size={11} className="fill-amber text-amber" /></> : "Any"}</button>)}</div></div>
      {([["stock", "In stock only"], ["sale", "On sale"]] as const).map(([k, l]) => <label key={k} className="flex cursor-pointer items-center justify-between"><span className="font-semibold">{l}</span><input type="checkbox" role="switch" checked={f[k]} onChange={() => set({ ...f, [k]: !f[k] })} className="h-5 w-9 cursor-pointer accent-[#6c4bff]" /></label>)}
    </div>
  );
}

export default function Shop() {
  const [params] = useSearchParams();
  const q = params.get("q")?.toLowerCase() ?? "";
  const initialCat = categories.find((c) => c === params.get("c") && c !== "All");
  const [f, setF] = useState<Filters>({ ...start, cats: initialCat ? [initialCat] : [] });
  const [sort, setSort] = useState("featured");
  const [cols, setCols] = useState(4);
  const [shown, setShown] = useState(PAGE);
  const [sheet, setSheet] = useState(false);

  const list = useMemo(() => {
    const out = products.filter((p) => (!f.cats.length || f.cats.includes(p.category)) && p.price <= f.max && ratingOf(p) >= f.rating && (!f.stock || p.stock > 0) && (!f.sale || discountFor(p) > 0) && `${p.name} ${p.note}`.toLowerCase().includes(q));
    if (sort === "low") out.sort((a, b) => a.price - b.price);
    if (sort === "high") out.sort((a, b) => b.price - a.price);
    if (sort === "rated") out.sort((a, b) => ratingOf(b) - ratingOf(a));
    return out;
  }, [f, sort, q]);

  const update = (next: Filters) => { setF(next); setShown(PAGE); };
  const chips = [...f.cats, ...(f.max < 300 ? [`Under $${f.max}`] : []), ...(f.rating ? [`${f.rating}+ stars`] : []), ...(f.stock ? ["In stock"] : []), ...(f.sale ? ["On sale"] : [])];

  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 md:px-6">
      <h1 className="font-display text-5xl md:text-6xl">{q ? `Results for "${q}"` : "All products"}</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block"><div className="sticky top-32 rounded-3xl bg-white p-6 ring-1 ring-sand"><Panel f={f} set={update} /></div></aside>
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink/60">{list.length} products</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setSheet(true)}><SlidersHorizontal size={14} /> Filters</Button>
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products" className="h-9 rounded-full border border-sand bg-white px-4 text-sm"><option value="featured">Featured</option><option value="rated">Top rated</option><option value="low">Price, low to high</option><option value="high">Price, high to low</option></select>
              <div className="hidden rounded-full border border-sand p-1 sm:flex">{([[3, LayoutGrid], [4, Grid3x3]] as const).map(([n, Icon]) => <button key={n} onClick={() => setCols(n)} aria-label={`${n} columns`} className={cn("grid h-7 w-7 cursor-pointer place-items-center rounded-full", cols === n && "bg-ink text-white")}><Icon size={14} /></button>)}</div>
            </div>
          </div>
          {chips.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{chips.map((c) => <span key={c} className="rounded-full bg-gold/10 px-3 py-1 text-xs text-gold">{c}</span>)}<button onClick={() => update(start)} className="flex cursor-pointer items-center gap-1 text-xs text-ink/60"><X size={12} /> Clear all</button></div>}
          <div className={cn("mt-6 grid grid-cols-2 gap-4 md:gap-6", cols === 3 ? "md:grid-cols-3" : "md:grid-cols-3 xl:grid-cols-4")}>{list.slice(0, shown).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
          {list.length === 0 && <p className="py-24 text-center text-2xl font-semibold">Nothing matches these filters.</p>}
          {shown < list.length && <div className="mt-10 text-center"><Button variant="outline" onClick={() => setShown((s) => s + PAGE)}>Load more ({list.length - shown} left)</Button></div>}
        </div>
      </div>
      <Drawer anchor="bottom" open={sheet} onClose={() => setSheet(false)} slotProps={{ paper: { sx: { p: 3, borderRadius: "24px 24px 0 0", maxHeight: "85vh" } } }}>
        <div className="mb-4 flex items-center justify-between"><p className="text-xl font-semibold">Filters</p><button onClick={() => setSheet(false)} aria-label="Close filters" className="cursor-pointer"><X /></button></div>
        <Panel f={f} set={update} /><Button className="mt-6" onClick={() => setSheet(false)}>Show {list.length} products</Button>
      </Drawer>
    </section>
  );
}
