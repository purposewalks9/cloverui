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
.clover-checkbox{--accent:#3d46ff;--outline:#d9d9d9}
.clover-checkbox>input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer;z-index:2}
.clover-checkbox>input:disabled{cursor:not-allowed}
.clover-checkbox .ccb-art{position:relative;width:var(--box);height:var(--box);pointer-events:none}
.clover-checkbox .ccb-face{position:absolute;inset:0;border:calc(var(--box)*.0625) solid var(--outline);border-radius:20%;background:transparent;transition:border-color 140ms,background 140ms}
.clover-checkbox>input:hover:not(:disabled):not(:checked)~.ccb-art .ccb-face{border-color:#b5b5b5}
.clover-checkbox>input:checked~.ccb-art .ccb-face{background:var(--accent);border-color:var(--accent)}
.clover-checkbox>input:focus-visible~.ccb-art{outline:2px solid var(--accent);outline-offset:6px;border-radius:20%}
.clover-checkbox>input:disabled~.ccb-art{opacity:.45}
.clover-checkbox .ccb-tick{position:absolute;inset:0;width:100%;height:100%;color:white;opacity:0}
.clover-checkbox>input:checked~.ccb-art .ccb-tick{opacity:1}
.clover-checkbox .ccb-burst{position:absolute;inset:-12.5%;border-radius:50%;border:0 solid #ff4663;opacity:0}
.clover-checkbox .ccb-dot{position:absolute;left:50%;top:50%;width:10%;height:10%;border-radius:50%;background:var(--dot);opacity:0}
.clover-checkbox .ccb-dot::after{content:"";position:absolute;width:45%;height:45%;left:160%;top:100%;border-radius:50%;background:inherit}
.clover-checkbox[data-animated=true][data-reduced=false]>input:checked~.ccb-art .ccb-face{animation:ccb-face 660ms both}
.clover-checkbox[data-animated=true][data-reduced=false]>input:checked~.ccb-art .ccb-tick{animation:ccb-tick 660ms both}
.clover-checkbox[data-animated=true][data-reduced=false]>input:checked~.ccb-art .ccb-burst{animation:ccb-burst 660ms both}
.clover-checkbox[data-animated=true][data-reduced=false]>input:checked~.ccb-art .ccb-dot{animation:ccb-dot 660ms both}
@keyframes ccb-face{0%{transform:scale(1)}8%,38%{transform:scale(0)}68%{transform:scale(1.06)}85%,100%{transform:scale(1)}}
@keyframes ccb-tick{0%,48%{opacity:0;transform:scale(.2)}68%{opacity:1;transform:scale(1.08)}85%,100%{opacity:1;transform:scale(1)}}
@keyframes ccb-burst{0%,8%{opacity:0;transform:scale(0);background:#df29ec;border-width:0}15%{opacity:1;transform:scale(.35);background:#df29ec}23%{opacity:1;transform:scale(.9);background:#ff4663;border-width:0}30%{opacity:1;transform:scale(1);background:transparent;border-width:calc(var(--box)*.16)}39%{opacity:0;transform:scale(1.12);background:transparent;border-width:1px}100%{opacity:0}}
@keyframes ccb-dot{0%,27%{opacity:0;transform:translate(-50%,-50%) scale(.1)}35%{opacity:1}65%{opacity:1;transform:translate(calc(-50% + var(--x)),calc(-50% + var(--y))) scale(1)}100%{opacity:0;transform:translate(calc(-50% + var(--x)*1.15),calc(-50% + var(--y)*1.15)) scale(0)}}
@media(prefers-reduced-motion:reduce){.clover-checkbox .ccb-art *{animation:none!important;transition:none!important}}
@media(forced-colors:active){.clover-checkbox .ccb-face{border-color:CanvasText!important;background:Canvas!important}.clover-checkbox .ccb-tick{color:CanvasText}.clover-checkbox .ccb-art{outline-color:Highlight!important}.clover-checkbox .ccb-burst,.clover-checkbox .ccb-dot{display:none}}
`;

const particles = ["#4455ff", "#2bd99c", "#b7dc39", "#df29ec", "#ff5988", "#ff4663"];

export function Checkbox({
  size = "default",
  color = "#3d46ff",
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
      style={{ "--accent": color, ...style } as CSSProperties}
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
        <span className="ccb-burst" />
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
        <svg className="ccb-tick" viewBox="0 0 80 80" fill="none">
          <path
            d="m23 41 11 11 24-25"
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
