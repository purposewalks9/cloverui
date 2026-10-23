# Clover UI maintenance instructions

Read `CONTRIBUTING.md` for setup and verification, and `ARCHITECTURE.md` for source ownership. These are public project rules; personal skills and private strategy remain local.

## Scope and design

- Follow the user's requested scope. Preserve unrelated work.
- Preserve existing component and playground layout, artwork, colors, typography, SVG paths, materials, default props and animation behavior unless the task explicitly changes them.
- Do not treat literal artwork colors as mistakes or replace them during general cleanup.
- Keep exported props, component names and install paths compatible unless the requested change includes a migration.

## Source and generated files

- Installable components live in `registry/clover-ui/`; site UI lives in `components/`.
- Keep component metadata in `registry.json` and docs in `docs/<name>/`.
- Rebuild `public/r/` with `pnpm registry:build`; never edit generated contents by hand. Remove obsolete artifacts when intentionally removing or renaming an item.
- Update install-all membership and explain route/export compatibility when names change.
- Do not publish ignored personal instructions, credentials or private notes.

## Verification and reporting

- Use the Node version in `.nvmrc` and pnpm version in `package.json`.
- Run `pnpm verify`. Use focused regressions to reproduce concrete failures.
- Distinguish source checks, server-render tests, browser interaction checks and visual comparisons. Report unavailable checks accurately.
- Describe the problem and resulting behavior in PRs, followed by relevant verification and compatibility notes. Avoid duplicate tool/session boilerplate; preserve contributor credit.
- Use concise imperative commit titles. Do not rewrite published history or merge unrelated work as cleanup.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
