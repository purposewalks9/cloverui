"use client";

import { ElementButton } from "@/registry/clover-ui/element-button";

export function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 px-4">
      <ElementButton element="lava">Lava</ElementButton>
      <ElementButton element="ocean">Ocean</ElementButton>
      <ElementButton element="stone">Stone</ElementButton>
      <ElementButton element="sky">Sky</ElementButton>
    </div>
  );
}
