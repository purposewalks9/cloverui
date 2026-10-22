# Integrating Clover UI without changing its designs

Clover components keep their existing artwork. Host applications supply the surrounding typography, semantic colors, and theme selector. The supported source contract is React 19, Tailwind CSS 4, a shadcn-compatible setup, and the dependencies in each registry entry. This is not a promise that arbitrary frameworks or CSS resets work without configuration.

## Installation contract

Use the registry to install components with their declared packages and registry dependencies. The host `components.json` aliases must resolve the generated component paths and `@/lib/utils`. That utility needs a compatible `cn` function; do not copy Clover's documentation-site utilities into the consumer app.

React 19 is required for components accepting `ref` as a prop. Several animated components deliberately expose imperative refs such as `play`, `pause`, or `reset` rather than a DOM node. Use each exported ref type.

Client components can be imported through their own `"use client"` boundary in an App Router project. A provider is still needed for provider-backed functionality: ThemeToggle integrates with `next-themes`; a different theme manager can own its `theme` and `onThemeChange` props.

The components use modern CSS, including color mixing, masks, and Tailwind 4 utilities. Canvas, WebGL, ResizeObserver, IntersectionObserver, and Web Animations are used by particular effects. The source contains some fallbacks, but the audit did not certify every browser or GPU.

## Map semantic tokens once

Keep your design system's existing values and map them to the tokens the components consume. Map paired colors together so labels remain readable. For a host with its own variables, the pattern is:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --color-background: var(--surface);
  --color-foreground: var(--on-surface);
  --color-primary: var(--action);
  --color-primary-foreground: var(--on-action);
  --color-muted: var(--subtle-surface);
  --color-muted-foreground: var(--subtle-text);
  --color-secondary: var(--secondary-surface);
  --color-secondary-foreground: var(--on-secondary);
  --color-accent: var(--hover-surface);
  --color-accent-foreground: var(--on-hover);
  --color-border: var(--outline);
  --color-input: var(--field-outline);
  --color-ring: var(--focus-ring);
}

:root {
  --background: var(--surface);
  --foreground: var(--on-surface);
  --primary: var(--action);
}
```

This is a mapping example, not a replacement palette. Define those host variables in both themes. Components that use raw `var(--primary)` or `var(--background)` need the corresponding raw aliases as well as Tailwind theme entries. A standard shadcn setup already provides these tokens. The declared Button dependency may also use destructive and other tokens from that setup.

If your host uses a data attribute, define the Tailwind `dark` variant against that selector. SignPad's automatic ink selection currently checks `.dark` on the document root, so a data-attribute-only or nested theme needs an adapter; its accent fallback does not change that limitation.

## Preserve artwork while customizing

| Surface                                                    | Integration approach                                                                                                                                              |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Body text, chart labels, consent descriptions, focus rings | Map semantic host tokens and inherited typography.                                                                                                                |
| Switch, SoftButton, ThemeToggle, Ghost, embossed RichText  | Preserve their material palettes, gradients, shadows, and geometry. Use the component's existing variants and override props intentionally.                       |
| PulseLoader colors                                         | CSS colors can come from host variables.                                                                                                                          |
| GrainCube and ThermalFlow shader palettes                  | Pass literal hex or comma-separated numeric RGB colors. CSS variables, named colors, HSL, and OKLCH are not resolved by these shader parsers.                     |
| LiquidButton shader palette                                | Pass literal hex colors. DOM theme variables are not resolved by its shader parser.                                                                               |
| NucleusText particles                                      | Supply a concrete canvas-compatible color; do not assume a DOM CSS variable is resolved by the canvas.                                                            |
| LogoMarquee, TextGif, AppleMusicCard                       | Supply accessible assets where supported. LogoMarquee's defaults use Clover-hosted URLs; GIFs and Apple artwork/metadata have external availability requirements. |

Native props are supported where the exported type declares them. Do not assume every artistic component accepts every DOM attribute. Use `className`, specialized class props, labels, formatters, and controlled props exposed by that particular component. Some inline artwork styles intentionally take precedence over generic style overrides.

For forms, SoftButton now defaults to `type="button"`; pass `type="submit"` explicitly when intended. Controlled inputs still require their documented change callback. Provide an accessible label for switches and other controls whose visible artwork does not name their purpose.

## Maintaining components

After source or metadata changes:

```bash
pnpm registry:build
pnpm registry:check
pnpm registry:typecheck
pnpm exec eslint registry/clover-ui scripts/check-registry.mjs
pnpm exec tsc --noEmit
```

The registry checker inspects static imports, client APIs, generated source and metadata, docs presence, and the aggregate installer. It does not execute the component, resolve every possible dynamic import, measure contrast, or replace browser checks.
