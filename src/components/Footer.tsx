import { Link } from "react-router-dom";
import { CreditCard, Facebook, Gift, Globe, Instagram, Landmark, Leaf, Lock, MapPin, Mail, Phone, RefreshCw, Smartphone, Twitter, Wallet, Youtube } from "lucide-react";

const columns = [
  { title: "Shop", links: [["New arrivals", "/new-arrivals"], ["Collections", "/collections"], ["Sale", "/sale"], ["Promotions", "/promotions"], ["Lookbook", "/lookbook"], ["Gift cards", "/gift-cards"]] },
  { title: "Support", links: [["Track order", "/track"], ["Shipping and returns", "/shipping"], ["Size guide", "/size-guide"], ["FAQ", "/faq"], ["Contact", "/contact"]] },
  { title: "Company", links: [["About", "/about"], ["Sustainability", "/sustainability"], ["Careers", "/careers"], ["Stores", "/stores"], ["Journal", "/journal"]] },
  { title: "Members", links: [["Membership", "/membership"], ["Sign in", "/login"], ["Join", "/register"], ["Wholesale", "/wholesale"], ["Wishlist", "/wishlist"]] },
];
const badges = [[RefreshCw, "30 day returns"], [Lock, "Secure checkout"], [Leaf, "Natural fibres"], [Gift, "Gift wrapping"]] as const;
const social = [[Instagram, "Instagram"], [Twitter, "Twitter"], [Youtube, "YouTube"], [Facebook, "Facebook"]] as const;
const pay = [CreditCard, Wallet, Landmark, Smartphone];

export function Footer() {
  return (
    <footer className="mt-32 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 border-b border-white/10 px-6 py-10 md:grid-cols-4">
        {badges.map(([Icon, text]) => <div key={text} className="flex items-center gap-3 text-sm"><Icon size={22} className="text-mint" />{text}</div>)}
      </div>
      <div data-reveal="stagger" className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <p className="text-3xl font-bold tracking-tight">shovid<span className="text-gold">.</span></p>
          <p className="mt-4 max-w-xs text-sm text-white/60">Considered clothing, cut in small runs and delivered worldwide.</p>
          <ul className="mt-6 space-y-2 text-sm text-white/70">
            <li className="flex items-center gap-2"><MapPin size={15} /> Rua das Flores 28, Porto</li>
            <li className="flex items-center gap-2"><Phone size={15} /> +351 220 000 000</li>
            <li className="flex items-center gap-2"><Mail size={15} /> hello@shovid.example</li>
          </ul>
          <div className="mt-6 flex gap-3">{social.map(([Icon, l]) => <a key={l} href="#" aria-label={l} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-gold"><Icon size={17} /></a>)}</div>
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-sm font-semibold">{c.title}</h2>
            <ul className="mt-4 space-y-3 text-sm text-white/60">{c.links.map(([l, to]) => <li key={to}><Link to={to} className="transition-colors hover:text-white">{l}</Link></li>)}</ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 px-6 py-6 text-xs text-white/50 md:flex-row">
        <p>2026 Shovid. All rights reserved.</p>
        <div className="flex items-center gap-4">{pay.map((Icon, i) => <Icon key={i} size={20} />)}</div>
        <div className="flex items-center gap-4"><span className="flex items-center gap-1"><Globe size={14} /> English / USD</span><Link to="/privacy" className="hover:text-white">Privacy</Link><Link to="/terms" className="hover:text-white">Terms</Link></div>
      </div>
    </footer>
  );
}
