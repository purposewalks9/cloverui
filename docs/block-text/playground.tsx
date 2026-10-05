"use client";

import { BlockText } from "@/registry/clover-ui/block-text";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "color-list",
    prop: "colors",
    label: "Colors",
    items: [
      { prop: "color1", label: "Block 1" },
      { prop: "color2", label: "Block 2" },
      { prop: "color3", label: "Block 3" },
    ],
  },
  { type: "color", prop: "textColor", label: "Text color" },
  {
    type: "text-list",
    prop: "words",
    label: "Words",
    items: [
      { prop: "word1", label: "Word 1" },
      { prop: "word2", label: "Word 2" },
      { prop: "word3", label: "Word 3" },
    ],
  },
  { type: "number", prop: "interval", label: "Pause (s)", min: 0.4, max: 4, step: 0.1 },
  { type: "number", prop: "duration", label: "Roll (s)", min: 0.2, max: 1.5, step: 0.05 },
  { type: "boolean", prop: "paused", label: "Paused" },
];

const defaultProps = {
  color1: "#16a34a",
  color2: "#ff5a1f",
  color3: "#0029ff",
  textColor: "#f5f5f5",
  word1: "Welcome",
  word2: "Hello",
  word3: "Thanks",
  interval: 1.4,
  duration: 0.65,
  paused: false,
};

function filled(values: Record<string, unknown>, props: string[]) {
  return props
    .map((prop) => values[prop])
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

export function BlockTextPlayground() {
  return (
    <PlaygroundShell
      componentName="BlockText"
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <div className="flex min-h-[260px] w-full items-center justify-center">
          <BlockText
            words={filled(values, ["word1", "word2", "word3"])}
            colors={filled(values, ["color1", "color2", "color3"])}
            textColor={values.textColor as string}
            interval={values.interval as number}
            duration={values.duration as number}
            paused={values.paused as boolean}
            className="text-5xl sm:text-6xl"
          />
        </div>
      )}
    />
  );
}
