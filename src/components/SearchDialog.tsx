import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@mui/material";
import { Search } from "lucide-react";
import { products } from "@/data";
import { money } from "@/lib/utils";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const hits = q.trim() ? products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];

  const go = (path: string) => { onClose(); setQ(""); navigate(path); };
  const submit = (e: FormEvent) => { e.preventDefault(); if (q.trim()) go(`/shop?q=${encodeURIComponent(q.trim())}`); };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { alignSelf: "flex-start", mt: 10 } } }}>
      <form onSubmit={submit} className="flex items-center gap-3 border-b border-sand p-5">
        <Search size={18} />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search running, trail, court" aria-label="Search products" className="flex-1 bg-transparent outline-none" />
        <kbd className="text-[10px] uppercase tracking-widest text-ink/50">Esc</kbd>
      </form>
      <ul>
        {hits.map((p) => (
          <li key={p.id}><button onClick={() => go(`/product/${p.id}`)} className="flex w-full cursor-pointer items-center gap-4 px-5 py-3 text-left hover:bg-sand/50">
            <span className="h-10 w-8" style={{ background: p.tone }} /><span className="flex-1 text-sm">{p.name}</span><span className="text-sm">{money(p.price)}</span>
          </button></li>
        ))}
        {q.trim() && hits.length === 0 && <li className="p-5 text-sm text-ink/60">No products match "{q}".</li>}
      </ul>
    </Dialog>
  );
}
