const stop = new Set([
  "the", "a", "an", "is", "are", "to", "of", "for", "and", "or", "me", "my", "i", "you", "it", "in", "on", "with", "do", "does", "can", "please", "what", "how", "your", "this", "that", "am", "be", "have", "has", "get", "got",
  "از", "به", "در", "با", "که", "را", "رو", "این", "آن", "اون", "و", "یا", "هم", "برای", "من", "تو", "شما", "ما", "او", "هست", "است", "بود", "باشه", "باشد", "شد", "می", "میشه", "کنم", "کنید", "کن", "دارم", "داره", "دارید", "یه", "یک", "تا", "هر", "لطفا", "ببخشید",
]);

// Persian digits, Arabic letter variants, diacritics and zero-width joiners are unified so "می‌خواهم" and "مي خواهم" match.
export const normalize = (s: string) => s
  .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
  .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
  .replace(/\u064A/g, "\u06CC").replace(/\u0643/g, "\u06A9")
  .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
  .replace(/[\u200C\u200D\u200E\u200F]/g, " ");

export const isPersian = (s: string) => /[\u0600-\u06FF]/.test(s);

export const tokenize = (s: string) => normalize(s).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);

export const stem = (w: string) => {
  if (isPersian(w)) return w.length > 4 ? w.replace(/(ها|های|ترین|تر)$/, "") : w;
  if (w.length <= 3) return w;
  const s = w.replace(/sses$/, "ss").replace(/ies$/, "y").replace(/(ing|ed)$/, "").replace(/([^s])s$/, "$1");
  return (s.length >= 3 ? s : w).replace(/(.)\1$/, "$1");
};

export const terms = (s: string) => tokenize(s).filter((w) => !stop.has(w)).map(stem);
