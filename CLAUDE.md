# Clover UI

A docs site and shadcn registry of animated React components. Live at https://cloverui.vercel.app, source at https://github.com/purposewalks9/cloverui.

Stack: Next.js 16 (webpack), React 19, Tailwind CSS v4, `motion`, shadcn, pnpm.

## Commands

- `pnpm dev`: dev server on port 3000
- `pnpm registry:build`: rebuild `public/r/*.json` from `registry.json`. Run it after any change to a registry component or `registry.json`.
- `pnpm registry:check`: verify imports, client boundaries, docs, and generated registry content.
- `pnpm registry:typecheck`: type-check the distributed components independently of the docs app.
- `pnpm lint` and `pnpm exec tsc --noEmit`: check the full app too and report baseline failures accurately. The OpenAI mark is preserved locally in `components/seed/openai-logo.tsx`, since newer icon-package releases removed its export.
- `pnpm format`: Prettier. `.prettierignore` skips `*.mdx`, `registry/clover-ui/soft-button.tsx` and `docs/soft-button`.

## Layout

- `registry/clover-ui/<slug>.tsx`: the published component. It must work on its own apart from what its `registry.json` entry declares.
- `registry.json`: one item per component (`name`, `title`, `description`, `dependencies`, `registryDependencies`, `category`). `category` picks the sidebar group. The groups are listed in `lib/doc.ts`.
- `docs/<slug>/`: `doc.mdx` (playground, installation, usage, props table), `demo.tsx` (a minimal `Demo` export) and `playground.tsx` (`PlaygroundShell` plus `ControlDef[]` from `@/lib/playground`). Passing `controls={[]}` shows the component on its own, with no Customize panel.
- `app/(docs)/`: the docs layout (sidebar, header and the `@toc` Table of Contents slot), shared by two routes:
  - `components/[slug]`: component pages. A slug is published only when it has both a `docs/<slug>/` folder (with `doc.mdx` and `demo.tsx`) and a `registry.json` entry (`lib/slugs.ts`).
  - `docs/[slug]`: Getting Started pages. Their content is in `docs/guides/<slug>.mdx`, and the list (title, description, order) is in `lib/basic-doc.ts`.
- `app/page.tsx`: home page. Its bento cards are listed by hand, so new components don't appear there on their own.
- `app/og/route.tsx`: share preview image. `/og` is the site card, and `/og?slug=<name>` reads the component's title and description from `registry.json`.
- `lib/config.ts`: the domain, GitHub, X handle and site description. Metadata, the sitemap, the GitHub stars button and the share previews all read from it.
- `components/`: site-only UI. `ui/` holds the shadcn primitives. `stem/` holds the headers, sidebar, command menu and TOC. `garden/` holds the playground. `leaves/` holds the docs and home page pieces.

## Adding or changing a component

1. Write `registry/clover-ui/<slug>.tsx`, then add or update its `registry.json` entry. For a new component, include `meta.addedAt` as its real release date (`YYYY-MM-DD`); the mobile menu’s New view automatically shows the six most recent dated components. Keep that original date on later edits.
2. Add `docs/<slug>/doc.mdx`, `demo.tsx` and `playground.tsx`. The props table and the usage text must match what the code actually does.
3. Run `pnpm registry:build`, then lint and type-check.
4. Follow `.agents/skills/review-ui/SKILL.md`. Preserve existing designs with `.agents/skills/preserve-ui-design/SKILL.md`. Use `.agents/skills/commit-verified-changes/SKILL.md` when committing or publishing changes.

`registry.json` also has an `all` item that installs every component through `registryDependencies`. Add each new component's URL to it, and remove it there when a component is deleted.

When renaming or deleting a component, update every one of these: the component file, `docs/<slug>/`, `public/r/<slug>.json`, the `registry.json` entry, any assets it used and the home page cards.

## Code style

- No code comments. The owner had all of them removed, so don't add new ones. Keep tooling directives such as `eslint-disable` and `@ts-expect-error`.
- Variants use `cva`, and classes are merged with `cn()` from `@/lib/utils`. Accept `className` and spread `...props` onto the root element. Take `ref` as a normal prop (React 19).
- Export the prop types, e.g. `MicColor` and `CursorTagSide`, so playgrounds cast to them instead of redeclaring unions or using `any`.
- Use host theme tokens for semantic UI and inherited text. Preserve existing artwork colors, material palettes, gradients, shadows, and effects. Do not repaint existing components to fit a theme. Use current override props or document the host mapping; check light, dark, and a custom palette. See `docs/component-integration.md`.
- Respect `prefers-reduced-motion` with `useReducedMotion()`. Clean up timers, animation frames, media streams and running animations when an effect re-runs or the component unmounts.
- Keep button and toolbar text on one line (`whitespace-nowrap`, `shrink-0`). Check headers at 200% browser zoom.

## Design preservation

Existing component and demo designs are protected by default. Internal fixes, packaging, and performance work must preserve normal rendering, visual defaults, public APIs, and playground layout. The owner can explicitly authorize a visual change. Before editing, retain a source baseline and compare affected renders when possible; report checks that could not run. Do not treat automated checks as proof of universal compatibility. The full workflow is `.agents/skills/preserve-ui-design/SKILL.md`.

## Things to be careful with

- `registry/clover-ui/soft-button.tsx` is the owner's own design. Don't reformat or restyle it unless asked. To add a color, extend its map.
- Use registry components as designed. Don't strip their visual effects (e.g. RichText's emboss) to "clean them up" without asking.
- Run only one `next dev`. The owner usually has one running already, and two servers corrupt `.next`. After renaming or deleting a docs folder, restart the server, or old URLs crash instead of returning 404.
- Dev returns HTTP 200 even when a page crashes, so check the rendered HTML for errors rather than the status code.
- The project folder name contains `*` (`@me*i`), so quote paths in shell commands.
- The `/og` image renderer (Satori) supports only flexbox and no `inset`. Use explicit `top`, `left`, `right` and `bottom`.

## Working with the owner

The owner is new to coding and writes casually. Make changes directly, verify them, and explain the result in plain words. Commit and push to `main` only when asked.
