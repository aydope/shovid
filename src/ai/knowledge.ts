import { planList } from "@/commerce";
import { posts, products, ratingOf, stores } from "@/data";
import { terms } from "./nlp";

export interface Doc {
  id: string;
  tag: string;
  title: string;
  text: string;
  link?: string;
}

export const docs: Doc[] = [
  {
    id: "returns",
    tag: "policy",
    title: "Returns and refunds",
    link: "/shipping",
    text: "Unworn shoes in their original box can be returned within 30 days for a full refund to the original payment method. Returns are free worldwide, and refunds arrive within 5 working days of us receiving the parcel.",
  },
  {
    id: "shipping",
    tag: "policy",
    title: "Shipping and delivery",
    link: "/shipping",
    text: "We ship to 48 countries. EU orders arrive in 2 to 4 working days and international orders in 4 to 8. Shipping is free over $150 (or lower with a membership plan), otherwise it is a flat $15.",
  },
  {
    id: "sizing",
    tag: "policy",
    title: "Sizing and fit",
    link: "/size-guide",
    text: "Sizes run EU 40 to 45. Measure your foot length in centimetres and match it to the size chart. Between sizes, choose the larger size for running shoes and your usual size for lifestyle sneakers. Each product page shows a fit meter based on buyer feedback.",
  },
  {
    id: "payment",
    tag: "policy",
    title: "Payment methods",
    link: "/checkout",
    text: "You can pay by card or by bank transfer at checkout. Card details are validated in the browser and only the last 4 digits are stored. Bank transfer orders are held until the payment arrives.",
  },
  {
    id: "gifts",
    tag: "policy",
    title: "Gift cards and gifting",
    link: "/gift-cards",
    text: "Digital gift cards from $50 to $500 arrive by email instantly and are valid for two years. Gift wrapping is free on every order.",
  },
  {
    id: "contact",
    tag: "policy",
    title: "Talk to an advisor",
    link: "/contact",
    text: "Our client advisors reply by email within one working day. Gold members get priority replies and Noir members get a concierge.",
  },
  {
    id: "alterations",
    tag: "policy",
    title: "Repairs and resoling",
    link: "/account/subscription",
    text: "Defects are repaired free for 60 days. Gold includes 2 free repairs a year and Noir includes unlimited repairs, covering resoling, cleaning and stitching.",
  },
  {
    id: "care-knit",
    tag: "care",
    title: "Caring for running shoes",
    text: "Rinse mesh uppers with lukewarm water and a soft brush, never use a washing machine or dryer, and air dry away from heat with paper inside to hold the shape.",
  },
  {
    id: "care-leather",
    tag: "care",
    title: "Caring for sneakers",
    text: "Brush off dirt, clean uppers with mild soap and a damp cloth, remove laces to wash them separately and air dry away from heat. Brush suede with a suede brush and avoid soaking.",
  },
  {
    id: "care-coat",
    tag: "care",
    title: "Storing your sneakers",
    text: "Keep sneakers in a ventilated spot out of direct sun, with shoe trees or paper inside to hold their shape. Rotate pairs to let the foam recover.",
  },
  {
    id: "stores",
    tag: "policy",
    title: "Store locations",
    link: "/stores",
    text: `Fittings are free and take about thirty minutes. ${stores.map(([n, a, h, p]) => `${n}: ${a}, ${h}, ${p}`).join(". ")}.`,
  },
  {
    id: "plans",
    tag: "policy",
    title: "Membership plans",
    link: "/membership",
    text:
      planList
        .map(
          (p) =>
            `${p.name} costs ${p.price.month ? `$${p.price.month} a month or $${p.price.year} a year` : "nothing"}: ${p.perks.join(", ")}`,
        )
        .join(". ") + ".",
  },
  {
    id: "rewards",
    tag: "policy",
    title: "Points and rewards",
    link: "/account/rewards",
    text: "Members earn 1 to 2 points per dollar depending on their plan. Rewards: $10 voucher at 500 points, free repair at 1,200, $50 voucher at 2,500 and a private styling session at 4,000.",
  },
  {
    id: "promos",
    tag: "policy",
    title: "Promotions",
    link: "/promotions",
    text: "Recurring offers apply automatically at checkout: Friday Flash 15% every Friday, Weekend Running Sale 20% on Running every Saturday and Sunday, Payday Week 10% in the first 7 days of the month and the Autumn Trail Event 25% on Trail in October and November. Offers stack with your member discount up to 40% of the subtotal.",
  },
  {
    id: "careers",
    tag: "policy",
    title: "Careers",
    link: "/careers",
    text: "Open roles: Footwear Designer in Porto (full time), Client Advisor in Berlin (full time), Frontend Engineer (remote, full time) and Visual Merchandiser in Paris (part time). Apply through the contact page.",
  },
  {
    id: "about",
    tag: "policy",
    title: "About Shovid",
    link: "/about",
    text: "Shovid is a footwear house from Porto, Portugal. We design premium sneakers for running, courts, trails and the city, make them in small runs, and repair them for life. We source full grain leather, suede and recycled mesh from audited suppliers.",
  },
  ...products.map(
    (p): Doc => ({
      id: `product-${p.id}`,
      tag: "product",
      title: p.name,
      link: `/product/${p.id}`,
      text: `${p.name} is a ${p.category} sneaker priced at $${p.price}. ${p.note}. ${p.stock} pairs in stock. Rated ${ratingOf(p).toFixed(1)} stars.`,
    }),
  ),
  ...posts.map(
    (p): Doc => ({
      id: `post-${p.slug}`,
      tag: "journal",
      title: p.title,
      link: `/journal/${p.slug}`,
      text: `${p.excerpt} ${p.body.join(" ")}`,
    }),
  ),
];

const indexed = docs.map((d) => ({
  d,
  t: terms(`${d.title} ${d.title} ${d.text}`),
}));
const avg = indexed.reduce((s, x) => s + x.t.length, 0) / indexed.length;
const df = new Map<string, number>();
indexed.forEach(({ t }) =>
  new Set(t).forEach((w) => df.set(w, (df.get(w) ?? 0) + 1)),
);

export function retrieve(query: string, tag?: string, k = 3) {
  const q = terms(query);
  return indexed
    .filter(({ d }) => !tag || d.tag === tag)
    .map(({ d, t }) => {
      let score = 0;
      for (const w of new Set(q)) {
        const f = t.filter((x) => x === w).length;
        if (!f) continue;
        const idf = Math.log(
          1 +
            (indexed.length - (df.get(w) ?? 0) + 0.5) /
              ((df.get(w) ?? 0) + 0.5),
        );
        score +=
          idf * ((f * 2.5) / (f + 1.5 * (0.25 + (0.75 * t.length) / avg)));
      }
      return { doc: d, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
