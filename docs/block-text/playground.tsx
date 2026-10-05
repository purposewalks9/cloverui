"use client";

import { BLOCK_TEXT_THEMES, BlockText, type BlockTextTheme } from "@/registry/clover-ui/block-text";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

function bands([a, b, c]: readonly string[]) {
  return `linear-gradient(135deg, ${a} 0 40%, ${b} 40% 70%, ${c} 70%)`;
}

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "theme",
    label: "Theme",
    options: (Object.keys(BLOCK_TEXT_THEMES) as BlockTextTheme[]).map((theme) => ({
      label: theme[0].toUpperCase() + theme.slice(1),
      value: theme,
      swatch: bands(BLOCK_TEXT_THEMES[theme].colors),
    })),
  },
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
  { type: "boolean", prop: "shimmer", label: "Shimmer" },
  { type: "boolean", prop: "paused", label: "Paused" },
];

const defaultProps = {
  theme: "halloween",
  word1: "Trick",
  word2: "Treat",
  word3: "Boo!",
  interval: 1.4,
  duration: 1.2,
  shimmer: true,
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
            theme={values.theme as BlockTextTheme}
            words={filled(values, ["word1", "word2", "word3"])}
            interval={values.interval as number}
            duration={values.duration as number}
            shimmer={values.shimmer as boolean}
            paused={values.paused as boolean}
            className="text-5xl sm:text-6xl"
          />
        </div>
      )}
    />
  );
}
