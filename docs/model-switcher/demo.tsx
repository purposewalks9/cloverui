"use client";

import { ModelSwitcher } from "@/registry/clover-ui/model-switcher";

export function Demo() {
  return (
    <div className="flex h-[30rem] w-full items-center justify-center">
      <ModelSwitcher />
    </div>
  );
}
