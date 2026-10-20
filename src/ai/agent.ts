import { activePromos, planList, promoPercent, type Coupon, type Plan } from "@/commerce";
import { discountFor, likesFor, products, ratingOf, reviewsFor, sizes, stores, type Category, type Product } from "@/data";
import type { Account, StoredOrder } from "@/auth";
import { classify } from "./intent";
import { docs, retrieve } from "./knowledge";
import { terms } from "./nlp";
import { money, money2 } from "@/lib/utils";

export interface Ctx { user: Account | null; plan: Plan; points: number; orders: StoredOrder[]; coupons: Coupon[]; cartCount: number; cartTotal: number }
export interface Filters { category?: Category; maxPrice?: number; minPrice?: number; color?: string[]; sale?: boolean; q?: string[] }
export interface Memory { filters: Filters; shown: string[]; last: string[] }
export interface Reply { text: string; items?: Product[]; links?: Array<{ label: string; to: string }>; tools: string[]; intent: string; confidence: number; suggest: string[]; addIds?: string[] }

export const newMemory = (): Memory => ({ filters: {}, shown: [], last: [] });

const categoryWords: Array<[RegExp, Category]> = [[/\b(run|running|runner|racer|jog|marathon)s?\b/, "Running"], [/\b(lifestyle|casual|everyday|minimal|daily)\b/, "Lifestyle"], [/\b(high-?top|mid-?top|basketball)s?\b/, "High Tops"], [/\b(trail|hik\w*|outdoor|mountain)s?\b/, "Trail"], [/\b(court|tennis|retro)s?\b/, "Court"]];
const colorWords: Record<string, string[]> = { black: ["black"], white: ["white", "tan"], cream: ["white", "tan"], ivory: ["white", "tan"], grey: ["grey"], gray: ["grey"], brown: ["brown"], tan: ["tan"], camel: ["tan", "brown"], beige: ["tan", "white"], red: ["red"], burgundy: ["red"], wine: ["red"], pink: ["pink", "red"], blue: ["blue"], navy: ["blue"], green: ["green"], olive: ["green"], purple: ["purple"], gold: ["gold", "tan"] };
const generic = new Set(["recommend", "show", "find", "want", "look", "looking", "something", "need", "buy", "suggest", "give", "idea", "under", "below", "over", "above", "cheap", "cheaper", "another", "more", "other", "option", "good", "best", "nice", "winter", "summer", "outfit", "sale"]);

function family(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d) { h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360; }
  if (l < 0.18) return "black";
  if (l > 0.9) return "white";
  if (s < 0.14) return l > 0.7 ? "white" : "grey";
  if (h < 15 || h >= 345) return "red";
  if (h < 45) return l < 0.5 ? "brown" : "tan";
  if (h < 70) return "gold";
  if (h < 170) return "green";
  if (h < 260) return "blue";
  return h < 300 ? "purple" : "pink";
}

function entities(t: string): Filters {
  const f: Filters = {};
  f.category = categoryWords.find(([r]) => r.test(t))?.[1];
  const between = t.match(/between \$?(\d+) and \$?(\d+)/);
  const max = t.match(/(?:under|below|less than|max(?:imum)?|up to|within|cheaper than)\s*\$?(\d{2,5})/) ?? t.match(/\$(\d{2,5})/);
  const min = t.match(/(?:over|above|more than|at least|from)\s*\$?(\d{2,5})/);
  if (between) { f.minPrice = Number(between[1]); f.maxPrice = Number(between[2]); }
  else { if (max) f.maxPrice = Number(max[1]); if (min) f.minPrice = Number(min[1]); }
  const color = Object.keys(colorWords).find((w) => new RegExp(`\\b${w}\\b`).test(t));
  if (color) f.color = colorWords[color];
  if (/\b(sale|discount|deal|offer)\b/.test(t)) f.sale = true;
  const known = new Set([...Object.keys(colorWords), "sneaker", "runner", "trainer", "shoe", "hightop", "trail", "court", "running"]);
  const q = terms(t).filter((w) => !generic.has(w) && !/^\d+$/.test(w) && (known.has(w) || w.length > 4));
  if (q.length) f.q = q;
  return f;
}

function searchCatalog(f: Filters, skip: string[]) {
  const words = f.q ?? [];
  return products
    .filter((p) => (!f.category || p.category === f.category) && (f.maxPrice === undefined || p.price <= f.maxPrice) && (f.minPrice === undefined || p.price >= f.minPrice) && (!f.color || f.color.includes(family(p.tone))) && (!f.sale || discountFor(p) > 0) && !skip.includes(p.id))
    .map((p) => {
      const t = new Set(terms(`${p.name} ${p.note} ${p.category}`));
      return { p, s: words.filter((w) => t.has(w)).length * 3 + likesFor(p) / 400 + ratingOf(p) };
    })
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p);
}

const describe = (f: Filters) => [f.category && f.category.toLowerCase(), f.color && `in ${f.color[0]}`, f.maxPrice !== undefined && `under ${money(f.maxPrice)}`, f.minPrice !== undefined && `over ${money(f.minPrice)}`, f.sale && "on sale"].filter(Boolean).join(" ");
const base = ["Recommend a running shoe under $200", "Show the best reviewed shoes", "Which items have the biggest discounts?", "Where is my order?", "What is your return policy?"];

const reviewStats = (p: Product) => { const r = reviewsFor(p); return { n: r.length, pos: r.filter((x) => x.rating >= 4).length, rating: ratingOf(p) }; };
const effective = (p: Product) => Math.round((1 - (1 - discountFor(p) / 100) * (1 - promoPercent(p) / 100)) * 100);
const nowPrice = (p: Product) => Math.round(p.price * (1 - effective(p) / 100));
const named = (t: string) => { const q = new Set(terms(t)); return products.filter((p) => terms(p.name).every((w) => q.has(w))); };
interface Rank { title: string; filter?: (p: Product) => boolean; sort: (a: Product, b: Product) => number; text: (p: Product) => string }
const ranks: Partial<Record<string, Rank>> = {
  top_discount: { title: "biggest discounts", filter: (p) => effective(p) > 0, sort: (a, b) => effective(b) - effective(a), text: (p) => `${p.name}: ${effective(p)}% off, now ${money(nowPrice(p))} (was ${money(p.price)})` },
  top_rated: { title: "best reviewed", sort: (a, b) => reviewStats(b).pos - reviewStats(a).pos || reviewStats(b).rating - reviewStats(a).rating, text: (p) => `${p.name}: ${reviewStats(p).rating.toFixed(1)} stars, ${reviewStats(p).pos} of ${reviewStats(p).n} reviews positive` },
  popular: { title: "most popular", sort: (a, b) => likesFor(b) - likesFor(a), text: (p) => `${p.name}: ${likesFor(p)} likes, ${money(p.price)}` },
  cheapest: { title: "lowest prices", sort: (a, b) => a.price - b.price, text: (p) => `${p.name}: ${money(p.price)}` },
  priciest: { title: "premium models", sort: (a, b) => b.price - a.price, text: (p) => `${p.name}: ${money(p.price)}` },
  new_arrivals: { title: "new arrivals", sort: (a, b) => Number(b.id.slice(1)) - Number(a.id.slice(1)), text: (p) => `${p.name}: ${money(p.price)}, ${p.category}` },
};

export function respond(text: string, ctx: Ctx, mem: Memory): Reply {
  const t = text.toLowerCase();
  const ranked = classify(text);
  let { intent, p: confidence } = ranked[0];
  const tools = ["intent_model"];
  const e = entities(t);
  const follow = /\b(cheaper|less expensive|lower price)\b/.test(t) ? "cheaper" : /\b(pricier|more expensive|premium)\b/.test(t) ? "pricier" : /\b(another|something else|more options|other options|different|next)\b/.test(t) ? "more" : /\b(start over|reset|new search)\b/.test(t) ? "reset" : null;
  const orderId = text.match(/SH-\d{4,6}/i)?.[0].toUpperCase();
  const shopping = !!(e.category || e.maxPrice !== undefined || e.minPrice !== undefined || e.color || e.sale);
  const nonShop = ["order_status", "returns", "shipping", "size_help", "human", "points", "membership", "payment", "care", "cart", "greeting", "thanks", "top_discount", "top_rated", "popular", "cheapest", "priciest", "new_arrivals", "stock", "product_info", "compare", "stores", "careers", "about", "stats"];
  if (confidence < 0.4) intent = "unknown";
  const mentioned = named(t);
  if (mentioned.length >= 2) intent = "compare";
  else if (mentioned.length === 1 && ["unknown", "recommend", "product_info"].includes(intent)) intent = "product_info";
  if ((shopping && !nonShop.includes(intent)) || (follow && Object.keys(mem.filters).length)) intent = "recommend";
  if (intent === "discount" && shopping) intent = "recommend";
  const out = (r: Partial<Reply> & { text: string }): Reply => ({ tools, intent, confidence: Math.round(confidence * 100), suggest: base.slice(0, 3), ...r });
  const name = ctx.user?.name.split(" ")[0];

  switch (intent) {
    case "greeting": return out({ text: `Hello${name ? ` ${name}` : ""}, I am Shovi. I can find products, check your orders, explain policies and manage your bag. ${ctx.user ? `You are on the ${ctx.plan.name} plan with ${ctx.points.toLocaleString()} points.` : ""}`, suggest: base });
    case "thanks": return out({ text: "You are welcome. Anything else I can help with?" });
    case "order_status": {
      tools.push("get_orders");
      if (!ctx.user) return out({ text: orderId ? "For privacy I can only look up orders when you are signed in. You can also use the tracking page with your order number and phone or email." : "Sign in and I can list your orders, or use the tracking page with your order number.", links: [{ label: "Track an order", to: "/track" }, { label: "Sign in", to: "/login" }] });
      const mine = ctx.orders.filter((o) => o.email === ctx.user?.email);
      const hit = orderId ? mine.find((o) => o.id === orderId) : undefined;
      if (orderId && !hit) return out({ text: `I could not find ${orderId} on your account.`, links: [{ label: "Track an order", to: "/track" }] });
      const list = hit ? [hit] : mine.slice(0, 3);
      if (!list.length) return out({ text: "You do not have any orders yet." });
      return out({ text: list.map((o) => `${o.id}: ${o.status}, ${money2(o.total)}, placed ${o.date}`).join("\n"), links: [{ label: "All my orders", to: "/account/orders" }], suggest: ["What is your return policy?", "Talk to a human"] });
    }
    case "membership": {
      tools.push("get_plans");
      if (/cancel/.test(t)) return out({ text: "You can cancel or change your plan any time from your subscription page.", links: [{ label: "Subscription", to: "/account/subscription" }] });
      const upgrade = planList[planList.findIndex((x) => x.id === ctx.plan.id) + 1];
      return out({ text: `${ctx.user ? `You are on ${ctx.plan.name}: ${ctx.plan.discount}% off, ${ctx.plan.points}x points, ${ctx.plan.support} support. ` : ""}${upgrade ? `${upgrade.name} adds ${upgrade.perks.slice(0, 3).join(", ")} for $${upgrade.price.month} a month.` : "You are on our top plan."} ${planList.map((x) => `${x.name}: ${x.discount}% off`).join(", ")}.`, links: [{ label: "Compare plans", to: "/membership" }] });
    }
    case "points": {
      tools.push("get_points");
      if (!ctx.user) return out({ text: "Members earn 1 to 2 points per dollar depending on their plan. Sign in to see your balance.", links: [{ label: "Sign in", to: "/login" }] });
      const next = [[500, "$10 voucher"], [1200, "free repair"], [2500, "$50 voucher"], [4000, "private styling session"]].find(([c]) => (c as number) > ctx.points);
      return out({ text: `You have ${ctx.points.toLocaleString()} points and earn ${ctx.plan.points}x on every order. ${next ? `Your next reward is a ${next[1]} at ${next[0]} points.` : "You can redeem any reward."}`, links: [{ label: "Rewards", to: "/account/rewards" }] });
    }
    case "discount": {
      tools.push("get_promotions");
      const live = activePromos();
      const codes = ctx.coupons.filter((c) => c.on && c.code !== "VIP30").map((c) => `${c.code} (${c.off}%)`);
      return out({ text: `${live.length ? `Live today: ${live.map((x) => `${x.name} ${x.percent}% off ${x.scope === "all" ? "everything" : x.scope}`).join(", ")}.` : "No recurring promotion is live today."} Coupon codes: ${codes.join(", ")}. ${ctx.plan.discount ? `Your ${ctx.plan.name} plan adds ${ctx.plan.discount}% on top.` : "Memberships add an extra discount to every order."}`, links: [{ label: "All promotions", to: "/promotions" }], suggest: ["Show items on sale", "Tell me about membership"] });
    }
    case "cart": {
      tools.push("get_cart");
      if (/\badd\b/.test(t) && mem.last.length) {
        const pick = products.find((x) => x.id === mem.last[0]);
        if (pick) return out({ text: `Added ${pick.name} to your bag.`, addIds: [pick.id], links: [{ label: "Checkout", to: "/checkout" }], suggest: ["Show my bag", "Show cheaper options"] });
      }
      return out({ text: ctx.cartCount ? `Your bag has ${ctx.cartCount} item${ctx.cartCount > 1 ? "s" : ""}, subtotal ${money2(ctx.cartTotal)}.` : "Your bag is empty.", links: [{ label: "Checkout", to: "/checkout" }] });
    }
    case "top_discount": case "top_rated": case "popular": case "cheapest": case "priciest": case "new_arrivals": {
      const r = ranks[intent]!;
      tools.push(`rank_products(${intent})`);
      const m = t.match(/\b(?:top|best|first)\s+(\d{1,2})\b|\b(\d{1,2})\s+(?:products|items|shoes|sneakers|pairs|models)\b/);
      const n = Math.min(8, Math.max(1, Number(m?.[1] ?? m?.[2] ?? 4)));
      const list = products.filter((p) => (!e.category || p.category === e.category) && (e.maxPrice === undefined || p.price <= e.maxPrice) && (e.minPrice === undefined || p.price >= e.minPrice) && (!e.color || e.color.includes(family(p.tone))) && (r.filter ? r.filter(p) : true)).sort(r.sort).slice(0, n);
      if (!list.length) return out({ text: `Nothing matches for ${r.title} with those filters.`, suggest: base.slice(0, 3) });
      mem.last = list.map((x) => x.id); mem.shown = [...new Set([...mem.shown, ...mem.last])];
      return out({ text: `Top ${list.length} ${r.title}${describe(e) ? ` for ${describe(e)}` : ""}:\n${list.map((p, i) => `${i + 1}. ${r.text(p)}`).join("\n")}`, items: list.slice(0, 4), suggest: ["Add the first one to my bag", "Show the best reviewed shoes", "Which items have the biggest discounts?"] });
    }
    case "product_info": case "stock": {
      const p = mentioned[0];
      if (!p) {
        if (intent === "stock") {
          tools.push("get_stock");
          const low = products.filter((x) => x.stock < 15).sort((a, b) => a.stock - b.stock).slice(0, 5);
          return out({ text: `Running low right now:\n${low.map((x) => `${x.name}: ${x.stock} pairs left`).join("\n")}`, items: low.slice(0, 3), suggest: base.slice(0, 3) });
        }
        return out({ text: "Which model do you mean? Tell me the name, for example Nova Runner.", suggest: ["Show the best reviewed shoes", "Show best sellers"] });
      }
      tools.push(`get_product(${p.id})`);
      const s = reviewStats(p), d = effective(p);
      mem.last = [p.id]; mem.shown = [...new Set([...mem.shown, p.id])];
      return out({ text: `${p.name} (${p.category}), ${money(p.price)}${d ? `, ${d}% off today so ${money(nowPrice(p))}` : ""}. ${p.note}. Rated ${s.rating.toFixed(1)} from ${s.n} reviews (${s.pos} positive) with ${likesFor(p)} likes. ${p.stock < 15 ? `Only ${p.stock} pairs left` : `${p.stock} pairs in stock`}, sizes EU ${sizes.join(", ")}.`, items: [p], links: [{ label: "Open product page", to: `/product/${p.id}` }], suggest: ["Add it to my bag", "Show the best reviewed shoes", "Show best sellers"] });
    }
    case "compare": {
      const [a, b] = mentioned;
      if (!a || !b) return out({ text: "Name two models to compare, for example Nova Runner and Pulse Racer.", suggest: ["Show the best reviewed shoes"] });
      tools.push(`compare(${a.id},${b.id})`);
      const sa = reviewStats(a), sb = reviewStats(b);
      const row = (p: Product, s: ReturnType<typeof reviewStats>) => `${p.name}: ${money(p.price)}, ${s.rating.toFixed(1)} stars (${s.n} reviews), ${p.stock} in stock, ${p.category}`;
      mem.last = [a.id, b.id]; mem.shown = [...new Set([...mem.shown, a.id, b.id])];
      return out({ text: `${row(a, sa)}\n${row(b, sb)}\n${sa.rating === sb.rating ? "They are rated equally" : `${sa.rating > sb.rating ? a.name : b.name} is rated higher`}, ${a.price === b.price ? "and they cost the same" : `and ${a.price < b.price ? a.name : b.name} is ${money(Math.abs(a.price - b.price))} cheaper`}.`, items: [a, b], suggest: ["Add the first one to my bag", "Show the best reviewed shoes"] });
    }
    case "stores": {
      tools.push("get_stores");
      return out({ text: stores.map(([n, a, h, p]) => `${n}: ${a}, ${h}, ${p}`).join("\n"), links: [{ label: "Store locator", to: "/stores" }] });
    }
    case "stats": {
      tools.push("get_catalogue_stats");
      const prices = products.map((x) => x.price);
      const cats = [...new Set(products.map((x) => x.category))];
      const reviews = products.reduce((s, x) => s + reviewsFor(x).length, 0);
      const avg = products.reduce((s, x) => s + ratingOf(x), 0) / products.length;
      return out({ text: `We carry ${products.length} models in ${cats.length} categories (${cats.join(", ")}), from ${money(Math.min(...prices))} to ${money(Math.max(...prices))}. The average rating is ${avg.toFixed(1)} from ${reviews} reviews. ${products.filter((x) => discountFor(x) > 0).length} models are on sale and ${products.filter((x) => x.stock < 15).length} are running low.`, suggest: base.slice(0, 3) });
    }
    case "recommend": {
      tools.push("search_catalog");
      if (follow === "reset") mem.filters = {};
      const prev = mem.filters;
      const shownProducts = mem.last.map((id) => products.find((x) => x.id === id)).filter((x): x is Product => Boolean(x));
      const f: Filters = { ...prev };
      (Object.keys(e) as Array<keyof Filters>).forEach((k) => { if (e[k] !== undefined) (f as Record<string, unknown>)[k] = e[k]; });
      if (follow === "cheaper" && shownProducts.length) { f.maxPrice = Math.round(Math.min(...shownProducts.map((x) => x.price)) * 0.99); delete f.minPrice; }
      if (follow === "pricier" && shownProducts.length) { f.minPrice = Math.round(Math.max(...shownProducts.map((x) => x.price)) * 1.01); delete f.maxPrice; }
      if (e.category && e.category !== prev.category && !e.q) delete f.q;
      const skip = follow === "more" ? mem.shown : [];
      const steps: Filters[] = [f, { ...f, color: undefined }, { ...f, color: undefined, maxPrice: undefined, minPrice: undefined }, { category: f.category }];
      const used = steps.findIndex((s) => searchCatalog(s, skip).length > 0);
      const items = used >= 0 ? searchCatalog(steps[used], skip).slice(0, 3) : [];
      tools[tools.length - 1] = `search_catalog(${describe(used >= 0 ? steps[used] : f) || "all"})`;
      if (!items.length) return out({ text: "I have nothing left that matches. Try changing the budget or category.", suggest: ["Start over", "Show items on sale"] });
      mem.filters = steps[used]; mem.last = items.map((x) => x.id); mem.shown = [...new Set([...mem.shown, ...mem.last])];
      const relaxed = used > 0 ? ` Nothing matched every filter, so I relaxed ${used === 1 ? "the colour" : "the budget"}.` : "";
      return out({ text: `Here ${items.length === 1 ? "is 1 pick" : `are ${items.length} picks`}${describe(steps[used]) ? ` for ${describe(steps[used])}` : ""}, ranked by relevance, ratings and likes.${relaxed}`, items, suggest: ["Show cheaper options", "Something else", "Add the first one to my bag"] });
    }
    default: {
      const intentDoc: Record<string, string> = { returns: "returns", shipping: "shipping", size_help: "sizing", payment: "payment", gift: "gifts", human: "contact", careers: "careers", about: "about" };
      const direct = intentDoc[intent] ? docs.find((d) => d.id === intentDoc[intent]) : undefined;
      const hits = retrieve(text, intent === "care" ? "care" : undefined, 3);
      const top = direct ?? (hits[0] && (intent !== "unknown" || hits[0].score >= 1.2) ? hits[0].doc : undefined);
      tools.push(`retrieve_docs(${top?.id ?? "none"})`);
      if (!top) return out({ text: "I am not sure about that one. I can find and compare shoes, rank by discounts or reviews, check orders, explain shipping, returns and sizing, or connect you with an advisor.", links: [{ label: "Contact an advisor", to: "/contact" }], suggest: base });
      const product = top.id.startsWith("product-") ? products.find((x) => `product-${x.id}` === top.id) : undefined;
      if (product) { mem.last = [product.id]; return out({ text: top.text, items: [product], links: [{ label: "Open product page", to: `/product/${product.id}` }], suggest: ["Add it to my bag", "Show best sellers"] }); }
      const extra = intent === "shipping" && ctx.plan.id !== "silver" ? ` With ${ctx.plan.name} shipping is free over ${ctx.plan.freeShipAt ? `$${ctx.plan.freeShipAt}` : "$0"}.` : "";
      return out({ text: top.text + extra, links: top.link ? [{ label: top.title, to: top.link }] : undefined, suggest: intent === "care" ? ["How to clean white sneakers", "Recommend a running shoe under $200"] : base.slice(0, 3) });
    }
  }
}
