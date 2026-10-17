import type { ReactNode } from "react";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ChevronDown } from "lucide-react";
import { PageShell } from "@/components/PageShell";

type Section = [heading: string, text: string];

function InfoPage({ title, lead, sections, children }: { title: string; lead: string; sections: Section[]; children?: ReactNode }) {
  return (
    <PageShell title={title} lead={lead}>
      {children}
      <div className="space-y-8">
        {sections.map(([h, t]) => <div key={h} className="border-t border-sand pt-6"><h2 className="font-display text-3xl">{h}</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70">{t}</p></div>)}
      </div>
    </PageShell>
  );
}

export const About = () => (
  <InfoPage title="About Shovid" lead="A clothing house built around fewer, better garments." sections={[
    ["Our story", "Shovid started as a three person tailoring studio and grew by word of mouth. We still cut every pattern in house."],
    ["Materials", "We source wool, cashmere, silk and linen from mills we have visited, and publish the origin of each fabric."],
    ["Responsibility", "Small production runs reduce waste. Every garment can be mended by us for life."],
  ]} />
);

export const Shipping = () => (
  <InfoPage title="Shipping and returns" lead="Insured delivery worldwide, with free returns for 30 days." sections={[
    ["Delivery times", "EU orders arrive in 2 to 4 working days. International orders take 4 to 8 working days."],
    ["Shipping cost", "Free on orders over $500. Otherwise a flat $15 within the EU and $30 elsewhere."],
    ["Returns", "Unworn items with tags can be returned within 30 days for a full refund to the original payment method."],
  ]} />
);

export const SizeGuide = () => (
  <InfoPage title="Size guide" lead="Measurements are in centimetres, taken on the body." sections={[["Between sizes?", "Choose the smaller size for knitwear and the larger size for tailoring."]]}>
    <div className="mb-12 overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead><tr className="border-b border-ink text-xs uppercase tracking-widest">{["Size", "Chest", "Waist", "Hip"].map((h) => <th key={h} className="py-3">{h}</th>)}</tr></thead>
        <tbody>{[["XS", 84, 68, 90], ["S", 92, 76, 96], ["M", 100, 84, 102], ["L", 108, 92, 108], ["XL", 116, 100, 114]].map((r) => <tr key={r[0]} className="border-b border-sand">{r.map((c, i) => <td key={i} className="py-3">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  </InfoPage>
);

export const Privacy = () => (
  <InfoPage title="Privacy" lead="What we collect and why." sections={[
    ["Data we collect", "Contact details, delivery addresses and order history, only to fulfil and support your orders."],
    ["Your rights", "You can request access, correction or deletion of your data by contacting us."],
  ]} />
);

export const Terms = () => (
  <InfoPage title="Terms of sale" lead="The conditions that apply to purchases." sections={[
    ["Orders", "An order is confirmed when we send a dispatch email. We may cancel orders affected by pricing errors."],
    ["Liability", "Statutory consumer rights are not affected by these terms."],
  ]} />
);

const faqs: Section[] = [
  ["How do I choose my size?", "Use the size guide and measure a garment you already own. Our advisors can also help by email."],
  ["Can I change or cancel an order?", "Yes, within two hours of purchase. After that we will have started preparing it."],
  ["Do you offer alterations?", "Hemming and sleeve adjustments are free on tailoring for the first 60 days."],
  ["Which payment methods are accepted?", "Cards, Apple Pay and bank transfer once payments are enabled on the store."],
];

export const Faq = () => (
  <PageShell title="FAQ" lead="Quick answers to common questions.">
    {faqs.map(([q, a]) => (
      <Accordion key={q} disableGutters>
        <AccordionSummary expandIcon={<ChevronDown size={18} />}><span className="font-display text-2xl">{q}</span></AccordionSummary>
        <AccordionDetails><p className="text-sm text-ink/70">{a}</p></AccordionDetails>
      </Accordion>
    ))}
  </PageShell>
);
