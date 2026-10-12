"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const glossySwitchVariants = cva(
  [
    "group relative inline-flex h-[4.2em] w-[8.2em] shrink-0 cursor-pointer rounded-full p-[0.3em] outline-none select-none",
    "bg-[linear-gradient(180deg,#1e1e1e_0%,#0c0c0c_50%,#050505_100%)]",
    "shadow-[0_0.3em_0.8em_rgb(0_0_0/0.3),inset_0_0.05em_0.04em_rgb(255_255_255/0.14),inset_0_-0.04em_0.05em_rgb(255_255_255/0.05)]",
    "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        sm: "text-[10px]",
        default: "text-[13px]",
        lg: "text-[17px]",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export type GlossySwitchSize = NonNullable<VariantProps<typeof glossySwitchVariants>["size"]>;

export interface GlossySwitchProps
  extends
    Omit<React.ComponentProps<"button">, "onClick" | "children" | "onChange" | "color">,
    VariantProps<typeof glossySwitchVariants> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onLabel?: string;
  offLabel?: string;
  color?: string;
}

const KNOB = "3.48em";

function GlossySwitch({
  checked,
  defaultChecked = true,
  onCheckedChange,
  onLabel = "ON",
  offLabel = "OFF",
  color = "#5aa676",
  size = "default",
  className,
  style,
  disabled,
  ...props
}: GlossySwitchProps) {
  const [inner, setInner] = React.useState(defaultChecked);
  const on = checked ?? inner;

  const toggle = () => {
    if (checked === undefined) setInner(!on);
    onCheckedChange?.(!on);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={props["aria-label"] ?? (on ? onLabel : offLabel)}
      disabled={disabled}
      className={cn(glossySwitchVariants({ size }), className)}
      style={{ "--ds-color": color, ...style } as React.CSSProperties}
      onClick={toggle}
      {...props}
    >
      <span
        className={cn(
          "relative flex size-full items-center overflow-hidden rounded-full p-[0.06em] transition-[background-color] duration-100 ease-out motion-reduce:transition-none",
          on ? "bg-[var(--ds-color)]" : "bg-[#1c1c1c]",
        )}
        style={{
          boxShadow: "0 0 0 0.05em #000, inset 0 0.1em 0.22em rgb(0 0 0 / 0.22)",
        }}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 flex items-center justify-center font-bold tracking-[0.01em] whitespace-nowrap text-white transition-opacity duration-100 ease-out motion-reduce:transition-none",
            on ? "opacity-100" : "opacity-0",
          )}
          style={{ left: 0, right: KNOB }}
        >
          <span className="text-[1.5em]">{onLabel}</span>
        </span>
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 flex items-center justify-center font-bold tracking-[0.01em] whitespace-nowrap text-white/40 transition-opacity duration-100 ease-out motion-reduce:transition-none",
            on ? "opacity-0" : "opacity-100",
          )}
          style={{ left: KNOB, right: 0 }}
        >
          <span className="text-[1.5em]">{offLabel}</span>
        </span>
        <span
          aria-hidden
          className={cn(
            "relative z-10 shrink-0 rounded-full transition-transform duration-100 ease-out motion-reduce:transition-none",
            on && "translate-x-[4em]",
          )}
          style={{
            width: KNOB,
            height: KNOB,
            background:
              "radial-gradient(circle at 50% 50%, #141414 0%, #121212 70%, #1d1d1d 84%, #262626 91%, #0b0b0b 100%)",
            boxShadow:
              "inset 0 0.05em 0.06em rgb(255 255 255 / 0.16), inset 0 -0.03em 0.05em rgb(255 255 255 / 0.05), -0.1em 0 0.35em rgb(0 0 0 / 0.3), 0 0.12em 0.28em rgb(0 0 0 / 0.38)",
          }}
        />
      </span>
    </button>
  );
}

export { GlossySwitch, glossySwitchVariants };
