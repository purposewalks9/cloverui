"use client";

import { Ghost } from "@/registry/clover-ui/ghost";

export function Demo() {
  return (
    <div className="relative flex min-h-[220px] items-center justify-center px-6 py-8">
      <Ghost boundary="parent" />
    </div>
  );
}
