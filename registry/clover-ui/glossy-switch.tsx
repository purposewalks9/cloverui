"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const glossySwitchVariants = cva(
  [
    "group relative inline-flex h-[4.2em] w-[8.2em] shrink-0 cursor-pointer rounded-full p-[0.3em] outline-none select-none",
    "bg-[linear-gradient(145deg,#353737_0%,#111212_18%,#080909_40%,#434545_72%,#1b1c1c_88%,#0b0c0c_100%)]",
    "shadow-[0_0.12em_0.18em_rgb(0_0_0/0.55),0_0.28em_0.5em_rgb(0_0_0/0.4),0_0.05em_0.8em_rgb(0_0_0/0.3),inset_0_0.025em_0.025em_rgb(255_255_255/0.12),inset_0_-0.03em_0.04em_rgb(0_0_0/0.8)]",
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

const BEVEL_MASK = {
  maskImage: "linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
  maskClip: "content-box, border-box",
  maskComposite: "exclude",
} satisfies React.CSSProperties;

function GlossySwitch({
  checked,
  defaultChecked = true,
  onCheckedChange,
  onLabel = "ON",
  offLabel = "OFF",
  color = "#42aa78",
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
        aria-hidden
        className="pointer-events-none absolute inset-[0.025em] rounded-full p-[0.025em]"
        style={{
          ...BEVEL_MASK,
          background:
            "linear-gradient(165deg, rgb(255 255 255 / 0.42) 4%, rgb(255 255 255 / 0.08) 28%, transparent 42%, rgb(255 255 255 / 0.05) 72%, transparent 88%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[0.035em] rounded-full p-[0.18em]"
        style={{
          ...BEVEL_MASK,
          background: "linear-gradient(180deg, rgb(255 255 255 / 0.15), transparent 0.3em)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[0.19em] rounded-full bg-[#050606]"
        style={{
          boxShadow: "0 0.025em 0.035em rgb(255 255 255 / 0.09), inset 0 0.05em 0.08em #000",
        }}
      />
      <span
        className={cn(
          "relative flex size-full items-center overflow-hidden rounded-full p-[0.06em] transition-[background-color] duration-100 ease-out motion-reduce:transition-none",
          on ? "bg-[var(--ds-color)]" : "bg-[#1c1c1c]",
        )}
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 27% 72%, rgb(255 255 255 / 0.035), transparent 65%), linear-gradient(180deg, rgb(0 0 0 / 0.13), transparent 36%, transparent 70%, rgb(0 0 0 / 0.06))",
          boxShadow:
            "0 0 0 0.035em #020303, inset 0 0.1em 0.18em rgb(0 0 0 / 0.58), inset 0.055em 0 0.1em rgb(0 0 0 / 0.18), inset 0 -0.025em 0.07em rgb(0 0 0 / 0.2)",
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
          <span className="text-[1.35em]">{onLabel}</span>
        </span>
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 flex items-center justify-center font-bold tracking-[0.01em] whitespace-nowrap text-white/60 transition-opacity duration-100 ease-out motion-reduce:transition-none",
            on ? "opacity-0" : "opacity-100",
          )}
          style={{ left: KNOB, right: 0 }}
        >
          <span className="text-[1.35em]">{offLabel}</span>
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
              "conic-gradient(from 215deg, #060707 0deg, #121414 38deg, #4c4f4f 91deg, #7e8181 135deg, #333535 166deg, #4b4e4e 210deg, #121313 252deg, #090a0a 300deg, #060707 360deg)",
            boxShadow:
              "0 0 0 0.065em #080909, 0 0.1em 0.12em rgb(0 0 0 / 0.75), -0.16em 0.04em 0.25em rgb(0 0 0 / 0.38), -0.3em 0.05em 0.55em rgb(0 0 0 / 0.28), inset 0 0.025em 0.025em rgb(255 255 255 / 0.18)",
          }}
        >
          <span
            className="absolute top-[0.12em] right-[0.19em] bottom-[0.075em] left-[0.055em] overflow-hidden rounded-full"
            style={{
              background:
                "radial-gradient(ellipse at 36% 28%, #222424 0%, #1d1e1e 62%, #202222 100%)",
              boxShadow:
                "inset 0 0.065em 0.09em rgb(0 0 0 / 0.85), inset -0.035em -0.025em 0.06em rgb(255 255 255 / 0.07), 0 0.025em 0.035em rgb(0 0 0 / 0.8)",
            }}
          >
            <span
              className="absolute inset-0 rounded-full p-[0.08em]"
              style={{
                ...BEVEL_MASK,
                background:
                  "conic-gradient(from 205deg, transparent 0deg, transparent 100deg, rgb(255 255 255 / 0.08) 140deg, rgb(255 255 255 / 0.22) 185deg, rgb(255 255 255 / 0.26) 215deg, transparent 260deg, transparent 360deg)",
              }}
            />
          </span>
        </span>
      </span>
    </button>
  );
}

export { GlossySwitch, glossySwitchVariants };
