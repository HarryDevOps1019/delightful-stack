<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Store architecture
- Mock catalogue data lives in `src/data/`; components read it only through async functions in `src/services/` — that service layer is the single swap point for a future backend.
- All money is stored and calculated in integer minor units (cents) and formatted only via `src/lib/format.ts` — avoids rounding drift.
- Cart state is a React Context + reducer in `src/context/cart.tsx`, persisted to localStorage with product ids/qty only — never store personal or payment details client-side.
- Store rules (stock caps, delivery thresholds, search, checkout validation) are covered by `src/test/store-rules.test.ts`; update it when rules change.
