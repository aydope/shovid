import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Badge, Drawer } from "@mui/material";
import {
  ChevronDown,
  Globe,
  Heart,
  HelpCircle,
  Menu,
  Search,
  ShoppingBag,
  Tag,
  User,
  X,
} from "lucide-react";
import { categories, img, products } from "@/data";
import { activePromos } from "@/commerce";
import { useApp } from "@/auth";
import { useCart } from "@/store";

const links = [
  ["New", "/new-arrivals"],
  ["Sale", "/sale"],
  ["Lookbook", "/lookbook"],
  ["Membership", "/membership"],
  ["Journal", "/journal"],
] as const;
const featured = products.slice(0, 2);

export function Header({ onSearch }: { onSearch: () => void }) {
  const { count, setOpen, wish } = useCart();
  const { user } = useApp();
  const live = activePromos()[0];
  const [menu, setMenu] = useState(false);
  const item = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3 py-2 text-sm transition-colors hover:bg-ink/5 ${isActive ? "text-gold" : ""}`;

  return (
    <header className="sticky top-0 z-40">
      <div className="hidden bg-ink text-[12px] text-white/80 md:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-6">
          <Link
            to="/promotions"
            className="flex items-center gap-2 hover:text-white"
          >
            <Tag size={14} />{" "}
            {live
              ? `${live.name}: ${live.percent}% off ${live.scope === "all" ? "everything" : live.scope.toLowerCase()} today`
              : "Free insured shipping over $150"}
          </Link>
          <div className="flex items-center gap-5">
            <Link to="/track" className="hover:text-white">
              Track order
            </Link>
            <Link to="/stores" className="hover:text-white">
              Stores
            </Link>
            <Link
              to="/faq"
              className="flex items-center gap-1 hover:text-white"
            >
              <HelpCircle size={13} /> Help
            </Link>
            <span className="flex items-center gap-1">
              <Globe size={13} /> EN / USD
            </span>
          </div>
        </div>
      </div>
      <div className="border-b border-sand/80 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
          <button
            className="cursor-pointer p-2 lg:hidden"
            onClick={() => setMenu(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <Link to="/" className="text-2xl font-bold tracking-tight">
            shovid<span className="text-gold">.</span>
          </Link>
          <nav className="hidden items-center lg:flex" aria-label="Main">
            <div className="group relative">
              <NavLink
                to="/shop"
                className={(s) => `${item(s)} inline-flex items-center gap-1`}
              >
                Shop <ChevronDown size={14} />
              </NavLink>
              <div className="invisible absolute left-0 top-full w-[34rem] translate-y-2 rounded-3xl border border-sand bg-white p-6 opacity-0 shadow-2xl transition-all group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="grid grid-cols-2 gap-6">
                  <ul className="space-y-1 text-sm">
                    {categories.map((c) => (
                      <li key={c}>
                        <Link
                          to={c === "All" ? "/shop" : `/shop?c=${c}`}
                          className="block rounded-xl px-3 py-2 hover:bg-sand/60"
                        >
                          {c === "All" ? "All products" : c}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="grid grid-cols-2 gap-3">
                    {featured.map((p) => (
                      <Link key={p.id} to={`/product/${p.id}`}>
                        <img
                          src={img(p.id, 200, 260)}
                          alt={p.name}
                          loading="lazy"
                          className="aspect-[3/4] rounded-2xl object-cover"
                        />
                        <p className="mt-1 text-xs">{p.name}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {links.map(([label, to]) => (
              <NavLink key={to} to={to} className={item}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center">
            <button
              onClick={onSearch}
              aria-label="Search"
              className="cursor-pointer rounded-full p-2.5 hover:bg-ink/5"
            >
              <Search size={19} />
            </button>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="hidden rounded-full p-2.5 hover:bg-ink/5 sm:block"
            >
              <Badge badgeContent={wish.length} color="secondary">
                <Heart size={19} />
              </Badge>
            </Link>
            <Link
              to={
                user
                  ? user.role === "admin"
                    ? "/admin"
                    : "/account"
                  : "/login"
              }
              aria-label={user ? "Dashboard" : "Sign in"}
              className="hidden rounded-full p-2.5 hover:bg-ink/5 sm:block"
            >
              <User size={19} />
            </Link>
            <button
              onClick={() => setOpen(true)}
              aria-label="Open bag"
              className="cursor-pointer rounded-full p-2.5 hover:bg-ink/5"
            >
              <Badge badgeContent={count} color="secondary">
                <ShoppingBag size={19} />
              </Badge>
            </button>
          </div>
        </div>
      </div>
      <Drawer
        anchor="left"
        open={menu}
        onClose={() => setMenu(false)}
        slotProps={{ paper: { sx: { width: 300, p: 3 } } }}
      >
        <div className="mb-6 flex items-center justify-between">
          <span className="text-xl font-bold">shovid.</span>
          <button
            onClick={() => setMenu(false)}
            aria-label="Close menu"
            className="cursor-pointer"
          >
            <X />
          </button>
        </div>
        <ul
          className="space-y-1 text-lg font-medium"
          onClick={() => setMenu(false)}
        >
          {[
            ["Shop", "/shop"],
            ...links,
            ["Wishlist", "/wishlist"],
            ["Account", "/account"],
            ["Stores", "/stores"],
            ["Help", "/faq"],
          ].map(([l, to]) => (
            <li key={to}>
              <Link
                to={to}
                className="block rounded-xl px-3 py-3 hover:bg-sand/60"
              >
                {l}
              </Link>
            </li>
          ))}
        </ul>
      </Drawer>
    </header>
  );
}
