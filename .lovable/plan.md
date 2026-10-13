# Finish the Asia Electronics demo store (no new images)

All pages are already built using the 7 existing pictures. No more pictures will be generated; products keep reusing their category picture.

## Remaining work
1. Fix any build or type errors in the new pages (shop filters, product page, checkout, account, policy pages).
2. Check every page in the browser at phone (375px), tablet (768px) and desktop (1440px): home, shop with search and filters, product with options, cart, checkout errors and success, sign-in, contact.
3. Confirm the cart survives a page refresh and never goes above available stock.
4. Add small automated checks for the rules that matter:
   - quantity can't exceed stock (including across options)
   - free delivery from Rs. 25,000, otherwise Rs. 450 flat (demo values)
   - search matches name, part number, brand and model
   - checkout rejects a bad Sri Lankan mobile number
5. Record project notes (roadmap, structure rules, brand colours and fonts) for future work.
6. Short handover: how to run it locally, what's simulated, and where the real backend and PayHere will plug in later.

## Technical details
- Tests go in `src/test/` using vitest against `src/context/cart.tsx` reducer logic, `src/services/catalog.ts` `listProducts`, and the checkout zod schema (export it from the route).
- Add `roadmap.md` and append rules to `AGENTS.md`: mock data in `src/data`, async services in `src/services` (swap point for backend), money in integer cents.
- Save memory: red #E60023, Montserrat + Manrope, square corners, demo-only labelling, no image generation for now.
