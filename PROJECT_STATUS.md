Project Status (TypeScript migration)
====================================

Purpose
-------
This doc captures what was done so far and what remains to finish the
TypeScript conversion and cleanup. It is written so a new contributor
can pick up the work without digging through chat history.

High-level goal
---------------
Convert the entire repo to TypeScript with strict type checking
(`strict: true`) and remove all `// @ts-nocheck` blocks by properly typing
files.

What was completed
------------------
Frontend (done)
- Converted frontend codebase to TypeScript.
- Removed `// @ts-nocheck` from all frontend pages and added proper types.
- Fixed common issues:
  - Date arithmetic now uses `.getTime()`.
  - DOM event handlers typed (e.g., `React.FormEvent`, `ChangeEvent`).
  - Added type guards and fallbacks for nullable/optional data.
  - Added pragmatic `AnyRecord` (`Record<string, any>`) where API payloads
    are too dynamic to fully type quickly.
- Frontend typecheck passes: `npm run typecheck` in `frontend/`.

Backend (in progress)
- Began removing `// @ts-nocheck` from backend files.
- `// @ts-nocheck` removed from:
  - `src/services/types.ts`
  - `src/services/cache.ts`
  - `src/services/email.ts`
  - `src/services/sportsmonks.ts`
  - `src/routes/standings.ts`
  - `src/routes/seasons.ts`
  - `src/routes/predictions.ts`
  - `src/routes/players.ts`
  - `src/routes/odds.ts`
  - `src/routes/topscorers.ts`

What is still pending
---------------------
1) Remove `// @ts-nocheck` from remaining backend routes
   - `src/routes/auth.ts`
   - `src/routes/fixtures.ts`
   - `src/routes/leagues.ts`
   - `src/routes/livescores.ts`
   - `src/routes/notes.ts`
   - `src/routes/teams.ts`
2) Finish typing any backend services/routes that error after removal.
3) Run backend typecheck and fix errors.

Current repo state (important)
------------------------------
- The repo contains many deleted `.js/.jsx` files and many new `.ts/.tsx`
  files. This is expected from the migration.
- `git status -sb` shows many deleted JS files and new TS files.

Suggested next steps (backend)
------------------------------
1) For each remaining backend file with `// @ts-nocheck`, remove the comment
   and add types. Start with:
   - `src/routes/teams.ts` (largest, most typing needed)
   - `src/routes/fixtures.ts`
   - `src/routes/notes.ts`
2) Run typecheck in backend (root):
   - `npm run typecheck` (or equivalent script if configured)
3) Fix remaining TypeScript errors.

Notes on approach
-----------------
- For complex API payloads, use `type AnyRecord = Record<string, any>;`
  and refine later.
- Add guards before accessing optional properties to satisfy strict mode.
- Prefer explicit types for event handlers and callback parameters.

