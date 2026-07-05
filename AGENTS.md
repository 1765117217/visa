# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js App Router app wrapped around legacy static visa pages. `app/` contains route entries such as `app/page.js`, `app/japan/page.js`, and global CSS. `components/LegacyPageClient.js` runs legacy browser scripts, while `lib/legacyHtml.js` loads and rewrites root HTML files like `index.html`, `japan.html`, and `Contact.html`. Static assets live in `public/`; root-level legacy PNGs remain for compatibility. Supabase client/server helpers belong in `lib/supabase/`. There is no dedicated test directory yet.

## Build, Test, and Development Commands
- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the local Next.js development server.
- `npm run build`: create a production build.
- `npm run start`: run the production build locally.
- `npm run lint`: run ESLint across the project.

No automated test command is currently defined. Use `npm run lint` and `npm run build` before submitting changes.

## Coding Style & Naming Conventions
Use ES module imports, 2-space indentation, and semicolons to match existing files. React components use PascalCase, helpers use camelCase, and route files stay named `page.js` under `app/<route>/`. Prefer server components by default; add `"use client"` only for browser APIs such as `window`, `document`, `localStorage`, or legacy script execution. Use the `@/` alias configured in `jsconfig.json`.

## Testing Guidelines
Until a test framework is added, verify changes with lint/build and manual route checks for `/`, `/japan`, `/korean`, `/japan-form`, `/pricing`, `/faq`, `/documents`, and `/contact`. If adding tests, place `*.test.js` files near the feature or under `tests/`, then add a matching npm script.

## Commit & Pull Request Guidelines
Git history was unavailable in this checkout, so no repository-specific convention could be inferred. Use short imperative commits, optionally scoped, such as `feat: add customer dashboard` or `fix: rewrite legacy image paths`. Pull requests should include a summary, affected routes, screenshots for UI changes, and any required environment or Supabase updates.

## Security & Configuration Tips
Keep `.env.local` private; it is ignored by Git. Never expose Supabase service-role keys to client components. Put secrets only in server-side code and document required environment variables when adding integrations.
