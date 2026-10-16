import { useEffect, useState, type ReactNode } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Skeleton } from "@mui/material";
import { cn } from "@/lib/utils";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  return <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-gold via-oxblood to-amber" />;
}

export function SectionDots({ sections }: { sections: ReadonlyArray<readonly [string, string]> }) {
  const [active, setActive] = useState(sections[0][0]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [sections]);
  return (
    <nav aria-label="Page sections" className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 xl:flex">
      {sections.map(([id, label]) => (
        <a key={id} href={`#${id}`} aria-label={label} title={label} className={cn("w-2 rounded-full bg-ink/20 transition-all duration-300 hover:bg-gold", active === id ? "h-7 bg-gold" : "h-2")} />
      ))}
    </nav>
  );
}

export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-16" aria-busy="true">
      <Skeleton variant="text" width="45%" height={90} />
      <Skeleton variant="text" width="30%" />
      <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} variant="rounded" height={340} />)}
      </div>
    </div>
  );
}

export function Section({ id, eyebrow, title, children, className }: { id: string; eyebrow?: string; title?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={cn("mx-auto max-w-7xl scroll-mt-24 snap-start px-6 pt-24 md:pt-32", className)}>
      {title && (
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-12 max-w-3xl">
          {eyebrow && <p className="text-sm font-semibold text-gold">{eyebrow}</p>}
          <h2 className="font-display mt-2 text-4xl md:text-6xl">{title}</h2>
        </motion.div>
      )}
      {children}
    </section>
  );
}

export function Countdown() {
  const [end] = useState(() => Date.now() + 3 * 864e5);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const s = Math.max(0, Math.floor((end - now) / 1000));
  const parts: Array<[string, number]> = [["Days", Math.floor(s / 86400)], ["Hours", Math.floor((s % 86400) / 3600)], ["Min", Math.floor((s % 3600) / 60)], ["Sec", s % 60]];
  return (
    <div className="flex gap-3">
      {parts.map(([l, v]) => (
        <div key={l} className="w-16 rounded-2xl bg-white/90 py-3 text-center text-ink"><p className="text-2xl font-semibold tabular-nums">{String(v).padStart(2, "0")}</p><p className="text-[10px]">{l}</p></div>
      ))}
    </div>
  );
}
