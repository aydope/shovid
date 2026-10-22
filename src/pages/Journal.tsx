import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { img, posts } from "@/data";
import { cn } from "@/lib/utils";

const tags = ["All", ...new Set(posts.map((p) => p.tag))];

export default function Journal() {
  const [tag, setTag] = useState("All");
  const [q, setQ] = useState("");
  const list = posts.filter(
    (p) =>
      (tag === "All" || p.tag === tag) &&
      `${p.title} ${p.excerpt}`.toLowerCase().includes(q.toLowerCase()),
  );
  const [lead, ...rest] = list;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 md:px-6">
      <h1 className="font-display text-5xl md:text-7xl">Journal</h1>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={cn(
                "shrink-0 cursor-pointer rounded-full border px-4 py-2 text-sm",
                tag === t ? "border-ink bg-ink text-white" : "border-sand",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search articles"
          aria-label="Search articles"
          className="h-10 w-full rounded-full border border-sand bg-white px-4 text-sm outline-none focus:border-gold sm:w-64"
        />
      </div>
      {lead && (
        <Link
          to={`/journal/${lead.slug}`}
          className="group mt-10 grid overflow-hidden rounded-[2rem] bg-white ring-1 ring-sand md:grid-cols-2"
        >
          <img
            src={img(lead.slug, 900, 700)}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="flex flex-col justify-center p-8 md:p-12">
            <p className="text-sm font-semibold text-gold">{lead.tag}</p>
            <h2 className="font-display mt-2 text-3xl md:text-5xl">
              {lead.title}
            </h2>
            <p className="mt-4 text-ink/60">{lead.excerpt}</p>
            <p className="mt-6 flex items-center gap-2 text-xs text-ink/50">
              <Clock size={13} /> {lead.read} min read, {lead.author}
            </p>
          </div>
        </Link>
      )}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p, i) => (
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 3) * 0.08 }}
          >
            <Link
              to={`/journal/${p.slug}`}
              className="group block overflow-hidden rounded-3xl bg-white ring-1 ring-sand"
            >
              <img
                src={img(p.slug, 600, 400)}
                alt=""
                loading="lazy"
                className="aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="p-6">
                <p className="text-xs font-semibold text-gold">{p.tag}</p>
                <h2 className="mt-1 text-xl font-semibold">{p.title}</h2>
                <p className="mt-2 text-sm text-ink/60">{p.excerpt}</p>
                <p className="mt-4 text-xs text-ink/50">
                  {p.read} min read, {p.date}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      {list.length === 0 && (
        <p className="py-24 text-center text-2xl font-semibold">
          No articles found.
        </p>
      )}
    </section>
  );
}
