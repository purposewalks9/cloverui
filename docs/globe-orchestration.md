# Globe Orchestrator

Use this workflow for the production-quality globe visualizer requested by the owner: a real 3D Earth that shows live requests traveling from a requester’s geographic origin to a selected server or edge location, with many requests visible concurrently.

## Outcome

Deliver a registry-ready React component, its documentation, demo, playground, registry entry, generated registry output, and proportionate verification. It must work with simulated events now and accept real request telemetry later without a redesign.

## Root-agent contract

The Globe Orchestrator is the only agent that decides the component API, edits the final integration surface, resolves conflicts, and reports completion. Before implementing, inspect the current repository and choose the smallest dependable rendering approach that meets the visual target.

Keep the globe genuinely geographic: latitude and longitude must map to the correct locations on a spherical Earth. A decorative flat map, arbitrary dots, or a CSS sphere is not an acceptable substitute.

Respect the repository conventions in `CLAUDE.md`, including reduced-motion support, cleanup of animation resources, theming, component registry requirements, and the dirty-worktree rule.

## Specialist lanes

Spawn only the lanes needed for the task. Give each specialist a bounded question and ask for a concise handoff to the Globe Orchestrator containing: recommendation, supporting evidence, risks, exact files inspected, and no unrelated edits.

1. **Rendering and geo specialist** — evaluate a suitable real-globe renderer; define accurate latitude/longitude-to-3D conversion, camera behavior, materials, arcs, and endpoint markers; identify dependency and bundle implications.
2. **Traffic animation specialist** — design the telemetry/event contract and bounded scheduler; cover concurrent flights, lifecycle cleanup, burst handling, identity/color semantics, and reduced motion.
3. **Performance and accessibility specialist** — set practical caps and pooling/batching; cover mobile, no-WebGL, resize, visibility, keyboard, labels, contrast, and measurable acceptance checks.
4. **Registry and QA specialist** — inspect registry conventions and review the proposed implementation for API consistency and regressions; return a test checklist, without owning the final merge.

## Telemetry model to preserve

Use an event shape equivalent to this unless the component API dictates a more idiomatic variant:

```ts
type GlobeRequest = {
  id: string;
  origin: { lat: number; lng: number; label?: string };
  destination: { lat: number; lng: number; label?: string };
  startedAt?: number;
  duration?: number;
  kind?: string;
  status?: "pending" | "success" | "error";
  color?: string;
};
```

Accept a changing stream or array of events, deduplicate by `id`, retain items only for their configured visual lifetime, and avoid unbounded memory growth. The demo must show concurrent requests from several continents.

## Quality bar

- Correct geo positioning on a rotatable, shaded 3D globe with recognizable land and ocean detail.
- Curved, elevated routes whose movement clearly reads as origin-to-server traffic.
- Multiple active events remain distinct and performant; bursts cap, sample, or pool instead of freezing.
- Responsive behavior, offscreen/hidden pause or reduced work, `prefers-reduced-motion`, and a graceful non-WebGL fallback.
- A deterministic demo for visual QA without a live backend or map API key.

## Submission protocol

Specialists submit their findings to the Globe Orchestrator, not directly to the user. The Globe Orchestrator synthesizes results, implements or delegates non-overlapping file work, runs required checks, and gives the user one clear handoff. Resolve tradeoffs in favor of geographic correctness, runtime stability, and simple adoption.
