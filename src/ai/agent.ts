import { activePromos, planList, promoPercent, type Coupon, type Plan } from "@/commerce";
import { discountFor, likesFor, products, ratingOf, reviewsFor, sizes, stores, type Category, type Product } from "@/data";
import type { Account, StoredOrder } from "@/auth";
import { classify } from "./intent";
import { docs, retrieve } from "./knowledge";
import { isPersian, normalize, terms } from "./nlp";
import { money, money2 } from "@/lib/utils";

export type Lang = "en" | "fa";
export interface Ctx { user: Account | null; plan: Plan; points: number; orders: StoredOrder[]; coupons: Coupon[]; cartCount: number; cartTotal: number }
export interface Filters { category?: Category; maxPrice?: number; minPrice?: number; color?: string[]; sale?: boolean; q?: string[] }
export interface Memory { filters: Filters; shown: string[]; last: string[] }
export interface Reply { text: string; items?: Product[]; links?: Array<{ label: string; to: string }>; tools: string[]; intent: string; confidence: number; suggest: string[]; lang: Lang }

export const newMemory = (): Memory => ({ filters: {}, shown: [], last: [] });

const categoryWords: Array<[RegExp, Category]> = [
  [/\b(run|running|runner|racer|jog|marathon)s?\b|دویدن|رانینگ|ماراتن/, "Running"],
  [/\b(lifestyle|casual|everyday|minimal|daily)\b|روزمره|کژوال|شهری|مینیمال|راحت/, "Lifestyle"],
  [/\b(high-?top|mid-?top|basketball)s?\b|ساق ?بلند|های ?تاپ|مید ?تاپ|بسکتبال/, "High Tops"],
  [/\b(trail|hik\w*|outdoor|mountain)s?\b|تریل|کوه|طبیعت|هایکینگ|پیاده ?روی/, "Trail"],
  [/\b(court|tennis|retro)s?\b|تنیس|کورت/, "Court"],
];
const categoryFa: Record<Category, string> = { Running: "دویدن", Lifestyle: "روزمره", "High Tops": "ساق‌بلند", Trail: "تریل", Court: "کورت" };
const colorWords: Record<string, string[]> = { black: ["black"], white: ["white", "tan"], cream: ["white", "tan"], ivory: ["white", "tan"], grey: ["grey"], gray: ["grey"], brown: ["brown"], tan: ["tan"], camel: ["tan", "brown"], beige: ["tan", "white"], red: ["red"], burgundy: ["red"], wine: ["red"], pink: ["pink", "red"], blue: ["blue"], navy: ["blue"], green: ["green"], olive: ["green"], purple: ["purple"], gold: ["gold", "tan"] };
const colorFa: Array<[RegExp, string[]]> = [[/مشکی/, ["black"]], [/سفید/, ["white", "tan"]], [/کرم|بژ/, ["white", "tan"]], [/طوسی|خاکستری/, ["grey"]], [/قهوه ?ای/, ["brown"]], [/قرمز|زرشکی/, ["red"]], [/صورتی/, ["pink", "red"]], [/آبی|سرمه ?ای/, ["blue"]], [/سبز/, ["green"]], [/بنفش/, ["purple"]], [/طلایی/, ["gold", "tan"]]];
const colorNameFa: Record<string, string> = { black: "مشکی", white: "سفید", grey: "طوسی", brown: "قهوه‌ای", tan: "کرم", red: "قرمز", pink: "صورتی", purple: "بنفش", blue: "آبی", green: "سبز", gold: "طلایی" };
const generic = new Set(["recommend", "show", "find", "want", "look", "looking", "something", "need", "buy", "suggest", "give", "idea", "under", "below", "over", "above", "cheap", "cheaper", "another", "more", "other", "option", "good", "best", "nice", "winter", "summer", "outfit", "sale"]);
const statusFa: Record<string, string> = { Processing: "در حال پردازش", Shipped: "ارسال شد", Delivered: "تحویل شد", Refunded: "بازپرداخت شد" };
const promoFa: Record<string, string> = { fri: "جمعه‌ی فلش", weekend: "حراج آخر هفته‌ی دویدن", payday: "هفته‌ی حقوق", autumn: "رویداد پاییزی تریل" };
const supportFa: Record<string, string> = { Standard: "معمولی", Priority: "اولویت‌دار", Concierge: "اختصاصی" };
const faWords: Record<string, number> = { یک: 1, دو: 2, سه: 3, چهار: 4, پنج: 5, شش: 6, هفت: 7, هشت: 8 };

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
  const between = t.match(/between \$?(\d+) and \$?(\d+)/) ?? t.match(/از\s*\$?(\d+)\s*(?:تا|الی)\s*\$?(\d+)/);
  const max = t.match(/(?:under|below|less than|max(?:imum)?|up to|within|cheaper than)\s*\$?(\d{2,5})/) ?? t.match(/(?:زیر|کمتر از|حداکثر|تا سقف|تا)\s*\$?\s*(\d{2,5})/) ?? t.match(/\$(\d{2,5})/);
  const min = t.match(/(?:over|above|more than|at least|from)\s*\$?(\d{2,5})/) ?? t.match(/(?:بالای|بیشتر از|حداقل)\s*\$?\s*(\d{2,5})/);
  if (between) { f.minPrice = Number(between[1]); f.maxPrice = Number(between[2]); }
  else { if (max) f.maxPrice = Number(max[1]); if (min) f.minPrice = Number(min[1]); }
  const color = Object.keys(colorWords).find((w) => new RegExp(`\\b${w}\\b`).test(t));
  if (color) f.color = colorWords[color];
  else { const hit = colorFa.find(([r]) => r.test(t)); if (hit) f.color = hit[1]; }
  if (/\b(sale|discount|deal|offer)\b|تخفیف|حراج/.test(t)) f.sale = true;
  const known = new Set([...Object.keys(colorWords), "sneaker", "runner", "trainer", "shoe", "hightop", "trail", "court", "running"]);
  const q = terms(t).filter((w) => /^[a-z]/.test(w) && !generic.has(w) && !/^\d+$/.test(w) && (known.has(w) || w.length > 4));
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

const describe = (f: Filters, fa: boolean) => fa
  ? [f.category && `دسته‌ی ${categoryFa[f.category]}`, f.color && `به رنگ ${colorNameFa[f.color[0]] ?? f.color[0]}`, f.maxPrice !== undefined && `زیر ${money(f.maxPrice)}`, f.minPrice !== undefined && `بالای ${money(f.minPrice)}`, f.sale && "تخفیف‌دار"].filter(Boolean).join("، ")
  : [f.category && f.category.toLowerCase(), f.color && `in ${f.color[0]}`, f.maxPrice !== undefined && `under ${money(f.maxPrice)}`, f.minPrice !== undefined && `over ${money(f.minPrice)}`, f.sale && "on sale"].filter(Boolean).join(" ");

const baseEn = ["Recommend a running shoe under $200", "Show the best reviewed shoes", "Which items have the biggest discounts?", "Where is my order?", "What is your return policy?"];
const baseFa = ["یه کفش دویدن زیر 200 دلار پیشنهاد بده", "کفش‌هایی با بیشترین نظر مثبت", "کدوم محصولات بیشترین تخفیف رو دارن؟", "سفارشم کجاست؟", "سیاست مرجوعی چیه؟"];
export const starterChips = (lang: Lang) => (lang === "fa" ? baseFa : baseEn);

const reviewStats = (p: Product) => { const r = reviewsFor(p); return { n: r.length, pos: r.filter((x) => x.rating >= 4).length, rating: ratingOf(p) }; };
const effective = (p: Product) => Math.round((1 - (1 - discountFor(p) / 100) * (1 - promoPercent(p) / 100)) * 100);
const nowPrice = (p: Product) => Math.round(p.price * (1 - effective(p) / 100));
const named = (t: string) => { const q = new Set(terms(t)); return products.filter((p) => terms(p.name).every((w) => q.has(w))); };
const planFa = (p: Plan) => `${p.discount}٪ تخفیف، ${p.points} برابر امتیاز، ارسال رایگان ${p.freeShipAt ? `از ${p.freeShipAt} دلار` : "همیشه"}، پشتیبانی ${supportFa[p.support] ?? p.support}`;

const productText = (p: Product, fa: boolean) => {
  const s = reviewStats(p), d = effective(p);
  return fa
    ? `${p.name} (${categoryFa[p.category]})، قیمت ${money(p.price)}${d ? `، امروز ${d}٪ تخفیف دارد و می‌شود ${money(nowPrice(p))}` : ""}. ${p.note}. امتیاز ${s.rating.toFixed(1)} از ${s.n} نظر (${s.pos} نظر مثبت) و ${likesFor(p)} لایک. ${p.stock < 15 ? `فقط ${p.stock} جفت مانده` : `${p.stock} جفت موجود است`}، سایزها ${sizes.join("، ")} (اروپایی).`
    : `${p.name} (${p.category}), ${money(p.price)}${d ? `, ${d}% off today so ${money(nowPrice(p))}` : ""}. ${p.note}. Rated ${s.rating.toFixed(1)} from ${s.n} reviews (${s.pos} positive) with ${likesFor(p)} likes. ${p.stock < 15 ? `Only ${p.stock} pairs left` : `${p.stock} pairs in stock`}, sizes EU ${sizes.join(", ")}.`;
};

interface Rank { title: string; filter?: (p: Product) => boolean; sort: (a: Product, b: Product) => number; text: (p: Product) => string }
const ranks = (fa: boolean): Partial<Record<string, Rank>> => ({
  top_discount: { title: fa ? "بیشترین تخفیف‌ها" : "biggest discounts", filter: (p) => effective(p) > 0, sort: (a, b) => effective(b) - effective(a), text: (p) => fa ? `${p.name}: ${effective(p)}٪ تخفیف، حالا ${money(nowPrice(p))} (قبلاً ${money(p.price)})` : `${p.name}: ${effective(p)}% off, now ${money(nowPrice(p))} (was ${money(p.price)})` },
  top_rated: { title: fa ? "بهترین نظرها" : "best reviewed", sort: (a, b) => reviewStats(b).pos - reviewStats(a).pos || reviewStats(b).rating - reviewStats(a).rating, text: (p) => fa ? `${p.name}: امتیاز ${reviewStats(p).rating.toFixed(1)}، ${reviewStats(p).pos} از ${reviewStats(p).n} نظر مثبت` : `${p.name}: ${reviewStats(p).rating.toFixed(1)} stars, ${reviewStats(p).pos} of ${reviewStats(p).n} reviews positive` },
  popular: { title: fa ? "محبوب‌ترین‌ها" : "most popular", sort: (a, b) => likesFor(b) - likesFor(a), text: (p) => fa ? `${p.name}: ${likesFor(p)} لایک، ${money(p.price)}` : `${p.name}: ${likesFor(p)} likes, ${money(p.price)}` },
  cheapest: { title: fa ? "کم‌قیمت‌ترین‌ها" : "lowest prices", sort: (a, b) => a.price - b.price, text: (p) => `${p.name}: ${money(p.price)}` },
  priciest: { title: fa ? "مدل‌های پریمیوم" : "premium models", sort: (a, b) => b.price - a.price, text: (p) => `${p.name}: ${money(p.price)}` },
  new_arrivals: { title: fa ? "تازه‌ترین‌ها" : "new arrivals", sort: (a, b) => Number(b.id.slice(1)) - Number(a.id.slice(1)), text: (p) => fa ? `${p.name}: ${money(p.price)}، ${categoryFa[p.category]}` : `${p.name}: ${money(p.price)}, ${p.category}` },
});

export function respond(text: string, ctx: Ctx, mem: Memory, preferred: Lang = "en"): Reply {
  const fa = isPersian(text) || (!/[a-z]/i.test(text) && preferred === "fa");
  const L = (en: string, persian: string) => (fa ? persian : en);
  const t = normalize(text).toLowerCase();
  const ranked = classify(text);
  let { intent, p: confidence } = ranked[0];
  const tools = ["intent_model"];
  const e = entities(t);
  const follow = /\b(cheaper|less expensive|lower price)\b|ارزون ?تر|ارزان ?تر|کم ?قیمت ?تر/.test(t) ? "cheaper" : /\b(pricier|more expensive|premium)\b|گرون ?تر|گران ?تر|لوکس ?تر/.test(t) ? "pricier" : /\b(another|something else|more options|other options|different|next)\b|یکی دیگه|یه دونه دیگه|گزینه های دیگه|بعدی|متفاوت/.test(t) ? "more" : /\b(start over|reset|new search)\b|از اول|شروع مجدد/.test(t) ? "reset" : null;
  const orderId = text.match(/SH-\d{4,6}/i)?.[0].toUpperCase();
  const shopping = !!(e.category || e.maxPrice !== undefined || e.minPrice !== undefined || e.color || e.sale);
  const nonShop = ["order_status", "returns", "shipping", "size_help", "human", "points", "membership", "payment", "care", "cart", "greeting", "thanks", "top_discount", "top_rated", "popular", "cheapest", "priciest", "new_arrivals", "stock", "product_info", "compare", "stores", "careers", "about", "stats", "off_topic"];
  if (confidence < 0.4) intent = "unknown";
  const mentioned = named(t);
  if (mentioned.length >= 2) intent = "compare";
  else if (mentioned.length === 1 && ["unknown", "recommend", "product_info"].includes(intent)) intent = "product_info";
  if ((shopping && !nonShop.includes(intent)) || (follow && Object.keys(mem.filters).length)) intent = "recommend";
  if (intent === "discount" && shopping) intent = "recommend";
  const sug = fa ? baseFa : baseEn;
  const out = (r: Partial<Reply> & { text: string }): Reply => ({ tools, intent, confidence: Math.round(confidence * 100), suggest: sug.slice(0, 3), lang: fa ? "fa" : "en", ...r });
  const name = ctx.user?.name.split(" ")[0];
  const link = (en: string, persian: string, to: string) => ({ label: L(en, persian), to });

  switch (intent) {
    case "greeting": return out({ text: L(`Hello${name ? ` ${name}` : ""}, I am Shovi. I can find products, check your orders, explain policies and manage your bag. ${ctx.user ? `You are on the ${ctx.plan.name} plan with ${ctx.points.toLocaleString()} points.` : ""}`, `سلام${name ? ` ${name}` : ""}، من شووی هستم. می‌توانم محصولات را پیدا کنم، سفارش‌هایتان را بررسی کنم و درباره‌ی قوانین فروشگاه توضیح بدهم. ${ctx.user ? `شما در پلن ${ctx.plan.name} هستید و ${ctx.points.toLocaleString()} امتیاز دارید.` : ""}`), suggest: sug });
    case "thanks": return out({ text: L("You are welcome. Anything else I can help with?", "خواهش می‌کنم. کار دیگری هست که بتوانم کمک کنم؟") });
    case "order_status": {
      tools.push("get_orders");
      if (!ctx.user) return out({ text: L(orderId ? "For privacy I can only look up orders when you are signed in. You can also use the tracking page with your order number and phone or email." : "Sign in and I can list your orders, or use the tracking page with your order number.", orderId ? "برای حفظ حریم خصوصی فقط وقتی وارد حساب شده باشید می‌توانم سفارش را بررسی کنم. می‌توانید از صفحه‌ی پیگیری با شماره‌ی سفارش و تلفن یا ایمیل هم استفاده کنید." : "وارد حساب شوید تا سفارش‌هایتان را فهرست کنم، یا از صفحه‌ی پیگیری با شماره‌ی سفارش استفاده کنید."), links: [link("Track an order", "پیگیری سفارش", "/track"), link("Sign in", "ورود", "/login")] });
      const mine = ctx.orders.filter((o) => o.email === ctx.user?.email);
      const hit = orderId ? mine.find((o) => o.id === orderId) : undefined;
      if (orderId && !hit) return out({ text: L(`I could not find ${orderId} on your account.`, `سفارش ${orderId} در حساب شما پیدا نشد.`), links: [link("Track an order", "پیگیری سفارش", "/track")] });
      const list = hit ? [hit] : mine.slice(0, 3);
      if (!list.length) return out({ text: L("You do not have any orders yet.", "هنوز سفارشی ندارید.") });
      return out({ text: list.map((o) => L(`${o.id}: ${o.status}, ${money2(o.total)}, placed ${o.date}`, `${o.id}: ${statusFa[o.status] ?? o.status}، ${money2(o.total)}، تاریخ ثبت ${o.date}`)).join("\n"), links: [link("All my orders", "همه‌ی سفارش‌های من", "/account/orders")], suggest: fa ? [baseFa[4], "با یه آدم واقعی حرف بزنم"] : ["What is your return policy?", "Talk to a human"] });
    }
    case "membership": {
      tools.push("get_plans");
      if (/cancel|لغو/.test(t)) return out({ text: L("You can cancel or change your plan any time from your subscription page.", "هر زمان از صفحه‌ی اشتراک می‌توانید پلن خود را لغو یا تغییر دهید."), links: [link("Subscription", "اشتراک", "/account/subscription")] });
      const upgrade = planList[planList.findIndex((x) => x.id === ctx.plan.id) + 1];
      return out({ text: L(`${ctx.user ? `You are on ${ctx.plan.name}: ${ctx.plan.discount}% off, ${ctx.plan.points}x points, ${ctx.plan.support} support. ` : ""}${upgrade ? `${upgrade.name} adds ${upgrade.perks.slice(0, 3).join(", ")} for $${upgrade.price.month} a month.` : "You are on our top plan."} ${planList.map((x) => `${x.name}: ${x.discount}% off`).join(", ")}.`, `${ctx.user ? `شما در پلن ${ctx.plan.name} هستید: ${planFa(ctx.plan)}. ` : ""}${upgrade ? `پلن ${upgrade.name} با ماهانه ${upgrade.price.month} دلار این مزایا را دارد: ${planFa(upgrade)}.` : "شما در بالاترین پلن هستید."} ${planList.map((x) => `${x.name}: ${x.discount}٪ تخفیف`).join("، ")}.`), links: [link("Compare plans", "مقایسه‌ی پلن‌ها", "/membership")] });
    }
    case "points": {
      tools.push("get_points");
      if (!ctx.user) return out({ text: L("Members earn 1 to 2 points per dollar depending on their plan. Sign in to see your balance.", "اعضا به ازای هر دلار ۱ تا ۲ امتیاز می‌گیرند. برای دیدن موجودی وارد شوید."), links: [link("Sign in", "ورود", "/login")] });
      const next = [[500, "$10 voucher", "کوپن ۱۰ دلاری"], [1200, "free repair", "تعمیر رایگان"], [2500, "$50 voucher", "کوپن ۵۰ دلاری"], [4000, "private styling session", "جلسه‌ی استایل خصوصی"]].find(([c]) => (c as number) > ctx.points);
      return out({ text: L(`You have ${ctx.points.toLocaleString()} points and earn ${ctx.plan.points}x on every order. ${next ? `Your next reward is a ${next[1]} at ${next[0]} points.` : "You can redeem any reward."}`, `شما ${ctx.points.toLocaleString()} امتیاز دارید و از هر سفارش ${ctx.plan.points} برابر امتیاز می‌گیرید. ${next ? `جایزه‌ی بعدی شما ${next[2]} با ${next[0]} امتیاز است.` : "می‌توانید هر جایزه‌ای را بگیرید."}`), links: [link("Rewards", "جایزه‌ها", "/account/rewards")] });
    }
    case "discount": {
      tools.push("get_promotions");
      const live = activePromos();
      const codes = ctx.coupons.filter((c) => c.on && c.code !== "VIP30").map((c) => `${c.code} (${c.off}%)`);
      const scope = (s: string) => (s === "all" ? L("everything", "همه‌ی محصولات") : fa ? categoryFa[s as Category] : s);
      return out({ text: L(`${live.length ? `Live today: ${live.map((x) => `${x.name} ${x.percent}% off ${scope(x.scope)}`).join(", ")}.` : "No recurring promotion is live today."} Coupon codes: ${codes.join(", ")}. ${ctx.plan.discount ? `Your ${ctx.plan.name} plan adds ${ctx.plan.discount}% on top.` : "Memberships add an extra discount to every order."}`, `${live.length ? `امروز فعال است: ${live.map((x) => `${promoFa[x.id] ?? x.name} ${x.percent}٪ تخفیف روی ${scope(x.scope)}`).join("، ")}.` : "امروز پروموشن تکرارشونده‌ای فعال نیست."} کدهای کوپن: ${codes.join("، ")}. ${ctx.plan.discount ? `پلن ${ctx.plan.name} شما ${ctx.plan.discount}٪ تخفیف اضافه می‌دهد.` : "عضویت برای هر سفارش تخفیف اضافه می‌دهد."}`), links: [link("All promotions", "همه‌ی پروموشن‌ها", "/promotions")], suggest: fa ? ["محصولات تخفیف‌دار رو نشون بده", "درباره‌ی عضویت بگو"] : ["Show items on sale", "Tell me about membership"] });
    }
    case "cart": {
      tools.push("get_cart");
      if (/\badd\b|اضافه ?کن|بذار|بزار/.test(t) && mem.last.length) {
        const pick = products.find((x) => x.id === mem.last[0]);
        if (pick) return out({ text: L(`Sizes differ between models, so choose your size for ${pick.name} on its page and add it from there.`, `سایز مدل‌ها فرق دارد؛ سایز ${pick.name} را در صفحه‌ی خودش انتخاب کنید و از همان‌جا به سبد اضافه کنید.`), links: [link("Choose size", "انتخاب سایز", `/product/${pick.id}`)], suggest: fa ? ["سبد من رو نشون بده", "ارزان‌تر نشون بده"] : ["Show my bag", "Show cheaper options"] });
      }
      return out({ text: ctx.cartCount ? L(`Your bag has ${ctx.cartCount} item${ctx.cartCount > 1 ? "s" : ""}, subtotal ${money2(ctx.cartTotal)}.`, `سبد شما ${ctx.cartCount} مورد دارد و جمع آن ${money2(ctx.cartTotal)} است.`) : L("Your bag is empty.", "سبد شما خالی است."), links: [link("Checkout", "پرداخت", "/checkout")] });
    }
    case "top_discount": case "top_rated": case "popular": case "cheapest": case "priciest": case "new_arrivals": {
      const base0 = ranks(fa)[intent]!;
      const worst = intent === "top_rated" && (/\b(worst|bad|lowest|poor|negative|terrible|critical)\b/.test(t) || /بدترین|ضعیف ?ترین|نظر(?:ات|ها)? ?(?:بد|منفی)|امتیاز پایین|کمترین امتیاز/.test(t));
      const r = worst ? { ...base0, title: L("lowest rated", "کمترین امتیاز"), sort: (a: Product, b: Product) => -base0.sort(a, b) } : base0;
      tools.push(`rank_products(${intent})`);
      const m = t.match(/\b(?:top|best|first)\s+(\d{1,2})\b|\b(\d{1,2})\s+(?:products|items|shoes|sneakers|pairs|models)\b/) ?? t.match(/(\d{1,2})\s*(?:تا|عدد|مورد)\b/);
      const word = Object.keys(faWords).find((w) => new RegExp(`${w}\\s*(?:تا|عدد|مورد)`).test(t));
      const n = Math.min(8, Math.max(1, Number(m?.[1] ?? m?.[2] ?? (word ? faWords[word] : 4))));
      const list = products.filter((p) => (!e.category || p.category === e.category) && (e.maxPrice === undefined || p.price <= e.maxPrice) && (e.minPrice === undefined || p.price >= e.minPrice) && (!e.color || e.color.includes(family(p.tone))) && (r.filter ? r.filter(p) : true)).sort(r.sort).slice(0, n);
      if (!list.length) return out({ text: L(`Nothing matches for ${r.title} with those filters.`, `با این فیلترها چیزی برای «${r.title}» پیدا نشد.`), suggest: sug.slice(0, 3) });
      mem.last = list.map((x) => x.id); mem.shown = [...new Set([...mem.shown, ...mem.last])];
      const d = describe(e, fa);
      return out({ text: L(`Top ${list.length} ${r.title}${d ? ` for ${d}` : ""}:\n${list.map((p, i) => `${i + 1}. ${r.text(p)}`).join("\n")}`, `${list.length} مورد از «${r.title}»${d ? ` (${d})` : ""}:\n${list.map((p, i) => `${i + 1}. ${r.text(p)}`).join("\n")}`), items: list.slice(0, 4), suggest: fa ? ["اولی رو به سبد اضافه کن", baseFa[1], baseFa[2]] : ["Add the first one to my bag", "Show the best reviewed shoes", "Which items have the biggest discounts?"] });
    }
    case "product_info": case "stock": {
      const p = mentioned[0];
      if (!p) {
        if (intent === "stock") {
          tools.push("get_stock");
          const low = products.filter((x) => x.stock < 15).sort((a, b) => a.stock - b.stock).slice(0, 5);
          return out({ text: L(`Running low right now:\n${low.map((x) => `${x.name}: ${x.stock} pairs left`).join("\n")}`, `الان کم‌موجود هستند:\n${low.map((x) => `${x.name}: ${x.stock} جفت مانده`).join("\n")}`), items: low.slice(0, 3), suggest: sug.slice(0, 3) });
        }
        return out({ text: L("Which model do you mean? Tell me the name, for example Nova Runner.", "کدام مدل را می‌گویید؟ نامش را بنویسید، مثلاً Nova Runner."), suggest: fa ? [baseFa[1], "پرفروش‌ترین کفش‌ها"] : ["Show the best reviewed shoes", "Show best sellers"] });
      }
      tools.push(`get_product(${p.id})`);
      mem.last = [p.id]; mem.shown = [...new Set([...mem.shown, p.id])];
      return out({ text: productText(p, fa), items: [p], links: [link("Open product page", "صفحه‌ی محصول", `/product/${p.id}`)], suggest: fa ? ["اضافه‌اش کن به سبد", baseFa[1], "پرفروش‌ترین کفش‌ها"] : ["Add it to my bag", "Show the best reviewed shoes", "Show best sellers"] });
    }
    case "compare": {
      const [a, b] = mentioned;
      if (!a || !b) return out({ text: L("Name two models to compare, for example Nova Runner and Pulse Racer.", "نام دو مدل را برای مقایسه بنویسید، مثلاً Nova Runner و Pulse Racer."), suggest: fa ? [baseFa[1]] : ["Show the best reviewed shoes"] });
      tools.push(`compare(${a.id},${b.id})`);
      const sa = reviewStats(a), sb = reviewStats(b);
      const row = (p: Product, s: ReturnType<typeof reviewStats>) => L(`${p.name}: ${money(p.price)}, ${s.rating.toFixed(1)} stars (${s.n} reviews), ${p.stock} in stock, ${p.category}`, `${p.name}: ${money(p.price)}، امتیاز ${s.rating.toFixed(1)} (${s.n} نظر)، ${p.stock} جفت موجود، دسته‌ی ${categoryFa[p.category]}`);
      mem.last = [a.id, b.id]; mem.shown = [...new Set([...mem.shown, a.id, b.id])];
      const better = sa.rating === sb.rating ? L("They are rated equally", "امتیازشان برابر است") : L(`${sa.rating > sb.rating ? a.name : b.name} is rated higher`, `امتیاز ${sa.rating > sb.rating ? a.name : b.name} بالاتر است`);
      const cheaper = a.price === b.price ? L("and they cost the same", "و قیمتشان یکی است") : L(`and ${a.price < b.price ? a.name : b.name} is ${money(Math.abs(a.price - b.price))} cheaper`, `و ${a.price < b.price ? a.name : b.name} به اندازه‌ی ${money(Math.abs(a.price - b.price))} ارزان‌تر است`);
      return out({ text: `${row(a, sa)}\n${row(b, sb)}\n${better}${fa ? "، " : ", "}${cheaper}.`, items: [a, b], suggest: fa ? ["اولی رو به سبد اضافه کن", baseFa[1]] : ["Add the first one to my bag", "Show the best reviewed shoes"] });
    }
    case "off_topic": return out({ text: L("That is outside what I can help with. I know the Shovid catalogue, prices, reviews, discounts, stock, orders, stores and policies.", "این موضوع از حوزه‌ی کمک من خارج است. من کاتالوگ شاوید، قیمت‌ها، نظرها، تخفیف‌ها، موجودی، سفارش‌ها، فروشگاه‌ها و قوانین را می‌شناسم."), suggest: sug });
    case "stores": {
      tools.push("get_stores");
      return out({ text: stores.map(([n, a, h, p]) => `${n}: ${a}${fa ? "،" : ","} ${h}${fa ? "،" : ","} ${p}`).join("\n"), links: [link("Store locator", "فروشگاه‌ها", "/stores")] });
    }
    case "stats": {
      tools.push("get_catalogue_stats");
      const prices = products.map((x) => x.price);
      const cats = [...new Set(products.map((x) => x.category))];
      const reviews = products.reduce((s, x) => s + reviewsFor(x).length, 0);
      const avg = products.reduce((s, x) => s + ratingOf(x), 0) / products.length;
      const onSale = products.filter((x) => discountFor(x) > 0).length, low = products.filter((x) => x.stock < 15).length;
      return out({ text: L(`We carry ${products.length} models in ${cats.length} categories (${cats.join(", ")}), from ${money(Math.min(...prices))} to ${money(Math.max(...prices))}. The average rating is ${avg.toFixed(1)} from ${reviews} reviews. ${onSale} models are on sale and ${low} are running low.`, `ما ${products.length} مدل در ${cats.length} دسته داریم (${cats.map((c) => categoryFa[c]).join("، ")}) با قیمت از ${money(Math.min(...prices))} تا ${money(Math.max(...prices))}. میانگین امتیاز ${avg.toFixed(1)} از ${reviews} نظر است. ${onSale} مدل تخفیف دارد و ${low} مدل رو به اتمام است.`), suggest: sug.slice(0, 3) });
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
      const priced = follow === "cheaper" || follow === "pricier";
      const steps: Filters[] = priced
        ? [f, { ...f, color: undefined }, { ...f, color: undefined, category: undefined }]
        : [f, { ...f, color: undefined }, { ...f, color: undefined, maxPrice: undefined, minPrice: undefined }, { category: f.category }];
      const used = steps.findIndex((s) => searchCatalog(s, skip).length > 0);
      const items = used >= 0 ? searchCatalog(steps[used], skip).slice(0, 3) : [];
      tools[tools.length - 1] = `search_catalog(${describe(used >= 0 ? steps[used] : f, false) || "all"})`;
      if (!items.length) return out({ text: priced ? L(`These are already the ${follow === "cheaper" ? "cheapest" : "most expensive"} options I can find. Try another category.`, `این‌ها از ${follow === "cheaper" ? "ارزان‌ترین" : "گران‌ترین"} گزینه‌هایی هستند که پیدا می‌کنم. دسته‌ی دیگری را امتحان کنید.`) : L("I have nothing left that matches. Try changing the budget or category.", "چیزی که مطابق خواسته‌ی شما باشد نمانده. بودجه یا دسته را عوض کنید."), suggest: fa ? ["از اول شروع کن", "محصولات تخفیف‌دار رو نشون بده"] : ["Start over", "Show items on sale"] });
      mem.filters = steps[used]; mem.last = items.map((x) => x.id); mem.shown = [...new Set([...mem.shown, ...mem.last])];
      const d = describe(steps[used], fa);
      const relaxed = used > 0 ? L(` Nothing matched every filter, so I relaxed ${used === 1 ? "the colour" : priced ? "the category" : "the budget"}.`, ` هیچ‌کدام همه‌ی فیلترها را نداشت، برای همین ${used === 1 ? "رنگ" : priced ? "دسته" : "بودجه"} را آزادتر کردم.`) : "";
      return out({ text: L(`Here ${items.length === 1 ? "is 1 pick" : `are ${items.length} picks`}${d ? ` for ${d}` : ""}, ranked by relevance, ratings and likes.${relaxed}`, `${items.length === 1 ? "یک پیشنهاد" : `${items.length} پیشنهاد`}${d ? ` برای ${d}` : ""} که بر اساس تناسب، امتیاز و لایک مرتب شده‌اند.${relaxed}`), items, suggest: fa ? ["ارزان‌تر نشون بده", "یکی دیگه", "اولی رو به سبد اضافه کن"] : ["Show cheaper options", "Something else", "Add the first one to my bag"] });
    }
    default: {
      const intentDoc: Record<string, string> = { returns: "returns", shipping: "shipping", size_help: "sizing", payment: "payment", gift: "gifts", human: "contact", careers: "careers", about: "about" };
      const wanted = intentDoc[intent] ? (fa ? `${intentDoc[intent]}-fa` : intentDoc[intent]) : undefined;
      const direct = wanted ? docs.find((d) => d.id === wanted) : undefined;
      const hits = retrieve(text, intent === "care" ? "care" : undefined, 3, fa ? "fa" : "en");
      const top = direct ?? (hits[0] && (intent !== "unknown" || hits[0].score >= 1.2) ? hits[0].doc : undefined);
      tools.push(`retrieve_docs(${top?.id ?? "none"})`);
      if (!top) return out({ text: L("I am not sure about that one. I can find and compare shoes, rank by discounts or reviews, check orders, explain shipping, returns and sizing, or connect you with an advisor.", "در این مورد مطمئن نیستم. می‌توانم کفش‌ها را پیدا و مقایسه کنم، بر اساس تخفیف یا نظرها رتبه‌بندی کنم، سفارش را بررسی کنم، درباره‌ی ارسال، مرجوعی و سایز توضیح بدهم یا شما را به یک مشاور وصل کنم."), links: [link("Contact an advisor", "تماس با مشاور", "/contact")], suggest: sug });
      const product = top.id.startsWith("product-") ? products.find((x) => `product-${x.id}` === top.id) : undefined;
      if (product) { mem.last = [product.id]; return out({ text: productText(product, fa), items: [product], links: [link("Open product page", "صفحه‌ی محصول", `/product/${product.id}`)], suggest: fa ? ["اضافه‌اش کن به سبد", "پرفروش‌ترین کفش‌ها"] : ["Add it to my bag", "Show best sellers"] }); }
      const extra = intent === "shipping" && ctx.plan.id !== "silver" ? L(` With ${ctx.plan.name} shipping is free over ${ctx.plan.freeShipAt ? `$${ctx.plan.freeShipAt}` : "$0"}.`, ` با پلن ${ctx.plan.name} ارسال برای سفارش بالای ${ctx.plan.freeShipAt ? `${ctx.plan.freeShipAt} دلار` : "۰ دلار"} رایگان است.`) : "";
      return out({ text: top.text + extra, links: top.link ? [{ label: top.title, to: top.link }] : undefined, suggest: intent === "care" ? (fa ? ["تمیز کردن کفش سفید", baseFa[0]] : ["How to clean white sneakers", "Recommend a running shoe under $200"]) : sug.slice(0, 3) });
    }
  }
}
