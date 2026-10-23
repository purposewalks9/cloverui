"use client";

import * as React from "react";
import { SignPad, type SignPadValue } from "@/registry/clover-ui/sign-pad";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { expr, jsx, type ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "color", prop: "accent", label: "Color" },
  {
    type: "number",
    prop: "strokeWidth",
    label: "Stroke",
    min: 1,
    max: 8,
    step: 0.5,
  },
  {
    type: "number",
    prop: "minInk",
    label: "Minimum ink",
    min: 0.08,
    max: 0.8,
    step: 0.02,
  },
];

const defaultProps = {
  accent: "#E1E900",
  strokeWidth: 3,
  minInk: 0.3,
};

export function SignPadPlayground() {
  const [, setSignature] = React.useState<SignPadValue | null>(null);

  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      code={(values) =>
        jsx("SignPad", {
          accent: values.accent,
          strokeWidth: values.strokeWidth,
          minInk: values.minInk,
          onChange: expr("setSignature"),
        })
      }
      render={(values) => (
        <div className="flex min-h-64 w-full flex-col items-center justify-center gap-5 px-6 py-10">
          <SignPad
            accent={values.accent as string}
            strokeWidth={values.strokeWidth as number}
            minInk={values.minInk as number}
            onChange={setSignature}
          />
        </div>
      )}
    />
  );
}
