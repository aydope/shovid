import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const calm = () => document.documentElement.classList.contains("rm") || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fresh = (selector: string) => Array.from(document.querySelectorAll<HTMLElement>(`${selector}:not([data-fx])`));

function scan() {
  fresh("[data-reveal]").forEach((el) => {
    el.dataset.fx = "1";
    const targets = el.dataset.reveal === "stagger" ? Array.from(el.children) : [el];
    gsap.from(targets, { y: 40, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
  });
  fresh("[data-parallax]").forEach((el) => {
    el.dataset.fx = "1";
    const s = Number(el.dataset.parallax) || 0.15;
    gsap.fromTo(el, { yPercent: -s * 50 }, { yPercent: s * 50, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
  });
  fresh("[data-count]").forEach((el) => {
    el.dataset.fx = "1";
    const state = { v: 0 };
    const decimals = Number(el.dataset.decimals ?? 0);
    const suffix = el.dataset.suffix ?? "";
    gsap.to(state, { v: Number(el.dataset.count), duration: 1.8, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 92%", once: true }, onUpdate: () => { el.textContent = state.v.toFixed(decimals) + suffix; } });
  });
  fresh("[data-split]").forEach((el) => {
    el.dataset.fx = "1";
    el.innerHTML = (el.textContent ?? "").split(" ").map((w) => `<span class="inline-block">${w}&nbsp;</span>`).join("");
    gsap.fromTo(el.children, { opacity: 0.12 }, { opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true } });
  });
}

export function ScrollFX() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (calm()) return;
    const timers = [350, 1200].map((ms) => window.setTimeout(() => { scan(); ScrollTrigger.refresh(); }, ms));
    return () => { timers.forEach(clearTimeout); ScrollTrigger.getAll().forEach((t) => t.kill()); };
  }, [pathname]);
  return null;
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <AnimatePresence>
      {show && <motion.button initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top" className="fixed bottom-24 right-5 z-[65] grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-white shadow-xl ring-1 ring-sand hover:text-gold"><ArrowUp size={18} /></motion.button>}
    </AnimatePresence>
  );
}
