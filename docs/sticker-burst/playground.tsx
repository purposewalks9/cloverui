"use client";

import { StickerBurst, type StickerBurstTrigger } from "@/registry/clover-ui/sticker-burst";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "color-list",
    prop: "colors",
    label: "Colors",
    items: [
      { prop: "color1", label: "Color 1" },
      { prop: "color2", label: "Color 2" },
      { prop: "color3", label: "Color 3" },
      { prop: "color4", label: "Color 4" },
    ],
  },
  { type: "color", prop: "textColor", label: "Text color" },
  {
    type: "select",
    prop: "trigger",
    label: "Trigger",
    options: [
      { label: "Loop", value: "loop" },
      { label: "Hover", value: "hover" },
    ],
  },
  { type: "text", prop: "title", label: "Title" },
  { type: "number", prop: "count", label: "Stickers", min: 8, max: 80, step: 1 },
  { type: "number", prop: "speed", label: "Speed", min: 0.5, max: 2, step: 0.1 },
];

const defaultProps = {
  color1: "#f2f20a",
  color2: "#c2f23c",
  color3: "#5cf08e",
  color4: "#20eee4",
  textColor: "#1d4b38",
  trigger: "loop",
  title: "Ideas in motion",
  count: 42,
  speed: 1,
};

export function StickerBurstPlayground() {
  return (
    <PlaygroundShell
      componentName="StickerBurst"
      controls={controls}
      defaultProps={defaultProps}
      codeNote="pass stickers={[...]} for your own labels"
      render={(values) => (
        <StickerBurst
          title={values.title as string}
          colors={[values.color1, values.color2, values.color3, values.color4].filter(
            (color): color is string => typeof color === "string" && color.length > 0,
          )}
          textColor={values.textColor as string}
          trigger={values.trigger as StickerBurstTrigger}
          count={values.count as number}
          speed={values.speed as number}
          className="h-[340px]"
        />
      )}
    />
  );
}
