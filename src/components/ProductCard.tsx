import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Plus, Star } from "lucide-react";
import { Skeleton } from "@mui/material";
import { useCart } from "@/store";
import { cn, money } from "@/lib/utils";
import { promoPercent } from "@/commerce";
import { img, likesFor, reviewsFor, type Product } from "@/data";

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const { add, wish, toggleWish } = useCart();
  const [loaded, setLoaded] = useState(false);
  const saved = wish.includes(product.id);
  const reviews = reviewsFor(product);
  const rating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
      className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-sand transition-shadow duration-500 hover:shadow-2xl"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-linear-to-b from-[#f4f1ea] to-[#e4ddd0]">
        {!loaded && (
          <Skeleton
            variant="rectangular"
            className="!absolute inset-0 !h-full !w-full"
          />
        )}
        <Link to={`/product/${product.id}`} aria-label={product.name}>
          <img
            src={img(product.id)}
            alt={product.name}
            width={600}
            height={750}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            className={cn(
              "h-full w-full object-cover transition-all duration-700 group-hover:scale-105",
              loaded ? "opacity-100" : "opacity-0",
            )}
          />
        </Link>
        {product.stock < 15 && (
          <span className="absolute left-3 top-3 rounded-full bg-oxblood px-3 py-1 text-xs font-medium text-white">
            Only {product.stock} left
          </span>
        )}
        {promoPercent(product) > 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-mint px-3 py-1 text-xs font-semibold text-ink">
            -{promoPercent(product)}% at checkout
          </span>
        )}
        <button
          onClick={() => toggleWish(product.id)}
          aria-label="Save to wishlist"
          className="absolute right-3 top-3 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/80 backdrop-blur transition-transform hover:scale-110"
        >
          <Heart
            size={16}
            className={cn(saved && "fill-oxblood text-oxblood")}
          />
        </button>
        <button
          onClick={() => add(product)}
          aria-label={`Add ${product.name} to bag`}
          className="absolute bottom-3 right-3 grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-ink text-white transition-all hover:bg-gold md:translate-y-14 md:group-hover:translate-y-0"
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs text-ink/50">{product.category}</p>
        <div className="mt-1 flex justify-between gap-3">
          <h3 className="text-base font-semibold leading-tight">
            {product.name}
          </h3>
          <p className="text-sm font-medium">{money(product.price)}</p>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-ink/60">
          <span className="flex items-center gap-1">
            <Star size={12} className="fill-amber text-amber" />{" "}
            {rating.toFixed(1)} ({reviews.length})
          </span>
          <span className="flex items-center gap-1">
            <Heart size={12} /> {likesFor(product)}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
