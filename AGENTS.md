# Clover UI agent instructions

Follow the repository conventions in `CLAUDE.md`.

## Code conventions

Read `.agents/skills/clover-conventions/SKILL.md` before adding or editing code. It sets the naming, file layout, Next.js route, `lib/`, hooks, import, type and component patterns. Match the existing pattern rather than inventing a new one, and update that skill in the same change when a convention moves.

- File name = export name (`command-menu.tsx` → `CommandMenu`). Route defaults are named `XPage` / `XLayout`.
- `getX` loads data, `buildX` assembles a value, `useX` is a hook. `lib/` functions are `export async function`, not arrow constants.
- `import * as React from "react"`, `@/` imports, `node:` built-ins, `import type` for types.
- `interface` for object shapes, `type` for unions.
- Components are `function X`, exported once at the bottom with `export { X }`. Take `ref` as a prop, with no `forwardRef` (except the owner's `soft-button.tsx`).
- Standalone hooks go in `hooks/use-x.ts`. A context's hook stays beside its provider. Reuse `useCopyToClipboard` for copy feedback.

## Component maintenance

Preserve existing component and demo designs during audits, portability fixes, and performance work. Read `.agents/skills/preserve-ui-design/SKILL.md` before those edits and `.agents/skills/review-ui/SKILL.md` for audits. For commits and GitHub updates use `.agents/skills/commit-verified-changes/SKILL.md`. Explicit user design instructions take precedence.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
