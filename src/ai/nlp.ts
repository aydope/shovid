const stop = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "to",
  "of",
  "for",
  "and",
  "or",
  "me",
  "my",
  "i",
  "you",
  "it",
  "in",
  "on",
  "with",
  "do",
  "does",
  "can",
  "please",
  "what",
  "how",
  "your",
  "this",
  "that",
  "am",
  "be",
  "have",
  "has",
  "get",
  "got",
]);

export const tokenize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

export const stem = (w: string) => {
  if (w.length <= 3) return w;
  const s = w
    .replace(/sses$/, "ss")
    .replace(/ies$/, "y")
    .replace(/(ing|ed)$/, "")
    .replace(/([^s])s$/, "$1");
  return (s.length >= 3 ? s : w).replace(/(.)\1$/, "$1");
};

export const terms = (s: string) =>
  tokenize(s)
    .filter((w) => !stop.has(w))
    .map(stem);
