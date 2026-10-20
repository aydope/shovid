import { photo } from "./images";

export type Category = "Running" | "Lifestyle" | "High Tops" | "Trail" | "Court";

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  tone: string;
  stock: number;
  note: string;
}

export type OrderStatus = "Processing" | "Shipped" | "Delivered" | "Refunded";

export interface Order {
  id: string;
  customer: string;
  total: number;
  status: OrderStatus;
  date: string;
}

const base: Product[] = [
  { id: "p1", name: "Nova Runner", category: "Running", price: 180, tone: "#f1ede4", stock: 14, note: "Responsive foam, breathable mesh" },
  { id: "p2", name: "Pulse Racer", category: "Running", price: 210, tone: "#1f3a5f", stock: 32, note: "Carbon plate, race day weight" },
  { id: "p3", name: "Aero Glide", category: "Running", price: 195, tone: "#b5485d", stock: 21, note: "Max cushion daily trainer" },
  { id: "p4", name: "Stride Elite", category: "Running", price: 240, tone: "#222222", stock: 48, note: "Knit upper, rocker sole" },
  { id: "p5", name: "Atelier Leather Sneaker", category: "Lifestyle", price: 220, tone: "#4a2c1d", stock: 6, note: "Full grain leather, cup sole" },
  { id: "p6", name: "Linden Suede Sneaker", category: "Lifestyle", price: 200, tone: "#9a6b3f", stock: 27, note: "Italian suede, cushioned insole" },
  { id: "p7", name: "Coast Canvas Low", category: "Lifestyle", price: 130, tone: "#2d4a6b", stock: 11, note: "Organic canvas, vulcanised sole" },
  { id: "p8", name: "Ivoire Minimal", category: "Lifestyle", price: 175, tone: "#efe6d4", stock: 120, note: "Clean leather, tonal stitching" },
];

export const categories: Array<"All" | Category> = ["All", "Running", "Lifestyle", "High Tops", "Trail", "Court"];

export const orders: Order[] = [
  { id: "SH-10482", customer: "Amara Voss", total: 1820, status: "Processing", date: "2026-10-18" },
  { id: "SH-10481", customer: "Luca Bianchi", total: 640, status: "Shipped", date: "2026-10-17" },
  { id: "SH-10477", customer: "Mei Tanaka", total: 2250, status: "Delivered", date: "2026-10-15" },
  { id: "SH-10470", customer: "Jonas Keller", total: 420, status: "Refunded", date: "2026-10-12" },
  { id: "SH-10466", customer: "Sofia Marin", total: 1100, status: "Delivered", date: "2026-10-10" },
];

export const weeklyRevenue = [
  { day: "Mon", value: 8400 }, { day: "Tue", value: 11200 }, { day: "Wed", value: 9600 },
  { day: "Thu", value: 14800 }, { day: "Fri", value: 17300 }, { day: "Sat", value: 21900 }, { day: "Sun", value: 15100 },
];

const extra: Array<[string, Category, number, string, string]> = [
  ["Halcyon High-Top", "High Tops", 185, "#b9a98f", "Padded collar, retro profile"],
  ["Noir High-Top", "High Tops", 210, "#0e0d0b", "Black leather, gum sole"],
  ["Ember Mid-Top", "High Tops", 195, "#c2955a", "Suede overlays, mid cut"],
  ["Arctic High-Top", "High Tops", 205, "#dfe3e6", "Pale leather, reinforced toe"],
  ["Ridge Trail", "Trail", 230, "#3a3f3a", "Grippy lugs, rock plate"],
  ["Summit Hiker", "Trail", 260, "#5b4a2e", "Waterproof membrane"],
  ["Canyon Trail", "Trail", 245, "#a67c52", "Cushioned, all terrain"],
  ["Forest Runner", "Trail", 225, "#2f5d50", "Light trail runner"],
  ["Meridian Court", "Court", 170, "#f0ebe0", "Court classic, leather"],
  ["Verona Court", "Court", 185, "#5b1a1a", "Burgundy accents"],
  ["Sable Court", "Court", 160, "#d8cbb2", "Tennis inspired low top"],
  ["Cassel Court Pro", "Court", 215, "#33392f", "Premium leather, extra cushioning"],
];

export const products: Product[] = [
  ...base,
  ...extra.map(([name, category, price, tone, note], i): Product => ({
    id: `p${base.length + i + 1}`, name, category, price, tone, note, stock: 4 + ((i * 13) % 40),
  })),
];

export interface Review { id: string; author: string; rating: number; title: string; body: string; date: string; likes: number }

const reviewers = ["Amara V.", "Luca B.", "Mei T.", "Jonas K.", "Sofia M.", "Daniel R.", "Ines C.", "Omar H.", "Clara W.", "Theo L."];
const reviewText: Array<[string, string]> = [
  ["Worth every cent", "The build feels far better than the price suggests and the fit was right on my first size."],
  ["Beautifully finished", "The stitching and lasting are spotless. You can tell somebody cared about this pair."],
  ["Runs slightly large", "Lovely shoe, but go half a size down if you are between sizes. Customer service swapped them quickly."],
  ["My new favourite", "Wore them three days in a row. Comfortable out of the box and no creasing at all."],
  ["Quiet luxury", "Understated, no logos, and it gets compliments anyway. Packaging was excellent too."],
];

export const reviewsFor = (p: Product): Review[] => {
  const seed = Number(p.id.slice(1));
  return Array.from({ length: 3 + (seed % 3) }, (_, i) => {
    const [title, body] = reviewText[(seed + i) % reviewText.length];
    return {
      id: `${p.id}-r${i}`, author: reviewers[(seed * 3 + i) % reviewers.length],
      rating: 4 + ((seed + i) % 5 === 0 ? 0 : 1), title, body, likes: (seed * 7 + i * 11) % 42, date: `2026-0${9 - (i % 3)}-${10 + ((seed + i * 5) % 18)}`,
    };
  });
};

export const sizes = ["40", "41", "42", "43", "44", "45"];

export const likesFor = (p: Product) => 120 + ((Number(p.id.slice(1)) * 37) % 900);

export const ratingOf = (p: Product) => { const r = reviewsFor(p); return r.reduce((s, x) => s + x.rating, 0) / r.length; };
export const discountFor = (p: Product) => { const n = Number(p.id.slice(1)); return n % 3 === 0 ? 30 : n % 2 === 0 ? 20 : 0; };

export interface Post { slug: string; title: string; tag: string; excerpt: string; body: string[]; read: number; date: string; author: string }

export const posts: Post[] = [
  { slug: "inside-the-porto-last-room", title: "Inside the Porto last room", tag: "Craft", read: 6, date: "2026-10-02", author: "Marta Reis", excerpt: "Twelve people, hundreds of wooden lasts and one rule: no pair leaves before it has been walked in.",
    body: ["The atelier sits above a bakery, so every fitting starts with the smell of bread. Twelve people work here, from pattern cutters to the two finishers who stitch every upper by hand.", "A sneaker begins as a paper pattern and a wooden last shaped to a real foot. Each design is prototyped, worn for a week and corrected until it feels right.", "Only then does the leather come out. Cutting takes an afternoon and lasting takes two days. Nothing leaves before it has been walked in, and nothing is rushed to hit a drop date."] },
  { slug: "how-to-choose-running-shoes", title: "How to choose running shoes", tag: "Guide", read: 5, date: "2026-09-24", author: "Elena Fox", excerpt: "Cushion, drop and fit explained, plus which Shovid model suits easy miles, long runs and race day.",
    body: ["Start with how you run. Easy miles and long runs reward cushion, while short fast sessions suit a lighter shoe with a stiffer plate.", "Fit matters more than any spec. Leave a thumb of space in front of your toes and make sure your heel does not slip when you push off.", "Many runners keep two pairs and alternate them. The foam recovers between runs and you spread the load across different parts of your feet."] },
  { slug: "cleaning-white-sneakers", title: "Cleaning white sneakers", tag: "Care", read: 4, date: "2026-09-12", author: "Marta Reis", excerpt: "Brush, soap, air dry. The simple routine that keeps white leather and mesh looking new.",
    body: ["Remove the laces and brush off loose dirt with a soft brush. Wash the laces separately in warm water.", "Clean leather with mild soap and a damp cloth, working in small circles. For mesh, use a soft brush and a little soapy water, never a hard scrub.", "Let the shoes air dry away from direct heat and stuff them with paper to keep their shape. A quick clean every two weeks beats a deep clean every season."] },
  { slug: "why-we-use-full-grain-leather", title: "Why we use full grain leather", tag: "Materials", read: 7, date: "2026-08-30", author: "Daniel Reis", excerpt: "It ages better, repairs better and breathes better. A look at the tanneries behind our leather sneakers.",
    body: ["Full grain leather keeps the strongest part of the hide intact. It develops a patina instead of cracking, which is why a good pair looks better after a year of wear.", "It also repairs. Scuffs can be polished out and soles can be replaced, while corrected grain and coated materials tend to peel.", "We buy from two audited tanneries in northern Portugal and publish the origin of every hide. That traceability is part of the price."] },
  { slug: "a-day-at-the-resole-bench", title: "A day at the resole bench", tag: "Stories", read: 5, date: "2026-08-14", author: "Elena Fox", excerpt: "Fresh soles, new laces and a very long lunch with the cobblers who keep your shoes going.",
    body: ["The repair bench opens at nine. By ten, the first pairs have their old soles removed and the uppers cleaned.", "Each pair gets a new sole, fresh insoles and a full polish. Members on Gold and Noir get repairs included, and everyone else gets them at cost.", "Lunch is communal. It is the one hour when nobody talks about shoes, and somehow it is when the best ideas arrive."] },
  { slug: "court-vs-running-shoes", title: "Court shoes versus running shoes", tag: "Guide", read: 6, date: "2026-07-28", author: "Daniel Reis", excerpt: "Flat soles and lateral support against cushioning and forward roll. Which one you need and when.",
    body: ["Court shoes have a flatter, firmer sole and side support for quick changes of direction. They also look cleaner with everyday outfits.", "Running shoes are built to roll you forward with soft foam under the heel. They are lighter, but the soft foam wears faster on city pavements.", "If you walk a lot in the city, a court shoe is the longer lasting choice. If you run, buy a running shoe and keep it for running."] },
];

export const img = (key: string, w = 600, h = 750) => {
  const [id, n] = key.split("-");
  const rank = products.findIndex((x) => x.id === id);
  const shot = /^\d$/.test(n ?? "") ? Number(n) : 0;
  if (rank < 0) {
    const hash = [...key].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    return photo(hash % 11, hash % 4, w, h);
  }
  return photo(rank, shot, w, h);
};

export const stores = [["Porto Flagship", "Rua das Flores 28, Porto", "Mon to Sat, 10:00 to 19:00", "+351 220 000 000"], ["Lisbon Chiado", "Rua Garrett 40, Lisbon", "Mon to Sat, 10:00 to 20:00", "+351 210 000 000"], ["Berlin Mitte", "Torstrasse 100, Berlin", "Tue to Sat, 11:00 to 19:00", "+49 30 000000"], ["Paris Marais", "Rue de Bretagne 12, Paris", "Tue to Sun, 11:00 to 19:00", "+33 1 00 00 00 00"]];
