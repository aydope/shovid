import { products } from "@/data";
import { terms, tokenize } from "./nlp";

export const intents = ["greeting", "thanks", "order_status", "returns", "shipping", "size_help", "recommend", "discount", "top_discount", "top_rated", "popular", "cheapest", "priciest", "new_arrivals", "stock", "product_info", "compare", "membership", "points", "human", "cart", "gift", "care", "payment", "stores", "careers", "about", "stats"] as const;
export type Intent = (typeof intents)[number];

export const intentLabels: Record<Intent, string> = {
  greeting: "Say hello", thanks: "Say thanks", order_status: "Order status", returns: "Returns", shipping: "Shipping", size_help: "Sizing help", recommend: "Product recommendation", discount: "Sales and coupons", top_discount: "Biggest discounts", top_rated: "Best reviewed", popular: "Most popular", cheapest: "Cheapest", priciest: "Most expensive", new_arrivals: "New arrivals", stock: "Stock and availability", product_info: "Product details", compare: "Compare products", membership: "Membership plans", points: "Points and rewards", human: "Talk to a person", cart: "My bag", gift: "Gifts", care: "Shoe care", payment: "Payment", stores: "Store locations", careers: "Jobs", about: "About Shovid", stats: "Catalogue facts",
};

const base: Record<Intent, string[]> = {
  greeting: ["hello", "hi there", "good morning", "hey shovi", "hello assistant", "hi", "good evening", "hey there"],
  thanks: ["thanks", "thank you so much", "great thanks", "that helps", "perfect thank you", "cheers", "awesome thanks"],
  order_status: ["where is my order", "track my package", "order status", "has my order shipped", "when will my order arrive", "order SH-10482 status", "delivery tracking", "where is my parcel", "my orders", "did my order ship yet"],
  returns: ["what is your return policy", "can I return an item", "how do I get a refund", "exchange a product", "send back my order", "return window", "is returning free", "refund time"],
  shipping: ["do you ship internationally", "how much is shipping", "delivery time", "free shipping threshold", "do you ship to germany", "how long does delivery take", "shipping cost to europe"],
  size_help: ["help me choose a size", "what size should I get", "does it run small", "size chart", "how does it fit", "measurements guide", "between sizes", "true to size"],
  recommend: ["recommend a running shoe", "show me sneakers", "I need trail shoes under 250", "find black high tops", "suggest something for the city", "what court shoes do you have", "looking for lifestyle sneakers", "show me something similar", "what shoes do you have", "ideas for a new pair", "i need shoes for the gym", "help me pick a pair"],
  discount: ["any discounts today", "is there a sale", "coupon code", "promo code", "do you have offers", "what promotions are running", "special offer", "is there a discount code", "friday sale"],
  top_discount: ["products with the biggest discounts", "items with the highest discount", "give me the best deals", "most discounted sneakers", "which shoes have the largest price drop", "show products with a big discount", "what has the highest sale percent", "top discounted pairs", "biggest sale items", "biggest discount on running shoes", "most discounted trail shoes"],
  top_rated: ["products with the best reviews", "the highest rated shoes", "which sneakers have the most positive reviews", "items customers love most", "top rated sneakers", "best reviewed pairs", "shoes with five star reviews", "what do customers rate highest", "most positive feedback", "give me the top rated models", "best reviewed trail shoes", "highest rated running shoes"],
  popular: ["best sellers", "most popular shoes", "what is trending", "most liked sneakers", "what do people buy most", "trending models right now", "customer favourites", "which pair is the most loved"],
  cheapest: ["cheapest shoes", "lowest priced sneakers", "most affordable pair", "budget options", "least expensive models", "what is the cheapest pair", "shoes that are cheap", "low price sneakers", "cheapest running shoe", "lowest priced trail shoes", "cheapest court sneakers"],
  priciest: ["most expensive shoes", "premium pairs", "highest priced sneakers", "luxury models", "what is your priciest model", "top of the range sneakers", "most premium pair", "most expensive high tops"],
  new_arrivals: ["new arrivals", "latest releases", "newest sneakers", "what is new this week", "just launched models", "recently added shoes", "what is new in store"],
  stock: ["is it in stock", "low stock items", "what is almost sold out", "availability of sizes", "do you have size 43", "which shoes are running low", "is size 42 available", "how many pairs are left"],
  product_info: ["tell me about this shoe", "details of the model", "what is it made of", "how much does it cost", "describe the product", "specs of this sneaker", "price of this pair", "what are the features"],
  compare: ["compare two models", "difference between these shoes", "which is better of the two", "compare these sneakers", "what is the difference between them", "versus comparison", "which one should I choose between"],
  membership: ["tell me about membership", "gold plan benefits", "how to upgrade my plan", "what does noir include", "subscription plans", "cancel my subscription", "member perks", "my plan"],
  points: ["how many points do I have", "how do rewards work", "redeem points", "loyalty points balance", "earn points", "my rewards"],
  human: ["talk to a human", "speak to an agent", "contact support", "I need customer service", "connect me with an advisor", "call someone", "real person"],
  cart: ["what is in my bag", "show my cart", "add it to my bag", "add the first one to cart", "checkout", "how much is my cart", "my basket total"],
  gift: ["gift card", "gift ideas", "buy a present", "gift wrapping", "something for my wife", "birthday present"],
  care: ["how to wash my sneakers", "care instructions", "how to clean leather shoes", "can I machine wash sneakers", "remove odor from shoes", "store my sneakers", "how do I clean white sneakers"],
  payment: ["which payment methods", "can I pay by card", "bank transfer details", "is checkout secure", "do you accept apple pay", "payment options"],
  stores: ["where are your stores", "store locations", "opening hours", "is there a shop in berlin", "find a store near me", "do you have a physical store", "shop in paris"],
  careers: ["are you hiring", "job openings", "careers at shovid", "work with you", "open positions", "can I apply for a job"],
  about: ["who are you", "tell me about shovid", "about the company", "where are the shoes made", "your story", "who makes the shoes", "what is shovid"],
  stats: ["how many products do you have", "how many models are in the catalogue", "catalogue size", "how many categories", "what is the price range", "how many reviews are there", "how many shoes are on sale"],
};

const H = 48, HASH = 192, EPOCHS = 28, WD = 1e-5, C = intents.length;
const fillers = ["please", "hey shovi", "quick question", "can you tell me", "i would like to know"];
const KEY = "shovid-ai-taught";

interface Model { vocab: Map<string, number>; n: number; W1: Float32Array; b1: Float32Array; W2: Float32Array; b2: Float32Array }
interface Sample { idx: number[]; y: number; base: boolean }
interface Taught { text: string; intent: Intent }
export interface Status { phase: "idle" | "training" | "ready"; label: string; progress: number; loss: number[]; valAcc: number | null; trainAcc: number | null; shape: string; examples: number; taught: number; trainMs: number }

let status: Status = { phase: "idle", label: "Not trained yet", progress: 0, loss: [], valAcc: null, trainAcc: null, shape: "", examples: 0, taught: 0, trainMs: 0 };
const listeners = new Set<() => void>();
const publish = (patch: Partial<Status>) => { status = { ...status, ...patch }; listeners.forEach((l) => l()); };
export const getStatus = () => status;
export const subscribeStatus = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

let model: Model | null = null;
let running: Promise<void> | null = null;
let again = false;
let resolveReady: () => void = () => {};
export const ready = new Promise<void>((r) => { resolveReady = r; });

const loadTaught = (): Taught[] => { try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Taught[]; } catch { return []; } };
const saveTaught = (t: Taught[]) => { try { localStorage.setItem(KEY, JSON.stringify(t)); } catch { /* storage unavailable */ } };

const rng = (seed: number) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

function features(text: string, vocab: Map<string, number>) {
  const t = terms(text);
  const idx = new Set<number>();
  for (const k of [...t, ...t.slice(1).map((w, i) => `${t[i]}_${w}`)]) { const i = vocab.get(k); if (i !== undefined) idx.add(i); }
  for (const w of tokenize(text)) if (w.length >= 4) for (let i = 0; i + 3 <= w.length; i++) { let h = 0; for (const ch of w.slice(i, i + 3)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; idx.add(vocab.size + (h % HASH)); }
  return [...idx];
}

function corpus(taught: Taught[]) {
  const out: Array<{ text: string; y: number; base: boolean }> = [];
  intents.forEach((intent, y) => base[intent].forEach((text, i) => { out.push({ text, y, base: true }, { text: `${fillers[(i + y) % fillers.length]} ${text}`, y, base: true }); }));
  const at = (i: Intent) => intents.indexOf(i);
  products.forEach((p, i) => {
    const q = products[(i + 5) % products.length];
    out.push({ text: `tell me about the ${p.name}`, y: at("product_info"), base: true }, { text: `how much is the ${p.name}`, y: at("product_info"), base: true }, { text: `is the ${p.name} in stock`, y: at("stock"), base: true }, { text: `compare ${p.name} and ${q.name}`, y: at("compare"), base: true });
  });
  for (const t of taught) for (let r = 0; r < 3; r++) out.push({ text: t.text, y: at(t.intent), base: false });
  return out;
}

const act = (m: Model, idx: number[], a: Float32Array) => { for (let j = 0; j < H; j++) { let s = m.b1[j]; for (const i of idx) s += m.W1[i * H + j]; a[j] = Math.tanh(s); } };
const softmax = (m: Model, h: Float32Array, p: Float32Array) => {
  let max = -1e9;
  for (let k = 0; k < C; k++) { let s = m.b2[k]; for (let j = 0; j < H; j++) s += h[j] * m.W2[j * C + k]; p[k] = s; if (s > max) max = s; }
  let sum = 0;
  for (let k = 0; k < C; k++) { p[k] = Math.exp(p[k] - max); sum += p[k]; }
  for (let k = 0; k < C; k++) p[k] /= sum;
};
const adam = (w: Float32Array, m: Float32Array, v: Float32Array, i: number, g: number, lr: number, c1: number, c2: number) => {
  m[i] = 0.9 * m[i] + 0.1 * g;
  v[i] = 0.999 * v[i] + 0.001 * g * g;
  w[i] -= (lr * (m[i] / c1)) / (Math.sqrt(v[i] / c2) + 1e-8);
};

const init = (vocab: Map<string, number>, rnd: () => number): Model => {
  const n = vocab.size + HASH;
  return { vocab, n, W1: Float32Array.from({ length: n * H }, () => (rnd() - 0.5) * 0.2), b1: new Float32Array(H), W2: Float32Array.from({ length: H * C }, () => (rnd() - 0.5) * 0.4), b2: new Float32Array(C) };
};

const accuracy = (m: Model, data: Sample[]) => {
  const a = new Float32Array(H), p = new Float32Array(C);
  let ok = 0;
  for (const s of data) { act(m, s.idx, a); softmax(m, a, p); if (p.indexOf(Math.max(...p)) === s.y) ok++; }
  return data.length ? Math.round((ok / data.length) * 100) : 0;
};

async function fit(m: Model, data: Sample[], from: number, to: number, rnd: () => number) {
  const s1 = [new Float32Array(m.W1.length), new Float32Array(m.W1.length)], sb1 = [new Float32Array(H), new Float32Array(H)];
  const s2 = [new Float32Array(m.W2.length), new Float32Array(m.W2.length)], sb2 = [new Float32Array(C), new Float32Array(C)];
  const a = new Float32Array(H), h = new Float32Array(H), p = new Float32Array(C), mask = new Float32Array(H), dz = new Float32Array(C), dh = new Float32Array(H);
  const losses: number[] = [];
  let t = 0;
  for (let e = 0; e < EPOCHS; e++) {
    const lr = 0.02 * (0.5 + 0.5 * Math.cos((Math.PI * e) / EPOCHS));
    const order = data.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    let loss = 0;
    for (const n of order) {
      const s = data[n];
      const idx = s.idx.length > 2 && rnd() < 0.2 ? s.idx.filter((_, i) => i !== Math.floor(rnd() * s.idx.length)) : s.idx;
      t++;
      const c1 = 1 - 0.9 ** t, c2 = 1 - 0.999 ** t;
      act(m, idx, a);
      for (let j = 0; j < H; j++) { mask[j] = rnd() < 0.8 ? 1.25 : 0; h[j] = a[j] * mask[j]; }
      softmax(m, h, p);
      for (let k = 0; k < C; k++) { const target = k === s.y ? 0.95 : 0.05 / (C - 1); dz[k] = p[k] - target; loss -= target * Math.log(p[k] + 1e-9); }
      for (let j = 0; j < H; j++) { let g = 0; for (let k = 0; k < C; k++) g += m.W2[j * C + k] * dz[k]; dh[j] = g * mask[j] * (1 - a[j] * a[j]); }
      for (let j = 0; j < H; j++) for (let k = 0; k < C; k++) { const i = j * C + k; adam(m.W2, s2[0], s2[1], i, h[j] * dz[k] + WD * m.W2[i], lr, c1, c2); }
      for (let k = 0; k < C; k++) adam(m.b2, sb2[0], sb2[1], k, dz[k], lr, c1, c2);
      for (let j = 0; j < H; j++) { adam(m.b1, sb1[0], sb1[1], j, dh[j], lr, c1, c2); for (const i of idx) { const q = i * H + j; adam(m.W1, s1[0], s1[1], q, dh[j] + WD * m.W1[q], lr, c1, c2); } }
    }
    losses.push(loss / data.length);
    publish({ progress: from + (to - from) * ((e + 1) / EPOCHS), loss: [...losses] });
    if (e % 2 === 1) await new Promise((r) => setTimeout(r, 0));
  }
}

async function run() {
  const started = performance.now();
  const taught = loadTaught();
  const texts = corpus(taught);
  const vocab = new Map<string, number>();
  for (const { text } of texts) { const t = terms(text); for (const k of [...t, ...t.slice(1).map((w, i) => `${t[i]}_${w}`)]) if (!vocab.has(k)) vocab.set(k, vocab.size); }
  const data: Sample[] = texts.map((s) => ({ idx: features(s.text, vocab), y: s.y, base: s.base }));
  const held = data.filter((s, i) => s.base && i % 5 === 0);
  const rest = data.filter((s, i) => !(s.base && i % 5 === 0));
  publish({ phase: "training", label: "Validating on held-out examples", progress: 0, loss: [], examples: data.length, taught: taught.length });
  const rnd = rng(7);
  const trial = init(vocab, rnd);
  await fit(trial, rest, 0, 0.5, rnd);
  const valAcc = accuracy(trial, held);
  publish({ label: "Training the final network", valAcc });
  const final = init(vocab, rnd);
  await fit(final, data, 0.5, 1, rnd);
  model = final;
  publish({ phase: "ready", label: "Ready", progress: 1, valAcc, trainAcc: accuracy(final, data), shape: `${final.n} inputs, ${H} hidden, ${C} intents`, trainMs: Math.round(performance.now() - started) });
  resolveReady();
}

export function startTraining(force = false): Promise<void> {
  if (running) { if (force) again = true; return running; }
  if (model && !force) return Promise.resolve();
  running = run().finally(() => { running = null; if (again) { again = false; void startTraining(true); } });
  return running;
}

export function teach(text: string, intent: Intent) {
  const list = loadTaught();
  if (!list.some((t) => t.text === text && t.intent === intent)) saveTaught([...list, { text, intent }]);
  void startTraining(true);
}

export function classify(text: string): Array<{ intent: Intent | "unknown"; p: number }> {
  if (!model) return [{ intent: "unknown", p: 0 }];
  const idx = features(text, model.vocab);
  if (!idx.length) return [{ intent: "unknown", p: 0 }];
  const a = new Float32Array(H), p = new Float32Array(C);
  act(model, idx, a);
  softmax(model, a, p);
  return Array.from(p, (v, k) => ({ intent: intents[k] as Intent, p: v })).sort((x, y) => y.p - x.p).slice(0, 3);
}
