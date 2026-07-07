# Next.js JavaScript to TypeScript Migration Plan

## Purpose

Migrate this repository from JavaScript source files to TypeScript while preserving the current Next.js App Router behavior.

This is not a migration from static HTML to Next.js. The app is already a native Next.js application. The target is:

- Next.js App Router
- React
- TypeScript source code
- Supabase Auth/Postgres helpers retained
- Existing public routes and UI behavior unchanged

Another coding agent should be able to implement this plan without re-deciding scope, strictness, test strategy, or high-risk areas.

## Current Repository State

The repository is currently a Next.js app using JavaScript.

Important current facts:

- App Router files live under `app/`.
- React components live under `components/` and `features/`.
- Page content/data lives in `data/pages/site.js`.
- Supabase helpers live under `lib/supabase/`.
- Auth/profile helpers live under `lib/auth/` and `lib/profile/`.
- Tests are Node test runner `.mjs` files under `tests/`.
- There is a `jsconfig.json`, but no `tsconfig.json`.
- `package.json` has no TypeScript dependencies yet.
- Current baseline was checked on 2026-07-07:
  - `npm.cmd test` passed: 25 tests
  - `npm.cmd run lint` passed
  - `npm.cmd run build` passed

Current key scripts:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "test": "node --experimental-default-type=module --test",
  "lint": "eslint ."
}
```

Current public route surface to preserve:

- `/`
- `/account`
- `/contact`
- `/documents`
- `/faq`
- `/japan`
- `/japan-form`
- `/korean`
- `/login`
- `/logout`
- `/pricing`
- `/register`

## Migration Decisions

Use the following decisions exactly:

- Scope: migrate all source code from JavaScript to TypeScript.
- Tests: keep tests as `.mjs` for this migration, but update imports and runner so tests can load TypeScript source.
- Strictness: use pragmatic strict TypeScript.
- Behavior: no UI redesign, route restructuring, Supabase schema change, or feature change.
- Public data/storage compatibility: keep existing localStorage/sessionStorage keys and env variable names unchanged.

Pragmatic strict means:

- Enable `strict: true`.
- Prefer real types for data shapes, form payloads, React events, refs, and Supabase helpers.
- Allow small explicit assertions where browser APIs, dynamic imports, or third-party libraries make perfect typing noisy.
- Do not use broad `any` as the default escape hatch.

## Tooling Changes

Install TypeScript tooling:

```powershell
npm.cmd install -D typescript tsx @types/node @types/react @types/react-dom typescript-eslint
```

Replace `jsconfig.json` with `tsconfig.json`.

Recommended `tsconfig.json` shape:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

Update scripts in `package.json`:

```json
{
  "test": "node --import tsx --test",
  "typecheck": "tsc --noEmit",
  "lint": "eslint ."
}
```

Keep `dev`, `build`, and `start` unchanged unless Next.js requires a config filename update.

Update `eslint.config.mjs` so it can parse and lint TypeScript. Use `typescript-eslint` flat config support. Preserve current ignores:

- `.next/**`
- `node_modules/**`
- `public/**`
- `out/**`

Also preserve browser globals if the current config still needs them for client components and tests.

## File Rename Plan

Rename JSX/rendering files to `.tsx`.

Expected `.tsx` groups:

- `app/**/page.js` -> `app/**/page.tsx`
- `app/layout.js` -> `app/layout.tsx`
- React component files under `components/`
- React feature files under `features/`

High-value known `.tsx` files:

- `components/AccountMenu.tsx`
- `components/IdleSessionTimeout.tsx`
- `components/account/AccountProfileForm.tsx`
- `components/layout/SiteLayout.tsx`
- `components/marketing/ContactForm.tsx`
- `components/marketing/FaqAccordion.tsx`
- `components/marketing/HomePageClient.tsx`
- `components/marketing/StaticPages.tsx`
- `components/visa/VisaChecklistPage.tsx`
- `features/japan-form/JapanFormPageClient.tsx`

Rename non-JSX logic/config/data files to `.ts`.

Expected `.ts` groups:

- `app/logout/route.js` -> `app/logout/route.ts`
- `proxy.js` -> `proxy.ts`
- `data/pages/site.js` -> `data/pages/site.ts`
- `lib/auth/*.js` -> `lib/auth/*.ts`
- `lib/profile/*.js` -> `lib/profile/*.ts`
- `lib/supabase/*.js` -> `lib/supabase/*.ts`

`next.config.js` can either remain `.js` with JSDoc typing or become `next.config.ts` if supported cleanly by the installed Next.js version. Prefer `next.config.ts` if the build accepts it without extra work.

## Import Update Rules

Update internal imports after renaming.

For app/source files:

- Prefer extensionless imports where Next.js resolves them cleanly.
- Keep alias imports using `@/` where already used.

For `.mjs` tests:

- Update direct source imports from `.js` to `.ts`.
- Example:

```js
import { parseEmailPasswordForm } from "../lib/auth/forms.ts";
```

Because the test script uses `node --import tsx --test`, the `.mjs` tests should be able to import TypeScript source files directly.

Do not leave tests importing deleted `.js` source paths.

## Type Design

### Page Data

Add exported types in `data/pages/site.ts` for the page data consumed by marketing and visa pages.

Useful types:

- `NavigationItem`
- `SimplePage`
- `VisaPage`
- `ChecklistItem`
- `OfficialLink`
- `BasicFormField`
- Option tuple or object types for form/select options

Use these types in:

- `components/layout/SiteLayout.tsx`
- `components/marketing/StaticPages.tsx`
- `components/visa/VisaChecklistPage.tsx`
- App route page components that pass page data

Preserve existing content and route labels. Do not translate or rewrite page copy as part of this migration.

### Auth and Profile

Type the current form parsing and profile payload functions without changing payload behavior.

Important files:

- `lib/auth/forms.ts`
- `lib/auth/actions.ts`
- `lib/auth/account.ts`
- `lib/auth/account-menu.ts`
- `lib/auth/session-timeout.ts`
- `lib/profile/forms.ts`
- `lib/profile/errors.ts`
- `lib/profile/client.ts`
- `lib/profile/server.ts`

Expected types:

- `FormData` input for server actions/form parsers.
- Auth credentials shape with `email` and `password`.
- Profile row/payload shapes using current snake_case database fields.
- Basic visa data shape using current camelCase local form fields.

Important behavior to preserve:

- Passport number and school name are omitted from profile payloads where currently omitted.
- Empty string trimming behavior remains the same.
- Missing profile table detection remains the same.
- Login/register redirects and error messages remain the same.

### Supabase Helpers

Type the Supabase helpers carefully.

Important files:

- `lib/supabase/config.ts`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/proxy.ts`

Preserve env variable behavior:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Existing anon-key fallback if currently supported by the code

Do not introduce service-role keys into client code.

Cookie handling in server/proxy helpers should remain behaviorally identical. If cookie setter types are noisy, use narrow local types rather than weakening the entire module.

### Client Components

Preserve `"use client"` at the first statement of client components.

Likely client files:

- `components/AccountMenu.tsx`
- `components/IdleSessionTimeout.tsx`
- `components/account/AccountProfileForm.tsx`
- `components/marketing/ContactForm.tsx`
- `components/marketing/FaqAccordion.tsx`
- `components/marketing/HomePageClient.tsx`
- `components/visa/VisaChecklistPage.tsx`
- `features/japan-form/JapanFormPageClient.tsx`

Use React types for:

- `FormEvent`
- `ChangeEvent`
- `MouseEvent`
- `RefObject`
- input/select/textarea element events
- file upload events

Avoid over-typing JSX. Type props and event boundaries first.

### Server Actions

Preserve `"use server"` at the first statement of server action modules.

Likely server action files:

- `lib/auth/actions.ts`
- `lib/profile/server.ts`

Do not move server actions into client components.

Do not import server-only helpers into client components.

## High-Risk Areas

### Japan Form

`features/japan-form/JapanFormPageClient` is high-risk because it uses:

- `localStorage`
- `sessionStorage`
- file uploads
- `FileReader`
- `useRef`
- dynamic imports of `html2canvas` and `jspdf`
- DOM queries with `querySelectorAll`
- print/PDF mode state

Implementation guidance:

- Type the PDF root ref as an HTML element that supports `querySelectorAll`.
- Narrow `event.target.files` before reading files.
- Use `String(loadEvent.target?.result || "")` behavior as currently implemented.
- Keep `setPdfMode` timing and print/PDF behavior unchanged.
- Keep storage keys unchanged:
  - `visamate_open_japan_form`
  - `visamate_basic_data`

### Visa Checklist Page

`components/visa/VisaChecklistPage` is high-risk because it uses:

- profile hydration
- localStorage/sessionStorage
- file uploads
- dynamic `pdf-lib` import
- Set state
- upload merge queue
- itinerary rows
- router navigation to `/japan-form`

Implementation guidance:

- Define types for the basic form, upload map, merge queue item, and itinerary row.
- Type `Set<string>` state explicitly.
- Type upload handlers around `FileList | null`.
- Keep `persistForm`, `syncBasicDataToProfile`, and `openJapanForm` behavior unchanged.
- Keep `router.push("/japan-form")` behavior unchanged.

### Tests

Existing tests inspect route files and import source files directly.

Update tests to account for `.tsx` route filenames:

- Any test scanning for `page.js` should scan for `page.tsx`.
- Any test checking absence of legacy extraction should still check all route page files.

Keep existing assertions intact unless a path extension changes.

## Validation Commands

Run these after implementation:

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Expected result:

- All existing tests pass.
- TypeScript typecheck passes.
- ESLint passes.
- Next production build passes.

If dependency installation is blocked by network/sandbox restrictions, request permission to run the npm install command with network access instead of changing the plan.

## Manual Smoke Checks

After automated validation, manually check the highest-risk flows:

1. `/japan`
   - Basic form renders.
   - Form submission shows checklist.
   - Profile/local storage prefill still works.
   - Upload controls still accept mergeable files.
   - Opening the Japan form still navigates to `/japan-form`.

2. `/japan-form`
   - Data prefills from previous Japan page flow.
   - Sample fill works.
   - Clear form works.
   - Photo upload preview works.
   - Print button still opens browser print flow.
   - Generate PDF button still attempts PDF generation.

3. Auth/profile routes
   - `/login` renders.
   - `/register` renders.
   - `/account` renders with existing profile form behavior.
   - `/logout` route still signs out.

4. Public pages
   - `/`
   - `/korean`
   - `/pricing`
   - `/faq`
   - `/documents`
   - `/contact`

## Non-Goals

Do not include these in this migration:

- UI redesign
- route changes
- Supabase schema changes
- payment integration changes
- changing localStorage/sessionStorage key names
- converting tests to TypeScript unless required to keep the test command simple
- adding a new test framework
- changing the app from server-backed Next.js to static export

## Completion Criteria

The migration is complete only when:

- No source `.js` files remain under `app/`, `components/`, `features/`, `lib/`, or `data/`.
- Source imports resolve without stale `.js` paths.
- Existing `.mjs` tests import TypeScript source successfully.
- `npm.cmd test` passes.
- `npm.cmd run typecheck` passes.
- `npm.cmd run lint` passes.
- `npm.cmd run build` passes.
- High-risk manual smoke checks are completed or any skipped checks are explicitly documented.

