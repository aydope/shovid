import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { discountFor, type Product } from "@/data";
import { useToast } from "@/toast";

interface CartLine { key: string; product: Product; qty: number; size?: string }

interface CartState {
  lines: CartLine[];
  total: number;
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (p: Product, size?: string) => void;
  remove: (key: string) => void;
  clear: () => void;
  wish: string[];
  toggleWish: (id: string) => void;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const [wish, setWish] = useState<string[]>([]);

  const value = useMemo<CartState>(() => ({
    lines,
    open,
    wish,
    toggleWish: (id) => {
      toast(wish.includes(id) ? "Removed from wishlist" : "Saved to wishlist", "info");
      setWish((cur) => (cur.includes(id) ? cur.filter((w) => w !== id) : [...cur, id]));
    },
    setOpen,
    total: lines.reduce((s, l) => s + Math.round(l.product.price * (1 - discountFor(l.product) / 100)) * l.qty, 0),
    count: lines.reduce((s, l) => s + l.qty, 0),
    add: (p, size) => {
      const key = size ? `${p.id}:${size}` : p.id;
      setLines((cur) => cur.some((l) => l.key === key)
        ? cur.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l))
        : [...cur, { key, product: p, qty: 1, size }]);
      toast(`${p.name}${size ? `, EU ${size},` : ""} added to bag`);
    },
    remove: (key) => setLines((cur) => cur.filter((l) => l.key !== key)),
    clear: () => setLines([]),
  }), [lines, open, wish, toast]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
