# Shovid

Storefront, member area and admin dashboard for the Shovid clothing brand.

Stack: React 18, TypeScript, Vite, Tailwind 4, shadcn-style UI primitives, MUI, Framer Motion, lucide-react.

    npm install
    npm run dev

Data lives in src/data.ts and cart state in src/store.tsx. There is no backend, authentication or payment provider yet. Forms validate input but do not submit anywhere.
Demo accounts (stored in localStorage only): admin@shovid.example / Admin123!  and  member@shovid.example / Member123!

If the dev server shows "Invalid hook call" after dependencies change: stop it, delete node_modules/.vite, run `npm ls react react-dom` (there must be a single version of each), then `npm run dev -- --force`.

Images: the catalogue is sneakers only. Photos load when the app starts (4 second limit). With a free Pexels key in `VITE_PEXELS_KEY` they come from Pexels searches for `sneakers` and `running shoes`. Without a key, sporty shoes from DummyJSON are used first and Wikimedia Commons search fills the gaps, so quality varies and some images repeat. A labelled placeholder from placehold.co is shown if no source is reachable. Edit `src/images.ts` to change sources.

## Requirements

Node 22.12 or newer (Vite 8 and TypeScript 7). Install with `npm install` and commit the generated `package-lock.json`.

Dependency versions are the ones in `package.json`: React 19.3, React Router 7 (`react-router-dom`), MUI 9, Vite 8 with `@vitejs/plugin-react` 6, Tailwind 4.3, TypeScript 7, framer-motion 14, lucide-react 1 and gsap 3.15. Notes for these versions:

- lucide-react 1 removed brand icons, so the social icons live in `src/components/BrandIcons.tsx`.
- MUI 9 removed `PaperProps` and `inputProps`; the code uses `slotProps`.
- TypeScript 7 removed `baseUrl`; the `@/*` alias is declared with `paths` only and mirrored in `vite.config.ts`.
- Leaflet is used through class constructors (`new L.Map`) so it works with 1.9 and 2.x.

## Scripts

    npm run dev        start the dev server
    npm run typecheck  TypeScript check
    npm run build      production build into dist/

## CI and deployment

`.github/workflows/ci.yml` typechecks and builds on every pull request and push to main (Node 22 and 24).
`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to main. In the repository settings choose Pages, Source: GitHub Actions. The build uses `VITE_BASE=/<repo name>/`; change it in the workflow for a user site or a custom domain. Commit a `package-lock.json` so the workflows use `npm ci`.

## Assistant

The chat assistant is not a hosted LLM. It combines:

- an intent network (MLP with Adam, dropout, word dropout and character n-gram features) trained in the browser on a generated corpus built from the catalogue, plus examples taught by users through the thumbs up and down buttons (stored in localStorage and used on every retrain);
- BM25 retrieval over store knowledge (policies, plans, promotions, stores, careers, journal and every product);
- tools that read the live catalogue, reviews, discounts, stock, cart, orders and plan, for example ranking by discount, reviews, likes or price, comparing models and looking up a product.

The validation score in the chat panel is measured on held-out generated examples, so real-world accuracy is lower. To let a real LLM phrase the answers, deploy a server endpoint and set `VITE_AI_ENDPOINT` (see `.env.example`).
