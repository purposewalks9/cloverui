"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type ButterflySpecies =
  "monarch" | "morpho" | "swallowtail" | "emerald" | "violet" | "glasswing";
export type ButterfliesSpecies = ButterflySpecies | "mixed";

export interface ButterfliesProps extends Omit<React.ComponentProps<"div">, "children"> {
  species?: ButterfliesSpecies;
  count?: number;
  size?: number;
  speed?: number;
  followCursor?: boolean;
  animate?: boolean;
}

type Pt = [number, number];
type Seg = [Pt, Pt, Pt];
type Shape = { path: Path2D; rim: Path2D; pts: Pt[]; edge: Pt[]; center: Pt };
type Part = "fore" | "hind";
type Paint = (ctx: CanvasRenderingContext2D, part: Part) => void;

type Look = {
  fore: Shape;
  hind: Shape;
  base: string | ((ctx: CanvasRenderingContext2D, part: Part) => CanvasGradient);
  vein: string;
  veinWidth: number;
  margin: string;
  marginWidth: Record<Part, number>;
  apex?: number;
  dots?: string;
  under?: Paint;
  over?: Paint;
  bodyDots?: string;
};

type Sprites = {
  wing: HTMLCanvasElement;
  dark: HTMLCanvasElement;
  shadow: HTMLCanvasElement;
};

type Flyer = {
  species: ButterflySpecies;
  scale: number;
  seed: number;
  x: number;
  y: number;
  heading: number;
  phase: number;
  glide: number;
};

type Live = {
  species: ButterfliesSpecies;
  count: number;
  size: number;
  speed: number;
  followCursor: boolean;
  animate: boolean;
};

const SPECIES: ButterflySpecies[] = [
  "monarch",
  "morpho",
  "swallowtail",
  "emerald",
  "violet",
  "glasswing",
];
const ROOT: Pt = [0.05, -0.04];
const BOX = { x: -0.06, y: -0.92, w: 1.18, h: 2.04 };
const BODY_BOX = { x: -0.26, y: -0.86, w: 0.52, h: 1.38 };

function bezier(a: Pt, b: Pt, c: Pt, d: Pt, t: number): Pt {
  const m = 1 - t;
  return [
    m * m * m * a[0] + 3 * m * m * t * b[0] + 3 * m * t * t * c[0] + t * t * t * d[0],
    m * m * m * a[1] + 3 * m * m * t * b[1] + 3 * m * t * t * c[1] + t * t * t * d[1],
  ];
}

function shape(start: Pt, segs: Seg[], edge: number[]): Shape {
  const pts: Pt[] = [start];
  const edgePts: Pt[] = [];
  let from = start;
  segs.forEach((seg, index) => {
    for (let i = 1; i <= 18; i++) {
      const p = bezier(from, seg[0], seg[1], seg[2], i / 18);
      pts.push(p);
      if (edge.includes(index)) edgePts.push(p);
    }
    from = seg[2];
  });
  const path = new Path2D();
  pts.forEach(([x, y], i) => (i ? path.lineTo(x, y) : path.moveTo(x, y)));
  path.closePath();
  const rim = new Path2D();
  edgePts.forEach(([x, y], i) => (i ? rim.lineTo(x, y) : rim.moveTo(x, y)));
  const center: Pt = [
    pts.reduce((sum, p) => sum + p[0], 0) / pts.length,
    pts.reduce((sum, p) => sum + p[1], 0) / pts.length,
  ];
  return { path, rim, pts, edge: edgePts, center };
}

function shapes() {
  const fore = shape(
    [0.04, -0.1],
    [
      [
        [0.22, -0.48],
        [0.62, -0.8],
        [0.96, -0.7],
      ],
      [
        [1.04, -0.52],
        [0.9, -0.24],
        [0.66, -0.08],
      ],
      [
        [0.45, 0],
        [0.2, 0.02],
        [0.05, -0.01],
      ],
    ],
    [0, 1],
  );
  const pointed = shape(
    [0.04, -0.1],
    [
      [
        [0.24, -0.5],
        [0.66, -0.8],
        [1, -0.66],
      ],
      [
        [0.92, -0.46],
        [0.84, -0.22],
        [0.62, -0.07],
      ],
      [
        [0.42, 0],
        [0.2, 0.02],
        [0.05, -0.01],
      ],
    ],
    [0, 1],
  );
  const hind = shape(
    ROOT,
    [
      [
        [0.4, -0.1],
        [0.78, 0.02],
        [0.8, 0.3],
      ],
      [
        [0.82, 0.55],
        [0.5, 0.72],
        [0.28, 0.62],
      ],
      [[0.12, 0.52], [0.04, 0.24], ROOT],
    ],
    [0, 1],
  );
  const tailed = shape(
    ROOT,
    [
      [
        [0.42, -0.1],
        [0.8, 0.02],
        [0.78, 0.3],
      ],
      [
        [0.74, 0.46],
        [0.52, 0.58],
        [0.42, 0.62],
      ],
      [
        [0.4, 0.8],
        [0.36, 0.98],
        [0.3, 1.02],
      ],
      [
        [0.24, 0.98],
        [0.28, 0.78],
        [0.24, 0.64],
      ],
      [[0.12, 0.55], [0.04, 0.26], ROOT],
    ],
    [0, 1, 2],
  );
  return { fore, pointed, hind, tailed };
}

function spot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function band(
  ctx: CanvasRenderingContext2D,
  from: Pt,
  via: Pt,
  to: Pt,
  width: number,
  color: string | CanvasGradient,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(from[0], from[1]);
  ctx.quadraticCurveTo(via[0], via[1], to[0], to[1]);
  ctx.stroke();
}

function sheen(ctx: CanvasRenderingContext2D, at: Pt, radius: number, color: string) {
  const g = ctx.createRadialGradient(at[0], at[1], 0, at[0], at[1], radius);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(BOX.x, BOX.y, BOX.w, BOX.h);
}

function looks(): Record<ButterflySpecies, Look> {
  const { fore, pointed, hind, tailed } = shapes();
  return {
    monarch: {
      fore,
      hind,
      base: (ctx) => {
        const g = ctx.createLinearGradient(0.05, 0, 0.9, -0.3);
        g.addColorStop(0, "#b8470a");
        g.addColorStop(0.45, "#e8741a");
        g.addColorStop(1, "#f59a32");
        return g;
      },
      vein: "#16100c",
      veinWidth: 0.026,
      margin: "#16100c",
      marginWidth: { fore: 0.17, hind: 0.15 },
      apex: 0.3,
      dots: "#fdf6e8",
      over: (ctx, part) => {
        if (part !== "fore") return;
        spot(ctx, 0.79, -0.6, 0.032, "#f6a640");
        spot(ctx, 0.86, -0.51, 0.028, "#f6a640");
        spot(ctx, 0.72, -0.67, 0.024, "#fdf6e8");
        spot(ctx, 0.9, -0.62, 0.02, "#fdf6e8");
      },
      bodyDots: "#fdf6e8",
    },
    morpho: {
      fore,
      hind,
      base: (ctx) => {
        const g = ctx.createRadialGradient(0.3, -0.18, 0, 0.3, -0.18, 0.95);
        g.addColorStop(0, "#9be7ff");
        g.addColorStop(0.3, "#2f95ff");
        g.addColorStop(0.7, "#0b45c9");
        g.addColorStop(1, "#06215f");
        return g;
      },
      vein: "rgba(4, 22, 74, 0.45)",
      veinWidth: 0.012,
      margin: "#0a0c14",
      marginWidth: { fore: 0.22, hind: 0.16 },
      apex: 0.27,
      dots: "#e8f4ff",
      over: (ctx) => {
        const g = ctx.createRadialGradient(0.32, -0.26, 0, 0.32, -0.26, 0.5);
        g.addColorStop(0, "rgba(210, 245, 255, 0.4)");
        g.addColorStop(1, "rgba(210, 245, 255, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(BOX.x, BOX.y, BOX.w, BOX.h);
      },
    },
    swallowtail: {
      fore: pointed,
      hind: tailed,
      base: (ctx) => {
        const g = ctx.createLinearGradient(0.05, 0, 0.9, -0.2);
        g.addColorStop(0, "#f2bf2c");
        g.addColorStop(1, "#ffe684");
        return g;
      },
      vein: "#1a1408",
      veinWidth: 0.014,
      margin: "#14110a",
      marginWidth: { fore: 0.2, hind: 0.24 },
      dots: "#ffe27a",
      under: (ctx, part) => {
        ctx.strokeStyle = "#14110a";
        ctx.lineCap = "round";
        const stripes: [Pt, Pt, number][] =
          part === "fore"
            ? [
                [[0.2, -0.58], [0.1, -0.04], 0.08],
                [[0.42, -0.74], [0.27, -0.03], 0.075],
                [[0.62, -0.78], [0.47, -0.06], 0.05],
                [[0.8, -0.74], [0.7, -0.4], 0.035],
              ]
            : [[[0.04, -0.02], [0.24, 0.64], 0.13]];
        for (const [a, b, width] of stripes) {
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
          ctx.stroke();
        }
      },
      over: (ctx, part) => {
        if (part !== "hind") return;
        for (const [x, y] of [
          [0.36, 0.5],
          [0.48, 0.47],
          [0.6, 0.4],
        ] as Pt[])
          spot(ctx, x, y, 0.026, "#4c8dff");
        spot(ctx, 0.3, 0.58, 0.04, "#f47a1f");
      },
    },
    emerald: {
      fore: pointed,
      hind: tailed,
      base: (ctx) => {
        const g = ctx.createLinearGradient(0.05, 0, 0.9, -0.3);
        g.addColorStop(0, "#0d2a20");
        g.addColorStop(1, "#06140f");
        return g;
      },
      vein: "rgba(0, 0, 0, 0.4)",
      veinWidth: 0.012,
      margin: "#050b08",
      marginWidth: { fore: 0.1, hind: 0.12 },
      dots: "#1fbf86",
      under: (ctx, part) => {
        const g = ctx.createLinearGradient(0.1, 0.3, 0.8, -0.6);
        g.addColorStop(0, "#14d68f");
        g.addColorStop(0.5, "#5cffc4");
        g.addColorStop(1, "#1bc98a");
        if (part === "fore") band(ctx, [0.3, -0.1], [0.46, -0.4], [0.72, -0.66], 0.2, g);
        else band(ctx, [0.12, 0.1], [0.36, 0.1], [0.62, 0.22], 0.22, g);
        sheen(ctx, part === "fore" ? [0.5, -0.4] : [0.36, 0.14], 0.4, "rgba(150, 255, 220, 0.35)");
      },
      over: (ctx, part) => {
        if (part === "hind") spot(ctx, 0.32, 0.56, 0.035, "#5fa8ff");
      },
    },
    violet: {
      fore,
      hind,
      base: (ctx) => {
        const g = ctx.createRadialGradient(0.3, -0.18, 0, 0.3, -0.18, 0.95);
        g.addColorStop(0, "#f0d4ff");
        g.addColorStop(0.3, "#b46bff");
        g.addColorStop(0.7, "#7a2fe0");
        g.addColorStop(1, "#3e1478");
        return g;
      },
      vein: "rgba(40, 8, 80, 0.45)",
      veinWidth: 0.012,
      margin: "#1a0b2e",
      marginWidth: { fore: 0.16, hind: 0.14 },
      apex: 0.22,
      dots: "#f6e8ff",
      over: (ctx, part) => {
        sheen(ctx, part === "fore" ? [0.34, -0.24] : [0.32, 0.18], 0.5, "rgba(255, 210, 255, 0.4)");
        if (part === "hind") {
          spot(ctx, 0.58, 0.4, 0.045, "#ff8ad8");
          spot(ctx, 0.58, 0.4, 0.022, "#1a0b2e");
        }
      },
    },
    glasswing: {
      fore: pointed,
      hind,
      base: "rgba(255, 255, 255, 0.07)",
      vein: "rgba(70, 35, 22, 0.6)",
      veinWidth: 0.012,
      margin: "#3a1f14",
      marginWidth: { fore: 0.12, hind: 0.1 },
      over: (ctx, part) => {
        sheen(ctx, part === "fore" ? [0.4, -0.3] : [0.35, 0.2], 0.45, "rgba(255, 255, 255, 0.16)");
        if (part === "fore") band(ctx, [0.66, -0.7], [0.74, -0.64], [0.82, -0.52], 0.05, "#fbf6ee");
      },
      bodyDots: "#e9dccb",
    },
  };
}

function veins(ctx: CanvasRenderingContext2D, s: Shape, look: Look) {
  ctx.strokeStyle = look.vein;
  ctx.lineWidth = look.veinWidth;
  ctx.lineCap = "round";
  const n = 7;
  for (let i = 0; i < n; i++) {
    const [ex, ey] = s.edge[Math.round((i / (n - 1)) * (s.edge.length - 1))];
    const mx = (ROOT[0] + ex) / 2;
    const my = (ROOT[1] + ey) / 2;
    const dx = ex - ROOT[0];
    const dy = ey - ROOT[1];
    ctx.beginPath();
    ctx.moveTo(ROOT[0], ROOT[1]);
    ctx.quadraticCurveTo(mx - dy * 0.08, my + dx * 0.08, ex, ey);
    ctx.stroke();
  }
}

function paintWing(ctx: CanvasRenderingContext2D, part: Part, look: Look) {
  const s = look[part];
  ctx.save();
  ctx.clip(s.path);
  ctx.fillStyle = typeof look.base === "function" ? look.base(ctx, part) : look.base;
  ctx.fillRect(BOX.x, BOX.y, BOX.w, BOX.h);
  look.under?.(ctx, part);
  veins(ctx, s, look);
  if (look.apex && part === "fore") spot(ctx, 1.02, -0.74, look.apex, look.margin);
  ctx.strokeStyle = look.margin;
  ctx.lineWidth = look.marginWidth[part];
  ctx.lineJoin = "round";
  ctx.lineCap = "butt";
  ctx.stroke(s.rim);
  const inset = look.marginWidth[part] * 0.24;
  const step = Math.max(1, Math.floor(s.edge.length / 12));
  for (let i = step; look.dots && i < s.edge.length - 1; i += step) {
    const [x, y] = s.edge[i];
    const dx = s.center[0] - x;
    const dy = s.center[1] - y;
    const d = Math.hypot(dx, dy) || 1;
    spot(ctx, x + (dx / d) * inset, y + (dy / d) * inset, 0.013, look.dots);
  }
  look.over?.(ctx, part);
  ctx.restore();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
  ctx.lineWidth = 0.008;
  ctx.stroke(s.path);
}

function unitCanvas(px: number, box: typeof BOX) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(box.w * px));
  canvas.height = Math.max(1, Math.ceil(box.h * px));
  const ctx = canvas.getContext("2d");
  ctx?.setTransform(px, 0, 0, px, -box.x * px, -box.y * px);
  return { canvas, ctx };
}

function wingSprites(look: Look, px: number): Sprites | null {
  const { canvas: wing, ctx } = unitCanvas(px, BOX);
  const { canvas: dark, ctx: darkCtx } = unitCanvas(px, BOX);
  const { canvas: shadow, ctx: shadowCtx } = unitCanvas(px, BOX);
  if (!ctx || !darkCtx || !shadowCtx) return null;
  paintWing(ctx, "hind", look);
  paintWing(ctx, "fore", look);
  darkCtx.setTransform(1, 0, 0, 1, 0, 0);
  darkCtx.drawImage(wing, 0, 0);
  darkCtx.globalCompositeOperation = "source-in";
  darkCtx.fillStyle = "#05030a";
  darkCtx.fillRect(0, 0, dark.width, dark.height);
  shadowCtx.setTransform(1, 0, 0, 1, 0, 0);
  shadowCtx.shadowColor = "#000";
  shadowCtx.shadowBlur = px * 0.05;
  shadowCtx.shadowOffsetX = shadow.width;
  shadowCtx.drawImage(dark, -shadow.width, 0);
  return { wing, dark, shadow };
}

const BODY = ["#1c1611", "#120d0a", "#3a2e25", "#4a3c31", "#140f0b", "#17110d"];

function bodySprite(px: number, dots?: string) {
  const { canvas, ctx } = unitCanvas(px, BODY_BOX);
  if (!ctx) return canvas;
  const [line, edge, mid, light, deep, head] = BODY;
  ctx.strokeStyle = line;
  ctx.lineWidth = 0.014;
  ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 0.02, -0.4);
    ctx.quadraticCurveTo(side * 0.06, -0.62, side * 0.17, -0.78);
    ctx.stroke();
    spot(ctx, side * 0.175, -0.79, 0.024, line);
  }
  const abdomen = ctx.createLinearGradient(-0.05, 0, 0.05, 0);
  abdomen.addColorStop(0, edge);
  abdomen.addColorStop(0.5, mid);
  abdomen.addColorStop(1, edge);
  ctx.fillStyle = abdomen;
  ctx.beginPath();
  ctx.ellipse(0, 0.16, 0.042, 0.27, 0, 0, Math.PI * 2);
  ctx.fill();
  const thorax = ctx.createRadialGradient(-0.015, -0.2, 0, 0, -0.17, 0.09);
  thorax.addColorStop(0, light);
  thorax.addColorStop(1, deep);
  ctx.fillStyle = thorax;
  ctx.beginPath();
  ctx.ellipse(0, -0.17, 0.062, 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  spot(ctx, 0, -0.35, 0.05, head);
  if (dots) {
    for (const [x, y] of [
      [-0.03, -0.37],
      [0.03, -0.37],
      [-0.035, -0.22],
      [0.035, -0.22],
      [0, -0.12],
    ] as Pt[])
      spot(ctx, x, y, 0.011, dots);
  }
  return canvas;
}

function hash(n: number) {
  const h = Math.sin(n * 127.1) * 43758.5453;
  return h - Math.floor(h);
}

function noise(x: number) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(i) + (hash(i + 1) - hash(i)) * u;
}

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

function Butterflies({
  species = "mixed",
  count = 12,
  size = 56,
  speed = 1,
  followCursor = true,
  animate = true,
  className,
  ref,
  ...props
}: ButterfliesProps) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const syncRef = React.useRef<(() => void) | null>(null);
  const live = React.useRef<Live>({
    species,
    count,
    size,
    speed,
    followCursor,
    animate,
  });

  const setHost = React.useCallback(
    (node: HTMLDivElement | null) => {
      hostRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  React.useEffect(() => {
    live.current = { species, count, size, speed, followCursor, animate };
    syncRef.current?.();
  }, [species, count, size, speed, followCursor, animate]);

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!host || !canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const art = looks();
    let sprites: Partial<Record<ButterflySpecies, Sprites>> = {};
    let bodies: Partial<Record<ButterflySpecies, HTMLCanvasElement>> = {};
    let spriteKey = "";
    let flyers: Flyer[] = [];
    let flyerKey = "";
    let raf = 0;
    let visible = true;
    let last = 0;
    let time = 0;
    let dpr = 1;
    let pointer: Pt | null = null;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(host.clientWidth * dpr));
      const h = Math.max(1, Math.round(host.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const ensure = () => {
      const L = live.current;
      const px = Math.ceil((Math.max(8, L.size) / 2) * 1.2 * dpr);
      const key = `${px}`;
      if (key !== spriteKey) {
        spriteKey = key;
        sprites = {};
        bodies = {};
      }
      const W = host.clientWidth;
      const H = host.clientHeight;
      const n = Math.max(0, Math.min(60, Math.round(L.count)));
      const nextKey = `${L.species}:${n}`;
      if (nextKey !== flyerKey) {
        flyerKey = nextKey;
        flyers = Array.from({ length: n }, (_, i) => {
          const old = flyers[i];
          const kind = L.species === "mixed" ? SPECIES[i % SPECIES.length] : L.species;
          const seed = old?.seed ?? Math.random() * 1000;
          return {
            species: kind,
            scale: old?.scale ?? 0.72 + hash(seed) * 0.42,
            seed,
            x: old?.x ?? W * (0.1 + Math.random() * 0.8),
            y: old?.y ?? H * (0.1 + Math.random() * 0.8),
            heading: old?.heading ?? Math.random() * Math.PI * 2,
            phase: old?.phase ?? Math.random() * Math.PI * 2,
            glide: old?.glide ?? 0,
          };
        }).sort((a, b) => a.scale - b.scale);
      }
      for (const f of flyers) {
        if (!sprites[f.species]) {
          const made = wingSprites(art[f.species], px);
          if (made) sprites[f.species] = made;
        }
        if (!bodies[f.species]) bodies[f.species] = bodySprite(px, art[f.species].bodyDots);
      }
    };

    const step = (dt: number) => {
      const L = live.current;
      const W = host.clientWidth;
      const H = host.clientHeight;
      const rect = host.getBoundingClientRect();
      const target =
        L.followCursor && pointer ? ([pointer[0] - rect.left, pointer[1] - rect.top] as Pt) : null;
      const chasing =
        target && target[0] >= 0 && target[1] >= 0 && target[0] <= W && target[1] <= H;
      for (const f of flyers) {
        const s = L.size * f.scale;
        let turn = (noise(time * 0.45 + f.seed) - 0.5) * 5;
        let pace = 1;
        const margin = Math.min(W, H) * 0.12 + s * 0.5;
        if (f.x < margin || f.x > W - margin || f.y < margin || f.y > H - margin) {
          turn += wrap(Math.atan2(H / 2 - f.y, W / 2 - f.x) - f.heading) * 2.4;
        }
        if (chasing && target) {
          const orbit = s * (0.9 + hash(f.seed + 3) * 1.4);
          const tx = target[0] + Math.cos(time * 0.9 + f.seed) * orbit;
          const ty = target[1] + Math.sin(time * 1.1 + f.seed) * orbit * 0.7;
          const d = Math.hypot(tx - f.x, ty - f.y);
          turn += wrap(Math.atan2(ty - f.y, tx - f.x) - f.heading) * 3.2;
          pace = Math.min(1.6, 0.5 + d / (s * 3));
        }
        f.heading = wrap(f.heading + Math.max(-4, Math.min(4, turn)) * dt);
        const glideWanted = noise(time * 0.3 + f.seed * 2) > 0.66 ? 1 : 0;
        f.glide += (glideWanted - f.glide) * Math.min(1, dt * 3);
        const v = s * (1.05 + noise(time * 0.6 + f.seed) * 0.5) * pace;
        f.x += Math.cos(f.heading) * v * dt;
        f.y += Math.sin(f.heading) * v * dt;
        f.x = Math.max(-s, Math.min(W + s, f.x));
        f.y = Math.max(-s, Math.min(H + s, f.y));
        f.phase += dt * Math.PI * 2 * (7.5 - f.glide * 5.5);
      }
    };

    const draw = (still: boolean) => {
      const L = live.current;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const f of flyers) {
        const set = sprites[f.species];
        const body = bodies[f.species];
        if (!set || !body) continue;
        const u = (L.size * f.scale) / 2;
        const beat = 0.5 + 0.5 * Math.cos(f.phase);
        const open = still ? 0.96 : 0.12 + 0.88 * (beat * (1 - f.glide) + 0.92 * f.glide);
        const lift = still ? 0 : Math.sin(f.phase) * u * 0.08 * (1 - f.glide);
        const angle = f.heading + Math.PI / 2;
        const lean = still ? 0 : Math.sin(f.phase * 0.5 + f.seed) * 0.06;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.translate(f.x + u * 0.35, f.y + u * 0.55);
        ctx.rotate(angle);
        ctx.scale(u, u);
        ctx.globalAlpha = 0.14;
        for (const side of [1, -1]) {
          ctx.save();
          ctx.scale(side * open, 1);
          ctx.drawImage(set.shadow, BOX.x, BOX.y, BOX.w, BOX.h);
          ctx.restore();
        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.translate(f.x, f.y + lift);
        ctx.rotate(angle + lean);
        ctx.scale(u, u);
        for (const side of [1, -1]) {
          ctx.save();
          ctx.scale(side * open, 1);
          ctx.globalAlpha = 1;
          ctx.drawImage(set.wing, BOX.x, BOX.y, BOX.w, BOX.h);
          ctx.globalAlpha = (1 - open) * 0.45;
          ctx.drawImage(set.dark, BOX.x, BOX.y, BOX.w, BOX.h);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
        ctx.drawImage(body, BODY_BOX.x, BODY_BOX.y, BODY_BOX.w, BODY_BOX.h);
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      raf = 0;
      const L = live.current;
      const moving = L.animate && L.speed > 0 && !reduced.matches;
      const dt = last ? Math.min((now - last) / 1000, 0.05) * L.speed : 0;
      last = now;
      ensure();
      if (moving) {
        time += dt;
        step(dt);
      }
      draw(!moving);
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

    const onPointer = (event: PointerEvent) => {
      pointer = [event.clientX, event.clientY];
    };
    const onLeave = (event: PointerEvent) => {
      if (!event.relatedTarget) pointer = null;
    };
    const onVisibility = () => {
      if (!document.hidden) schedule();
    };
    const onMotion = () => schedule();
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerout", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    reduced.addEventListener("change", onMotion);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      syncRef.current = null;
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerout", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", onMotion);
    };
  }, []);

  return (
    <div
      ref={setHost}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      {...props}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

Butterflies.displayName = "Butterflies";

export { Butterflies };
