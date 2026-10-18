"use client";

import * as React from "react";
import { SiVercel } from "@icons-pack/react-simple-icons";
import type {
  ResponseSource,
  ResponseStatus,
  ResponseStep,
} from "@/registry/clover-ui/response-block";

export type DemoName = "research" | "coding";

const ASSETS = "/docs-assets/response-block";

const CONVEX_SCHEMAS: ResponseSource = {
  url: "https://docs.convex.dev/database/schemas",
  title: "Convex schemas",
  icon: (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logos/convex.png" alt="" className="size-full rounded-[3px]" />
  ),
};

const GATEWAY_SOURCES: ResponseSource[] = [
  {
    url: "https://vercel.com/docs/ai-gateway",
    title: "Vercel AI Gateway: Models, Routing, and Observability",
    icon: <SiVercel />,
  },
  {
    url: "https://ai-sdk.dev/providers/ai-sdk-providers/ai-gateway",
    title: "AI Gateway (AI SDK)",
    icon: <SiVercel />,
  },
  {
    url: "https://docs.litellm.ai/docs/providers/vercel_ai_gateway",
    title: "Vercel AI Gateway (LiteLLM)",
  },
  {
    url: "https://www.promptfoo.dev/docs/providers/vercel/",
    title: "Vercel AI Gateway (Promptfoo)",
  },
];

const SCHEMA = `import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({ role: v.string(), body: v.string() }),
});`;

type Frame = { status: ResponseStatus; steps: ResponseStep[]; answer: string };
type Beat = { at: number; apply: (frame: Frame) => Frame };

const set = (id: string, patch: Partial<ResponseStep>) => (frame: Frame) => ({
  ...frame,
  steps: frame.steps.map((s) => (s.id === id ? ({ ...s, ...patch } as ResponseStep) : s)),
});
const add = (step: ResponseStep) => (frame: Frame) => ({ ...frame, steps: [...frame.steps, step] });
const note = (id: string, text: string) => add({ id, type: "note", text });
const status = (value: ResponseStatus) => (frame: Frame) => ({ ...frame, status: value });

function answer(parts: string[], start: number, gap = 3, end: ResponseStatus = "done"): Beat[] {
  return [
    { at: start - 3, apply: status("summarizing") },
    ...parts.map((_, i) => ({
      at: start + i * gap,
      apply: (frame: Frame) => ({ ...frame, answer: parts.slice(0, i + 1).join("\n\n") }),
    })),
    { at: start + parts.length * gap, apply: status(end) },
  ];
}

function command(
  id: string,
  at: number,
  run: string,
  done: string,
  output: string,
  failed = false,
) {
  return [
    {
      at,
      apply: add({
        id,
        type: "tool",
        kind: "command",
        title: run,
        meta: "script",
        status: "running",
      }),
    },
    {
      at: at + 4,
      apply: set(id, {
        status: failed ? "failed" : "done",
        title: done,
        output: { code: output, language: "bash" },
      }),
    },
  ];
}

function edit(id: string, at: number) {
  return [
    {
      at,
      apply: add({
        id,
        type: "tool",
        kind: "edit",
        title: "Editing convex/schema.ts",
        meta: "file",
        status: "running",
      }),
    },
    {
      at: at + 4,
      apply: set(id, {
        status: "done",
        title: "Edited convex/schema.ts",
        output: { code: SCHEMA, language: "ts" },
      }),
    },
  ];
}

function task(id: string, at: number) {
  return [
    {
      at,
      apply: add({
        id,
        type: "tool",
        kind: "task",
        title: "Updating task",
        meta: "task",
        status: "running",
      }),
    },
    {
      at: at + 3,
      apply: set(id, {
        status: "done",
        title: "Task update",
        output: { code: '{ "taskId": "12", "status": "completed" }', language: "json" },
      }),
    },
  ];
}

const GATEWAY_ANSWER = [
  `**Vercel AI Gateway** is one endpoint for calling models from many providers, like ![OpenAI](${ASSETS}/openai-mark.svg) OpenAI and ![Claude](${ASSETS}/claude-mark.svg) Claude. You use one key, and [Vercel's docs](https://vercel.com/docs/ai-gateway) say it adds no markup to token prices.`,
  "What it handles for you:\n\n- **Failover** to another provider or model when one is down\n- **Logs** with the model, latency, tokens and cost of every request\n- **Budgets** per team, project or key",
  "With the [AI SDK](https://ai-sdk.dev/providers/ai-sdk-providers/ai-gateway) there's nothing to install. You pass a model name like `openai/gpt-6-astra`, and the gateway handles the rest.",
];

const CODING_ANSWER = [
  "The build passes now. The schema was missing a `messages` table, so I added one following ![Convex](/logos/convex.png) [Convex's schema docs](https://docs.convex.dev/database/schemas).",
  "What I changed:\n\n1. Installed `convex`.\n2. Added a `messages` table with `role` and `body` fields.\n3. Rebuilt and marked the task done.",
  `\`\`\`ts\n${SCHEMA}\n\`\`\``,
];

const DEMOS: Record<DemoName, Beat[]> = {
  research: [
    { at: 0, apply: note("n1", "I'll look up what Vercel AI Gateway is and how to use it.") },
    {
      at: 4,
      apply: add({ id: "s1", type: "search", query: "Vercel AI Gateway", status: "running" }),
    },
    { at: 10, apply: set("s1", { status: "done", results: GATEWAY_SOURCES }) },
    { at: 11, apply: note("n2", "Vercel's own docs look most reliable, so I'll read them first.") },
    {
      at: 13,
      apply: add({ id: "r1", type: "read", source: GATEWAY_SOURCES[0], status: "running" }),
    },
    { at: 19, apply: set("r1", { status: "done" }) },
    {
      at: 20,
      apply: add({ id: "r2", type: "read", source: GATEWAY_SOURCES[1], status: "running" }),
    },
    { at: 25, apply: set("r2", { status: "done" }) },
    ...answer(GATEWAY_ANSWER, 30),
  ],
  coding: [
    { at: 0, apply: note("n1", "I'll install Convex and check that the project builds.") },
    ...command(
      "c1",
      3,
      "Running pnpm add convex",
      "Ran pnpm add convex",
      "pnpm add convex\n\nPackages: +1\nDone in 2.4s",
    ),
    ...command(
      "c2",
      8,
      "Running pnpm build",
      "Build failed",
      'Type error: Table "messages" is not defined in convex/schema.ts',
      true,
    ),
    {
      at: 13,
      apply: note("n2", "The messages table is missing, so I'll check how Convex defines schemas."),
    },
    { at: 15, apply: add({ id: "r1", type: "read", source: CONVEX_SCHEMAS, status: "running" }) },
    { at: 20, apply: set("r1", { status: "done" }) },
    ...edit("e1", 21),
    ...command(
      "c3",
      26,
      "Running pnpm build",
      "Build passed",
      "pnpm build\n\n✓ Compiled successfully",
    ),
    ...task("t1", 31),
    ...answer(CODING_ANSWER, 38),
  ],
};

const SPEED = 3;
const TICK = 100;
const START: Frame = { status: "searching", steps: [], answer: "" };

const IMAGES = [`${ASSETS}/openai-mark.svg`, `${ASSETS}/claude-mark.svg`, "/logos/convex.png"];

export function useResponseSimulation(name: DemoName) {
  React.useEffect(() => {
    for (const src of IMAGES) new Image().src = src;
  }, []);
  const beats = DEMOS[name] ?? DEMOS.research;
  const end = Math.max(...beats.map((beat) => beat.at));
  const [seconds, setSeconds] = React.useState(0);
  const done = seconds >= end;

  React.useEffect(() => {
    if (done) return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const step = ((now - last) / 1000) * SPEED;
      last = now;
      setSeconds((s) => Math.min(end, s + step));
    }, TICK);
    return () => window.clearInterval(timer);
  }, [done, end]);

  const frame = React.useMemo(
    () =>
      [...beats]
        .sort((a, b) => a.at - b.at)
        .filter((beat) => beat.at <= seconds)
        .reduce((f, beat) => beat.apply(f), START),
    [beats, seconds],
  );

  const restart = React.useCallback(() => setSeconds(0), []);

  return { ...frame, elapsed: seconds * 1000, restart };
}
