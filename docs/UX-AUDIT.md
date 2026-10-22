# Shovid UX and accessibility audit

## Scope and method

Review of the client application against WCAG 2.2 AA and common e-commerce usability practice, by reading the code. It was not tested with users, assistive technology or real browsers, and the changes below were not run. Treat every item as implemented but unverified until the validation plan at the end has been done.

Assumptions: shoppers on mobile and desktop, mock data, demo checkout without a payment provider.

## Findings and changes

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | A shoe could be added to the bag with a preselected size, and the bag did not record sizes | Critical | Changed: size is required (radio group, error message, focus), bag lines carry the size, quick actions open the product page |
| 2 | Sale prices were not applied consistently at checkout and not shown on cards or the product page | High | Changed: checkout quote includes sale prices, cards and product page show sale price with the old price struck through |
| 3 | Countdown restarted on every visit and the "% sold" bar was invented | High (trust) | Changed: countdown runs to local midnight with a label, "% sold" removed |
| 4 | Form errors were not tied to their fields and focus stayed on the button | High | Changed: shared `Field` and `TextArea` with labels, `aria-invalid`, `aria-describedby`, required and optional markers, focus moves to the first error |
| 5 | Low contrast: text at 40 to 60 percent opacity, danger red (about 3.6:1), mint text on white | High | Changed: minimum text opacity 70 percent, danger token `#e11d48`, `text-mint-ink` for text on light surfaces. Ratios are estimated, not measured |
| 6 | Text as small as 10 and 11 px | Medium | Changed: 12 px minimum |
| 7 | Route changes were silent for screen readers and the page title never changed | Medium | Changed: title per route and per product or article, focus moves to the main region after navigation |
| 8 | A runtime error blanked the whole page | Medium | Changed: error boundary with reload and home actions, reset on navigation |
| 9 | Chat and accessibility panels ignored Escape and did not manage focus | Medium | Changed: Escape closes and returns focus, the chat input is focused on open |
| 10 | Data tables had no header scope | Low | Changed: `scope="col"` |
| 11 | Looping animations ignored the reduced motion setting | Medium | Changed: framer-motion follows the OS setting. Known gap: the in-app toggle only affects CSS and GSAP effects |
| 12 | Typography relied on a global CSS override of `uppercase` and `tracking-*` | Low (maintainability) | Changed: classes removed and the override deleted |

## Open items

- Several icon buttons are 36 to 40 px. This meets the WCAG 2.2 minimum of 24 px but not the 44 px recommendation.
- Checkout is a single page with two numbered sections. A step indicator and an order review step were not added.
- Product photos are placeholders from public sources, with no `srcset` or responsive sizes.
- No right-to-left or translated interface.
- The cart is not persisted between visits.
- Guest order lookup works with order number plus email or phone, but there is no order confirmation email.

## Validation plan

1. Run axe and Lighthouse on home, shop, product, checkout, login and the dashboards. Measure contrast with a tool instead of the estimates above.
2. Keyboard-only pass: header menu, filters, size selection, checkout with a validation error, chat and accessibility panels.
3. Screen reader pass with NVDA and VoiceOver on the product page and checkout.
4. Moderated test with 5 shoppers on two tasks: find a running shoe under $200 and buy it; compare two models. Record task success, time and errors.
5. Test at 320 px width and at 200 percent zoom.

## Measurement events to add when analytics exist

`product_view`, `size_selected`, `size_error_shown`, `add_to_bag`, `checkout_started`, `field_error` (with field name), `coupon_applied`, `purchase_completed`, `chat_opened`, `chat_feedback`. Review conversion from `product_view` to `add_to_bag` and the rate of `size_error_shown`.

## Risks

- Required size adds one step before purchase. Expect fewer instant adds and fewer wrong-size returns; measure both.
- The demo checkout and mock reviews are not business data. Replace them before drawing conclusions about conversion.
