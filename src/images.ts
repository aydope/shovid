export type Kind = "hoodie" | "sneaker";
type Pool = string[][];
type Loader = () => Promise<Pool>;

const label: Record<Kind, string> = { hoodie: "Hoodie", sneaker: "Sneakers" };
const pexelsKey = import.meta.env.VITE_PEXELS_KEY as string | undefined;

const memo = new Map<string, Promise<Pool>>();
const once = (id: string, fn: Loader): Loader => () => {
  const hit = memo.get(id);
  if (hit) return hit;
  const run = fn();
  memo.set(id, run);
  return run;
};

// Pexels (optional, free key): best quality curated photos. Used first when VITE_PEXELS_KEY is set.
const pexels = (query: string) => once(`pexels:${query}`, async () => {
  if (!pexelsKey) return [];
  const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=30&orientation=portrait`, { headers: { Authorization: pexelsKey } });
  if (!res.ok) throw new Error(`Pexels ${query}`);
  const json = (await res.json()) as { photos: Array<{ src: { large: string } }> };
  return json.photos.map((p) => [p.src.large]);
});

// DummyJSON (public, no key): clean product shots. Filtered to sporty shoes only.
const dummy = (slug: string, match: RegExp) => once(`dummy:${slug}`, async () => {
  const res = await fetch(`https://dummyjson.com/products/category/${slug}?select=title,thumbnail,images&limit=20`);
  if (!res.ok) throw new Error(`DummyJSON ${slug}`);
  const json = (await res.json()) as { products: Array<{ title: string; thumbnail: string; images?: string[] }> };
  return json.products.filter((p) => match.test(p.title)).map((p) => (p.images?.length ? p.images : [p.thumbnail]));
});

// Wikimedia Commons search (public, CORS enabled, no key): real photos, quality varies.
const commons = (term: string) => once(`commons:${term}`, async () => {
  const q = encodeURIComponent(`filetype:bitmap ${term}`);
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrnamespace=6&gsrlimit=30&prop=imageinfo&iiprop=url%7Cmime%7Csize&iiurlwidth=800&format=json&origin=*`);
  if (!res.ok) throw new Error(`Commons ${term}`);
  type Info = { thumburl?: string; mime: string; width: number; height: number };
  const json = (await res.json()) as { query?: { pages?: Record<string, { imageinfo?: Info[] }> } };
  return Object.values(json.query?.pages ?? {})
    .map((p) => p.imageinfo?.[0])
    .filter((i): i is Info & { thumburl: string } => Boolean(i?.thumburl) && i?.mime === "image/jpeg" && (i?.width ?? 0) >= 600 && (i?.height ?? 0) >= 400)
    .map((i) => [i.thumburl]);
});

const sporty = /sport|sneaker|nike|puma|jordan|trainer|run/i;

const loaders: Record<Kind, Loader[]> = {
  hoodie: [pexels("hoodie"), commons("hoodie"), commons("hooded sweatshirt")],
  sneaker: [pexels("sneakers"), dummy("mens-shoes", sporty), commons("sneakers"), commons("running shoes")],
};

const pools: Partial<Record<Kind, Pool>> = {};

export async function loadImages(timeoutMs = 4000) {
  const kinds = Object.keys(loaders) as Kind[];
  const work = Promise.all(kinds.map(async (kind) => {
    const settled = await Promise.allSettled(loaders[kind].map((load) => load()));
    const merged = settled.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
    if (merged.length) pools[kind] = merged;
  }));
  await Promise.race([work, new Promise((resolve) => setTimeout(resolve, timeoutMs))]);
}

export function photo(kind: Kind, rank: number, shot: number, _seed: number, w: number, h: number) {
  const pool = pools[kind];
  if (pool?.length) {
    const item = pool[rank % pool.length];
    return item[shot % item.length];
  }
  return `https://placehold.co/${w}x${h}/efe9dc/6b6257/png?text=${encodeURIComponent(label[kind])}`;
}
