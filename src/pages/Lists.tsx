import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { ProductCard } from "@/components/ProductCard";
import { categories, products } from "@/data";
import { useCart } from "@/store";
import { money } from "@/lib/utils";

export function Cart() {
  const { lines, total, remove } = useCart();
  return (
    <PageShell title="Your bag">
      {lines.length === 0 ? <p>Your bag is empty. <Link to="/shop" className="text-gold">Continue shopping</Link></p> : (
        <>
          {lines.map(({ product, qty }) => (
            <div key={product.id} className="flex items-center gap-6 border-b border-sand py-6">
              <div className="h-28 w-24" style={{ background: product.tone }} />
              <div className="flex-1"><Link to={`/product/${product.id}`} className="font-display text-2xl hover:text-gold">{product.name}</Link><p className="text-xs">Qty {qty}</p></div>
              <p>{money(product.price * qty)}</p>
              <button onClick={() => remove(product.id)} className="cursor-pointer text-xs uppercase tracking-widest text-oxblood">Remove</button>
            </div>
          ))}
          <div className="mt-8 flex items-center justify-between"><p className="font-display text-3xl">Total {money(total)}</p><Link to="/checkout"><Button>Checkout</Button></Link></div>
        </>
      )}
    </PageShell>
  );
}

export function Wishlist() {
  const { wish } = useCart();
  const saved = products.filter((p) => wish.includes(p.id));
  return (
    <PageShell title="Wishlist">
      {saved.length === 0 ? <p className="flex items-center gap-2"><Heart size={16} /> Tap the heart on any product to save it here.</p>
        : <div className="grid grid-cols-2 gap-6 md:grid-cols-3">{saved.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>}
    </PageShell>
  );
}

export function Collections() {
  return (
    <PageShell title="Collections" lead="Browse the house by category.">
      <div className="grid gap-4 md:grid-cols-2">
        {categories.slice(1).map((c) => (
          <Link key={c} to={`/shop?c=${c}`} className="flex h-56 items-end p-8 text-ivory transition-transform hover:-translate-y-1" style={{ background: products.find((p) => p.category === c)?.tone }}>
            <span className="font-display text-5xl">{c}<span className="ml-3 text-sm">{products.filter((p) => p.category === c).length} pieces</span></span>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
