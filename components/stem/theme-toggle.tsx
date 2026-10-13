"use client";

import { ThemeToggle as ThemeButton } from "@/registry/clover-ui/theme-toggle";
import { useGhost } from "@/registry/clover-ui/ghost";
import { ghostWords } from "@/components/leaves/site-ghost";

export function ThemeToggle() {
  const ghost = useGhost();

  return (
    <ThemeButton
      size="sm"
      className="translate-y-[calc(var(--lift)/2)] text-[calc(32px/2.8)]"
      onThemeChange={(next) => ghost.say(next === "light" ? ghostWords.light : ghostWords.dark)}
    />
  );
}
