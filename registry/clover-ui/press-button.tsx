"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const pressButtonVariants = cva(
  [
    "clover-press-button relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 align-middle font-semibold whitespace-nowrap outline-none select-none touch-manipulation [-webkit-tap-highlight-color:transparent]",
    "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-4",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      size: { sm: "text-sm", default: "text-base", lg: "text-xl" },
      shape: {
        pill: "min-h-[3.5em] min-w-[8em]",
        circle: "size-[3.5em]",
      },
    },
    defaultVariants: { size: "default", shape: "pill" },
  },
);

export type PressButtonSize = NonNullable<VariantProps<typeof pressButtonVariants>["size"]>;
export type PressButtonShape = NonNullable<VariantProps<typeof pressButtonVariants>["shape"]>;
export type PressButtonTheme = "auto" | "light" | "dark";

export interface PressButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof pressButtonVariants> {
  theme?: PressButtonTheme;
  color?: string;
}

const css = `
.clover-press-button{
  --press-lift:.24em;
  --press-neutral:#c9c9ce;
  --press-seed:var(--press-color,var(--press-neutral));
  --press-text:#48484f;
  --press-rim-top:color-mix(in srgb,var(--press-seed),white 96%);
  --press-rim-side:color-mix(in srgb,var(--press-seed),white 60%);
  --press-rim-bottom:color-mix(in srgb,var(--press-seed),white 76%);
  --press-face-top:color-mix(in srgb,var(--press-seed),white 26%);
  --press-face-mid:color-mix(in srgb,var(--press-seed),white 64%);
  --press-face-bottom:color-mix(in srgb,var(--press-seed),white 96%);
  --press-base:color-mix(in srgb,var(--press-seed),black 13%);
  --press-edge:color-mix(in srgb,var(--press-seed),black 26%);
  --press-shine:rgb(255 255 255/.9);
  --press-ink-shadow:rgb(255 255 255/.55);
  color:var(--press-text);
}
:where(.dark) .clover-press-button[data-theme=auto],.clover-press-button[data-theme=dark]{
  --press-neutral:#484950;
  --press-text:#ededf1;
  --press-rim-top:color-mix(in srgb,var(--press-seed),white 24%);
  --press-rim-side:color-mix(in srgb,var(--press-seed),black 26%);
  --press-rim-bottom:color-mix(in srgb,var(--press-seed),black 52%);
  --press-face-top:color-mix(in srgb,var(--press-seed),black 25%);
  --press-face-mid:color-mix(in srgb,var(--press-seed),black 55%);
  --press-face-bottom:color-mix(in srgb,var(--press-seed),black 80%);
  --press-base:color-mix(in srgb,var(--press-seed),black 70%);
  --press-edge:color-mix(in srgb,var(--press-seed),black 85%);
  --press-shine:rgb(255 255 255/.2);
  --press-ink-shadow:rgb(0 0 0/.5);
}
.clover-press-button:enabled:is(:active,[data-key-pressed=true]){--press-lift:.02em}
.clover-press-base{position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:var(--press-base);box-shadow:0 .06em 0 var(--press-edge),0 .32em .55em -.15em rgb(0 0 0/.24)}
.clover-press-top{
  position:relative;display:inline-flex;align-items:center;justify-content:center;width:100%;min-height:inherit;padding:.27em .42em .24em;border-radius:inherit;pointer-events:none;
  transform:translateY(calc(-1 * var(--press-lift)));
  background:linear-gradient(180deg,var(--press-rim-top),var(--press-rim-side) 60%,var(--press-rim-bottom));
  box-shadow:inset 0 .06em .08em var(--press-shine),inset 0 -.04em .08em rgb(0 0 0/.06),0 calc(var(--press-lift) * 1.2) calc(.16em + var(--press-lift) * 1.5) rgb(0 0 0/.16);
  transition:transform 120ms ease-out,box-shadow 120ms ease-out;
}
.clover-press-face{
  position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.5em;width:100%;min-height:2.99em;padding:.6em 1.28em;border-radius:999px;
  background:radial-gradient(ellipse 85% 90% at 50% 110%,var(--press-face-bottom),transparent 80%),linear-gradient(180deg,var(--press-face-top),var(--press-face-mid) 62%,var(--press-face-bottom));
  box-shadow:inset 0 .04em .1em rgb(0 0 0/.035),0 .035em .07em var(--press-shine);
  text-shadow:0 1px 0 var(--press-ink-shadow);
}
.clover-press-button[data-shape=circle] .clover-press-top{height:100%;padding:.3em}
.clover-press-button[data-shape=circle] .clover-press-face{height:100%;min-height:0;padding:0;aspect-ratio:1}
.clover-press-face>svg{width:1.1em;height:1.1em;flex-shrink:0}
.clover-press-button:enabled:is(:active,[data-key-pressed=true]) .clover-press-top,.clover-press-button[data-reduced=true] .clover-press-top{transition:none}
@media(prefers-reduced-motion:reduce){.clover-press-top{transition:none}}
@media(forced-colors:active){.clover-press-button{color:ButtonText;border:1px solid ButtonText}.clover-press-base{display:none}.clover-press-top,.clover-press-face{background:ButtonFace;box-shadow:none;text-shadow:none}}
`;

function PressButton({
  children,
  size = "default",
  shape = "pill",
  theme = "auto",
  color,
  className,
  style,
  disabled,
  type = "button",
  onKeyDown,
  onKeyUp,
  onBlur,
  ...props
}: PressButtonProps) {
  const [keyPressed, setKeyPressed] = React.useState(false);
  const reducedMotion = useReducedMotion();

  React.useEffect(() => {
    if (!keyPressed) return;
    const release = () => setKeyPressed(false);
    window.addEventListener("keyup", release);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("keyup", release);
      window.removeEventListener("blur", release);
    };
  }, [keyPressed]);

  return (
    <>
      <style href="clover-press-button" precedence="clover">
        {css}
      </style>
      <button
        {...props}
        type={type}
        disabled={disabled}
        data-theme={theme}
        data-shape={shape}
        data-reduced={Boolean(reducedMotion)}
        data-key-pressed={keyPressed && !disabled}
        className={cn(pressButtonVariants({ size, shape }), className)}
        style={{ "--press-color": color, ...style } as React.CSSProperties}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented && (event.key === " " || event.key === "Enter")) {
            setKeyPressed(true);
          }
        }}
        onKeyUp={(event) => {
          onKeyUp?.(event);
          if (event.key === " " || event.key === "Enter") setKeyPressed(false);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          setKeyPressed(false);
        }}
      >
        <span aria-hidden className="clover-press-base" />
        <span className="clover-press-top">
          <span className="clover-press-face">{children}</span>
        </span>
      </button>
    </>
  );
}

export { PressButton, pressButtonVariants };
