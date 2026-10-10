"use client";

import { Gem } from "@/registry/clover-ui/gem";

export function Demo() {
  return (
    <div className="flex items-center justify-center gap-10 py-10">
      <Gem color="#2f6bff" size={120} />
      <Gem color="#e6e8ec" size={170} />
      <Gem color="#14d977" material="solid" size={120} />
    </div>
  );
}
