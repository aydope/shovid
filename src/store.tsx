import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/data";
import { useToast } from "@/toast";

interface CartLine {
  product: Product;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  total: number;
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (p: Product) => void;
  remove: (id: string) => void;
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

  const value = useMemo<CartState>(
    () => ({
      lines,
      open,
      wish,
      toggleWish: (id) => {
        toast(
          wish.includes(id) ? "Removed from wishlist" : "Saved to wishlist",
          "info",
        );
        setWish((cur) =>
          cur.includes(id) ? cur.filter((w) => w !== id) : [...cur, id],
        );
      },
      setOpen,
      total: lines.reduce((s, l) => s + l.product.price * l.qty, 0),
      count: lines.reduce((s, l) => s + l.qty, 0),
      add: (p) => {
        setLines((cur) =>
          cur.some((l) => l.product.id === p.id)
            ? cur.map((l) =>
                l.product.id === p.id ? { ...l, qty: l.qty + 1 } : l,
              )
            : [...cur, { product: p, qty: 1 }],
        );
        toast(`${p.name} added to bag`);
      },
      remove: (id) => setLines((cur) => cur.filter((l) => l.product.id !== id)),
      clear: () => setLines([]),
    }),
    [lines, open, wish, toast],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
