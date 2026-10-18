import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { orders as seedOrders, type Order, type OrderStatus } from "@/data";
import { plans, type Coupon, type Cycle, type Plan, type PlanId } from "@/commerce";

export type Role = "admin" | "member";
export interface Account { email: string; password: string; name: string; role: Role }
export interface Subscription { plan: PlanId; cycle: Cycle; since: string; renews: string; alterationsUsed: number }
export interface StoredOrder extends Order { email: string; items: string[]; discount: number; shipping: number; phone?: string; payment?: string }
export interface Address { id: number; label: string; line: string; phone: string; postcode: string; lat?: number; lng?: number }
interface Data { users: Account[]; session: string | null; subs: Record<string, Subscription>; orders: StoredOrder[]; addresses: Record<string, Address[]>; points: Record<string, number>; coupons: Coupon[] }
interface Result { error?: string; role?: Role }

export const demo = { admin: { email: "admin@shovid.example", password: "Admin123!" }, member: { email: "member@shovid.example", password: "Member123!" } };
const KEY = "shovid-app-v2";
const iso = (days: number) => new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);
const mk = (id: string, total: number, date: string, status: OrderStatus): StoredOrder => ({ id, customer: "Amara Voss", total, status, date, email: demo.member.email, items: ["Aurelia Cashmere Roll Neck x1"], discount: 0, shipping: 0 });

const seed = (): Data => ({
  users: [{ ...demo.admin, name: "Store Admin", role: "admin" }, { ...demo.member, name: "Amara Voss", role: "member" }],
  session: null,
  subs: { [demo.member.email]: { plan: "gold", cycle: "month", since: iso(-75), renews: iso(15), alterationsUsed: 0 } },
  orders: [...seedOrders.map((o): StoredOrder => ({ ...o, email: o.customer === "Amara Voss" ? demo.member.email : `${o.customer.split(" ")[0].toLowerCase()}@mail.example`, items: ["Order items"], discount: 0, shipping: 0 })), mk("SH-10390", 640, "2026-09-02", "Delivered"), mk("SH-10311", 320, "2026-08-11", "Delivered")],
  addresses: { [demo.member.email]: [{ id: 1, label: "Home", line: "Torstrasse 100, Berlin", phone: "+49 30 1234567", postcode: "10119" }] },
  points: { [demo.member.email]: 4200 },
  coupons: [{ code: "WELCOME10", off: 10, on: true }, { code: "WINTER20", off: 20, on: true }, { code: "VIP30", off: 30, on: false }],
});

function load(): Data {
  try { const raw = localStorage.getItem(KEY); return raw ? { ...seed(), ...JSON.parse(raw) } : seed(); } catch { return seed(); }
}

interface AppState {
  user: Account | null; plan: Plan; sub: Subscription | null; points: number; orders: StoredOrder[]; addresses: Address[]; coupons: Coupon[]; allUsers: Account[];
  login: (email: string, password: string) => Result; register: (name: string, email: string, password: string) => Result; logout: () => void;
  subscribe: (plan: PlanId, cycle: Cycle) => void; cancelSub: () => void; bookAlteration: () => boolean;
  placeOrder: (o: { items: string[]; total: number; discount: number; shipping: number; points: number; email: string; customer: string; phone: string; payment: string }) => string;
  setOrderStatus: (id: string, s: OrderStatus) => void; addAddress: (a: Omit<Address, "id">) => void; removeAddress: (id: number) => void;
  redeem: (cost: number) => boolean; setCoupons: (f: (c: Coupon[]) => Coupon[]) => void;
}

const Ctx = createContext<AppState | null>(null);
export const useApp = () => { const v = useContext(Ctx); if (!v) throw new Error("useApp must be used inside AppProvider"); return v; };

export function AppProvider({ children }: { children: ReactNode }) {
  const [d, setD] = useState<Data>(load);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* storage unavailable */ } }, [d]);

  const value = useMemo<AppState>(() => {
    const user = d.users.find((u) => u.email === d.session) ?? null;
    const email = user?.email ?? "";
    const sub = d.subs[email] ?? null;
    return {
      user, sub, plan: plans[sub?.plan ?? "silver"], points: d.points[email] ?? 0, orders: d.orders, addresses: d.addresses[email] ?? [], coupons: d.coupons, allUsers: d.users,
      login: (e, p) => {
        const u = d.users.find((x) => x.email.toLowerCase() === e.trim().toLowerCase() && x.password === p);
        if (!u) return { error: "Incorrect email or password" };
        setD((s) => ({ ...s, session: u.email }));
        return { role: u.role };
      },
      register: (name, e, p) => {
        const mail = e.trim().toLowerCase();
        if (d.users.some((x) => x.email === mail)) return { error: "An account with this email already exists" };
        setD((s) => ({ ...s, users: [...s.users, { email: mail, password: p, name: name.trim(), role: "member" }], session: mail }));
        return { role: "member" };
      },
      logout: () => setD((s) => ({ ...s, session: null })),
      subscribe: (plan, cycle) => setD((s) => ({ ...s, subs: { ...s.subs, [email]: { plan, cycle, since: iso(0), renews: iso(cycle === "year" ? 365 : 30), alterationsUsed: 0 } } })),
      cancelSub: () => setD((s) => { const { [email]: _gone, ...rest } = s.subs; return { ...s, subs: rest }; }),
      bookAlteration: () => {
        if (!sub || sub.alterationsUsed >= plans[sub.plan].alterations) return false;
        setD((s) => ({ ...s, subs: { ...s.subs, [email]: { ...sub, alterationsUsed: sub.alterationsUsed + 1 } } }));
        return true;
      },
      placeOrder: (o) => {
        const id = `SH-${10500 + d.orders.length}`;
        setD((s) => ({ ...s, orders: [{ id, customer: o.customer, email: o.email.toLowerCase(), total: o.total, status: "Processing", date: iso(0), items: o.items, discount: o.discount, shipping: o.shipping, phone: o.phone, payment: o.payment }, ...s.orders], points: email ? { ...s.points, [email]: (s.points[email] ?? 0) + o.points } : s.points }));
        return id;
      },
      setOrderStatus: (id, status) => setD((s) => ({ ...s, orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) })),
      addAddress: (a) => setD((s) => ({ ...s, addresses: { ...s.addresses, [email]: [...(s.addresses[email] ?? []), { ...a, id: Date.now() }] } })),
      removeAddress: (id) => setD((s) => ({ ...s, addresses: { ...s.addresses, [email]: (s.addresses[email] ?? []).filter((x) => x.id !== id) } })),
      redeem: (cost) => {
        if ((d.points[email] ?? 0) < cost) return false;
        setD((s) => ({ ...s, points: { ...s.points, [email]: (s.points[email] ?? 0) - cost } }));
        return true;
      },
      setCoupons: (f) => setD((s) => ({ ...s, coupons: f(s.coupons) })),
    };
  }, [d]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
