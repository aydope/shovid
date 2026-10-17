import { useState, type FormEvent } from "react";
import { Sparkles, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/toast";
import { cn } from "@/lib/utils";

export function Takeaways({ items }: { items: string[] }) {
  return (
    <aside data-reveal className="mt-8 rounded-3xl bg-gradient-to-br from-gold/10 to-mint/10 p-6">
      <p className="flex items-center gap-2 text-sm font-semibold text-gold"><Sparkles size={15} /> Key takeaways</p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink/70">{items.map((t) => <li key={t}>{t}</li>)}</ul>
    </aside>
  );
}

export function AuthorCard({ name }: { name: string }) {
  return (
    <div data-reveal className="mt-10 flex items-center gap-4 rounded-3xl bg-white p-6 ring-1 ring-sand">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-gold to-oxblood text-xl font-semibold text-white">{name[0]}</span>
      <div><p className="font-semibold">{name}</p><p className="text-sm text-ink/60">Writes about craft, materials and care at the Porto atelier.</p></div>
    </div>
  );
}

interface Comment { id: number; name: string; text: string; likes: number }
const seed: Comment[] = [{ id: 1, name: "Clara W.", text: "Lovely read. The care tips saved my favourite knit.", likes: 6 }, { id: 2, name: "Omar H.", text: "Would love a follow up on alterations.", likes: 3 }];

export function Comments() {
  const toast = useToast();
  const [list, setList] = useState(seed);
  const [liked, setLiked] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const post = (e: FormEvent) => { e.preventDefault(); if (!name.trim() || !text.trim()) { toast("Add your name and a comment", "error"); return; } setList((l) => [{ id: Date.now(), name: name.trim(), text: text.trim(), likes: 0 }, ...l]); setName(""); setText(""); toast("Comment posted"); };
  return (
    <section data-reveal className="mt-14">
      <h2 className="font-display text-3xl">Comments ({list.length})</h2>
      <form onSubmit={post} className="mt-5 space-y-3"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" aria-label="Name" className="h-11 w-full rounded-2xl border border-sand bg-white px-4 text-sm outline-none focus:border-gold" /><textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Join the conversation" aria-label="Comment" className="w-full rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-gold" /><Button type="submit" size="sm">Post comment</Button></form>
      <div className="mt-6 space-y-3">{list.map((c) => <div key={c.id} className="rounded-3xl bg-white p-5 ring-1 ring-sand"><p className="text-sm font-medium">{c.name}</p><p className="mt-1 text-sm text-ink/70">{c.text}</p><button onClick={() => setLiked((l) => (l.includes(c.id) ? l.filter((x) => x !== c.id) : [...l, c.id]))} className={cn("mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1 text-xs ring-1 ring-sand", liked.includes(c.id) && "bg-gold/10 text-gold ring-gold")}><ThumbsUp size={12} /> {c.likes + (liked.includes(c.id) ? 1 : 0)}</button></div>)}</div>
    </section>
  );
}
