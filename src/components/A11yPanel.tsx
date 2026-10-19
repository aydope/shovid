import { useEffect, useState } from "react";
import { Accessibility, Contrast, Link2, Minus, Plus, RotateCcw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Prefs { size: number; hc: boolean; rm: boolean; ul: boolean }
const defaults: Prefs = { size: 100, hc: false, rm: false, ul: false };
const KEY = "shovid-a11y";

function load(): Prefs {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") }; } catch { return defaults; }
}

export function A11yPanel() {
  const [open, setOpen] = useState(false);
  const [p, setP] = useState<Prefs>(load);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${p.size}%`;
    root.classList.toggle("hc", p.hc);
    root.classList.toggle("rm", p.rm);
    root.classList.toggle("ul", p.ul);
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage unavailable */ }
  }, [p]);

  const toggles = [["hc", "High contrast", Contrast], ["rm", "Reduce motion", Zap], ["ul", "Underline links", Link2]] as const;

  return (
    <div className="fixed bottom-5 left-5 z-[70]">
      {open && (
        <div role="dialog" aria-label="Accessibility settings" className="absolute bottom-16 left-0 w-72 rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-sand">
          <p className="font-semibold">Accessibility</p>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-sand/50 p-2">
            <button onClick={() => setP({ ...p, size: Math.max(85, p.size - 10) })} aria-label="Decrease text size" className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white"><Minus size={16} /></button>
            <span className="text-sm">Text {p.size}%</span>
            <button onClick={() => setP({ ...p, size: Math.min(140, p.size + 10) })} aria-label="Increase text size" className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white"><Plus size={16} /></button>
          </div>
          <div className="mt-3 space-y-2">
            {toggles.map(([k, label, Icon]) => (
              <button key={k} role="switch" aria-checked={p[k]} onClick={() => setP({ ...p, [k]: !p[k] })} className={cn("flex w-full cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm", p[k] ? "border-gold bg-gold/10 text-gold" : "border-sand")}><Icon size={16} />{label}</button>
            ))}
          </div>
          <button onClick={() => setP(defaults)} className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-ink/60"><RotateCcw size={13} /> Reset</button>
        </div>
      )}
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Accessibility settings" className="grid h-14 w-14 cursor-pointer place-items-center rounded-full bg-gold text-white shadow-2xl transition-transform hover:scale-110"><Accessibility /></button>
    </div>
  );
}
