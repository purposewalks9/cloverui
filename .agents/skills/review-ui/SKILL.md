---
name: review-ui
description: Review React components, demos, and interfaces for theme integration, install portability, behavior, accessibility, rendering performance, and maintainability. Use for component audits, UI critiques, quality checks, and frontend polish. Produce evidence-based findings and preserve existing designs unless visual changes are requested.
---

# UI Reviewer

## Establish scope and preserve the baseline

Read the task, repository instructions, public props, examples, and relevant styles. Identify whether the user wants a review or fixes. Review-only requests do not authorize edits; requests to improve components do authorize appropriate fixes. Use the available design-preservation skill when the user protects the UI, or apply the same boundary here: no incidental restyling or changed visual defaults.

Record the source/commit baseline and available renders. For a library audit, inventory every component and mark each one's evidence level instead of assuming one successful demo covers the library. Keep the owner's typography, materials, palettes, geometry, artwork, and normal-motion behavior intact. Distinguish functional bugs from design suggestions.

## Audit integration and APIs

- Inspect each component's imports against its installation/registry metadata. Check declared third-party and registry dependencies, client boundaries, browser globals during SSR, and accidental imports from the documentation app.
- Verify the actual host contract: React/framework versions, styling engine, utility aliases, CSS tokens, dark selector, optional providers, external assets, and browser APIs. Do not promise universal compatibility or a successful fresh install based only on the docs site's dependency tree.
- Separate inherited/semantic text and surfaces from intentional artwork colors. Check light, dark, and a custom host palette when renders are available. Resolve missing tokens with documented mappings or unchanged fallbacks; do not repaint the design wholesale.
- Exercise supported controlled/uncontrolled state, prop updates, forwarded refs without losing internal refs, native attributes/events, default button type in forms, disabled behavior, labels, and exported types. Do not assume all refs are DOM refs; some expose deliberate imperative APIs.
- Check loading, empty-to-loaded, error, malformed persisted data, unmount, and multiple-instance cases relevant to the component. Keep demos, live code, docs, and generated registry output aligned with the real API.

## Audit behavior and rendering

- Inspect timers, requestAnimationFrame, observers, event listeners, network requests, WebGL/canvas resources, and animations for cleanup on unmount and dependency changes.
- Check paused, zero-speed, hidden, and offscreen work where applicable. Prefer avoiding unnecessary work over unmeasured memoization or removing the signature effect. Do not claim a speed improvement without a measured count, trace, or concrete eliminated operation.
- Verify accessible names, keyboard operation, focus, status announcements, contrast where measurable, reduced-motion behavior, narrow layouts, and text zoom. A screenshot cannot prove keyboard behavior; source inspection cannot prove contrast or visual equivalence.
- Avoid rewriting every component to a uniform API or adding dependencies without a demonstrated need. Preserve standalone distribution when adding helpers.

## Fix and verify when authorized

Reproduce significant suspected bugs with the smallest fixture available, or clearly label source-only findings. Make focused fixes and run the checks that cover their failure modes. Rebuild generated artifacts. Compare affected default renders under matching conditions and inspect the source diff for changed design constants/classes/assets.

If a fix would visibly change a protected design, finish safe work and report the unresolved issue and specific proposed change. Do not ask permission again for work the user already authorized. Do not add tests that merely mirror implementation or inflate an audit with speculative warnings.

## Report evidence

Lead with up to five prioritized findings or completed fixes. For each material finding give the file or reproduction, practical effect, smallest correction, and verification. A broad library audit may include a full per-component table in a repository report; keep the conversational result concise.

State what was source-reviewed, rendered, interacted with, and still unverified. Separate introduced failures from baseline failures. When no material issue is found, say so without inventing issues. Do not claim bug-free, production-ready, universal design-system compatibility, or complete visual coverage from limited checks.
