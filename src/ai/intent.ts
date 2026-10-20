import { terms } from "./nlp";

export const intents = ["greeting", "thanks", "order_status", "returns", "shipping", "size_help", "recommend", "discount", "membership", "points", "human", "cart", "gift", "care", "payment"] as const;
export type Intent = (typeof intents)[number];

const data: Record<Intent, string[]> = {
  greeting: ["hello", "hi there", "good morning", "hey shovi", "hello assistant", "hi", "good evening"],
  thanks: ["thanks", "thank you so much", "great thanks", "that helps", "perfect thank you", "cheers"],
  order_status: ["where is my order", "track my package", "order status", "has my order shipped", "when will my order arrive", "order SH-10482 status", "delivery tracking", "where is my parcel", "my orders"],
  returns: ["what is your return policy", "can I return an item", "how do I get a refund", "exchange a product", "send back my order", "return window", "is returning free", "refund time"],
  shipping: ["do you ship internationally", "how much is shipping", "delivery time", "free shipping threshold", "do you ship to germany", "how long does delivery take", "shipping cost to europe"],
  size_help: ["help me choose a size", "what size should I get", "does it run small", "size chart", "how does it fit", "measurements guide", "between sizes", "true to size"],
  recommend: ["recommend a running shoe", "show me sneakers", "I need trail shoes under 250", "find black high tops", "suggest something for the city", "what court shoes do you have", "looking for lifestyle sneakers", "best sellers", "show me something cheaper", "what shoes do you have", "ideas for a new pair"],
  discount: ["any discounts today", "is there a sale", "coupon code", "promo code", "do you have offers", "what promotions are running", "cheap deals", "special offer"],
  membership: ["tell me about membership", "gold plan benefits", "how to upgrade my plan", "what does noir include", "subscription plans", "cancel my subscription", "member perks", "my plan"],
  points: ["how many points do I have", "how do rewards work", "redeem points", "loyalty points balance", "earn points", "my rewards"],
  human: ["talk to a human", "speak to an agent", "contact support", "I need customer service", "connect me with an advisor", "call someone", "real person"],
  cart: ["what is in my bag", "show my cart", "add it to my bag", "add the first one to cart", "checkout", "how much is my cart", "my basket total"],
  gift: ["gift card", "gift ideas", "buy a present", "gift wrapping", "something for my wife", "birthday present"],
  care: ["how to wash my sneakers", "care instructions", "how to clean sneakers", "can I machine wash sneakers", "remove odor from shoes", "store my sneakers", "how do I clean white sneakers"],
  payment: ["which payment methods", "can I pay by card", "bank transfer details", "is checkout secure", "do you accept apple pay", "payment options"],
};

const samples = intents.flatMap((intent, y) => data[intent].map((text) => ({ text, y })));
const vocab = new Map<string, number>();
samples.forEach((s) => terms(s.text).forEach((t) => { if (!vocab.has(t)) vocab.set(t, vocab.size); }));

const V = vocab.size, H = 24, C = intents.length;
let seed = 7;
const rand = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const W1 = Array.from({ length: V }, () => Array.from({ length: H }, () => (rand() - 0.5) * 0.6));
const b1 = new Array<number>(H).fill(0);
const W2 = Array.from({ length: H }, () => Array.from({ length: C }, () => (rand() - 0.5) * 0.6));
const b2 = new Array<number>(C).fill(0);
const indices = (text: string) => [...new Set(terms(text).map((t) => vocab.get(t)).filter((i): i is number => i !== undefined))];

function forward(idx: number[]) {
  const h = b1.map((b, j) => Math.tanh(b + idx.reduce((s, i) => s + W1[i][j], 0)));
  const z = b2.map((b, k) => b + h.reduce((s, hj, j) => s + hj * W2[j][k], 0));
  const m = Math.max(...z);
  const e = z.map((v) => Math.exp(v - m));
  const sum = e.reduce((a, b) => a + b, 0);
  return { h, p: e.map((v) => v / sum) };
}

const started = performance.now();
const prepared = samples.map((s) => ({ idx: indices(s.text), y: s.y }));
for (let epoch = 0; epoch < 220; epoch++) {
  const lr = 0.25 * (1 - epoch / 260);
  for (const { idx, y } of [...prepared].sort(() => rand() - 0.5)) {
    const { h, p } = forward(idx);
    const dz = p.slice(); dz[y] -= 1;
    const dh = h.map((hj, j) => (1 - hj * hj) * dz.reduce((s, d, k) => s + W2[j][k] * d, 0));
    for (let j = 0; j < H; j++) { for (let k = 0; k < C; k++) W2[j][k] -= lr * h[j] * dz[k]; b1[j] -= lr * dh[j]; }
    for (let k = 0; k < C; k++) b2[k] -= lr * dz[k];
    for (const i of idx) for (let j = 0; j < H; j++) W1[i][j] -= lr * dh[j];
  }
}

export const model = {
  shape: `${V} to ${H} to ${C}`, samples: samples.length, trainMs: Math.round(performance.now() - started),
  accuracy: Math.round((prepared.filter(({ idx, y }) => forward(idx).p.indexOf(Math.max(...forward(idx).p)) === y).length / prepared.length) * 100),
};

export function classify(text: string): Array<{ intent: Intent | "unknown"; p: number }> {
  const idx = indices(text);
  if (!idx.length) return [{ intent: "unknown", p: 0 }];
  const { p } = forward(idx);
  return p.map((v, k) => ({ intent: intents[k] as Intent, p: v })).sort((a, b) => b.p - a.p).slice(0, 3);
}
