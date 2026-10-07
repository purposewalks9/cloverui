"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useGhost } from "@/registry/clover-ui/ghost";
import { ghostWords } from "@/components/leaves/site-ghost";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const ghost = useGhost();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className="inline-flex size-8" aria-hidden="true" />;
  }

  const dark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => {
        setTheme(dark ? "light" : "dark");
        ghost.say(dark ? ghostWords.light : ghostWords.dark);
      }}
      className="text-muted-foreground hover:bg-sidebar-accent hover:text-foreground focus-visible:ring-ring inline-flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none"
    >
      {dark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
    </button>
  );
}
