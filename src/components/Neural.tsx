import { motion } from "framer-motion";

const nodes = Array.from({ length: 15 }, (_, i) => ({ x: 24 + (i % 5) * 68 + ((i * 37) % 18), y: 14 + Math.floor(i / 5) * 36 + ((i * 53) % 14) }));
const edges = nodes.flatMap((a, i) => nodes.slice(i + 1).map((b, j) => [i, i + 1 + j, Math.hypot(a.x - b.x, a.y - b.y)] as const)).filter(([, , d]) => d < 90);

export function NeuralMesh({ active = false, className }: { active?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 320 100" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      {edges.map(([a, b], i) => (
        <motion.line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="currentColor" strokeWidth={1} animate={{ strokeOpacity: active ? [0.1, 0.9, 0.1] : [0.1, 0.35, 0.1] }} transition={{ duration: active ? 0.8 : 3.2, repeat: Infinity, delay: (i % 7) * 0.12 }} />
      ))}
      {nodes.map((n, i) => (
        <motion.circle key={i} cx={n.x} cy={n.y} r={2.5} initial={{ r: 2.5 }} fill="currentColor" animate={{ r: active ? [2, 4.5, 2] : [2.5, 3.4, 2.5] }} transition={{ duration: active ? 0.7 : 2.6, repeat: Infinity, delay: (i % 5) * 0.15 }} />
      ))}
    </svg>
  );
}

export function Orb({ open }: { open: boolean }) {
  return (
    <span className="relative grid h-14 w-14 place-items-center rounded-full">
      <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#6c4bff,#ff3b6b,#14c8a0,#0a84ff,#6c4bff)] blur-[2px]" style={{ animation: "spin 5s linear infinite" }} />
      <span className="absolute inset-[3px] rounded-full bg-[#0b0b14]" />
      <NeuralMesh active={!open} className="absolute inset-[3px] h-[calc(100%-6px)] w-[calc(100%-6px)] overflow-hidden rounded-full text-white/60" />
      <span className="relative text-xs font-bold tracking-wider text-white">{open ? "X" : "AI"}</span>
    </span>
  );
}
