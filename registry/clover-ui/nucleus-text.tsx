"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface NucleusTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  ref?: React.Ref<HTMLSpanElement>;
  children: string;
  color?: string;
  particleColor?: string;
  particleCount?: number;
  particleSize?: number;
  gatherSpeed?: number;
  shake?: number;
}

type Particle = {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
};

function NucleusText({
  ref,
  children,
  color = "#b8ff8b",
  particleColor = color,
  particleCount = 90,
  particleSize = 1.6,
  gatherSpeed = 1,
  shake = 1,
  className,
  style,
  ...props
}: NucleusTextProps) {
  const hostRef = React.useRef<HTMLSpanElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useImperativeHandle(ref, () => hostRef.current as HTMLSpanElement);

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!host || !canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let raf = 0;
    let disposed = false;
    const padding = 76;
    const rect = host.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const canvasWidth = width + padding * 2;
    const canvasHeight = height + padding * 2;
    const durationScale = 1 / Math.max(0.25, gatherSpeed);
    const count = Math.max(12, Math.min(320, Math.floor(particleCount)));
    const random = (min: number, max: number) => min + Math.random() * (max - min);

    canvas.width = Math.round(canvasWidth * dpr);
    canvas.height = Math.round(canvasHeight * dpr);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    canvas.style.left = `${-padding}px`;
    canvas.style.top = `${-padding}px`;

    const particles: Particle[] = Array.from({ length: count }, () => {
      const side = Math.floor(Math.random() * 4);
      let sx = 0;
      let sy = 0;
      if (side === 0) {
        sx = random(0, canvasWidth);
        sy = random(0, padding * 0.8);
      } else if (side === 1) {
        sx = random(0, canvasWidth);
        sy = random(canvasHeight - padding * 0.8, canvasHeight);
      } else if (side === 2) {
        sx = random(0, padding * 0.8);
        sy = random(0, canvasHeight);
      } else {
        sx = random(canvasWidth - padding * 0.8, canvasWidth);
        sy = random(0, canvasHeight);
      }

      return {
        sx,
        sy,
        tx: padding + random(width * 0.04, width * 0.96),
        ty: padding + random(height * 0.12, height * 0.88),
        delay: random(0, 420) * durationScale,
        duration: random(520, 1050) * durationScale,
        size: random(particleSize * 0.55, particleSize * 1.5),
        drift: random(-10, 10),
      };
    });

    const start = performance.now();
    let shakeAnimation: Animation | undefined;
    if (shake > 0) {
      shakeAnimation = host.animate(
        [
          { transform: "translate3d(0, 0, 0)" },
          { transform: `translate3d(${-2.5 * shake}px, 0, 0) rotate(${-0.45 * shake}deg)` },
          { transform: `translate3d(${2.5 * shake}px, 0, 0) rotate(${0.45 * shake}deg)` },
          { transform: `translate3d(${-1.25 * shake}px, 0, 0)` },
          { transform: "translate3d(0, 0, 0)" },
        ],
        { duration: 360, easing: "ease-out", iterations: 1 },
      );
    }

    const frame = (now: number) => {
      if (disposed) return;
      const elapsed = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      let activeParticles = 0;
      for (const p of particles) {
        const t = (elapsed - p.delay) / p.duration;
        if (t <= 0 || t >= 1) continue;
        activeParticles++;
        const eased = 1 - Math.pow(1 - t, 3);
        const x = p.sx + (p.tx - p.sx) * eased + Math.sin(t * Math.PI) * p.drift;
        const y = p.sy + (p.ty - p.sy) * eased;
        const alpha = Math.min(1, t * 5) * Math.pow(1 - t, 1.7);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = particleColor;
        ctx.shadowColor = particleColor;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      if (activeParticles > 0 || elapsed < 1500 * durationScale) {
        raf = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    raf = requestAnimationFrame(frame);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      shakeAnimation?.cancel();
    };
  }, [children, particleColor, particleCount, particleSize, gatherSpeed, shake]);

  return (
    <span
      ref={hostRef}
      className={cn("relative inline-block align-middle", className)}
      style={{ ...style, color, lineHeight: style?.lineHeight ?? 1.05 }}
      {...props}
    >
      <span className="relative z-0">{children}</span>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute z-10 max-w-none"
      />
    </span>
  );
}

export { NucleusText };
