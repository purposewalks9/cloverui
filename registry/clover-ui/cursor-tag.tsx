"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const cursorTagVariants = cva("relative inline-flex items-start select-none", {
  variants: {
    side: {
      right: "flex-row",
      left: "flex-row-reverse",
    },
    size: {
      sm: "text-xs [--arrow:14px]",
      default: "text-sm [--arrow:18px]",
      lg: "text-base [--arrow:22px]",
    },
  },
  defaultVariants: { side: "right", size: "default" },
});

const labelVariants = cva(
  "mt-[calc(var(--arrow)*0.85)] rounded-[5px] font-medium whitespace-nowrap shadow-sm",
  {
    variants: {
      side: {
        right: "-ml-[calc(var(--arrow)*0.15)]",
        left: "-mr-[calc(var(--arrow)*0.15)]",
      },
      size: {
        sm: "px-1.5 py-0.5",
        default: "px-2 py-0.5",
        lg: "px-2.5 py-1",
      },
    },
    defaultVariants: { side: "right", size: "default" },
  },
);

export type CursorTagSide = NonNullable<VariantProps<typeof cursorTagVariants>["side"]>;
export type CursorTagSize = NonNullable<VariantProps<typeof cursorTagVariants>["size"]>;

export interface CursorTagProps
  extends
    Omit<React.ComponentProps<"span">, "color" | "children">,
    VariantProps<typeof cursorTagVariants> {
  label: string;
  color?: string;
  textColor?: string;
  float?: boolean;
}

function CursorTag({
  label,
  color,
  textColor = "#ffffff",
  side = "right",
  size = "default",
  float = true,
  className,
  ...props
}: CursorTagProps) {
  const reduceMotion = useReducedMotion();
  const drift = float && !reduceMotion;

  return (
    <span className={cn("inline-block", className)} {...props}>
      <motion.span
        className={cursorTagVariants({ side, size })}
        animate={drift ? { x: [0, 3, -2, 0], y: [0, -2, 2, 0] } : undefined}
        transition={drift ? { duration: 6, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={cn(
            "size-(--arrow) shrink-0 drop-shadow-sm",
            side === "left" && "-scale-x-100",
            !color && "fill-foreground stroke-background",
          )}
          style={color ? { fill: color, stroke: textColor } : undefined}
        >
          <path d="M3.5 3 20.5 10.2 13 13 10.2 20.5Z" strokeWidth={1.4} strokeLinejoin="miter" />
        </svg>

        <span
          className={cn(labelVariants({ side, size }), !color && "bg-foreground text-background")}
          style={color ? { backgroundColor: color, color: textColor } : undefined}
        >
          {label}
        </span>
      </motion.span>
    </span>
  );
}

export { CursorTag, cursorTagVariants };
