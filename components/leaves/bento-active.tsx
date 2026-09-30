"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const ActiveContext = React.createContext<number[]>([]);

function pickRandom(pool: number[]) {
  return pool[Math.floor(Math.random() * pool.length)];
}

// Keeps `count` of `total` cards highlighted and swaps `step` of them every
// `interval` ms, so the highlight wanders around the grid instead of jumping.
export function BentoActiveProvider({
  total,
  count = 5,
  step = 2,
  interval = 1600,
  children,
}: {
  total: number;
  count?: number;
  step?: number;
  interval?: number;
  children: React.ReactNode;
}) {
  // A fixed first set keeps the server and client render identical.
  const [active, setActive] = React.useState(() =>
    Array.from({ length: Math.min(count, total) }, (_, i) => (i * 5) % total),
  );

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      setActive((current) => {
        const next = [...current];
        for (let i = 0; i < step; i++) {
          const idle = Array.from({ length: total }, (_, n) => n).filter((n) => !next.includes(n));
          if (idle.length === 0) break;
          next.splice(Math.floor(Math.random() * next.length), 1);
          next.push(pickRandom(idle));
        }
        return next;
      });
    }, interval);
    return () => clearInterval(id);
  }, [total, step, interval]);

  return <ActiveContext.Provider value={active}>{children}</ActiveContext.Provider>;
}

export function BentoActiveCard({
  index,
  className,
  children,
}: {
  index: number;
  className?: string;
  children: React.ReactNode;
}) {
  const active = React.useContext(ActiveContext).includes(index);

  return (
    <div
      data-active={active || undefined}
      className={cn(
        "relative isolate flex flex-col overflow-hidden rounded-3xl transition-colors duration-700",
        active ? "bg-foreground/[0.04]" : "bg-transparent",
        className,
      )}
    >
      {children}
    </div>
  );
}
