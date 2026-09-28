"use client";

import dynamic from "next/dynamic";

const TokenFall = dynamic(
  () => import("@/registry/clover-ui/token-fall").then((m) => m.TokenFall),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-white/5" /> },
);

export function Demo() {
  return (
    <div className="relative h-[32rem] w-full min-w-0 overflow-hidden rounded-xl">
      <TokenFall count={55} minSize={12} maxSize={25} />
    </div>
  );
}