"use client";

import * as React from "react";
import { useGhost, type GhostColor, type GhostSize } from "@/registry/clover-ui/ghost";
import { useSiteGhostLook } from "@/components/leaves/site-ghost";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const colors: { value: GhostColor; swatch: string }[] = [
  { value: "lime", swatch: "#84cc16" },
  { value: "white", swatch: "#e4e4e7" },
  { value: "pink", swatch: "#ec4899" },
  { value: "peach", swatch: "#f97316" },
  { value: "lemon", swatch: "#facc15" },
  { value: "mint", swatch: "#10b981" },
  { value: "sky", swatch: "#0ea5e9" },
  { value: "lilac", swatch: "#8b5cf6" },
];

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "color",
    label: "Color",
    options: colors.map(({ value, swatch }) => ({ label: value, value, swatch })),
  },
  {
    type: "select",
    prop: "size",
    label: "Size",
    options: [
      { label: "Small", value: "sm" },
      { label: "Medium", value: "md" },
      { label: "Large", value: "lg" },
    ],
  },
];

const defaultProps = {
  color: "lime",
  size: "lg",
};

function SiteGhostStage({ color, size }: { color: GhostColor; size: GhostSize }) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const setLook = useSiteGhostLook();
  const { visit } = useGhost();

  React.useEffect(() => {
    setLook({ color, size });
    const t = window.setTimeout(() => visit(stageRef.current), 450);
    return () => window.clearTimeout(t);
  }, [color, size, setLook, visit]);

  React.useEffect(() => () => setLook(null), [setLook]);

  return <div ref={stageRef} className="min-h-[280px] w-full" />;
}

export function GhostPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <SiteGhostStage color={values.color as GhostColor} size={values.size as GhostSize} />
      )}
    />
  );
}
