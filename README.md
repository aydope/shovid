# Shovid

Storefront, member area and admin dashboard for the Shovid clothing brand.

Stack: React 18, TypeScript, Vite, Tailwind 4, shadcn-style UI primitives, MUI, Framer Motion, lucide-react.

    npm install
    npm run dev

Data lives in src/data.ts and cart state in src/store.tsx. There is no backend, authentication or payment provider yet. Forms validate input but do not submit anywhere.
Demo accounts (stored in localStorage only): admin@shovid.example / Admin123!  and  member@shovid.example / Member123!

If the dev server shows "Invalid hook call" after dependencies change: stop it, delete node_modules/.vite, run `npm ls react react-dom` (there must be a single version of each), then `npm run dev -- --force`.

Images: product photos come from public APIs with no key, loaded when the app starts (4 second limit). DummyJSON supplies shirts, tops, dresses and shoes, Fake Store API supplies jackets and coats, and Wikimedia Commons search supplies trousers, scarves, belts and extra coats. If a source is unreachable, a neutral labelled placeholder from placehold.co is shown. Commons photos are real but not studio shots. For consistent editorial photography, swap `photo()` in src/images.ts for the Unsplash or Pexels API (both need a free key).

## Scripts

    npm run dev        start the dev server
    npm run typecheck  TypeScript check
    npm run build      production build into dist/

## CI and deployment

`.github/workflows/ci.yml` typechecks and builds on every pull request and push to main (Node 20 and 22).
`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to main. In the repository settings choose Pages, Source: GitHub Actions. The build uses `VITE_BASE=/<repo name>/`; change it in the workflow for a user site or a custom domain. Commit a `package-lock.json` so the workflows use `npm ci`.

## Assistant

The chat assistant is not a hosted LLM. A small neural network (trained in the browser on start) classifies intent, BM25 retrieves answers from policies and the journal, and tools read the live catalogue, cart, orders and plan. To let a real LLM phrase the answers, deploy a server endpoint and set `VITE_AI_ENDPOINT` (see `.env.example`).
