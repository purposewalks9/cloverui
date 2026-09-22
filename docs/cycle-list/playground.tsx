"use client";

import { CycleList } from "@/registry/clover-ui/cycle-list";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import type { ControlDef } from "@/lib/playground";

const items = ["Overconfidence", "Lack of reliability", "Missed deadlines"];

const controls: ControlDef[] = [
  { type: "color", prop: "color", label: "Text color" },
  { type: "color", prop: "activeColor", label: "Active color" },
  { type: "color", prop: "mutedColor", label: "Muted color" },
  { type: "number", prop: "interval", label: "Interval", min: 300, max: 4000, step: 100 },
  { type: "number", prop: "itemRotation", label: "Rotation", min: -20, max: 20, step: 1 },
  { type: "number", prop: "curvature", label: "Curvature", min: 0, max: 80, step: 2 },
];

const defaultProps = {
  color: "#ffffff",
  activeColor: "#22c55e",
  mutedColor: "#71717a",
  interval: 1800,
  itemRotation: 4,
  curvature: 26,
};

export function CycleListPlayground() {
  return (
    <PlaygroundShell
      componentName="CycleList"
      controls={controls}
      defaultProps={defaultProps}
      codeNote="items omitted here — see Usage below"
      render={(values) => (
      <div className="flex w-full justify-center">
        <CycleList
          items={items}
          color={values.color as string}
          activeColor={values.activeColor as string}
          mutedColor={values.mutedColor as string}
          interval={values.interval as number}
          itemRotation={values.itemRotation as number}
          curvature={values.curvature as number}
        />
        </div>
      )}
    />
  );
}
