import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Cpu, RefreshCw, Send, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { NeuralMesh, Orb } from "@/components/Neural";
import { newMemory, respond, type Reply } from "@/ai/agent";
import { getStatus, intentLabels, intents, startTraining, subscribeStatus, teach, type Intent } from "@/ai/intent";
import { img, products, type Product } from "@/data";
import { useApp } from "@/auth";
import { useCart } from "@/store";
import { useToast } from "@/toast";
import { cn, money } from "@/lib/utils";

interface Msg { from: "bot" | "me"; text: string; items?: Product[]; links?: Reply["links"]; query?: string; fb?: "up" | "down" | "taught"; meta?: { intent: string; confidence: number; tools: string[] } }

const endpoint = import.meta.env.VITE_AI_ENDPOINT as string | undefined;
const first = ["Which items have the biggest discounts?", "Show the best reviewed shoes", "Recommend a running shoe under $200", "Where is my order?", "What are the store opening hours?"];

function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values), min = Math.min(...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${28 - ((v - min) / (max - min || 1)) * 26}`).join(" ");
  return <svg viewBox="0 0 100 30" className="h-8 w-full" role="img" aria-label="Training loss curve"><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

export function Chatbot() {
  const { user, plan, points, orders, coupons } = useApp();
  const { add, count, total } = useCart();
  const toast = useToast();
  const st = useSyncExternalStore(subscribeStatus, getStatus);
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState(false);
  const [busy, setBusy] = useState<string[] | null>(null);
  const [step, setStep] = useState(0);
  const [text, setText] = useState("");
  const [chips, setChips] = useState(first);
  const [asking, setAsking] = useState<number | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: "Hi, I am Shovi. I know the whole Shovid catalogue, prices, reviews, discounts, stock, stores and policies. Ask me anything about the shop." }]);
  const memory = useRef(newMemory());
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => void startTraining(), 800);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy, asking]);
  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setStep((s) => Math.min(s + 1, busy.length - 1)), 350);
    return () => clearInterval(t);
  }, [busy]);

  const ask = async (q: string) => {
    if (busy) return;
    setMsgs((m) => [...m, { from: "me", text: q }]);
    setStep(0);
    if (st.phase !== "ready") { setBusy([`training_intent_network ${Math.round(st.progress * 100)}%`]); await startTraining(); }
    const reply = respond(q, { user, plan, points, orders, coupons, cartCount: count, cartTotal: total }, memory.current);
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
    setMsgs((m) => [...m, { from: "bot", text: answer, items: reply.items, links: reply.links, query: q, meta: { intent: reply.intent, confidence: reply.confidence, tools: reply.tools } }]);
  };
  const submit = (e: FormEvent) => { e.preventDefault(); if (text.trim()) { void ask(text.trim()); setText(""); } };

  const isIntent = (v: string): v is Intent => (intents as readonly string[]).includes(v);
  const approve = (i: number) => {
    const m = msgs[i];
    if (m.query && m.meta && isIntent(m.meta.intent)) { teach(m.query, m.meta.intent); toast("Thanks, Shovi is learning from this"); }
    setMsgs((all) => all.map((x, k) => (k === i ? { ...x, fb: "up" } : x)));
  };
  const correct = (i: number, intent: Intent) => {
    const m = msgs[i];
    if (m.query) teach(m.query, intent);
    setAsking(null);
    setMsgs((all) => all.map((x, k) => (k === i ? { ...x, fb: "taught" } : x)));
    toast("Thanks, retraining the network with your correction");
  };

  const training = st.phase === "training";
  return (
    <div className="fixed bottom-5 right-5 z-[70]">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.94 }} role="dialog" aria-label="Shovi AI assistant" className="absolute bottom-[4.5rem] right-0 flex h-[38rem] max-h-[82vh] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-[2rem] bg-[#0b0b14] text-white shadow-2xl ring-1 ring-white/10">
            <div className="relative h-28 shrink-0 overflow-hidden bg-linear-to-br from-gold/50 via-[#0b0b14] to-mint/30">
              <NeuralMesh active={!!busy || training} className="absolute inset-0 h-full w-full text-mint" />
              <div className="relative flex items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 backdrop-blur"><Sparkles size={18} /></span><div className="flex-1"><p className="font-semibold">Shovi AI</p><p className="flex items-center gap-1.5 text-xs text-white/70"><span className={cn("h-1.5 w-1.5 rounded-full", training ? "animate-pulse bg-amber" : "bg-mint")} /> {training ? `Learning ${Math.round(st.progress * 100)}%` : endpoint ? "Connected to remote model" : "Runs privately in your browser"}</p></div><button onClick={() => setInfo((v) => !v)} aria-pressed={info} aria-label="How this works" className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/10 hover:bg-white/20"><Cpu size={16} /></button></div>
              {training && <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10"><div className="h-full bg-mint transition-all" style={{ width: `${st.progress * 100}%` }} /></div>}
            </div>
            {info && (
              <div className="space-y-2 border-b border-white/10 bg-white/[0.04] p-4 text-xs leading-relaxed text-white/70">
                <p>Intent network: {st.shape || "not trained yet"}. Trained in your browser on {st.examples} examples ({st.taught} taught by you) with Adam, dropout and word dropout.</p>
                <p>Held-out validation: <b className="text-mint">{st.valAcc ?? "n/a"}%</b>, final training accuracy: {st.trainAcc ?? "n/a"}%, {st.trainMs} ms. The validation set comes from the same generated examples, so real-world accuracy is lower.</p>
                <div className="text-mint"><Spark values={st.loss} /></div>
                <p>Answers use live catalogue, review, discount, stock, order and plan data plus BM25 search over store knowledge. Rate replies with the thumbs to teach it.</p>
                <button onClick={() => void startTraining(true)} disabled={training} className="flex cursor-pointer items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 hover:border-mint hover:text-mint disabled:opacity-40"><RefreshCw size={12} /> Retrain now</button>
              </div>
            )}
            <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
              {msgs.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("max-w-[92%]", m.from === "me" && "ml-auto")}>
                  <div className={cn("whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm", m.from === "me" ? "bg-linear-to-br from-gold to-oxblood" : "border border-white/10 bg-white/[0.07]")}>{m.text}</div>
                  {m.items && <div className="mt-2 space-y-2">{m.items.map((p) => <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-2"><Link to={`/product/${p.id}`} onClick={() => setOpen(false)}><img src={img(p.id, 120, 150)} alt="" className="h-14 w-12 rounded-xl bg-white/80 object-cover" /></Link><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{p.name}</p><p className="text-xs text-white/60">{money(p.price)}</p></div><button onClick={() => add(p)} className="cursor-pointer rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink">Add</button></div>)}</div>}
                  {m.links && <div className="mt-2 flex flex-wrap gap-2">{m.links.map((l) => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-full border border-white/20 px-3 py-1 text-xs hover:border-mint hover:text-mint">{l.label}</Link>)}</div>}
                  {m.meta && (
                    <div className="mt-1.5 text-[10px] text-white/45">
                      <p className="flex flex-wrap items-center gap-1.5"><span className="text-mint">{m.meta.intent} {m.meta.confidence}%</span>{m.meta.tools.slice(1).map((t) => <span key={t} className="rounded bg-white/10 px-1.5 py-0.5 font-mono">{t}</span>)}</p>
                      {m.fb ? <p className="mt-1 text-mint">{m.fb === "up" ? "Thanks, learned from this." : m.fb === "taught" ? "Thanks, correction learned." : ""}</p> : (
                        <p className="mt-1 flex items-center gap-2"><span>Was this right?</span><button onClick={() => approve(i)} aria-label="Yes, this was right" className="cursor-pointer rounded-full p-1.5 hover:bg-white/10 hover:text-mint"><ThumbsUp size={12} /></button><button onClick={() => setAsking(asking === i ? null : i)} aria-label="No, teach Shovi" className="cursor-pointer rounded-full p-1.5 hover:bg-white/10 hover:text-oxblood"><ThumbsDown size={12} /></button></p>
                      )}
                      {asking === i && <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.05] p-3"><p className="mb-2 text-white/70">What did you want?</p><div className="flex flex-wrap gap-1.5">{intents.map((k) => <button key={k} onClick={() => correct(i, k)} className="cursor-pointer rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/80 hover:border-mint hover:text-mint">{intentLabels[k]}</button>)}</div></div>}
                    </div>
                  )}
                </motion.div>
              ))}
              {busy && <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-xs text-white/70"><span className="flex gap-1">{[0, 1, 2].map((d) => <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-mint" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 0.9, delay: d * 0.2 }} />)}</span><span className="font-mono">{busy[step]}</span></div>}
              <div ref={end} />
            </div>
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">{chips.map((q) => <button key={q} disabled={!!busy} onClick={() => void ask(q)} className="shrink-0 cursor-pointer rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:border-mint hover:text-mint disabled:opacity-40">{q}</button>)}</div>
            <form onSubmit={submit} className="flex gap-2 border-t border-white/10 p-3"><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about products, prices, reviews, stores" aria-label="Message" className="h-10 flex-1 rounded-full bg-white/10 px-4 text-sm outline-none placeholder:text-white/40" /><button aria-label="Send" disabled={!!busy} className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-linear-to-br from-gold to-oxblood disabled:opacity-50"><Send size={16} /></button></form>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setOpen((o) => !o)} aria-label={open ? "Close chat" : "Open AI assistant"} className="cursor-pointer rounded-full shadow-2xl transition-transform hover:scale-110"><Orb open={open} /></button>
    </div>
  );
}
