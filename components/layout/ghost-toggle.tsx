"use client";

import * as React from "react";
import { GraduationCap } from "@phosphor-icons/react";
import { useGhost } from "@/registry/clover-ui/ghost";
import { useSiteGhostGuide } from "@/components/layout/site-ghost";
import { cn } from "@/lib/utils";

export function GhostToggle({ className }: { className?: string }) {
  const { hide } = useGhost();
  const { shown, turnOn, turnOff } = useSiteGhostGuide();
  const leaving = React.useRef(0);

  React.useEffect(() => () => window.clearTimeout(leaving.current), []);

  return (
    <button
      type="button"
      aria-label={shown ? "Turn the guide off" : "Turn the guide on"}
      aria-pressed={shown}
      onClick={() => {
        window.clearTimeout(leaving.current);
        if (!shown) {
          turnOn();
          return;
        }
        hide();
        leaving.current = window.setTimeout(turnOff, 360);
      }}
      className={cn(
        "cursor-pointer whitespace-nowrap",
        className,
        shown &&
          "text-[#a855f7] hover:text-[#a855f7] dark:text-[#c084fc] dark:hover:text-[#c084fc]",
      )}
    >
      <GraduationCap weight="fill" />
      <span className={cn(shown && "sponsor-gradient")}>Guide</span>
    </button>
  );
}
