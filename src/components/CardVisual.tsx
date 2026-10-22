import { motion } from "framer-motion";
import { Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  number: string;
  name: string;
  expiry: string;
  cvc?: string;
  flipped?: boolean;
  variant?: "user" | "store";
}

const brand = (n: string) =>
  n.startsWith("4")
    ? "VISA"
    : /^(5|2)/.test(n)
      ? "MASTERCARD"
      : n.startsWith("3")
        ? "AMEX"
        : "CARD";
const face =
  "absolute inset-0 rounded-3xl p-6 text-white shadow-2xl [backface-visibility:hidden]";

export function CardVisual({
  number,
  name,
  expiry,
  cvc = "",
  flipped = false,
  variant = "user",
}: Props) {
  const digits = number.replace(/\D/g, "");
  const shown = (digits + "################")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
  const bg =
    variant === "store"
      ? "bg-linear-to-br from-oxblood via-gold to-ink"
      : "bg-linear-to-br from-ink via-[#2b1d73] to-gold";
  return (
    <div className="w-full max-w-sm [perspective:1000px]">
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        className="relative aspect-[1.586] [transform-style:preserve-3d]"
      >
        <div className={cn(face, bg)}>
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 left-10 h-44 w-44 rounded-full bg-white/10" />
          <div className="relative flex items-center justify-between">
            <span className="h-9 w-12 rounded-lg bg-linear-to-br from-amber to-[#b88a2c]" />
            <Wifi size={22} className="rotate-90 opacity-80" />
          </div>
          <p className="relative mt-7 font-mono text-xl tracking-[0.18em] sm:text-2xl">
            {shown}
          </p>
          <div className="relative mt-5 flex items-end justify-between text-xs">
            <div>
              <p className="text-[10px] uppercase text-white/60">
                {variant === "store" ? "Account holder" : "Card holder"}
              </p>
              <p className="mt-0.5 text-sm font-medium uppercase">
                {name || "Your name"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-white/60">Expires</p>
              <p className="mt-0.5 text-sm font-medium">{expiry || "MM/YY"}</p>
            </div>
            <span className="text-sm font-bold italic tracking-wider">
              {brand(digits)}
            </span>
          </div>
        </div>
        <div className={cn(face, "bg-ink [transform:rotateY(180deg)]")}>
          <div className="-mx-6 mt-2 h-10 bg-black" />
          <div className="mt-6 flex items-center gap-3">
            <div className="h-9 flex-1 bg-white/80" />
            <span className="rounded bg-white px-3 py-2 font-mono text-sm text-ink">
              {cvc || "***"}
            </span>
          </div>
          <p className="mt-4 text-[10px] text-white/50">
            Demo card for a mock online purchase. Nothing is charged.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
