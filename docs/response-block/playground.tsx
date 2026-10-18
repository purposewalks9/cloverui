"use client";

import { ResponseBlock } from "@/registry/clover-ui/response-block";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";
import { useResponseSimulation, type DemoName } from "./simulation";

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "demo",
    label: "Demo",
    options: [
      { label: "Research", value: "research" },
      { label: "Coding task", value: "coding" },
    ],
  },
  { type: "boolean", prop: "collapseWhenDone", label: "Collapse when done" },
];

const defaultProps = { demo: "research", collapseWhenDone: false };

function Simulation({ demo, values }: { demo: DemoName; values: Record<string, unknown> }) {
  const { status, steps, answer, elapsed, restart } = useResponseSimulation(demo);
  return (
    <ResponseBlock
      status={status}
      steps={steps}
      answer={answer}
      elapsed={elapsed}
      collapseWhenDone={values.collapseWhenDone as boolean}
      onRetry={restart}
      className="max-w-xl"
    />
  );
}

export function ResponseBlockPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      stageClassName="items-start pt-10 sm:pt-14 lg:min-h-[36rem]"
      render={(values) => {
        const demo = values.demo as DemoName;
        return <Simulation key={demo} demo={demo} values={values} />;
      }}
    />
  );
}
