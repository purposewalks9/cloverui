"use client";

import { TokenFall } from "@/registry/clover-ui/token-fall";

export function Demo() {
  return (
    <div className="relative h-[32rem] w-full min-w-0 overflow-hidden rounded-xl">
      <TokenFall count={55} minSize={12} maxSize={25} />
    </div>
  );
}