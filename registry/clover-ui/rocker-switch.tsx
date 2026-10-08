"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const rockerSwitchVariants = cva(
  [
    "relative inline-flex h-[3.6em] w-[10em] shrink-0 cursor-pointer rounded-[0.45em] p-[0.32em] outline-none select-none",
    "bg-[linear-gradient(180deg,#151515,#050505)]",
    "shadow-[0_0.3em_0.8em_rgb(0_0_0/0.55),0_0.06em_0.12em_rgb(0_0_0/0.6),inset_0_0.05em_0_rgb(255_255_255/0.1)]",
    "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        sm: "text-[11px]",
        default: "text-[14px]",
        lg: "text-[18px]",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export type RockerSwitchSize = NonNullable<VariantProps<typeof rockerSwitchVariants>["size"]>;

export interface RockerSwitchProps
  extends
    Omit<React.ComponentProps<"button">, "onClick" | "children" | "onChange">,
    VariantProps<typeof rockerSwitchVariants> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onLabel?: string;
  offLabel?: string;
  glowColor?: string;
}

const FACE = "linear-gradient(180deg, #3a3a3a 0%, #232323 40%, #171717 100%)";
const PRESSED = "linear-gradient(180deg, #080808 0%, #101010 60%, #151515 100%)";

function RockerSwitch({
  checked,
  defaultChecked = true,
  onCheckedChange,
  onLabel = "ON",
  offLabel = "OFF",
  glowColor = "#7dff3c",
  size = "default",
  className,
  disabled,
  ...props
}: RockerSwitchProps) {
  const reduceMotion = useReducedMotion();
  const [inner, setInner] = React.useState(defaultChecked);
  const on = checked ?? inner;

  const set = (next: boolean) => {
    if (next === on) return;
    if (checked === undefined) setInner(next);
    onCheckedChange?.(next);
  };

  const tilt = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 600, damping: 26, mass: 0.7 };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      className={cn(rockerSwitchVariants({ size }), className)}
      onClick={(event) => {
        if (event.detail === 0) {
          set(!on);
          return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        set(event.clientX < rect.left + rect.width / 2);
      }}
      {...props}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -bottom-[0.9em] left-[8%] h-[1.6em] w-[38%] rounded-full blur-[0.8em]"
        style={{ backgroundColor: glowColor }}
        initial={false}
        animate={{ opacity: on ? 0.35 : 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.3 }}
      />

      <span className="relative block size-full rounded-[0.25em] bg-black perspective-[22em]">
        <motion.span
          className="relative flex size-full transform-3d"
          initial={false}
          animate={{ rotateY: on ? -17 : 17 }}
          transition={tilt}
        >
          <span
            className="flex flex-1 items-center justify-center rounded-l-[0.2em] text-[1.35em] font-bold tracking-wide transition-[background,color,text-shadow,box-shadow] duration-300"
            style={{
              background: on ? PRESSED : FACE,
              color: on ? glowColor : "#3b3b3b",
              textShadow: on
                ? `0 0 0.25em ${glowColor}, 0 0 0.7em ${glowColor}`
                : "0 -0.04em 0 rgb(0 0 0 / 0.9), 0 0.04em 0 rgb(255 255 255 / 0.08)",
              boxShadow: on
                ? "inset 0 0.12em 0.3em rgb(0 0 0 / 0.7), inset -0.6em 0 0.6em -0.1em rgb(0 0 0 / 0.75)"
                : "inset 0 0.07em 0 rgb(255 255 255 / 0.2), inset 0.06em 0 0 rgb(255 255 255 / 0.08)",
            }}
          >
            {onLabel}
          </span>

          <span className="w-px bg-black" />

          <span
            className="flex flex-1 items-center justify-center rounded-r-[0.2em] text-[1.35em] font-bold tracking-wide transition-[background,color,text-shadow,box-shadow] duration-300"
            style={{
              background: on ? FACE : PRESSED,
              color: on ? "#3b3b3b" : "#8a8a8a",
              textShadow: "0 -0.04em 0 rgb(0 0 0 / 0.9), 0 0.04em 0 rgb(255 255 255 / 0.08)",
              boxShadow: on
                ? "inset 0 0.07em 0 rgb(255 255 255 / 0.2), inset -0.06em 0 0 rgb(255 255 255 / 0.08)"
                : "inset 0 0.12em 0.3em rgb(0 0 0 / 0.7), inset 0.6em 0 0.6em -0.1em rgb(0 0 0 / 0.75)",
            }}
          >
            {offLabel}
          </span>

          <span
            className="absolute inset-y-0 right-0 w-[0.9em] origin-right bg-[linear-gradient(90deg,#4a4a4a,#262626)]"
            style={{ transform: "rotateY(-90deg)" }}
          />
          <span
            className="absolute inset-y-0 left-0 w-[0.9em] origin-left bg-[linear-gradient(270deg,#4a4a4a,#262626)]"
            style={{ transform: "rotateY(90deg)" }}
          />
        </motion.span>
      </span>

      <span className="pointer-events-none absolute inset-[0.32em] rounded-[0.25em] shadow-[inset_0_0_0_0.06em_rgb(0_0_0/0.9),inset_0_0.1em_0.25em_rgb(0_0_0/0.6)]" />
    </button>
  );
}

export { RockerSwitch, rockerSwitchVariants };
