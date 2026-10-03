# Clover UI agent instructions

## Globe swarm

When the user asks to build, extend, review, or troubleshoot the real-time globe/request-traffic component, use the workflow in `docs/globe-orchestration.md`.

The root agent is the **Globe Orchestrator**. It owns the task decomposition, architecture, implementation plan, integration, verification, and final answer. It may delegate independent work only when that improves the result. Every specialist reports its findings to the Globe Orchestrator; specialists do not independently merge competing implementations or change unrelated files.

For all other work, follow the existing repository conventions in `CLAUDE.md`.
