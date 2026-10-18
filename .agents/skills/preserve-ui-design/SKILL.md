---
name: preserve-ui-design
description: Preserve existing component designs during audits, bug fixes, theme integration, refactoring, dependency updates, and performance work. Use when the user says not to change the UI or when maintaining established component artwork. Protect visual defaults while allowing explicitly requested design changes.
---

# Preserve UI Design

## Establish the boundary

Read the user's latest request and repository instructions. Existing user authorization takes precedence over this skill. A request to improve portability, speed, maintainability, accessibility, or dark/light integration does not by itself authorize a redesign.

Record the target files and a baseline before editing: the current commit or original source, relevant screenshots if available, and the component's public API. If the current work includes an explicitly approved visual change, use that approved state as the baseline for subsequent internal work.

## Protect the design

Keep the existing default layout, dimensions, spacing, typography, labels, assets, colors, gradients, shadows, masks, borders, radii, materials, layering, and animation choreography. Preserve component demos and playground arrangement too. Do not rename or remove public props as incidental cleanup.

Distinguish semantic UI colors from material and artwork colors. A black glass surface, luminous accent, embossed text, or white label on a dark material is intentional artwork unless evidence shows otherwise. Do not replace all literal colors with theme tokens or flatten effects to make code simpler.

For integration, prefer existing className/style/color props, documented host token mapping, optional new overrides that leave defaults unchanged, and fixes to broken color parsing. Keep the original fallback when a host token is absent. Do not promise compatibility with every theme or framework without stating the actual contract.

## Make the smallest useful fix

Proceed with authorized internal work: dependency declarations, client boundaries, composed refs, event/callback correctness, cleanup, idle scheduling, invalid input handling, and accurate documentation. Bug fixes may change behavior in the broken scenario; explain that difference. Respect reduced motion, keyboard use, and accessible naming while preserving ordinary rendering.

If a proposed correction needs a new visual default, changed copy, geometry, focus treatment, or choreography outside the request, finish the safe internal work and report the issue with the smallest proposed visual change. Ask only for that unresolved design decision. Do not use this skill to block work already authorized by the user.

## Verify and report

Inspect the diff for classes, style expressions, design constants, SVG paths, assets, default props, and demo changes. Compare affected renders with matching data, theme, viewport, fonts, animation phase, and browser conditions when feasible. Exercise the actual bug separately; a still screenshot cannot verify behavior.

Separate source invariants, screenshot evidence, and interaction checks. A source diff is useful but does not prove pixel equivalence. Do not edit a baseline merely to make a regression check pass. Record approved exceptions explicitly.

Report what was fixed, evidence that the defaults were preserved, and any remaining bug or unverified visual state. Avoid a blanket claim that the design is locked by automation; these are working rules supported by the checks actually run.
