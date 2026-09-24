"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LazyMountProps {
  children: React.ReactNode;
  className?: string;
  rootMargin?: string;
  fallback?: React.ReactNode;
}

export function LazyMount({
  children,
  className,
  rootMargin = "240px",
  fallback,
}: LazyMountProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  const [height, setHeight] = React.useState<number | undefined>();

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        } else {
          setHeight(el.offsetHeight || undefined);
          setVisible(false);
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={cn("min-w-0", className)}
      style={!visible && height ? { minHeight: height } : undefined}
    >
      {visible
        ? children
        : (fallback ?? (
            <div
              aria-hidden
              className="h-24 w-40 animate-pulse rounded-lg bg-white/5"
            />
          ))}
    </div>
  );
}
