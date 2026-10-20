import { posts } from "@/data";
import { terms } from "./nlp";

export interface Doc { id: string; tag: string; title: string; text: string; link?: string }

export const docs: Doc[] = [
  { id: "returns", tag: "policy", title: "Returns and refunds", link: "/shipping", text: "Unworn items with tags can be returned within 30 days for a full refund to the original payment method. Returns are free worldwide, and refunds arrive within 5 working days of us receiving the parcel." },
  { id: "shipping", tag: "policy", title: "Shipping and delivery", link: "/shipping", text: "We ship to 48 countries. EU orders arrive in 2 to 4 working days and international orders in 4 to 8. Shipping is free over $500 (or lower with a membership plan), otherwise it is a flat $15." },
  { id: "sizing", tag: "policy", title: "Sizing and fit", link: "/size-guide", text: "Our size guide lists chest, waist and hip measurements in centimetres. Between sizes, choose the smaller size for knitwear and the larger size for tailoring. Each product page shows a fit meter based on buyer feedback." },
  { id: "payment", tag: "policy", title: "Payment methods", link: "/checkout", text: "You can pay by card or by bank transfer at checkout. Card details are validated in the browser and only the last 4 digits are stored. Bank transfer orders are held until the payment arrives." },
  { id: "gifts", tag: "policy", title: "Gift cards and gifting", link: "/gift-cards", text: "Digital gift cards from $50 to $500 arrive by email instantly and are valid for two years. Gift wrapping is free on every order." },
  { id: "contact", tag: "policy", title: "Talk to an advisor", link: "/contact", text: "Our client advisors reply by email within one working day. Gold members get priority replies and Noir members get a concierge." },
  { id: "alterations", tag: "policy", title: "Alterations", link: "/account/subscription", text: "Hemming and sleeve adjustments are free on tailoring for 60 days. Gold includes 2 free alterations a year and Noir includes unlimited alterations." },
  { id: "care-knit", tag: "care", title: "Caring for cashmere and knitwear", link: "/journal/caring-for-cashmere", text: "Wash cashmere and wool by hand in cold water with wool detergent, press out the water in a towel and dry flat. Rest each knit for two days between wears and brush off early pilling with a cashmere comb." },
  { id: "care-leather", tag: "care", title: "Caring for leather and suede", text: "Wipe leather with a soft damp cloth and condition it twice a year. Brush suede with a suede brush, avoid soaking, and store shoes with cedar shoe trees." },
  { id: "care-coat", tag: "care", title: "Caring for coats and tailoring", text: "Store coats and jackets on wide shoulder hangers, steam to remove creases and dry clean only when needed, ideally once a season." },
  ...posts.map((p): Doc => ({ id: `post-${p.slug}`, tag: "journal", title: p.title, link: `/journal/${p.slug}`, text: `${p.excerpt} ${p.body.join(" ")}` })),
];

const indexed = docs.map((d) => ({ d, t: terms(`${d.title} ${d.title} ${d.text}`) }));
const avg = indexed.reduce((s, x) => s + x.t.length, 0) / indexed.length;
const df = new Map<string, number>();
indexed.forEach(({ t }) => new Set(t).forEach((w) => df.set(w, (df.get(w) ?? 0) + 1)));

export function retrieve(query: string, tag?: string, k = 3) {
  const q = terms(query);
  return indexed
    .filter(({ d }) => !tag || d.tag === tag)
    .map(({ d, t }) => {
      let score = 0;
      for (const w of new Set(q)) {
        const f = t.filter((x) => x === w).length;
        if (!f) continue;
        const idf = Math.log(1 + (indexed.length - (df.get(w) ?? 0) + 0.5) / ((df.get(w) ?? 0) + 0.5));
        score += idf * ((f * 2.5) / (f + 1.5 * (0.25 + (0.75 * t.length) / avg)));
      }
      return { doc: d, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
