import { FormPage } from "./FormPage";

const email = { name: "email", label: "Email", type: "email" };

export const Contact = () => (
  <FormPage title="Contact" lead="Our client advisors reply within one working day." fields={[{ name: "name", label: "Name" }, email, { name: "message", label: "Message", textarea: true }]} cta="Send message" success="Message validated. Connect a mail endpoint to deliver it." />
);

const tiers = [["10 to 49 pieces", "10% off"], ["50 to 199 pieces", "18% off"], ["200+ pieces", "25% off"]];

export const Wholesale = () => (
  <FormPage title="Wholesale" lead="Stock Shovid in your boutique. Request a quote and receive line sheets within two days." cta="Request quote" success="Request validated. Connect a CRM or mail endpoint to receive it."
    fields={[{ name: "company", label: "Company" }, email, { name: "qty", label: "Estimated quantity", type: "number" }, { name: "notes", label: "Requirements", textarea: true }]}
    intro={<div className="mb-12 grid gap-4 md:grid-cols-3">{tiers.map(([q, d]) => <div key={q} className="border border-ink p-6"><p className="text-xs uppercase tracking-widest">{q}</p><p className="mt-2 font-display text-4xl text-gold">{d}</p></div>)}</div>} />
);
