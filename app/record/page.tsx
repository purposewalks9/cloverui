"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { GridReveal } from "@/registry/clover-ui/grid-reveal";

const variants = [
  {
    pattern: "random" as const,
    color: "#E1E900",
    rows: 6,
    cols: 10,
    gap: 0,
    blockDuration: 0.45,
    stagger: 0.03,
  },
  {
    pattern: "wave" as const,
    color: "#8B5CF6",
    rows: 5,
    cols: 12,
    gap: 2,
    blockDuration: 0.32,
    stagger: 0.035,
  },
  {
    pattern: "diagonal" as const,
    color: "#22D3EE",
    rows: 8,
    cols: 8,
    gap: 1,
    blockDuration: 0.38,
    stagger: 0.045,
  },
  {
    pattern: "center" as const,
    color: "#F43F5E",
    rows: 7,
    cols: 11,
    gap: 2,
    blockDuration: 0.42,
    stagger: 0.035,
  },
  {
    pattern: "random" as const,
    color: "#FB923C",
    rows: 10,
    cols: 14,
    gap: 1,
    blockDuration: 0.25,
    stagger: 0.02,
  },
  {
    pattern: "center" as const,
    color: "#34D399",
    rows: 6,
    cols: 6,
    gap: 3,
    blockDuration: 0.5,
    stagger: 0.055,
  },
  {
    pattern: "diagonal" as const,
    color: "#60A5FA",
    rows: 9,
    cols: 13,
    gap: 1,
    blockDuration: 0.3,
    stagger: 0.025,
  },
  {
    pattern: "wave" as const,
    color: "#F472B6",
    rows: 5,
    cols: 9,
    gap: 3,
    blockDuration: 0.48,
    stagger: 0.04,
  },
];

export default function Home() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % variants.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  const variant = variants[index];

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="relative flex h-[460px] w-full max-w-[820px] items-center justify-center overflow-hidden p-8">
        <div className="relative w-full h-[460px]">
          <GridReveal
            key={index}
            rows={variant.rows}
            cols={variant.cols}
            color={variant.color}
            blockDuration={variant.blockDuration}
            stagger={variant.stagger}
            pattern={variant.pattern}
            gap={variant.gap}
            autoStart
            loop
            loopDelay={0.7}
            className="h-full w-full"
            blockClassName="rounded-none"
          >

          </GridReveal>
        </div>
      </div>
    </main>
  );
}