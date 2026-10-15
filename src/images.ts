export type Kind = "coat" | "knit" | "trouser" | "shirt" | "dress" | "scarf" | "belt" | "shoe" | "boot" | "sneaker";
type Pool = string[][];
type Loader = () => Promise<Pool>;

const label: Record<Kind, string> = { coat: "Coat", knit: "Knitwear", trouser: "Trousers", shirt: "Shirt", dress: "Dress", scarf: "Scarf", belt: "Belt", shoe: "Shoes", boot: "Boots", sneaker: "Sneakers" };

const memo = new Map<string, Promise<Pool>>();
const once = (id: string, fn: Loader): Loader => () => {
  const hit = memo.get(id);
  if (hit) return hit;
  const run = fn();
  memo.set(id, run);
  return run;
};

// DummyJSON: clean product photos for shirts, tops, dresses and shoes (public, no key).
const dummy = (slug: string) => once(`dummy:${slug}`, async () => {
  const res = await fetch(`https://dummyjson.com/products/category/${slug}?select=thumbnail,images&limit=12`);
  if (!res.ok) throw new Error(`DummyJSON ${slug}`);
  const json = (await res.json()) as { products: Array<{ thumbnail: string; images?: string[] }> };
  return json.products.map((p) => (p.images?.length ? p.images : [p.thumbnail]));
});

// Fake Store API: jackets and coats (public, no key).
const fake = (category: string, match: RegExp) => once(`fake:${category}`, async () => {
  const res = await fetch(`https://fakestoreapi.com/products/category/${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error(`FakeStore ${category}`);
  const json = (await res.json()) as Array<{ title: string; image: string }>;
  return json.filter((p) => match.test(p.title)).map((p) => [p.image]);
});

// Wikimedia Commons search: real photos for trousers, scarves and belts (public, CORS enabled, no key).
const commons = (term: string) => once(`commons:${term}`, async () => {
  const q = encodeURIComponent(`filetype:bitmap ${term}`);
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url%7Cmime&iiurlwidth=800&format=json&origin=*`);
  if (!res.ok) throw new Error(`Commons ${term}`);
  const json = (await res.json()) as { query?: { pages?: Record<string, { imageinfo?: Array<{ thumburl?: string; mime: string }> }> } };
  return Object.values(json.query?.pages ?? {})
    .map((p) => p.imageinfo?.[0])
    .filter((i): i is { thumburl: string; mime: string } => Boolean(i?.thumburl) && i?.mime === "image/jpeg")
    .map((i) => [i.thumburl]);
});

const loaders: Record<Kind, Loader[]> = {
  shirt: [dummy("mens-shirts")],
  knit: [dummy("tops")],
  dress: [dummy("womens-dresses")],
  shoe: [dummy("mens-shoes"), dummy("womens-shoes")],
  boot: [dummy("mens-shoes")],
  sneaker: [dummy("mens-shoes"), dummy("womens-shoes")],
  coat: [fake("men's clothing", /jacket|coat/i), fake("women's clothing", /jacket|coat/i), commons("overcoat")],
  trouser: [commons("trousers"), commons("chino pants")],
  scarf: [commons("wool scarf")],
  belt: [commons("leather belt")],
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
