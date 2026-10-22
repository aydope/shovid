import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function DragScroll({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const [dragging, setDragging] = useState(false);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = () => {
    const el = ref.current;
    if (el)
      setEdge({
        start: el.scrollLeft < 4,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
      });
  };
  useEffect(() => {
    update();
  }, []);
  const by = (dir: number) =>
    ref.current?.scrollBy({
      left: dir * ref.current.clientWidth * 0.8,
      behavior: "smooth",
    });
  const stop = () => {
    drag.current.down = false;
    setDragging(false);
  };

  return (
    <div className="group/scroll relative">
      <div
        ref={ref}
        role="region"
        aria-label={`${label}. Use left and right arrow keys or drag to scroll.`}
        tabIndex={0}
        onScroll={update}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            by(1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            by(-1);
          }
        }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !ref.current) return;
          drag.current = {
            down: true,
            x: e.clientX,
            left: ref.current.scrollLeft,
            moved: false,
          };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d.down || !ref.current) return;
          if (Math.abs(e.clientX - d.x) > 5) {
            d.moved = true;
            setDragging(true);
          }
          ref.current.scrollLeft = d.left - (e.clientX - d.x);
        }}
        onPointerUp={stop}
        onPointerLeave={stop}
        onDragStart={(e) => e.preventDefault()}
        onClickCapture={(e) => {
          if (drag.current.moved) {
            e.preventDefault();
            e.stopPropagation();
            drag.current.moved = false;
          }
        }}
        className={cn(
          "no-scrollbar -mx-6 flex snap-x snap-proximity gap-5 overflow-x-auto px-6 pb-4 md:cursor-grab",
          dragging && "cursor-grabbing snap-none select-none",
          className,
        )}
      >
        {children}
      </div>
      {(
        [
          [-1, ChevronLeft, edge.start, "left-2"],
          [1, ChevronRight, edge.end, "right-2"],
        ] as const
      ).map(([dir, Icon, off, pos]) => (
        <button
          key={dir}
          onClick={() => by(dir)}
          disabled={off}
          aria-label={dir < 0 ? "Scroll left" : "Scroll right"}
          className={cn(
            "absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white shadow-xl ring-1 ring-sand transition-opacity md:grid",
            pos,
            off
              ? "opacity-0"
              : "opacity-0 group-hover/scroll:opacity-100 focus:opacity-100",
          )}
        >
          <Icon size={20} />
        </button>
      ))}
    </div>
  );
}
