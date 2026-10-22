import { useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { Bell, ChevronsLeft, Crown, CreditCard, Gift, Heart, LayoutDashboard, LogOut, MapPin, Package, Settings, ShoppingCart, Sparkles, Star, Tag, Users, type LucideIcon } from "lucide-react";
import { useApp } from "@/auth";
import { useToast } from "@/toast";
import { cn, money } from "@/lib/utils";

type Group = [title: string, items: Array<[to: string, label: string, Icon: LucideIcon]>];

const menus: Record<"admin" | "member", Group[]> = {
  admin: [
    ["Overview", [["/admin", "Dashboard", LayoutDashboard]]],
    ["Commerce", [["/admin/orders", "Orders", ShoppingCart], ["/admin/products", "Products", Package], ["/admin/customers", "Customers", Users]]],
    ["Growth", [["/admin/reviews", "Reviews", Star], ["/admin/coupons", "Coupons", Tag]]],
    ["System", [["/admin/settings", "Settings", Settings]]],
  ],
  member: [
    ["Account", [["/account", "Overview", LayoutDashboard], ["/account/orders", "My orders", Package], ["/account/subscription", "Subscription", CreditCard], ["/account/wishlist", "Wishlist", Heart]]],
    ["Profile", [["/account/addresses", "Addresses", MapPin], ["/account/rewards", "Rewards", Gift], ["/account/settings", "Settings", Settings]]],
  ],
};

export default function Dashboard({ kind }: { kind: "admin" | "member" }) {
  const { user, plan, points, orders, logout } = useApp();
  const toast = useToast();
  const { pathname } = useLocation();
  const [slim, setSlim] = useState(false);

  if (!user) return <Navigate to={`/login?next=${kind === "admin" ? "/admin" : "/account"}`} replace />;
  if (user.role !== kind) return <Navigate to={user.role === "admin" ? "/admin" : "/account"} replace />;

  const groups = menus[kind];
  const flat = groups.flatMap(([, items]) => items);
  const here = flat.find(([to]) => to === pathname)?.[1] ?? "";
  const mine = orders.filter((o) => o.email === user.email);
  const pending = orders.filter((o) => o.status === "Processing").length;
  const active = mine.filter((o) => o.status === "Processing" || o.status === "Shipped").length;
  const today = orders.filter((o) => o.date === new Date().toISOString().slice(0, 10)).reduce((s, o) => s + o.total, 0);
  const badge = (to: string) => (kind === "admin" && to === "/admin/orders" ? pending : kind === "member" && to === "/account/orders" ? active : 0);
  const link = ({ isActive }: { isActive: boolean }) => cn("flex h-12 items-center gap-3 rounded-2xl text-[15px] transition-all", slim ? "justify-center" : "px-4", isActive ? "bg-ink font-medium text-white shadow-lg shadow-ink/20" : "text-ink/65 hover:bg-sand/60 hover:text-ink");
  const chips = kind === "admin" ? [[Sparkles, `${pending} to fulfil`], [Crown, `${money(today)} today`]] as const : [[Crown, `${plan.name} plan`], [Sparkles, `${points.toLocaleString()} points`]] as const;

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 pt-6 md:px-6">
      <aside className={cn("sticky top-28 hidden h-[calc(100vh-8rem)] shrink-0 flex-col rounded-[2rem] bg-white py-6 ring-1 ring-sand transition-all duration-300 lg:flex", slim ? "w-24 px-4" : "w-72 px-5")} aria-label="Dashboard">
        <div className={cn("flex items-center gap-3", slim && "justify-center")}>
          <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br text-lg font-semibold text-white", kind === "admin" ? "from-ink to-gold" : plan.color)}>{user.name[0]}</span>
          {!slim && <div className="min-w-0"><p className="truncate font-semibold">{user.name}</p><p className="truncate text-xs text-ink/50">{kind === "admin" ? "Administrator" : `${plan.name} member`}</p></div>}
        </div>
        <nav className="mt-8 flex-1 space-y-8 overflow-y-auto pr-1">
          {groups.map(([title, items]) => (
            <div key={title}>
              {!slim && <p className="mb-3 px-4 text-xs font-medium text-ink/40">{title}</p>}
              <div className="space-y-1.5">{items.map(([to, label, Icon]) => (
                <NavLink key={to} to={to} end title={label} className={link}>
                  <Icon size={19} className="shrink-0" />{!slim && <span className="flex-1">{label}</span>}
                  {!slim && badge(to) > 0 && <span className="rounded-full bg-oxblood px-2 py-0.5 text-[11px] font-medium text-white">{badge(to)}</span>}
                </NavLink>
              ))}</div>
            </div>
          ))}
        </nav>
        <div className="mt-6 space-y-1.5 border-t border-sand pt-5">
          <button onClick={() => { logout(); toast("Signed out", "info"); }} title="Sign out" className={cn(link({ isActive: false }), "w-full cursor-pointer")}><LogOut size={19} />{!slim && "Sign out"}</button>
          <button onClick={() => setSlim(!slim)} aria-label="Collapse sidebar" className={cn(link({ isActive: false }), "w-full cursor-pointer")}><ChevronsLeft size={19} className={cn("transition-transform", slim && "rotate-180")} />{!slim && "Collapse"}</button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <nav className="no-scrollbar mb-5 flex gap-2 overflow-x-auto lg:hidden" aria-label="Dashboard sections">{flat.map(([to, label, Icon]) => <NavLink key={to} to={to} end className={({ isActive }) => cn("flex h-11 shrink-0 items-center gap-2 rounded-full border px-5 text-sm", isActive ? "border-ink bg-ink text-white" : "border-sand bg-white")}><Icon size={15} />{label}</NavLink>)}</nav>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white px-5 py-3 ring-1 ring-sand">
          <p className="text-sm text-ink/50">{kind === "admin" ? "Back office" : "Member area"} <span className="mx-1">/</span> <span className="font-medium text-ink">{here}</span></p>
          <div className="flex items-center gap-2">
            {chips.map(([Icon, text]) => <span key={text} className="hidden items-center gap-1.5 rounded-full bg-sand/60 px-3 py-1.5 text-xs sm:flex"><Icon size={13} className="text-gold" />{text}</span>)}
            <Link to="/contact" className="rounded-full px-3 py-1.5 text-xs text-ink/60 hover:text-ink">Help</Link>
            <span className="relative rounded-full bg-sand/60 p-2"><Bell size={15} />{(kind === "admin" ? pending : active) > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-oxblood" />}</span>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
