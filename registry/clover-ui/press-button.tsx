"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const pressButtonVariants = cva(
  [
    "clover-press-button relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center min-h-[3.5em] min-w-[8em] rounded-full border-0 bg-transparent p-0 align-middle font-semibold whitespace-nowrap outline-none select-none touch-manipulation [-webkit-tap-highlight-color:transparent]",
    "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-4",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      size: { sm: "text-sm", default: "text-base", lg: "text-xl" },
    },
    defaultVariants: { size: "default" },
  },
);

export type PressButtonSize = NonNullable<VariantProps<typeof pressButtonVariants>["size"]>;
export interface PressButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof pressButtonVariants> {
  color?: string;
}

const css = `
.clover-press-button{
  --press-drop-y:1.1em;
  --press-drop-blur:1.6em;
  --press-sink:0em;
  --press-seed:var(--press-color,#ffffff);
  --press-rim-top:#ffffff;
  --press-rim-bottom:#ececec;
  --press-rim-edge:rgb(0 0 0/.07);
  --press-face-top:#d8d8d8;
  --press-face-bottom:#f9f9f9;
  --press-face-inset:rgb(0 0 0/.13);
  --press-shine:rgb(255 255 255/.95);
  --press-text:#8c8c8c;
  --press-ink-shadow:rgb(255 255 255/.75);
  --press-drop:rgb(0 0 0/.26);
  color:var(--press-text);
}
:where(.dark) .clover-press-button{
  --press-rim-top:#46474d;
  --press-rim-bottom:#2b2c31;
  --press-rim-edge:rgb(0 0 0/.35);
  --press-face-top:#1c1d21;
  --press-face-bottom:#33343a;
  --press-face-inset:rgb(0 0 0/.45);
  --press-shine:rgb(255 255 255/.12);
  --press-text:#a8a8b0;
  --press-ink-shadow:rgb(0 0 0/.55);
  --press-drop:rgb(0 0 0/.55);
}
.clover-press-button[data-colored=true]{
  --press-rim-top:color-mix(in srgb,var(--press-seed),white 35%);
  --press-rim-bottom:color-mix(in srgb,var(--press-seed),black 8%);
  --press-rim-edge:color-mix(in srgb,var(--press-seed),black 30%);
  --press-face-top:color-mix(in srgb,var(--press-seed),black 22%);
  --press-face-bottom:color-mix(in srgb,var(--press-seed),white 12%);
  --press-face-inset:rgb(0 0 0/.22);
  --press-shine:rgb(255 255 255/.4);
  --press-text:#fff;
  --press-ink-shadow:rgb(0 0 0/.22);
}
.clover-press-button:enabled:is(:active,[data-key-pressed=true]){--press-drop-y:.45em;--press-drop-blur:.8em;--press-sink:.08em}
.clover-press-base{position:absolute;inset:0;border-radius:inherit;pointer-events:none;box-shadow:0 var(--press-drop-y) var(--press-drop-blur) calc(var(--press-drop-blur) * -.4) var(--press-drop);transition:box-shadow 120ms ease-out}
.clover-press-top{
  position:relative;display:inline-flex;align-items:center;justify-content:center;width:100%;min-height:inherit;padding:.15em .85em .17em;border-radius:inherit;pointer-events:none;
  transform:translateY(var(--press-sink));
  background:linear-gradient(180deg,var(--press-rim-top),var(--press-rim-bottom));
  box-shadow:inset 0 .06em .06em var(--press-shine),inset 0 -.08em .12em var(--press-rim-edge),0 .04em .1em var(--press-rim-edge);
  transition:transform 120ms ease-out;
}
.clover-press-face{
  position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.5em;width:100%;min-height:3em;padding:.6em 1.4em;border-radius:999px;
  background:linear-gradient(180deg,var(--press-face-top),var(--press-face-bottom) 85%);
  box-shadow:inset 0 .3em .55em -.1em var(--press-face-inset),inset 0 -.12em .2em var(--press-shine);
  font-weight:800;letter-spacing:.14em;text-transform:uppercase;
  text-shadow:0 1px 0 var(--press-ink-shadow);
}
.clover-press-face>svg{width:1.1em;height:1.1em;flex-shrink:0}
.clover-press-button:enabled:is(:active,[data-key-pressed=true]) :is(.clover-press-top,.clover-press-base),.clover-press-button[data-reduced=true] :is(.clover-press-top,.clover-press-base){transition:none}
@media(prefers-reduced-motion:reduce){.clover-press-top,.clover-press-base{transition:none}}
@media(forced-colors:active){.clover-press-button{color:ButtonText;border:1px solid ButtonText}.clover-press-base{display:none}.clover-press-top,.clover-press-face{background:ButtonFace;box-shadow:none;text-shadow:none}}
`;

function PressButton({
  children,
  size = "default",
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
        data-reduced={Boolean(reducedMotion)}
        data-colored={Boolean(color)}
        data-key-pressed={keyPressed && !disabled}
        className={cn(pressButtonVariants({ size }), className)}
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
