import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Cpu, Send, Sparkles } from "lucide-react";
import { NeuralMesh, Orb } from "@/components/Neural";
import { modelInfo, newMemory, respond, type Reply } from "@/ai/agent";
import { img, products, type Product } from "@/data";
import { useApp } from "@/auth";
import { useCart } from "@/store";
import { cn, money } from "@/lib/utils";

interface Msg { from: "bot" | "me"; text: string; items?: Product[]; links?: Reply["links"]; meta?: { intent: string; confidence: number; tools: string[] } }

const endpoint = import.meta.env.VITE_AI_ENDPOINT as string | undefined;
const first = ["Recommend a hoodie under $150", "Where is my order?", "What is your return policy?", "How do points work?", "Any sale today?"];

export function Chatbot() {
  const { user, plan, points, orders, coupons } = useApp();
  const { add, count, total } = useCart();
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState(false);
  const [busy, setBusy] = useState<string[] | null>(null);
  const [step, setStep] = useState(0);
  const [text, setText] = useState("");
  const [chips, setChips] = useState(first);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: "Hi, I am Shovi, the Shovid shopping assistant. I can search the catalogue, check your orders, explain policies and manage your bag." }]);
  const memory = useRef(newMemory());
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);
  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setStep((s) => Math.min(s + 1, busy.length - 1)), 350);
    return () => clearInterval(t);
  }, [busy]);

  const ask = async (q: string) => {
    if (busy) return;
    const reply = respond(q, { user, plan, points, orders, coupons, cartCount: count, cartTotal: total }, memory.current);
    setMsgs((m) => [...m, { from: "me", text: q }]);
    setStep(0);
    setBusy(reply.tools);
    const wait = new Promise((r) => setTimeout(r, 500 + reply.tools.length * 350));
    const rewrite = endpoint
      ? fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: q, grounding: reply.text, tools: reply.tools }) })
          .then((r) => (r.ok ? (r.json() as Promise<{ text?: string }>) : {}))
          .then((j) => ("text" in j && j.text) || reply.text)
          .catch(() => reply.text)
      : Promise.resolve(reply.text);
    const [answer] = await Promise.all([rewrite, wait]);
    reply.addIds?.forEach((id) => { const p = products.find((x) => x.id === id); if (p) add(p); });
    setBusy(null);
    setChips(reply.suggest);
    setMsgs((m) => [...m, { from: "bot", text: answer, items: reply.items, links: reply.links, meta: { intent: reply.intent, confidence: reply.confidence, tools: reply.tools } }]);
  };
  const submit = (e: FormEvent) => { e.preventDefault(); if (text.trim()) { void ask(text.trim()); setText(""); } };

  return (
    <div className="fixed bottom-5 right-5 z-[70]">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.94 }} role="dialog" aria-label="Shovi AI assistant" className="absolute bottom-[4.5rem] right-0 flex h-[36rem] max-h-[80vh] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-[2rem] bg-[#0b0b14] text-white shadow-2xl ring-1 ring-white/10">
            <div className="relative h-28 shrink-0 overflow-hidden bg-gradient-to-br from-gold/50 via-[#0b0b14] to-mint/30">
              <NeuralMesh active={!!busy} className="absolute inset-0 h-full w-full text-mint" />
              <div className="relative flex items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 backdrop-blur"><Sparkles size={18} /></span><div className="flex-1"><p className="font-semibold">Shovi AI</p><p className="flex items-center gap-1.5 text-xs text-white/70"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" /> {endpoint ? "Connected to remote model" : "Runs privately in your browser"}</p></div><button onClick={() => setInfo((v) => !v)} aria-pressed={info} aria-label="How this works" className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/10 hover:bg-white/20"><Cpu size={16} /></button></div>
            </div>
            {info && <div className="border-b border-white/10 bg-white/[0.04] p-4 text-xs leading-relaxed text-white/70">Intent model: a small neural network ({modelInfo.shape}) trained in your browser in {modelInfo.trainMs} ms on {modelInfo.samples} examples, {modelInfo.accuracy}% training accuracy. Answers use BM25 search over store policies and the journal, plus live catalogue, cart, order and plan data. {endpoint ? "A remote model rewrites the grounded answer." : "No remote language model is configured, so replies are generated from these tools."}</div>}
            <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
              {msgs.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("max-w-[90%]", m.from === "me" && "ml-auto")}>
                  <div className={cn("whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm", m.from === "me" ? "bg-gradient-to-br from-gold to-oxblood" : "border border-white/10 bg-white/[0.07]")}>{m.text}</div>
                  {m.items && <div className="mt-2 space-y-2">{m.items.map((p) => <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-2"><Link to={`/product/${p.id}`} onClick={() => setOpen(false)}><img src={img(p.id, 120, 150)} alt="" className="h-14 w-12 rounded-xl bg-white/80 object-cover" /></Link><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{p.name}</p><p className="text-xs text-white/60">{money(p.price)}</p></div><button onClick={() => add(p)} className="cursor-pointer rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink">Add</button></div>)}</div>}
                  {m.links && <div className="mt-2 flex flex-wrap gap-2">{m.links.map((l) => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-full border border-white/20 px-3 py-1 text-xs hover:border-mint hover:text-mint">{l.label}</Link>)}</div>}
                  {m.meta && <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-white/45"><span className="text-mint">{m.meta.intent} {m.meta.confidence}%</span>{m.meta.tools.slice(1).map((t) => <span key={t} className="rounded bg-white/10 px-1.5 py-0.5 font-mono">{t}</span>)}</p>}
                </motion.div>
              ))}
              {busy && <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-xs text-white/70"><span className="flex gap-1">{[0, 1, 2].map((d) => <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-mint" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 0.9, delay: d * 0.2 }} />)}</span><span className="font-mono">{busy[step]}</span></div>}
              <div ref={end} />
            </div>
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">{chips.map((q) => <button key={q} disabled={!!busy} onClick={() => void ask(q)} className="shrink-0 cursor-pointer rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:border-mint hover:text-mint disabled:opacity-40">{q}</button>)}</div>
            <form onSubmit={submit} className="flex gap-2 border-t border-white/10 p-3"><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask Shovi anything" aria-label="Message" className="h-10 flex-1 rounded-full bg-white/10 px-4 text-sm outline-none placeholder:text-white/40" /><button aria-label="Send" disabled={!!busy} className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-gradient-to-br from-gold to-oxblood disabled:opacity-50"><Send size={16} /></button></form>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setOpen((o) => !o)} aria-label={open ? "Close chat" : "Open AI assistant"} className="cursor-pointer rounded-full shadow-2xl transition-transform hover:scale-110"><Orb open={open} /></button>
    </div>
  );
}
