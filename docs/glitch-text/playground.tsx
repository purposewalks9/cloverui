"use client";

import { GlitchText, type GlitchTextTrigger } from "@/registry/clover-ui/glitch-text";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "trigger",
    label: "Trigger",
    options: [
      { label: "Auto", value: "auto" },
      { label: "Hover", value: "hover" },
      { label: "Always", value: "always" },
    ],
  },
];

const defaultProps = {
  trigger: "auto",
};

const fixedProps = { children: "SIGNAL LOST" };

export function GlitchTextPlayground() {
  return (
    <PlaygroundShell
      componentName="GlitchText"
      controls={controls}
      defaultProps={defaultProps}
      fixedProps={fixedProps}
      render={(values) => (
        <div className="flex w-full justify-center px-4">
          <GlitchText
            trigger={values.trigger as GlitchTextTrigger}
            interval={2400}
            className="text-center text-4xl font-bold tracking-tight sm:text-5xl"
          >
            SIGNAL LOST
          </GlitchText>
        </div>
      )}
    />
  );
}
