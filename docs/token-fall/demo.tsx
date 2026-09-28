"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/registry/clover-ui/spinner";

const TokenFall = dynamic(
  () => import("@/registry/clover-ui/token-fall").then((m) => m.TokenFall),
  { ssr: false, loading: () => <div className="flex h-full w-full items-center justify-center"><Spinner size={24} interactive={false} /></div> },
);

export function Demo() {
  return (
    <div className="relative h-[32rem] w-full min-w-0 overflow-hidden rounded-xl">
      <TokenFall count={55} minSize={12} maxSize={25} />
    </div>
  );
}