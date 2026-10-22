"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type SpectrumBarsTheme = "signal" | "neon" | "sunset" | "mono";

export const SPECTRUM_BARS_THEMES: Record<SpectrumBarsTheme, string[]> = {
  signal: ["#16d872", "#1ff0c8", "#22d8ff", "#3a5bff", "#ff2f8e", "#ff1e3c", "#ff6a00", "#ffd400"],
  neon: ["#6a2bff", "#b14dff", "#ff4fd8", "#4df0ff", "#00ffa3", "#c6ff3d", "#fff04d"],
  sunset: ["#5a189a", "#9d4edd", "#f72585", "#ff5e1a", "#ff9f1c", "#ffd23f", "#fff1e0"],
  mono: ["#3a3a3a", "#6f6f6f", "#a3a3a3", "#d6d6d6", "#ffffff"],
};

export interface SpectrumBarsProps {
  theme?: SpectrumBarsTheme;
  colors?: string[];
  bandWidth?: number;
  bandHeight?: number;
  columns?: number;
  glow?: number;
  glitch?: number;
  speed?: number;
  animate?: boolean;
  backgroundColor?: string;
  radius?: string;
  style?: React.CSSProperties;
  className?: string;
}

type RGB = [number, number, number];

function parseColor(input: string): RGB {
  const s = input.trim();
  if (s.startsWith("#")) {
    let c = s.slice(1);
    if (c.length === 3 || c.length === 4)
      c = c
        .split("")
        .map((x) => x + x)
        .join("");
    if (c.length >= 6) {
      return [
        parseInt(c.slice(0, 2), 16),
        parseInt(c.slice(2, 4), 16),
        parseInt(c.slice(4, 6), 16),
      ];
    }
  }
  const m = s.match(/rgba?\(([^)]+)\)/i);
  if (m) {
    const [r, g, b] = m[1].split(",").map((x) => parseFloat(x));
    return [r, g, b];
  }
  return [0, 0, 0];
}

function hash(x: number, y: number) {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
}

function noise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function sample(palette: RGB[], t: number): RGB {
  const last = palette.length - 1;
  if (last <= 0) return palette[0];
  const p = Math.min(Math.max(t, 0), 1) * last;
  const i = Math.min(Math.floor(p), last - 1);
  const f = p - i;
  const a = palette[i];
  const b = palette[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

const smooth = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

type Live = {
  palette: RGB[];
  bandWidth: number;
  bandHeight: number;
  columns: number;
  glow: number;
  glitch: number;
  speed: number;
  animate: boolean;
};

function SpectrumBars({
  theme = "signal",
  colors,
  bandWidth = 0.86,
  bandHeight = 1,
  columns = 112,
  glow = 2,
  glitch = 0.5,
  speed = 3.6,
  animate = true,
  backgroundColor,
  radius,
  style,
  className,
}: SpectrumBarsProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const syncRef = React.useRef<(() => void) | null>(null);
  const key = (colors ?? SPECTRUM_BARS_THEMES[theme] ?? SPECTRUM_BARS_THEMES.signal).join(",");

  const palette = React.useMemo(() => (key ? key.split(",") : ["#000000"]).map(parseColor), [key]);

  const live = React.useRef<Live>({
    palette,
    bandWidth,
    bandHeight,
    columns,
    glow,
    glitch,
    speed,
    animate,
  });

  React.useEffect(() => {
    live.current = { palette, bandWidth, bandHeight, columns, glow, glitch, speed, animate };
    syncRef.current?.();
  }, [palette, bandWidth, bandHeight, columns, glow, glitch, speed, animate]);

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!host || !canvas || !ctx) return;

    const strip = document.createElement("canvas");
    const stripCtx = strip.getContext("2d");
    if (!stripCtx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = true;
    let last = 0;
    let time = Math.random() * 100;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(host.clientWidth * dpr));
      const h = Math.max(1, Math.round(host.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const draw = () => {
      const L = live.current;
      const W = canvas.width;
      const H = canvas.height;
      const fill = L.bandWidth >= 1;
      const bw = Math.max(1, Math.round(W * Math.min(1, Math.max(0.05, L.bandWidth))));
      const bh = H * Math.min(1, Math.max(0.05, L.bandHeight));
      if (strip.width !== bw || strip.height !== 1) {
        strip.width = bw;
        strip.height = 1;
      }
      const count = Math.max(4, Math.min(256, L.columns));
      const stripe = bw / count;
      const sway = (noise(time * 0.35, 7.3) - 0.5) * 0.08 * L.glitch * bw;
      const slide = time * 0.6 * stripe + (fill ? sway : 0);
      const image = stripCtx.createImageData(bw, 1);
      for (let px = 0; px < bw; px++) {
        const c = Math.floor((px + slide) / stripe);
        const u = c / count;
        const v = Math.min(
          1,
          Math.max(
            0,
            (0.62 * noise(u * 3.2, time * 0.12) + 0.38 * noise(u * 11, time * 0.2) - 0.15) / 0.72,
          ),
        );
        let light = 0.3 + 0.7 * smooth(0.14, 0.3, noise(u * 23, time * 0.25));
        if (!fill) light *= smooth(0, 0.3, Math.min(px, bw - 1 - px) / bw);
        const color = sample(L.palette, v);
        const white = smooth(0.86, 1, v) * 0.6;
        const o = px * 4;
        image.data[o] = color[0] + (255 - color[0]) * white;
        image.data[o + 1] = color[1] + (255 - color[1]) * white;
        image.data[o + 2] = color[2] + (255 - color[2]) * white;
        image.data[o + 3] = light * 255;
      }
      stripCtx.putImageData(image, 0, 0);
      const x0 = (W - bw) / 2 + (fill ? 0 : sway);
      const y0 = (H - bh) / 2;
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.filter = "none";
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(strip, 0, 0, bw, 1, x0, y0, bw, bh);
      if (L.glow > 0) {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = Math.min(1, 0.45 * L.glow);
        const spread = Math.max(1, W * 0.01 * L.glow);
        const padX = fill ? spread * 3 : 0;
        const padY = bh >= H ? spread * 3 : 0;
        ctx.filter = `blur(${spread}px)`;
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(strip, 0, 0, bw, 1, x0 - padX, y0 - padY, bw + padX * 2, bh + padY * 2);
        ctx.filter = "none";
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }
    };

    const tick = (now: number) => {
      raf = 0;
      const L = live.current;
      const moving = L.animate && L.speed !== 0 && !reduced;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      if (moving) time += dt * L.speed;
      draw();
      if (moving && visible && !document.hidden) raf = requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };

    syncRef.current = () => {
      resize();
      schedule();
    };

    resize();
    schedule();

    const ro = new ResizeObserver(() => syncRef.current?.());
    ro.observe(host);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
    });
    io.observe(host);

    const onVisibility = () => {
      if (!document.hidden) schedule();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      syncRef.current = null;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={cn(
        "bg-background pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      style={{ borderRadius: radius, backgroundColor, ...style }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

SpectrumBars.displayName = "SpectrumBars";

export { SpectrumBars };
