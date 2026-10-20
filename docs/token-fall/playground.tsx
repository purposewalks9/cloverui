"use client";

import dynamic from "next/dynamic";

const TokenFall = dynamic(
  () => import("@/registry/clover-ui/token-fall").then((m) => m.TokenFall),
  {
    ssr: false,
  },
);
import { PlaygroundShell } from "@/components/garden/playground-shell";
import { jsx, type ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "number", prop: "count", label: "Count", min: 5, max: 150, step: 1 },
  { type: "number", prop: "minSize", label: "Min size", min: 4, max: 30, step: 1 },
  { type: "number", prop: "maxSize", label: "Max size", min: 10, max: 40, step: 1 },
  { type: "number", prop: "gravity", label: "Gravity", min: 0.05, max: 1, step: 0.05 },
  { type: "number", prop: "restitution", label: "Bounciness", min: 0, max: 1, step: 0.05 },
  { type: "number", prop: "spawnInterval", label: "Spawn interval", min: 20, max: 400, step: 10 },
];

const defaultProps = {
  count: 34,
  minSize: 12,
  maxSize: 25,
  gravity: 0.35,
  restitution: 0.75,
  spawnInterval: 180,
};

export function TokenFallPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      stageClassName="w-full"
      code={(values) =>
        jsx("TokenFall", {
          count: values.count,
          minSize: values.minSize,
          maxSize: values.maxSize,
          gravity: values.gravity,
          restitution: values.restitution,
          spawnInterval: values.spawnInterval,
        })
      }
      render={(values) => (
        <div className="flex w-full justify-center">
          <div
            key={JSON.stringify(values)}
            className="relative h-72 w-full max-w-md overflow-hidden rounded-2xl"
          >
            <TokenFall
              count={values.count as number}
              minSize={values.minSize as number}
              maxSize={values.maxSize as number}
              gravity={values.gravity as number}
              restitution={values.restitution as number}
              spawnInterval={values.spawnInterval as number}
            />
          </div>
        </div>
      )}
    />
  );
}
