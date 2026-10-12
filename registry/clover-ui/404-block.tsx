"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import {
  LiquidButton,
  elementGradient,
  useElementSurface,
  type ElementColors,
} from "@/registry/clover-ui/liquid-button";

export interface Block404Props extends Omit<React.ComponentProps<"section">, "title"> {
  title?: string;
  description?: React.ReactNode;
  actionLabel?: string;
  href?: string;
  onAction?: () => void;
}

const LAVA_TEXT: ElementColors = ["#ff5a4a", "#e8261a", "#a80e06"];

function ElementText({
  text,
  still,
  className,
}: {
  text: string;
  still: boolean;
  className?: string;
}) {
  const wrapRef = React.useRef<HTMLSpanElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const tones = LAVA_TEXT;
  const { ready } = useElementSurface(canvasRef, "lava", tones, still);
  const [masked, setMasked] = React.useState(false);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas || !ready) return;

    const paintMask = () => {
      const { width, height } = wrap.getBoundingClientRect();
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const mask = document.createElement("canvas");
      mask.width = Math.round(width * dpr);
      mask.height = Math.round(height * dpr);
      const ctx = mask.getContext("2d");
      if (!ctx) return;
      const style = getComputedStyle(wrap);
      ctx.scale(dpr, dpr);
      ctx.font = style.font;
      if ("letterSpacing" in ctx) ctx.letterSpacing = style.letterSpacing;
      const metrics = ctx.measureText(text);
      const ascent = metrics.fontBoundingBoxAscent;
      const descent = metrics.fontBoundingBoxDescent;
      ctx.fillText(text, 0, (height - ascent - descent) / 2 + ascent);
      const url = `url(${mask.toDataURL()})`;
      canvas.style.maskImage = url;
      canvas.style.webkitMaskImage = url;
      setMasked(true);
    };

    paintMask();
    document.fonts?.ready.then(paintMask);
    const observer = new ResizeObserver(paintMask);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [ready, text]);

  return (
    <span ref={wrapRef} className={cn("relative inline-block whitespace-pre", className)}>
      <span
        className="bg-clip-text text-transparent"
        style={{ backgroundImage: elementGradient(tones) }}
      >
        {text}
      </span>
      <canvas
        ref={canvasRef}
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 size-full [mask-size:100%_100%] transition-opacity duration-500 [-webkit-mask-size:100%_100%]",
          ready && masked ? "opacity-100" : "opacity-0",
        )}
      />
    </span>
  );
}

function Block404({
  title = "Error",
  description = (
    <>
      Sorry, the page you were looking for <strong>doesn&apos;t exist</strong>. Check the{" "}
      <strong>URL</strong> for typos, or head back <strong>home</strong>.
    </>
  ),
  actionLabel = "Back to home",
  href = "/",
  onAction,
  className,
  ...props
}: Block404Props) {
  const still = Boolean(useReducedMotion());

  return (
    <section
      className={cn("text-foreground flex w-full justify-center px-6 py-16", className)}
      {...props}
    >
      <div className="flex w-full max-w-md flex-col items-start text-left">
        <h1 className="flex flex-wrap items-baseline gap-x-[0.25em] text-3xl leading-tight tracking-tight sm:text-4xl">
          <span className="text-muted-foreground font-semibold">{title}</span>
          <ElementText text="404" still={still} className="font-bold" />
        </h1>

        {description && (
          <p className="text-muted-foreground [&_strong]:text-foreground mt-3 text-[15px] leading-relaxed text-pretty sm:text-base [&_a]:underline-offset-4 [&_a:hover]:underline [&_strong]:font-semibold">
            {description}
          </p>
        )}

        {onAction ? (
          <LiquidButton onClick={onAction} className="mt-6">
            {actionLabel}
          </LiquidButton>
        ) : (
          <LiquidButton asChild className="mt-6">
            <a href={href}>{actionLabel}</a>
          </LiquidButton>
        )}
      </div>
    </section>
  );
}

export { Block404 };
