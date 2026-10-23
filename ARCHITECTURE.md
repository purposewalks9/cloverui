# Clover UI architecture

Clover UI distributes React 19 and Tailwind CSS v4 components as source through a shadcn registry. This repository also contains the Next.js documentation site. The application package is private; consumers install individual registry files rather than this application as an npm package.

## Source ownership

| Location              | Responsibility                                                                     |
| --------------------- | ---------------------------------------------------------------------------------- |
| `registry/clover-ui/` | Installable component source and public props                                      |
| `registry.json`       | Component names, descriptions, categories, dependencies and install-all membership |
| `public/r/`           | Generated registry artifacts; rebuild instead of editing contents                  |
| `docs/<name>/`        | Component documentation, demo, playground and optional examples                    |
| `app/`                | Site routes, metadata endpoints and sponsor webhook                                |
| `components/`         | Documentation-site UI and supporting primitives                                    |
| `lib/`, `hooks/`      | Site data loading, utilities and hooks                                             |
| `scripts/`, `tests/`  | Repository validation and regression checks                                        |

An installed component must not depend on documentation-site code. Its dependencies belong in its registry entry; `@/lib/utils` is the shared host utility convention. The registry checker validates static imports against the declared package and registry dependencies.

## Registry and documentation flow

1. Edit component source and its entry in `registry.json`.
2. Keep the component's `docs/<name>/` files and the `all` bundle in sync.
3. Run `pnpm registry:build` to regenerate `public/r/` using the locked CLI.
4. Run `pnpm verify` before submitting the source and generated changes together.

The site reads `registry.json` through `lib/registry.ts`, validates its metadata and derives component navigation through `lib/doc.ts`. `lib/guides.ts` owns non-component guide entries. Documentation routes use `/docs/<slug>`; `lib/slugs.ts` derives published component slugs from available docs and registry entries.

Names connect source filenames, documentation folders, registry URLs and consumer imports. A rename must account for all of them. Explain compatibility effects and any redirect strategy in the PR; keep historical PR descriptions accurate to their original changes.

## Verification boundaries

`pnpm verify` runs lint, application and registry TypeScript checks, registry validation, tests and a production build. CI runs that command and checks that registry regeneration produces no tracked diff or new output files.

Registry validation checks metadata, generated content, import declarations, selected client APIs, required docs and bundle membership. Property tests use reproducible samples to check initial server-rendered numeric invariants. Neither server rendering nor type checking establishes browser interaction or pixel equivalence. Changes to interactive behavior need focused browser checks; visual changes need comparable screenshots or recordings.

## Site integrations

`lib/config.ts` holds site identity and URLs. Optional sponsor data is loaded server-side by `lib/sponsors.ts`. The `/api/sponsors` endpoint verifies a webhook signature before invalidating cached sponsor data. `.env.example` describes optional configuration; credentials remain local or in deployment settings.

The shadcn MCP server provides registry tooling. Consumers configure `@clover-ui` in their own `components.json`. Contributor agents should also read `AGENTS.md` and `CONTRIBUTING.md`; MCP access alone does not explain maintenance boundaries.
