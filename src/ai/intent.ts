import { products } from "@/data";
import { terms, tokenize } from "./nlp";

export const intents = ["greeting", "thanks", "order_status", "returns", "shipping", "size_help", "recommend", "discount", "top_discount", "top_rated", "popular", "cheapest", "priciest", "new_arrivals", "stock", "product_info", "compare", "membership", "points", "human", "cart", "gift", "care", "payment", "stores", "careers", "about", "stats", "off_topic"] as const;
export type Intent = (typeof intents)[number];

export const intentLabels: Record<Intent, string> = {
  greeting: "Say hello", thanks: "Say thanks", order_status: "Order status", returns: "Returns", shipping: "Shipping", size_help: "Sizing help", recommend: "Product recommendation", discount: "Sales and coupons", top_discount: "Biggest discounts", top_rated: "Best reviewed", popular: "Most popular", cheapest: "Cheapest", priciest: "Most expensive", new_arrivals: "New arrivals", stock: "Stock and availability", product_info: "Product details", compare: "Compare products", membership: "Membership plans", points: "Points and rewards", human: "Talk to a person", cart: "My bag", gift: "Gifts", care: "Shoe care", payment: "Payment", stores: "Store locations", careers: "Jobs", about: "About Shovid", stats: "Catalogue facts", off_topic: "Not about the shop",
};

const base: Record<Intent, string[]> = {
  greeting: ["hello", "hi there", "good morning", "hey shovi", "hello assistant", "hi", "good evening", "hey there", "how are you", "whats up"],
  thanks: ["thanks", "thank you so much", "great thanks", "that helps", "perfect thank you", "cheers", "awesome thanks"],
  order_status: ["where is my order", "track my package", "order status", "has my order shipped", "when will my order arrive", "order SH-10482 status", "delivery tracking", "where is my parcel", "my orders", "did my order ship yet"],
  returns: ["what is your return policy", "can I return an item", "how do I get a refund", "exchange a product", "send back my order", "return window", "is returning free", "refund time"],
  shipping: ["do you ship internationally", "how much is shipping", "delivery time", "free shipping threshold", "do you ship to germany", "how long does delivery take", "shipping cost to europe"],
  size_help: ["help me choose a size", "what size should I get", "does it run small", "size chart", "how does it fit", "measurements guide", "between sizes", "true to size"],
  recommend: ["recommend a running shoe", "show me sneakers", "I need trail shoes under 250", "find black high tops", "suggest something for the city", "what court shoes do you have", "looking for lifestyle sneakers", "show me something similar", "what shoes do you have", "ideas for a new pair", "i need shoes for the gym", "help me pick a pair"],
  discount: ["any discounts today", "is there a sale", "coupon code", "promo code", "do you have offers", "what promotions are running", "special offer", "is there a discount code", "friday sale"],
  top_discount: ["products with the biggest discounts", "items with the highest discount", "give me the best deals", "most discounted sneakers", "which shoes have the largest price drop", "show products with a big discount", "what has the highest sale percent", "top discounted pairs", "biggest sale items", "biggest discount on running shoes", "most discounted trail shoes"],
  top_rated: ["products with the best reviews", "the highest rated shoes", "which sneakers have the most positive reviews", "items customers love most", "top rated sneakers", "best reviewed pairs", "shoes with five star reviews", "what do customers rate highest", "most positive feedback", "give me the top rated models", "best reviewed trail shoes", "highest rated running shoes"],
  popular: ["best sellers", "most popular shoes", "what is trending", "most liked sneakers", "what do people buy most", "trending models right now", "customer favourites", "which pair is the most loved", "most popular sneakers", "which sneakers sell best", "bestselling shoes", "what are people buying", "top selling models", "hottest shoes right now"],
  cheapest: ["cheapest shoes", "lowest priced sneakers", "most affordable pair", "budget options", "least expensive models", "what is the cheapest pair", "shoes that are cheap", "what is the lowest price", "low price sneakers", "cheapest running shoe", "lowest priced trail shoes", "cheapest court sneakers"],
  priciest: ["most expensive shoes", "premium pairs", "highest priced sneakers", "luxury models", "what is your priciest model", "top of the range sneakers", "most premium pair", "most expensive high tops"],
  new_arrivals: ["new arrivals", "latest releases", "newest sneakers", "what is new this week", "just launched models", "recently added shoes", "what is new in store"],
  stock: ["is it in stock", "low stock items", "what is almost sold out", "availability of sizes", "do you have size 43", "which shoes are running low", "is size 42 available", "how many pairs are left", "are they back in stock", "do you have my size"],
  product_info: ["tell me about this shoe", "details of the model", "what is it made of", "how much does it cost", "describe the product", "specs of this sneaker", "price of this pair", "what are the features"],
  compare: ["compare two models", "difference between these shoes", "which is better of the two", "compare these sneakers", "what is the difference between them", "versus comparison", "which one should I choose between"],
  membership: ["tell me about membership", "gold plan benefits", "how to upgrade my plan", "what does noir include", "subscription plans", "cancel my subscription", "member perks", "my plan"],
  points: ["how many points do I have", "how do rewards work", "redeem points", "loyalty points balance", "earn points", "my rewards"],
  human: ["talk to a human", "speak to an agent", "contact support", "I need customer service", "connect me with an advisor", "call someone", "real person"],
  cart: ["what is in my bag", "show my cart", "add it to my bag", "add the first one to cart", "checkout", "how much is my cart", "my basket total"],
  gift: ["gift card", "gift ideas", "buy a present", "gift wrapping", "something for my wife", "birthday present"],
  care: ["how to wash my sneakers", "care instructions", "how to clean leather shoes", "can I machine wash sneakers", "remove odor from shoes", "store my sneakers", "how do I clean white sneakers"],
  payment: ["which payment methods", "can I pay by card", "bank transfer details", "is checkout secure", "do you accept apple pay", "payment options", "i want to pay with card", "how can i pay", "do you take credit cards", "can i pay by bank transfer", "is paypal accepted", "which cards do you accept"],
  stores: ["where are your stores", "store locations", "opening hours", "is there a shop in berlin", "find a store near me", "do you have a physical store", "shop in paris", "do you have a store in berlin", "is there a shop in lisbon", "store in porto", "where can i try the shoes on", "your shop address", "do you have a store in london"],
  careers: ["are you hiring", "job openings", "careers at shovid", "work with you", "open positions", "can I apply for a job", "any vacancies at shovid", "how do i join your team"],
  about: ["who are you", "tell me about shovid", "about the company", "where are the shoes made", "your story", "who makes the shoes", "what is shovid"],
  off_topic: ["what is the weather today", "tell me a joke", "who won the football game", "write me a poem", "how do i cook pasta", "translate this sentence", "what is the capital of france", "help me with my homework", "what is the meaning of life", "play some music", "who is the president", "do you like pizza", "solve this math problem", "recommend a movie", "who is the best footballer", "what is the stock market doing", "who is the richest person", "tell me the news", "how tall is mount everest", "who wrote hamlet", "what time is it in tokyo", "give me a recipe", "what is bitcoin worth", "tell me about politics"],
  stats: ["how many products do you have", "how many models are in the catalogue", "catalogue size", "how many categories", "what is the price range", "how many reviews are there", "how many shoes are on sale", "how many sneakers do you sell", "number of models"],
};

export const intentLabelsFa: Record<Intent, string> = {
  greeting: "سلام و احوالپرسی", thanks: "تشکر", order_status: "وضعیت سفارش", returns: "مرجوعی", shipping: "ارسال", size_help: "راهنمای سایز", recommend: "پیشنهاد محصول", discount: "تخفیف و کوپن", top_discount: "بیشترین تخفیف", top_rated: "بهترین نظرها", popular: "محبوب‌ترین‌ها", cheapest: "ارزان‌ترین", priciest: "گران‌ترین", new_arrivals: "تازه‌ها", stock: "موجودی", product_info: "جزئیات محصول", compare: "مقایسه محصولات", membership: "پلن‌های عضویت", points: "امتیاز و جایزه", human: "صحبت با انسان", cart: "سبد خرید", gift: "هدیه", care: "نگهداری کفش", payment: "پرداخت", stores: "فروشگاه‌ها", careers: "فرصت شغلی", about: "درباره شاوید", stats: "آمار کاتالوگ", off_topic: "نامربوط به فروشگاه",
};

const baseFa: Record<Intent, string[]> = {
  greeting: ["سلام", "درود", "سلام وقت بخیر", "صبح بخیر", "عصر بخیر", "هی سلام", "حالت چطوره", "سلام خوبی", "salam"],
  thanks: ["ممنون", "مرسی", "خیلی ممنون", "دستت درد نکنه", "سپاس", "عالی بود مرسی", "ممنونم از کمکت"],
  order_status: ["سفارشم کجاست", "وضعیت سفارش من چیه", "کی سفارشم میرسه", "سفارشم ارسال شد", "پیگیری سفارش", "بسته من کجاست", "سفارش SH-10482 چی شد", "سفارش های من", "سفارشم رسید"],
  returns: ["سیاست مرجوعی چیه", "میشه کفش رو برگردونم", "چطور پولم رو پس بگیرم", "تعویض کفش امکان داره", "مهلت مرجوع کردن چقدره", "مرجوعی رایگانه", "بازگشت وجه چقدر طول میکشه"],
  shipping: ["ارسال بین المللی دارید", "هزینه ارسال چقدره", "ارسال چند روز طول میکشه", "ارسال رایگان از چند دلاره", "به آلمان ارسال میکنید", "زمان تحویل چقدره", "هزینه پست به اروپا"],
  size_help: ["کمکم کن سایز انتخاب کنم", "چه سایزی بگیرم", "سایزش کوچیکه", "جدول سایز", "اندازه پا رو چطور اندازه بگیرم", "بین دو سایز موندم", "سایزبندی استاندارده"],
  recommend: ["یه کفش دویدن پیشنهاد بده", "کفش اسپرت نشونم بده", "کفش مشکی میخوام", "زیر 200 دلار چه کفشی دارید", "یه کفش برای کوهنوردی میخوام", "کفش راحت برای شهر", "چه کفش هایی دارید", "برای باشگاه کفش میخوام", "یه جفت کفش خوب معرفی کن", "کفش سفید میخوام"],
  discount: ["تخفیف دارید", "امروز حراج هست", "کد تخفیف دارید", "چه پروموشن هایی فعاله", "پیشنهاد ویژه دارید", "کد کوپن", "تخفیف جمعه"],
  top_discount: ["کدوم محصولات بیشترین تخفیف رو دارن", "محصولات با تخفیف زیاد رو بهم بده", "بهترین تخفیف ها", "بیشترین درصد تخفیف", "کفش های حراج شده", "چندتا محصول با تخفیف بالا بده", "بیشترین تخفیف روی چه کفشیه"],
  top_rated: ["محصولاتی که بیشترین نظر مثبت رو دارن", "بهترین امتیاز مال کدوم کفشه", "بالاترین امتیاز", "کفش هایی که مشتری ها دوست دارن", "بهترین نظرات مال کدومه", "کفش با ریویو خوب", "بیشترین ستاره", "کفش هایی با نظر مثبت بده", "بدترین نظرها مال کدوم کفشه"],
  popular: ["پرفروش ترین کفش ها", "محبوب ترین مدل", "چی بیشتر فروش میره", "ترند الان چیه", "کفش های محبوب", "بیشترین لایک رو کدوم داره", "مردم چی میخرن", "پرفروش ترین مدل کدومه", "پرفروش ترین کفش کدومه", "محبوب ترین کفش کدومه", "چی زیاد فروش میره"],
  cheapest: ["ارزان ترین کفش", "کم قیمت ترین مدل", "ارزونترین جفت", "گزینه های اقتصادی", "ارزون ترین کفش دویدن", "کمترین قیمت چنده"],
  priciest: ["گران ترین کفش", "لوکس ترین مدل", "گرون ترین جفت", "بالاترین قیمت", "مدل های پریمیوم"],
  new_arrivals: ["جدیدترین کفش ها", "تازه رسیده ها", "محصولات جدید", "چی جدید اومده", "آخرین مدل ها"],
  stock: ["موجود هست", "کم موجود ها", "چی داره تموم میشه", "سایز 43 موجوده", "موجودی سایزها", "کدوم کفش ها کم مونده", "سایز من هست", "دوباره موجود میشه"],
  product_info: ["درباره این کفش بگو", "مشخصات مدل", "جنسش چیه", "قیمتش چنده", "ویژگی های این کفش", "این مدل چطوره"],
  compare: ["این دو مدل رو مقایسه کن", "فرقشون چیه", "کدوم بهتره", "مقایسه دو کفش", "تفاوت بین این دو", "کدومو انتخاب کنم بین این دوتا"],
  membership: ["درباره عضویت بگو", "مزایای پلن گلد", "چطور ارتقا بدم", "نوآر شامل چیه", "پلن های اشتراک", "لغو اشتراک", "مزایای اعضا", "پلن من چیه"],
  points: ["چند امتیاز دارم", "امتیازها چطور کار میکنه", "استفاده از امتیاز", "موجودی امتیاز", "چطور امتیاز بگیرم", "جوایز من"],
  human: ["میخوام با یه نفر صحبت کنم", "با پشتیبانی حرف بزنم", "اپراتور", "مشاور فروش میخوام", "ارتباط با پشتیبان", "یه آدم واقعی", "با یه آدم واقعی حرف بزنم", "میخوام با پشتیبان حرف بزنم", "با کسی صحبت کنم", "با مشاور حرف بزنم"],
  cart: ["تو سبدم چیه", "سبد خرید رو نشون بده", "اضافه کن به سبد", "اولی رو به سبد اضافه کن", "پرداخت", "جمع سبد چقدره"],
  gift: ["کارت هدیه دارید", "ایده هدیه", "هدیه تولد", "کادو پیچی", "برای همسرم هدیه میخوام", "هدیه برای دوستم"],
  care: ["چطور کفش رو بشورم", "نگهداری از کفش", "تمیز کردن کفش سفید", "کفش رو میشه تو ماشین لباسشویی شست", "بوی بد کفش", "کفش چرم رو چطور تمیز کنم", "نگهداری کفش اسپرت"],
  payment: ["روش های پرداخت", "با کارت میشه پرداخت کرد", "انتقال بانکی", "پرداخت امنه", "میخوام با کارت پرداخت کنم", "پرداخت درب منزل"],
  stores: ["فروشگاه هاتون کجاست", "آدرس شعبه ها", "ساعت کاری", "تو برلین فروشگاه دارید", "فروشگاه حضوری دارید", "شعبه پاریس", "کجا میتونم کفش رو امتحان کنم", "شعبه برلین کجاست", "فروشگاه لیسبون دارید", "آدرس فروشگاه پورتو", "فروشگاه تو لندن دارید"],
  careers: ["استخدام میکنید", "فرصت شغلی دارید", "همکاری با شما", "موقعیت شغلی", "میتونم درخواست کار بدم"],
  about: ["شما کی هستید", "درباره شاوید بگو", "داستان برند", "کفش ها کجا ساخته میشن", "شاوید چیه", "سازنده کفش ها کیه"],
  stats: ["چند تا محصول دارید", "چند مدل کفش موجوده", "محدوده قیمت چقدره", "چند دسته بندی دارید", "چند نظر ثبت شده", "چند کفش تخفیف دارن", "چند تا مدل دارید", "چند مدل دارید", "تعداد مدل ها چقدره"],
  off_topic: ["هوا امروز چطوره", "یه جوک بگو", "نتیجه بازی فوتبال", "یه شعر بنویس", "طرز تهیه قورمه سبزی", "پایتخت فرانسه کجاست", "فیلم پیشنهاد بده", "قیمت بیت کوین چنده", "رئیس جمهور کیه", "تکلیف ریاضی ام رو حل کن", "ساعت چنده", "هوا چطوره", "آب و هوای امروز", "هوا بارونیه", "درباره سیاست حرف بزنیم", "اخبار امروز چیه"],
};

const H1 = 96, H2 = 32, HASH = 256, EPOCHS = 30, TUNE_EPOCHS = 8, WD = 1e-5, C = intents.length;
const fillers = ["please", "hey shovi", "quick question", "can you tell me", "i would like to know"];
const fillersFa = ["لطفا", "ببخشید", "یه سوال دارم", "میشه بگی", "میخواستم بدونم"];
const suffixesFa = ["زیر 200 دلار", "مشکی", "برای دویدن", "برای شهر", "مردانه", "زنانه"];
const suffixes = ["under $200", "in black", "for running", "for the city", "for men", "for women", "right now", "this week"];
const augmented: Intent[] = ["recommend", "top_discount", "top_rated", "popular", "cheapest", "priciest", "new_arrivals", "stock"];
const KEY = "shovid-ai-taught";

interface Model { vocab: Map<string, number>; n: number; W1: Float32Array; b1: Float32Array; W2: Float32Array; b2: Float32Array; W3: Float32Array; b3: Float32Array }
interface Sample { idx: number[]; y: number; base: boolean }
interface Taught { text: string; intent: Intent }
export interface Status { phase: "idle" | "training" | "ready"; label: string; progress: number; loss: number[]; valAcc: number | null; trainAcc: number | null; shape: string; params: number; neurons: number; examples: number; taught: number; trainMs: number }

let status: Status = { phase: "idle", label: "Not trained yet", progress: 0, loss: [], valAcc: null, trainAcc: null, shape: "", params: 0, neurons: H1 + H2, examples: 0, taught: 0, trainMs: 0 };
const listeners = new Set<() => void>();
const publish = (patch: Partial<Status>) => { status = { ...status, ...patch }; listeners.forEach((l) => l()); };
export const getStatus = () => status;
export const subscribeStatus = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

let model: Model | null = null;
let running: Promise<void> | null = null;
let pending: "tune" | "full" | null = null;
let resolveReady: () => void = () => {};
export const ready = new Promise<void>((r) => { resolveReady = r; });

const loadTaught = (): Taught[] => { try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Taught[]; } catch { return []; } };
const saveTaught = (t: Taught[]) => { try { localStorage.setItem(KEY, JSON.stringify(t)); } catch { /* storage unavailable */ } };
const rng = (seed: number) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// Hashed character trigrams occupy the first HASH inputs (typo tolerance), words and bigrams follow, so the vocabulary can grow.
const tokensOf = (text: string) => { const t = terms(text); return [...t, ...t.slice(1).map((w, i) => `${t[i]}_${w}`)]; };
function features(text: string, vocab: Map<string, number>) {
  const idx = new Set<number>();
  for (const k of tokensOf(text)) { const i = vocab.get(k); if (i !== undefined) idx.add(HASH + i); }
  for (const w of tokenize(text)) if (w.length >= 3) { const p = `#${w}#`; for (let i = 0; i + 3 <= p.length; i++) { let h = 0; for (const ch of p.slice(i, i + 3)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; idx.add(h % HASH); } }
  return [...idx];
}

function corpus(taught: Taught[]) {
  const out: Array<{ text: string; y: number; base: boolean }> = [];
  const at = (i: Intent) => intents.indexOf(i);
  intents.forEach((intent, y) => base[intent].forEach((text, i) => {
    out.push({ text, y, base: true }, { text: `${fillers[(i + y) % fillers.length]} ${text}`, y, base: true });
    if (augmented.includes(intent)) out.push({ text: `${text} ${suffixes[(i * 3 + y) % suffixes.length]}`, y, base: true });
  }));
  intents.forEach((intent, y) => baseFa[intent].forEach((text, i) => {
    out.push({ text, y, base: true }, { text: `${fillersFa[(i + y) % fillersFa.length]} ${text}`, y, base: true });
    if (augmented.includes(intent)) out.push({ text: `${text} ${suffixesFa[(i * 3 + y) % suffixesFa.length]}`, y, base: true });
  }));
  products.forEach((p, i) => {
    const q = products[(i + 5) % products.length];
    out.push({ text: `درباره ${p.name} بگو`, y: at("product_info"), base: true }, { text: `قیمت ${p.name} چنده`, y: at("product_info"), base: true }, { text: `${p.name} موجوده`, y: at("stock"), base: true }, { text: `${p.name} و ${q.name} رو مقایسه کن`, y: at("compare"), base: true });
    out.push({ text: `tell me about the ${p.name}`, y: at("product_info"), base: true }, { text: `how much is the ${p.name}`, y: at("product_info"), base: true }, { text: `is the ${p.name} in stock`, y: at("stock"), base: true }, { text: `compare ${p.name} and ${q.name}`, y: at("compare"), base: true });
  });
  for (const t of taught) for (let r = 0; r < 3; r++) out.push({ text: t.text, y: at(t.intent), base: false });
  return out;
}

interface Buf { t1: Float32Array; a1: Float32Array; t2: Float32Array; a2: Float32Array; p: Float32Array }
const buffers = (): Buf => ({ t1: new Float32Array(H1), a1: new Float32Array(H1), t2: new Float32Array(H2), a2: new Float32Array(H2), p: new Float32Array(C) });

function forward(m: Model, idx: number[], b: Buf, d1?: Float32Array, d2?: Float32Array) {
  for (let j = 0; j < H1; j++) { let s = m.b1[j]; for (const i of idx) s += m.W1[i * H1 + j]; b.t1[j] = Math.tanh(s); b.a1[j] = b.t1[j] * (d1 ? d1[j] : 1); }
  for (let j = 0; j < H2; j++) { let s = m.b2[j]; for (let i = 0; i < H1; i++) s += b.a1[i] * m.W2[i * H2 + j]; b.t2[j] = Math.tanh(s); b.a2[j] = b.t2[j] * (d2 ? d2[j] : 1); }
  let max = -1e9;
  for (let k = 0; k < C; k++) { let s = m.b3[k]; for (let j = 0; j < H2; j++) s += b.a2[j] * m.W3[j * C + k]; b.p[k] = s; if (s > max) max = s; }
  let sum = 0;
  for (let k = 0; k < C; k++) { b.p[k] = Math.exp(b.p[k] - max); sum += b.p[k]; }
  for (let k = 0; k < C; k++) b.p[k] /= sum;
}

const adam = (w: Float32Array, m: Float32Array, v: Float32Array, i: number, g: number, lr: number, c1: number, c2: number) => {
  m[i] = 0.9 * m[i] + 0.1 * g;
  v[i] = 0.999 * v[i] + 0.001 * g * g;
  w[i] -= (lr * (m[i] / c1)) / (Math.sqrt(v[i] / c2) + 1e-8);
};

const init = (vocab: Map<string, number>, rnd: () => number): Model => {
  const n = HASH + vocab.size;
  const rand = (len: number, scale: number) => Float32Array.from({ length: len }, () => (rnd() - 0.5) * scale);
  return { vocab, n, W1: rand(n * H1, 0.2), b1: new Float32Array(H1), W2: rand(H1 * H2, 0.3), b2: new Float32Array(H2), W3: rand(H2 * C, 0.4), b3: new Float32Array(C) };
};

// New words get fresh input rows while every learned weight is kept, so feedback adds knowledge instead of resetting it.
function grow(old: Model, vocab: Map<string, number>, rnd: () => number): Model {
  const fresh = init(vocab, rnd);
  fresh.W1.set(old.W1);
  fresh.b1.set(old.b1); fresh.W2.set(old.W2); fresh.b2.set(old.b2); fresh.W3.set(old.W3); fresh.b3.set(old.b3);
  return fresh;
}

const accuracy = (m: Model, data: Sample[]) => {
  const b = buffers();
  let ok = 0;
  for (const s of data) { forward(m, s.idx, b); if (b.p.indexOf(Math.max(...b.p)) === s.y) ok++; }
  return data.length ? Math.round((ok / data.length) * 100) : 0;
};

async function fit(m: Model, data: Sample[], epochs: number, lr0: number, from: number, to: number, rnd: () => number, losses: number[]) {
  const st = (len: number) => [new Float32Array(len), new Float32Array(len)];
  const s1 = st(m.W1.length), sb1 = st(H1), s2 = st(m.W2.length), sb2 = st(H2), s3 = st(m.W3.length), sb3 = st(C);
  const b = buffers();
  const d1 = new Float32Array(H1), d2 = new Float32Array(H2), dz = new Float32Array(C), dt2 = new Float32Array(H2), dt1 = new Float32Array(H1);
  let t = 0;
  for (let e = 0; e < epochs; e++) {
    const lr = lr0 * (0.5 + 0.5 * Math.cos((Math.PI * e) / epochs));
    const order = data.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    let loss = 0;
    for (const n of order) {
      const s = data[n];
      const idx = s.idx.length > 2 && rnd() < 0.2 ? s.idx.filter((_, i) => i !== Math.floor(rnd() * s.idx.length)) : s.idx;
      t++;
      const c1 = 1 - 0.9 ** t, c2 = 1 - 0.999 ** t;
      for (let j = 0; j < H1; j++) d1[j] = rnd() < 0.9 ? 1 / 0.9 : 0;
      for (let j = 0; j < H2; j++) d2[j] = rnd() < 0.9 ? 1 / 0.9 : 0;
      forward(m, idx, b, d1, d2);
      for (let k = 0; k < C; k++) { const target = k === s.y ? 0.97 : 0.03 / (C - 1); dz[k] = b.p[k] - target; loss -= target * Math.log(b.p[k] + 1e-9); }
      for (let j = 0; j < H2; j++) { let g = 0; for (let k = 0; k < C; k++) g += m.W3[j * C + k] * dz[k]; dt2[j] = g * d2[j] * (1 - b.t2[j] * b.t2[j]); }
      for (let i = 0; i < H1; i++) { let g = 0; for (let j = 0; j < H2; j++) g += m.W2[i * H2 + j] * dt2[j]; dt1[i] = g * d1[i] * (1 - b.t1[i] * b.t1[i]); }
      for (let j = 0; j < H2; j++) for (let k = 0; k < C; k++) { const q = j * C + k; adam(m.W3, s3[0], s3[1], q, b.a2[j] * dz[k] + WD * m.W3[q], lr, c1, c2); }
      for (let k = 0; k < C; k++) adam(m.b3, sb3[0], sb3[1], k, dz[k], lr, c1, c2);
      for (let i = 0; i < H1; i++) for (let j = 0; j < H2; j++) { const q = i * H2 + j; adam(m.W2, s2[0], s2[1], q, b.a1[i] * dt2[j] + WD * m.W2[q], lr, c1, c2); }
      for (let j = 0; j < H2; j++) adam(m.b2, sb2[0], sb2[1], j, dt2[j], lr, c1, c2);
      for (let i = 0; i < H1; i++) { adam(m.b1, sb1[0], sb1[1], i, dt1[i], lr, c1, c2); for (const x of idx) { const q = x * H1 + i; adam(m.W1, s1[0], s1[1], q, dt1[i] + WD * m.W1[q], lr, c1, c2); } }
    }
    losses.push(loss / data.length);
    publish({ progress: from + (to - from) * ((e + 1) / epochs), loss: [...losses] });
    if (e % 2 === 1) await new Promise((r) => setTimeout(r, 0));
  }
}

async function run(mode: "tune" | "full") {
  const started = performance.now();
  const taught = loadTaught();
  const texts = corpus(taught);
  const full = mode === "full" || !model;
  const vocab = full ? new Map<string, number>() : new Map(model!.vocab);
  for (const { text } of texts) for (const k of tokensOf(text)) if (!vocab.has(k)) vocab.set(k, vocab.size);
  const rnd = rng(full ? 7 : 11 + taught.length);
  const m = full ? init(vocab, rnd) : grow(model!, vocab, rnd);
  const data: Sample[] = texts.map((s) => ({ idx: features(s.text, vocab), y: s.y, base: s.base }));
  const losses: number[] = [];
  let valAcc = status.valAcc;
  publish({ phase: "training", label: full ? "Training with a held-out check" : "Learning from your feedback", progress: 0, loss: [], examples: data.length, taught: taught.length });
  if (full) {
    const held = data.filter((s, i) => s.base && i % 5 === 0);
    const rest = data.filter((s, i) => !(s.base && i % 5 === 0));
    await fit(m, rest, EPOCHS, 0.012, 0, 0.75, rnd, losses);
    valAcc = accuracy(m, held);
    publish({ label: "Fine-tuning on all examples", valAcc });
    await fit(m, data, TUNE_EPOCHS, 0.004, 0.75, 1, rnd, losses);
  } else {
    await fit(m, data, TUNE_EPOCHS, 0.008, 0, 1, rnd, losses);
  }
  model = m;
  const params = m.n * H1 + H1 + H1 * H2 + H2 + H2 * C + C;
  publish({ phase: "ready", label: "Ready", progress: 1, valAcc, trainAcc: accuracy(m, data), shape: `${m.n} inputs, ${H1} and ${H2} hidden neurons, ${C} intents`, params, trainMs: Math.round(performance.now() - started) });
  resolveReady();
}

function kick(mode: "tune" | "full"): Promise<void> {
  if (running) { if (mode === "full" || pending !== "full") pending = mode; return running; }
  running = run(mode).finally(() => { running = null; const next = pending; pending = null; if (next) void kick(next); });
  return running;
}

export function startTraining(force = false): Promise<void> {
  if (!model) return kick("full");
  return force ? kick("full") : running ?? Promise.resolve();
}

export function teach(text: string, intent: Intent) {
  const list = loadTaught();
  if (!list.some((t) => t.text === text && t.intent === intent)) saveTaught([...list, { text, intent }]);
  return kick(model ? "tune" : "full");
}

export function classify(text: string): Array<{ intent: Intent | "unknown"; p: number }> {
  if (!model) return [{ intent: "unknown", p: 0 }];
  const idx = features(text, model.vocab);
  if (!idx.length) return [{ intent: "unknown", p: 0 }];
  const b = buffers();
  forward(model, idx, b);
  return Array.from(b.p, (v, k) => ({ intent: intents[k] as Intent, p: v })).sort((x, y) => y.p - x.p).slice(0, 3);
}
