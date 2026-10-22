import { Link } from "react-router-dom";
import { Flame, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DragScroll } from "@/components/DragScroll";
import { discountFor, img, likesFor, products } from "@/data";
import { useCart } from "@/store";
import { money } from "@/lib/utils";

export function SaleSlider() {
  const { add } = useCart();
  const deals = products.filter((p) => discountFor(p) > 0);
  return (
    <DragScroll label="Sale products">
      {deals.map((p) => {
        const off = discountFor(p);
        const sold = 40 + (likesFor(p) % 55);
        const now = Math.round(p.price * (1 - off / 100));
        return (
          <article key={p.id} className="w-72 shrink-0 snap-start overflow-hidden rounded-[2rem] bg-white text-ink shadow-xl">
            <Link to={`/product/${p.id}`} className="relative block aspect-[4/5]">
              <img src={img(p.id, 500, 625)} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
              <span className="absolute left-4 top-4 rounded-full bg-oxblood px-3 py-1 text-sm font-bold text-white">-{off}%</span>
            </Link>
            <div className="p-5">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="mt-1 flex items-baseline gap-2"><span className="text-xl font-bold text-oxblood">{money(now)}</span><span className="text-sm text-ink/40 line-through">{money(p.price)}</span></p>
              <p className="mt-4 flex items-center gap-1 text-xs text-ink/60"><Flame size={13} className="text-oxblood" /> {sold}% sold</p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sand"><div className="h-full rounded-full bg-linear-to-r from-amber to-oxblood" style={{ width: `${sold}%` }} /></div>
              <Button size="sm" className="mt-4 w-full" onClick={() => add({ ...p, price: now })}><Plus size={14} /> Add to bag</Button>
            </div>
          </article>
        );
      })}
    </DragScroll>
  );
}
