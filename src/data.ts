import { photo, type Kind } from "./images";

export type Category = "Outerwear" | "Knitwear" | "Tailoring" | "Essentials" | "Footwear";

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
  { id: "p1", name: "Lumen Wool Overcoat", category: "Outerwear", price: 1180, tone: "#2b2723", stock: 14, note: "Double-faced Italian wool" },
  { id: "p2", name: "Aurelia Cashmere Roll Neck", category: "Knitwear", price: 640, tone: "#b08d57", stock: 32, note: "Grade A Mongolian cashmere" },
  { id: "p3", name: "Verona Pleated Trouser", category: "Tailoring", price: 420, tone: "#5b1a1a", stock: 21, note: "Tropical wool, high rise" },
  { id: "p4", name: "Sable Silk Shirt", category: "Essentials", price: 320, tone: "#d8cbb2", stock: 48, note: "19 momme mulberry silk" },
  { id: "p5", name: "Noir Leather Trench", category: "Outerwear", price: 2250, tone: "#0e0d0b", stock: 6, note: "Vegetable-tanned lambskin" },
  { id: "p6", name: "Ivoire Merino Cardigan", category: "Knitwear", price: 480, tone: "#efe6d4", stock: 27, note: "Extra-fine 15.5 micron merino" },
  { id: "p7", name: "Meridian Single-Breasted Blazer", category: "Tailoring", price: 960, tone: "#3a3f3a", stock: 11, note: "Half-canvas, hand-set sleeves" },
  { id: "p8", name: "Atelier Pima Tee", category: "Essentials", price: 140, tone: "#f0ebe0", stock: 120, note: "Heavyweight 220gsm" },
];

export const categories: Array<"All" | Category> = ["All", "Outerwear", "Knitwear", "Tailoring", "Essentials", "Footwear"];

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
  ["Cassel Camel Coat", "Outerwear", 1390, "#a67c52", "Brushed wool and cashmere blend"],
  ["Orsay Quilted Jacket", "Outerwear", 780, "#33392f", "Recycled down, matte shell"],
  ["Hale Shearling Bomber", "Outerwear", 1850, "#4a3426", "Reversible Spanish shearling"],
  ["Pallas Alpaca Cardigan", "Knitwear", 560, "#cdbfa6", "Baby alpaca, shawl collar"],
  ["Rhone Fisherman Sweater", "Knitwear", 520, "#e9e1cf", "Chunky merino rib"],
  ["Vesper Knit Polo", "Knitwear", 360, "#1f1d1a", "Mercerised cotton, open weave"],
  ["Lysander Three-Piece Suit", "Tailoring", 2100, "#2a2d33", "Super 120s wool, full canvas"],
  ["Corvin Linen Suit Jacket", "Tailoring", 890, "#c9bba0", "Irish linen, unlined"],
  ["Elan Wide-Leg Trouser", "Tailoring", 390, "#3d1414", "Fluid crepe, side adjusters"],
  ["Marche Oxford Shirt", "Essentials", 210, "#dfe3e6", "Brushed cotton, mother of pearl"],
  ["Linden Cotton Hoodie", "Essentials", 260, "#8d8a82", "Loopback terry, 480gsm"],
  ["Quill Straight Denim", "Essentials", 290, "#25303d", "Japanese selvedge, raw"],
  ["Nera Silk Slip Dress", "Essentials", 540, "#6b2230", "Bias-cut charmeuse"],
  ["Soleil Wrap Dress", "Tailoring", 680, "#c28a3a", "Matte crepe, tonal buttons"],
  ["Ardent Leather Belt", "Essentials", 180, "#3b2a1c", "Full-grain, brass buckle"],
  ["Halcyon Cashmere Scarf", "Knitwear", 340, "#b9a98f", "Hand-fringed, 200cm"],
  ["Rivoli Leather Derby", "Footwear", 540, "#4a2c1d", "Goodyear welted calfskin"],
  ["Tulum Suede Loafer", "Footwear", 420, "#9a6b3f", "Italian suede, leather sole"],
  ["Arden Chelsea Boot", "Footwear", 620, "#1d1a17", "Hand-burnished leather"],
  ["Nova Leather Sneaker", "Footwear", 310, "#f1ede4", "Minimal court sneaker"],
  ["Coast Canvas Sneaker", "Footwear", 180, "#2d4a6b", "Organic canvas, rubber sole"],
  ["Pellia Ballet Flat", "Footwear", 360, "#b5485d", "Nappa leather, flexible sole"],
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
  ["Worth every cent", "The fabric feels far heavier than the price suggests and the fit was right on my first size."],
  ["Beautifully finished", "Inside seams are as clean as the outside. You can tell somebody cared about this one."],
  ["Runs slightly large", "Lovely piece, but I would size down if you are between sizes. Customer service swapped it quickly."],
  ["My new favourite", "Wore it three days in a row. Drapes well and has not creased at all."],
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

export const sizes = ["XS", "S", "M", "L", "XL"];

export const likesFor = (p: Product) => 120 + ((Number(p.id.slice(1)) * 37) % 900);

export const ratingOf = (p: Product) => { const r = reviewsFor(p); return r.reduce((s, x) => s + x.rating, 0) / r.length; };
export const discountFor = (p: Product) => { const n = Number(p.id.slice(1)); return n % 3 === 0 ? 30 : n % 2 === 0 ? 20 : 0; };

export interface Post { slug: string; title: string; tag: string; excerpt: string; body: string[]; read: number; date: string; author: string }

export const posts: Post[] = [
  { slug: "inside-the-porto-atelier", title: "Inside the Porto atelier", tag: "Craft", read: 6, date: "2026-10-02", author: "Marta Reis", excerpt: "Twelve pattern cutters, one cutting table and a rule that no coat leaves before its third fitting.",
    body: ["The atelier sits above a bakery, which means every fitting starts with the smell of bread. Twelve people work here, from pattern cutters to the two finishers who sew every buttonhole by hand.", "A coat begins as a paper pattern graded across five sizes. Each pattern is cut in calico first, pinned on a model and corrected until the shoulder falls cleanly.", "Only then does the wool come out. Cutting takes one afternoon and finishing takes four days. Nothing leaves before its third fitting, and nothing is rushed to hit a drop date."] },
  { slug: "capsule-winter-wardrobe", title: "How to build a capsule winter wardrobe", tag: "Guide", read: 5, date: "2026-09-24", author: "Elena Fox", excerpt: "Seven pieces in three tones that cover office, weekend and travel without repeating an outfit.",
    body: ["Start with a neutral base: a camel coat, a navy knit and a pair of charcoal trousers. These three carry most of your week.", "Add texture rather than colour. A ribbed roll neck and a brushed overshirt make the same trousers look different on Tuesday and Saturday.", "Finish with one accent piece. A burgundy scarf or an ivory cardigan is enough to make the whole set feel considered."] },
  { slug: "caring-for-cashmere", title: "Caring for cashmere", tag: "Care", read: 4, date: "2026-09-12", author: "Marta Reis", excerpt: "Wash cold, dry flat and rest the garment between wears. Pilling in the first month is normal.",
    body: ["Cashmere fibres are fine and short, so some surface fuzz in the first weeks is normal. Brush it off gently with a cashmere comb.", "Wash by hand in cold water with a wool detergent, press out the water in a towel and dry flat away from direct heat.", "Rest each knit for two days between wears. The fibres recover their shape and you will see the garment last far longer."] },
  { slug: "why-natural-fibres", title: "Why we only use natural fibres", tag: "Materials", read: 7, date: "2026-08-30", author: "Daniel Reis", excerpt: "Wool, silk, linen and cotton age better, repair better and breathe better than blends.",
    body: ["Natural fibres regulate temperature in a way synthetics cannot. Wool warms you when it is cold and keeps you comfortable when it is mild.", "They also repair. A moth hole in wool can be darned invisibly, while a snag in a blend tends to run.", "That is why 92% of our range is made from natural fibres, and why our repair program exists at all."] },
  { slug: "a-day-in-paris", title: "A day in Paris with the Marais team", tag: "Stories", read: 5, date: "2026-08-14", author: "Elena Fox", excerpt: "Fittings, coffee and a very long lunch with the people behind our newest store.",
    body: ["The Marais store opens at eleven, but the team arrives at nine to steam every garment on the rail.", "Fittings run in thirty minute slots. Our advisors keep a notebook for every regular client, from preferred sleeve length to favourite colours.", "Lunch is communal. It is the one hour when nobody talks about clothes, and somehow it is when the best ideas arrive."] },
  { slug: "tailoring-vs-ready-to-wear", title: "Tailoring versus ready to wear", tag: "Guide", read: 6, date: "2026-07-28", author: "Daniel Reis", excerpt: "What half canvas construction actually means and when it is worth paying for.",
    body: ["A canvas layer inside the chest of a jacket lets it mould to your body over time. Fused jackets use glue instead and stay flat.", "Half canvas gives you most of that benefit at a fair price, which is why our blazers use it.", "If you wear a jacket weekly for years, the difference becomes obvious. For occasional wear, fused construction is perfectly fine."] },
];

const kinds: Kind[] = ["coat", "knit", "trouser", "shirt", "dress", "shoe", "sneaker", "boot", "scarf"];

const kindOf = (name: string, category: string): Kind => {
  const n = name.toLowerCase();
  if (category === "Footwear") return /boot/.test(n) ? "boot" : /sneaker/.test(n) ? "sneaker" : "shoe";
  if (/scarf/.test(n)) return "scarf";
  if (/belt/.test(n)) return "belt";
  if (/dress/.test(n)) return "dress";
  if (/trouser|denim|jean/.test(n)) return "trouser";
  if (/shirt|tee|polo/.test(n)) return "shirt";
  if (/sweater|cardigan|roll neck|hoodie|knit/.test(n)) return "knit";
  return "coat";
};

const group = (k: Kind) => (k === "shoe" || k === "boot" || k === "sneaker" ? "foot" : k);
const rankOf = (p: Product) => {
  const g = group(kindOf(p.name, p.category));
  return products.filter((x) => group(kindOf(x.name, x.category)) === g).findIndex((x) => x.id === p.id);
};

export const img = (key: string, w = 600, h = 750) => {
  const [id, n] = key.split("-");
  const p = products.find((x) => x.id === id);
  if (!p) {
    const hash = [...key].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    return photo(kinds[hash % kinds.length], hash % 5, hash % 4, hash, w, h);
  }
  return photo(kindOf(p.name, p.category), rankOf(p), /^\d$/.test(n ?? "") ? Number(n) : 0, Number(p.id.slice(1)) * 13, w, h);
};
