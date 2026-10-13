"use client";

import * as React from "react";
import { GlitchyText } from "@/registry/clover-ui/glitchy-text";
import { cn } from "@/lib/utils";

const HoverContext = React.createContext(false);

export function GlitchGroup({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [hovering, setHovering] = React.useState(false);

  return (
    <span
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
      className={cn("inline-flex", className)}
    >
      <HoverContext.Provider value={hovering}>{children}</HoverContext.Provider>
    </span>
  );
}

export function GlitchName({ children, className }: { children: string; className?: string }) {
  const hovering = React.useContext(HoverContext);

  return (
    <GlitchyText
      trigger={hovering ? "always" : "hover"}
      color="pixel"
      className={cn("whitespace-nowrap", className)}
    >
      {children}
    </GlitchyText>
  );
}
