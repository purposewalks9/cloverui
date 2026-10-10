"use client";

import * as React from "react";
import { GraduationCap } from "lucide-react";
import { useGhost } from "@/registry/clover-ui/ghost";
import { useGuide } from "@/components/leaves/site-ghost";
import { cn } from "@/lib/utils";

export function GhostToggle({ className }: { className?: string }) {
  const { hide } = useGhost();
  const { shown, turnOn, turnOff } = useGuide();
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
        shown && "text-lime-600 hover:text-lime-600 dark:text-lime-400 dark:hover:text-lime-400",
      )}
    >
      <GraduationCap />
      Guide
    </button>
  );
}
