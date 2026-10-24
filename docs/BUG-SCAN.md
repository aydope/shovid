# Bug scan

## Method

The app was not run in a browser, so this is a static and scripted review plus one end-to-end run of the assistant in Node:

- every local named import and lazy route export checked against the real exports
- every internal link, `navigate()` call and menu entry checked against the route table
- list keys checked for values that can repeat
- icon-only buttons and images checked for accessible names
- the app's own code type-checked with third-party libraries stubbed out, so only problems in this repository show up
- the real intent network, agent and knowledge base run in Node on English and Persian conversations

Not covered: rendering, layout, animation, real network responses from the image and map services, screen readers.

## Found and fixed

| Area | Problem | Fix |
|------|---------|-----|
| Product page | Duplicate React keys when a product had one photo, and four identical thumbnails | Thumbnails are de-duplicated, keyed by position, and hidden when there is one photo |
| Product and article pages | Size, photo, comment drafts and likes carried over when moving from one product or article to another | Each page is remounted per product or article |
| Shop | Choosing a category from the menu while already on the shop did not change the filter | Filters follow the `c` query parameter |
| Map search | Results with the same coordinates could share a key | Keys include the position |
| Images | The same photo could be assigned to several products, and photos that arrived after the first paint never replaced placeholders | Pool is de-duplicated and the app re-renders when it updates |
| Countdown | Stayed at zero after midnight | Recomputed every second to the next local midnight |
| Order tracking | An empty contact field could match a guest order that had no email | An empty field never matches |
| Admin | A new product could reuse the id of a deleted one | Ids come from the timestamp |
| Assistant | Waited for retraining before every answer after feedback, and a typing error in the remote reply handling | Waits only for the first training, reply typed correctly |
| Assistant | "Cheaper" or "more expensive" could return the same or costlier items | Price bounds are never relaxed for those follow-ups |
| Home page | Missing `Manifesto` export crashed the page (fixed earlier in v1.3.1) | Restored |

The reported warning about two children with the same key and a Wikimedia image URL came from the product gallery. If you meant a different list, send the component name from the console stack.

## Not verified or open

- Everything above is untested in a browser.
- The scan found no broken internal links and no missing exports, but it cannot find layout or timing bugs.
- Product descriptions (`note`) are English only, also in Persian answers. Journal articles are English only.
- Persian support covers common phrasing, Persian digits and mixed Persian and English product names. Romanised Persian (Finglish) was only lightly trained.
- Remote photos come from public services and can be slow, repeated or unrelated.
