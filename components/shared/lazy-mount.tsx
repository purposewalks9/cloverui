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
  rootMargin = "600px",
  fallback = null,
}: LazyMountProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || mounted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted, rootMargin]);

  return (
    <div ref={ref} className={cn("min-w-0", className)}>
      {mounted ? children : fallback}
    </div>
  );
}
