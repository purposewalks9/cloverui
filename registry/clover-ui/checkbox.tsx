"use client";

import { useState, type ComponentPropsWithRef, type CSSProperties } from "react";
import { cva } from "class-variance-authority";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const sizes = cva("clover-checkbox relative inline-grid shrink-0 place-items-center align-middle", {
  variants: {
    size: {
      sm: "size-11 [--box:24px]",
      default: "size-11 [--box:32px]",
      lg: "size-20 [--box:80px]",
    },
  },
  defaultVariants: { size: "default" },
});

export type CheckboxSize = "sm" | "default" | "lg";
export type CheckboxProps = Omit<
  ComponentPropsWithRef<"input">,
  "type" | "size" | "color" | "children"
> & {
  size?: CheckboxSize;
  color?: string;
  onCheckedChange?: (checked: boolean) => void;
};

const css = `
.clover-checkbox{--accent:var(--foreground,#0a0a0a);--tick:var(--background,#fff);--outline:var(--border,#d9d9d9)}
.clover-checkbox>input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer;z-index:2}
.clover-checkbox>input:disabled{cursor:not-allowed}
.clover-checkbox .ccb-art{position:relative;width:var(--box);height:var(--box);pointer-events:none}
.clover-checkbox .ccb-face{position:absolute;inset:0;border:calc(var(--box)*.0625) solid var(--outline);border-radius:20%;background:transparent}
.clover-checkbox .ccb-fill{position:absolute;inset:0;background:var(--accent);clip-path:inset(0 0 100% 0 round 20%)}
.clover-checkbox>input:checked~.ccb-art .ccb-fill{clip-path:inset(0 round 20%)}
.clover-checkbox[data-animated=true]>input~.ccb-art .ccb-fill{animation:ccb-fill-out 180ms cubic-bezier(.4,0,.2,1) 150ms both}
.clover-checkbox[data-animated=true]>input:checked~.ccb-art .ccb-fill{animation:ccb-fill-in 180ms cubic-bezier(.55,0,.75,.2) both}
@keyframes ccb-fill-in{from{clip-path:inset(50% round 50%)}to{clip-path:inset(0 round 20%)}}
@keyframes ccb-fill-out{from{clip-path:inset(0 round 20%)}to{clip-path:inset(0 0 100% 0 round 20%)}}
.clover-checkbox>input:focus-visible~.ccb-art{outline:2px solid var(--accent);outline-offset:6px;border-radius:20%}
.clover-checkbox>input:disabled~.ccb-art{opacity:.45}
.clover-checkbox .ccb-tick{position:absolute;inset:0;width:100%;height:100%;color:var(--tick)}
.clover-checkbox .ccb-tick path{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 150ms cubic-bezier(.4,0,1,1)}
.clover-checkbox>input:checked~.ccb-art .ccb-tick path{stroke-dashoffset:0;transition:stroke-dashoffset 180ms cubic-bezier(.2,0,0,1) 170ms}
.clover-checkbox .ccb-dot{position:absolute;left:50%;top:50%;width:10%;height:10%;border-radius:50%;background:var(--dot);opacity:0;z-index:1}
.clover-checkbox .ccb-dot::after{content:"";position:absolute;width:45%;height:45%;left:160%;top:100%;border-radius:50%;background:inherit}
.clover-checkbox[data-animated=true][data-reduced=false]>input:checked~.ccb-art .ccb-dot{animation:ccb-dot 520ms 300ms both}
@keyframes ccb-dot{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}12%{opacity:1}60%{opacity:1;transform:translate(calc(-50% + var(--x)),calc(-50% + var(--y))) scale(1)}100%{opacity:0;transform:translate(calc(-50% + var(--x)*1.15),calc(-50% + var(--y)*1.15)) scale(0)}}
@media(prefers-reduced-motion:reduce){.clover-checkbox .ccb-art *{animation:none!important;transition:none!important}}
@media(forced-colors:active){.clover-checkbox .ccb-face{border-color:CanvasText!important;background:Canvas!important}.clover-checkbox .ccb-tick{color:CanvasText}.clover-checkbox .ccb-art{outline-color:Highlight!important}.clover-checkbox .ccb-fill,.clover-checkbox .ccb-dot{display:none}}
`;

const particles = ["#4455ff", "#2bd99c", "#b7dc39", "#df29ec", "#ff5988", "#ff4663"];

export function Checkbox({
  size = "default",
  color,
  className,
  style,
  onChange,
  onCheckedChange,
  ...props
}: CheckboxProps) {
  const [animated, setAnimated] = useState(false);
  const reducedMotion = useReducedMotion();
  return (
    <span
      className={cn(sizes({ size }), className)}
      style={{ ...(color && { "--accent": color, "--tick": "#fff" }), ...style } as CSSProperties}

      data-animated={animated}
      data-reduced={!!reducedMotion}
    >
      <style>{css}</style>
      <input
        {...props}
        type="checkbox"
        onChange={(event) => {
          setAnimated(true);
          onChange?.(event);
          onCheckedChange?.(event.currentTarget.checked);
        }}
      />
      <span className="ccb-art" aria-hidden="true">
        {particles.map((dot, index) => {
          const angle = ((index * 60 - 110) * Math.PI) / 180;
          return (
            <span
              key={dot}
              className="ccb-dot"
              style={
                {
                  "--dot": dot,
                  "--x": `calc(var(--box) * ${(Math.cos(angle) * 0.95).toFixed(3)})`,
                  "--y": `calc(var(--box) * ${(Math.sin(angle) * 0.95).toFixed(3)})`,
                } as CSSProperties
              }
            />
          );
        })}
        <span className="ccb-face" />
        <span className="ccb-fill" />
        <svg className="ccb-tick" viewBox="0 0 80 80" fill="none">
          <path
            d="m23 41 11 11 24-25"
            pathLength={1}
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
}
