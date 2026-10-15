import { Link, useNavigate } from "react-router-dom";
import { Drawer } from "@mui/material";
import { ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { img } from "@/data";
import { useCart } from "@/store";
import { useApp } from "@/auth";
import { money } from "@/lib/utils";

export function CartDrawer() {
  const { lines, total, open, setOpen, remove } = useCart();
  const navigate = useNavigate();
  const { plan } = useApp();
  const freeAt = plan.freeShipAt;

  return (
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { width: { xs: "100%", sm: 420 }, p: 3, borderRadius: { sm: "24px 0 0 24px" } } }}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Bag</h2>
        <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close bag"><X size={20} /></Button>
      </div>
      <div className="mt-4 rounded-2xl bg-sand/60 p-4 text-xs">
        {total >= freeAt ? "You have unlocked free insured shipping." : `Add ${money(freeAt - total)} more for free shipping.`}
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-gradient-to-r from-gold to-mint transition-all" style={{ width: `${freeAt ? Math.min(100, (total / freeAt) * 100) : 100}%` }} /></div>
      </div>
      <div className="mt-6 flex-1 space-y-5 overflow-y-auto">
        {lines.length === 0 && <div className="py-16 text-center text-sm text-ink/60"><ShoppingBag className="mx-auto mb-3" />Your bag is empty.</div>}
        {lines.map(({ product, qty }) => (
          <div key={product.id} className="flex gap-4">
            <img src={img(product.id, 160, 200)} alt="" loading="lazy" className="h-24 w-20 rounded-2xl object-cover" style={{ background: product.tone }} />
            <div className="flex-1"><Link to={`/product/${product.id}`} onClick={() => setOpen(false)} className="font-medium">{product.name}</Link><p className="mt-1 text-xs text-ink/50">Qty {qty}</p><button className="mt-2 cursor-pointer text-xs text-oxblood" onClick={() => remove(product.id)}>Remove</button></div>
            <p className="text-sm font-medium">{money(product.price * qty)}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-sand pt-5">
        <div className="mb-4 flex justify-between font-medium"><span>Subtotal</span><span>{money(total)}</span></div>
        <Button className="w-full" disabled={lines.length === 0} onClick={() => { setOpen(false); navigate("/checkout"); }}>Checkout</Button>
      </div>
    </Drawer>
  );
}
