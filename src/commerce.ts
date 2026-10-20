import type { Category, Product } from "@/data";

export type PlanId = "silver" | "gold" | "noir";
export type Cycle = "month" | "year";

export interface Plan {
  id: PlanId; name: string; price: Record<Cycle, number>; discount: number; freeShipAt: number;
  points: number; alterations: number; support: string; early: boolean; styling: boolean; color: string; perks: string[];
}

export const plans: Record<PlanId, Plan> = {
  silver: { id: "silver", name: "Silver", price: { month: 0, year: 0 }, discount: 0, freeShipAt: 150, points: 1, alterations: 0, support: "Standard", early: false, styling: false, color: "from-sky to-mint", perks: ["1 point per $1", "Free shipping over $150", "Standard support"] },
  gold: { id: "gold", name: "Gold", price: { month: 9, year: 90 }, discount: 5, freeShipAt: 75, points: 1.5, alterations: 2, support: "Priority", early: true, styling: false, color: "from-amber to-oxblood", perks: ["5% off every order", "1.5 points per $1", "Free shipping over $75", "2 free alterations a year", "Early access to sales", "Priority support"] },
  noir: { id: "noir", name: "Noir", price: { month: 29, year: 290 }, discount: 10, freeShipAt: 0, points: 2, alterations: 99, support: "Concierge", early: true, styling: true, color: "from-gold to-ink", perks: ["10% off every order", "2 points per $1", "Free shipping on everything", "Unlimited alterations", "Early access to sales", "Private styling session", "Concierge support"] },
};
export const planList = Object.values(plans);

export interface Promo { id: string; name: string; percent: number; scope: "all" | Category; schedule: string; when: (d: Date) => boolean }

export const promos: Promo[] = [
  { id: "fri", name: "Friday Flash", percent: 15, scope: "all", schedule: "Every Friday", when: (d) => d.getDay() === 5 },
  { id: "weekend", name: "Weekend Pullover Sale", percent: 20, scope: "Pullovers", schedule: "Every Saturday and Sunday", when: (d) => d.getDay() === 0 || d.getDay() === 6 },
  { id: "payday", name: "Payday Week", percent: 10, scope: "all", schedule: "First 7 days of every month", when: (d) => d.getDate() <= 7 },
  { id: "autumn", name: "Autumn Zip Hoodie Event", percent: 25, scope: "Zip Hoodies", schedule: "October and November", when: (d) => d.getMonth() === 9 || d.getMonth() === 10 },
];

export const activePromos = (d = new Date()) => promos.filter((p) => p.when(d));
export const promoPercent = (p: Product, d = new Date()) => Math.max(0, ...activePromos(d).filter((x) => x.scope === "all" || x.scope === p.category).map((x) => x.percent));

export interface Coupon { code: string; off: number; on: boolean }
export interface Line { product: Product; qty: number }

export function quote(lines: Line[], plan: Plan, coupon?: Coupon) {
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const promo = lines.reduce((s, l) => s + (l.product.price * l.qty * promoPercent(l.product)) / 100, 0);
  const member = ((subtotal - promo) * plan.discount) / 100;
  const code = ((subtotal - promo - member) * (coupon?.on ? coupon.off : 0)) / 100;
  const raw = promo + member + code;
  const k = raw > subtotal * 0.4 ? (subtotal * 0.4) / raw : 1;
  const net = subtotal - raw * k;
  const shipping = lines.length === 0 || net >= plan.freeShipAt ? 0 : 15;
  const total = Math.round((net + shipping) * 100) / 100;
  return { subtotal, promo: promo * k, member: member * k, coupon: code * k, shipping, total, points: Math.floor(total * plan.points), capped: k < 1 };
}
