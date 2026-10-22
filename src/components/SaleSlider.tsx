import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { DragScroll } from "@/components/DragScroll";
import { discountFor, img, products } from "@/data";
import { money } from "@/lib/utils";

export function SaleSlider() {
  const deals = products.filter((p) => discountFor(p) > 0);
  return (
    <DragScroll label="Sale products">
      {deals.map((p) => {
        const off = discountFor(p);
        const now = Math.round(p.price * (1 - off / 100));
        return (
          <article key={p.id} className="w-72 shrink-0 snap-start overflow-hidden rounded-[2rem] bg-white text-ink">
            <Link to={`/product/${p.id}`} className="relative block aspect-[4/5]" aria-label={`${p.name}, ${off}% off`}>
              <img src={img(p.id, 500, 625)} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
              <span className="absolute left-4 top-4 rounded-full bg-oxblood px-3 py-1 text-sm font-bold text-white">-{off}%</span>
            </Link>
            <div className="p-5">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="mt-1 flex items-baseline gap-2"><span className="text-xl font-bold text-oxblood">{money(now)}</span><s className="text-sm text-ink/70">{money(p.price)}</s></p>
              <Link to={`/product/${p.id}`} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-white transition-colors hover:bg-ink/80">Choose size <ArrowRight size={14} /></Link>
            </div>
          </article>
        );
      })}
    </DragScroll>
  );
}
