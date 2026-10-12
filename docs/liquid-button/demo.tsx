"use client";

import { LiquidButton } from "@/registry/clover-ui/liquid-button";

export function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 px-4">
      <LiquidButton element="lava">Lava</LiquidButton>
      <LiquidButton element="ocean">Ocean</LiquidButton>
      <LiquidButton element="stone">Stone</LiquidButton>
      <LiquidButton element="sky">Sky</LiquidButton>
    </div>
  );
}
