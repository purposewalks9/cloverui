"use client";

import * as React from "react";
import { GraduationCap } from "lucide-react";
import { useGhost } from "@/registry/clover-ui/ghost";
import { cn } from "@/lib/utils";

export function GhostToggle({ className }: { className?: string }) {
  const ghost = useGhost();
  const { show } = ghost;
  const on = ghost.state.visible;

  React.useEffect(() => {
    const wake = () => {
      if (document.visibilityState === "visible") show();
    };
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("pageshow", wake);
    return () => {
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("pageshow", wake);
    };
  }, [show]);

  return (
    <button
      type="button"
      aria-label={on ? "Turn the guide off" : "Turn the guide on"}
      aria-pressed={on}
      onClick={() => (on ? ghost.hide() : ghost.show())}
      className={cn(
        "cursor-pointer whitespace-nowrap",
        className,
        on && "text-lime-600 hover:text-lime-600 dark:text-lime-400 dark:hover:text-lime-400",
      )}
    >
      <GraduationCap />
      Guide
    </button>
  );
}
