import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowLeft, Clock, Heart, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { AuthorCard, Comments, Takeaways } from "@/components/PostExtras";
import { img, posts, products } from "@/data";
import { useToast } from "@/toast";
import { cn } from "@/lib/utils";

export default function Post() {
  const { slug } = useParams();
  const toast = useToast();
  const [liked, setLiked] = useState(false);
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const index = posts.findIndex((p) => p.slug === slug);
  const post = posts[index];

  if (!post) return <p className="py-40 text-center text-5xl font-semibold">Article not found</p>;

  const more = posts.filter((p) => p.slug !== post.slug && p.tag === post.tag).concat(posts.filter((p) => p.slug !== post.slug && p.tag !== post.tag)).slice(0, 3);
  const next = posts[(index + 1) % posts.length];
  const copy = async () => {
    try { await navigator.clipboard.writeText(window.location.href); toast("Link copied"); } catch { toast("Could not copy the link", "error"); }
  };

  return (
    <article className="mx-auto max-w-3xl px-4 pt-10 md:px-6">
      <motion.div style={{ scaleX: width }} className="fixed inset-x-0 top-0 z-[61] h-1 origin-left bg-mint" />
      <Link to="/journal" className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink"><ArrowLeft size={14} /> Journal</Link>
      <p className="mt-8 text-sm font-semibold text-gold">{post.tag}</p>
      <h1 className="font-display mt-2 text-4xl md:text-6xl">{post.title}</h1>
      <p className="mt-4 flex items-center gap-3 text-sm text-ink/50"><Clock size={14} /> {post.read} min read, {post.author}, {post.date}</p>
      <div className="mt-8 overflow-hidden rounded-3xl"><img data-parallax="0.2" src={img(post.slug, 1200, 700)} alt="" className="aspect-[16/10] w-full scale-110 object-cover" /></div>
      <p className="mt-8 text-xl text-ink/70">{post.excerpt}</p>
      <Takeaways items={[post.excerpt, post.body[1].split(". ")[0] + ".", `${post.read} minute read`]} />
      <div data-reveal="stagger" className="mt-10 space-y-6 text-lg leading-relaxed">{post.body.map((b, i) => <div key={b}><p className={cn(i === 0 && "first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-7xl first-letter:font-semibold")}>{b}</p>{i === 0 && <blockquote className="my-10 border-l-4 border-gold pl-6 font-serif text-3xl italic leading-snug md:text-4xl">{post.body[1].split(". ")[0]}.</blockquote>}</div>)}</div>
      <div className="mt-10 flex gap-3 border-y border-sand py-5">
        <Button variant="outline" size="sm" onClick={() => { setLiked(!liked); toast(liked ? "Like removed" : "Thanks for the like", "info"); }}><Heart size={14} className={cn(liked && "fill-oxblood text-oxblood")} /> {liked ? 25 : 24}</Button>
        <Button variant="outline" size="sm" onClick={copy}><Link2 size={14} /> Copy link</Button>
      </div>
      <AuthorCard name={post.author} />
      <Comments />
      <h2 className="font-display mt-14 text-3xl">Shop the story</h2>
      <div className="mt-6 grid grid-cols-2 gap-4">{products.slice(index, index + 2).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
      <h2 className="font-display mt-14 text-3xl">Keep reading</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">{more.map((p) => <Link key={p.slug} to={`/journal/${p.slug}`} className="rounded-3xl bg-white p-5 ring-1 ring-sand hover:shadow-lg"><p className="text-xs text-gold">{p.tag}</p><p className="mt-1 font-semibold">{p.title}</p></Link>)}</div>
      <Link to={`/journal/${next.slug}`} className="mt-8 block rounded-3xl bg-ink p-6 text-white"><p className="text-xs text-white/60">Next article</p><p className="mt-1 text-xl font-semibold">{next.title}</p></Link>
    </article>
  );
}
