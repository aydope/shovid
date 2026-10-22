import type { ReactNode } from "react";

export function PageShell({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-5xl px-6 pt-16">
      <h1 className="font-display text-6xl md:text-7xl">{title}</h1>
      {lead && (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/70">
          {lead}
        </p>
      )}
      <div className="mt-12">{children}</div>
    </section>
  );
}
