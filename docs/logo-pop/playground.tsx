"use client";

import { LogoPop, logoPopLogos } from "@/registry/clover-ui/logo-pop";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const logos = logoPopLogos.map((logo) => ({
  ...logo,
  src: logo.src.replace("https://cloverui.vercel.app", ""),
}));

const controls: ControlDef[] = [
  { type: "number", prop: "speed", label: "Speed", min: 0.5, max: 2, step: 0.1 },
];

const defaultProps = {
  speed: 1,
};

export function LogoPopPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <div className="flex min-h-[320px] w-full items-center justify-center px-6">
          <LogoPop
            key={String(values.speed)}
            logos={logos}
            speed={values.speed as number}
            className="max-w-2xl"
          />
        </div>
      )}
    />
  );
}
