"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type PetalRevealPattern = "random" | "top" | "wave" | "diagonal" | "center";
export type PetalRevealTone = "red" | "pink" | "white" | "yellow" | "peach" | "purple";
export type PetalRevealColor = PetalRevealTone | "mixed";

export interface PetalRevealRef {
  play: () => void;
  cover: () => void;
  reset: () => void;
}

export interface PetalRevealProps extends Omit<React.ComponentProps<"div">, "ref"> {
  ref?: React.Ref<PetalRevealRef>;
  color?: PetalRevealColor;
  size?: number;
  pattern?: PetalRevealPattern;
  duration?: number;
  loop?: boolean;
  loopDelay?: number;
  autoStart?: boolean;
  inView?: boolean;
  once?: boolean;
  onStart?: () => void;
  onComplete?: () => void;
}

type Rgb = [number, number, number];
type Phase = "covered" | "revealing" | "revealed" | "covering";

interface Tone {
  base: Rgb;
  tip: Rgb;
}

interface Sprite {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

interface Petal {
  front: string;
  back: string;
  x: number;
  y: number;
  turn: number;
  flip: number;
  tilt: number;
  scale: number;
  order: number;
  pop: number;
  drift: number;
  spin: number;
  flipRate: number;
  tiltRate: number;
  sway: number;
  swayRate: number;
  swayPhase: number;
  height: number;
  exit: number;
}

interface Live {
  color: PetalRevealColor;
  size: number;
  pattern: PetalRevealPattern;
  duration: number;
  loop: boolean;
  loopDelay: number;
  onStart?: () => void;
  onComplete?: () => void;
}

const TONES: Record<PetalRevealTone, Tone> = {
  red: { base: [250, 214, 206], tip: [196, 18, 44] },
  pink: { base: [255, 236, 238], tip: [238, 104, 128] },
  white: { base: [255, 253, 246], tip: [244, 236, 228] },
  yellow: { base: [255, 248, 214], tip: [245, 190, 24] },
  peach: { base: [255, 240, 226], tip: [242, 132, 88] },
  purple: { base: [248, 224, 248], tip: [178, 66, 196] },
};

const COLORS = Object.keys(TONES) as PetalRevealTone[];
const SHAPES = 6;
const LAND = 0.85;
const SHARP = 1.3;

function hash(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

function mix(a: Rgb, b: Rgb, t: number) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t)) as Rgb;
}

function rgba([r, g, b]: Rgb, a = 1) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function tracePetal(ctx: CanvasRenderingContext2D, len: number, half: number, seed: number) {
  const base = len / 2;
  const tip = -len / 2;
  const notch = len * (0.02 + hash(seed + 3) * 0.07);
  const lean = (hash(seed + 4) - 0.5) * 0.16;
  const side = (s: number) => half * (1 + s * lean);
  ctx.beginPath();
  ctx.moveTo(0, base);
  ctx.bezierCurveTo(
    -side(-1) * 0.32,
    base - len * 0.2,
    -side(-1) * 1.12,
    len * 0.14,
    -side(-1),
    -len * 0.12,
  );
  ctx.bezierCurveTo(-side(-1) * 0.9, -len * 0.36, -side(-1) * 0.5, tip, -side(-1) * 0.16, tip);
  ctx.quadraticCurveTo(-side(-1) * 0.05, tip + notch * 0.2, 0, tip + notch);
  ctx.quadraticCurveTo(side(1) * 0.05, tip + notch * 0.2, side(1) * 0.16, tip);
  ctx.bezierCurveTo(side(1) * 0.5, tip, side(1) * 0.9, -len * 0.36, side(1), -len * 0.12);
  ctx.bezierCurveTo(side(1) * 1.12, len * 0.14, side(1) * 0.32, base - len * 0.2, 0, base);
  ctx.closePath();
}

function buildSprite(tone: Tone, shape: number, len: number, ratio: number, back: boolean) {
  const seed = shape * 17.3 + 5;
  const half = len * (0.3 + hash(seed + 1) * 0.1);
  const pad = Math.ceil(len * 0.08) + 3;
  const width = half * 2.3 + pad * 2;
  const height = len + pad * 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * ratio);
  canvas.height = Math.ceil(height * ratio);
  const ctx = canvas.getContext("2d");
  if (!ctx) return { canvas, width, height };

  const paleBase = back ? mix(tone.base, [255, 255, 255], 0.35) : tone.base;
  const paleTip = back ? mix(tone.tip, [255, 255, 255], 0.38) : tone.tip;
  const vein = mix(tone.tip, [90, 20, 40], 0.35);
  const heart = mix(paleBase, [236, 232, 170], 0.45);

  ctx.scale(ratio, ratio);
  ctx.translate(width / 2, height / 2);

  tracePetal(ctx, len, half, seed);
  ctx.save();
  ctx.shadowColor = "rgba(60, 20, 30, 0.22)";
  ctx.shadowBlur = 2.5;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = rgba(paleBase);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.clip();

  const body = ctx.createLinearGradient(0, len / 2, 0, -len / 2);
  body.addColorStop(0, rgba(heart));
  body.addColorStop(0.16, rgba(paleBase));
  body.addColorStop(0.55, rgba(mix(paleBase, paleTip, 0.5)));
  body.addColorStop(1, rgba(paleTip));
  ctx.fillStyle = body;
  ctx.fillRect(-width, -height, width * 2, height * 2);

  const light = ctx.createLinearGradient(-half, -len * 0.2, half, len * 0.2);
  light.addColorStop(0, back ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.34)");
  light.addColorStop(0.45, "rgba(255, 255, 255, 0)");
  light.addColorStop(1, back ? "rgba(70, 20, 40, 0.06)" : "rgba(70, 20, 40, 0.16)");
  ctx.fillStyle = light;
  ctx.fillRect(-width, -height, width * 2, height * 2);

  const glow = ctx.createRadialGradient(0, len * 0.42, 0, 0, len * 0.42, len * 0.5);
  glow.addColorStop(0, "rgba(255, 255, 255, 0.35)");
  glow.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(-width, -height, width * 2, height * 2);

  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(vein, back ? 0.07 : 0.13);
  ctx.lineWidth = Math.max(0.5, len * 0.008);
  const veins = 7;
  for (let i = 0; i < veins; i++) {
    const t = i / (veins - 1) - 0.5;
    const bend = (hash(seed + 20 + i) - 0.5) * half * 0.12;
    ctx.beginPath();
    ctx.moveTo(t * half * 0.12, len * 0.46);
    ctx.quadraticCurveTo(t * half * 1.1 + bend, len * 0.05, t * half * 1.25, -len * 0.4);
    ctx.stroke();
  }
  ctx.strokeStyle = back ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.22)";
  ctx.lineWidth = Math.max(0.6, len * 0.014);
  ctx.beginPath();
  ctx.moveTo(0, len * 0.46);
  ctx.quadraticCurveTo(half * 0.04, 0, 0, -len * 0.36);
  ctx.stroke();
  ctx.restore();

  tracePetal(ctx, len, half, seed);
  ctx.strokeStyle = rgba(mix(paleTip, [80, 20, 40], 0.3), 0.22);
  ctx.lineWidth = 0.7;
  ctx.stroke();

  return { canvas, width, height };
}

function getFactor(pattern: PetalRevealPattern, x: number, y: number, seed: number) {
  switch (pattern) {
    case "top":
      return y * 0.85 + hash(seed) * 0.15;
    case "wave":
      return x * 0.85 + hash(seed) * 0.15;
    case "diagonal":
      return (x + y) * 0.43 + hash(seed) * 0.14;
    case "center":
      return Math.min(1, Math.hypot(x - 0.5, y - 0.5) * 1.25) * 0.86 + hash(seed) * 0.14;
    case "random":
    default:
      return hash(seed);
  }
}

function buildPetals(L: Live, W: number, H: number) {
  const gx = L.size * 0.36;
  const gy = L.size * 0.38;
  const g = H * 2.2 + 300;
  const petals: Petal[] = [];
  for (let j = -1; j <= Math.ceil(H / gy) + 1; j++) {
    for (let i = -1; i <= Math.ceil(W / gx) + 1; i++) {
      const seed = petals.length * 7.31 + 11;
      const r = (n: number) => hash(seed + n);
      const sign = (n: number) => (r(n) > 0.5 ? 1 : -1);
      const tone = L.color === "mixed" ? COLORS[Math.floor(r(1) * COLORS.length)] : L.color;
      const shape = Math.floor(r(2) * SHAPES);
      const x = (i + (j % 2 ? 0.5 : 0) + (r(3) - 0.5) * 0.7) * gx;
      const y = (j + (r(4) - 0.5) * 0.7) * gy;
      const scale = 0.85 + r(5) * 0.3;
      const pop = 30 + r(6) * 70;
      const fall = H + L.size * scale - y;
      petals.push({
        front: `${tone}:${shape}:0`,
        back: `${tone}:${shape}:1`,
        x,
        y,
        turn: r(7) * Math.PI * 2,
        flip: r(8) < 0.1 ? Math.PI + (r(9) - 0.5) * 0.9 : (r(9) - 0.5) * 1.3,
        tilt: (r(10) - 0.5) * 1.1,
        scale,
        order: getFactor(
          L.pattern,
          Math.min(1, Math.max(0, x / W)),
          Math.min(1, Math.max(0, y / H)),
          seed + 12,
        ),
        pop,
        drift: (r(13) - 0.5) * 140,
        spin: sign(14) * (1 + r(15) * 3),
        flipRate: sign(16) * (3 + r(17) * 6),
        tiltRate: sign(18) * (1 + r(19) * 2.5),
        sway: 8 + r(20) * 18,
        swayRate: 3 + r(21) * 4,
        swayPhase: r(22) * Math.PI * 2,
        height: H * 0.25 + y + L.size + r(23) * H * 0.3,
        exit: (pop + Math.sqrt(pop * pop + 2 * g * Math.max(0, fall))) / g,
      });
    }
  }
  return petals.sort((a, b) => b.order - a.order);
}

function PetalReveal({
  ref,
  children,
  color = "pink",
  size = 44,
  pattern = "random",
  duration = 1,
  loop = true,
  loopDelay = 1.6,
  autoStart = true,
  inView = false,
  once = true,
  onStart,
  onComplete,
  className,
  ...props
}: PetalRevealProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const controls = React.useRef<PetalRevealRef | null>(null);
  const syncRef = React.useRef<(() => void) | null>(null);
  const live = React.useRef<Live>({
    color,
    size,
    pattern,
    duration,
    loop,
    loopDelay,
    onStart,
    onComplete,
  });

  React.useImperativeHandle(
    ref,
    () => ({
      play: () => controls.current?.play(),
      cover: () => controls.current?.cover(),
      reset: () => controls.current?.reset(),
    }),
    [],
  );

  React.useEffect(() => {
    live.current = { color, size, pattern, duration, loop, loopDelay, onStart, onComplete };
    syncRef.current?.();
  }, [color, size, pattern, duration, loop, loopDelay, onStart, onComplete]);

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!host || !canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sprites = new Map<string, Sprite>();
    let petals: Petal[] = [];
    let layoutKey = "";
    let spriteKey = "";
    let phase: Phase = "covered";
    let clock = 0;
    let looping = false;
    let played = false;
    let revealEnd = 0;
    let raf = 0;
    let last = 0;
    let visible = false;
    let dpr = 1;

    const getSprite = (key: string) => {
      const found = sprites.get(key);
      if (found) return found;
      const [tone, shape, side] = key.split(":");
      const sprite = buildSprite(
        TONES[tone as PetalRevealTone],
        Number(shape),
        live.current.size,
        dpr * SHARP,
        side === "1",
      );
      sprites.set(key, sprite);
      return sprite;
    };

    const layout = () => {
      const L = live.current;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = host.clientWidth;
      const H = host.clientHeight;
      const w = Math.max(1, Math.round(W * dpr));
      const h = Math.max(1, Math.round(H * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const nextSprites = `${L.size}:${dpr}`;
      if (nextSprites !== spriteKey) {
        spriteKey = nextSprites;
        sprites.clear();
      }
      const nextLayout = `${W}:${H}:${L.color}:${L.size}:${L.pattern}:${L.duration}`;
      if (nextLayout === layoutKey) return;
      layoutKey = nextLayout;
      petals = buildPetals(L, W, H);
      revealEnd = petals.reduce((end, p) => Math.max(end, p.order * L.duration + p.exit), 0);
    };

    const place = (
      p: Petal,
      x: number,
      y: number,
      turn: number,
      flip: number,
      tilt: number,
      grow: number,
    ) => {
      const flat = Math.cos(flip);
      const sprite = getSprite(flat < 0 ? p.back : p.front);
      const ratio = dpr * SHARP;
      const k = (p.scale * grow * dpr) / ratio;
      const sx = Math.sign(flat || 1) * Math.max(0.06, Math.abs(flat)) * k;
      const sy = (0.6 + 0.4 * Math.abs(Math.cos(tilt))) * k;
      const cos = Math.cos(turn);
      const sin = Math.sin(turn);
      ctx.setTransform(cos * sx, sin * sx, -sin * sy, cos * sy, x * dpr, y * dpr);
      ctx.drawImage(sprite.canvas, -sprite.canvas.width / 2, -sprite.canvas.height / 2);
    };

    const draw = () => {
      const L = live.current;
      const H = host.clientHeight;
      const g = H * 2.2 + 300;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (phase === "revealed") return;

      if (phase === "covered") {
        for (const p of petals) place(p, p.x, p.y, p.turn, p.flip, p.tilt, 1);
        return;
      }

      if (phase === "revealing") {
        for (const p of petals) {
          if (clock <= p.order * L.duration) place(p, p.x, p.y, p.turn, p.flip, p.tilt, 1);
        }
        for (const p of petals) {
          const age = clock - p.order * L.duration;
          if (age <= 0 || age >= p.exit) continue;
          const ramp = Math.min(1, age / 0.3);
          const swing = Math.sin(p.swayPhase + age * p.swayRate) * p.sway * ramp;
          place(
            p,
            p.x + p.drift * age * ramp + swing,
            p.y - p.pop * age + 0.5 * g * age * age,
            p.turn + p.spin * age * ramp,
            p.flip + p.flipRate * age * ramp,
            p.tilt + p.tiltRate * age * ramp,
            1 + 0.15 * Math.min(1, age * 3),
          );
        }
        return;
      }

      for (const p of petals) {
        if (clock - (1 - p.order) * L.duration >= LAND) {
          place(p, p.x, p.y, p.turn, p.flip, p.tilt, 1);
        }
      }
      for (const p of petals) {
        const age = clock - (1 - p.order) * L.duration;
        if (age < 0 || age >= LAND) continue;
        const rest = Math.pow(1 - age / LAND, 3);
        const swing = Math.sin(p.swayPhase + age * p.swayRate) * p.sway * rest;
        place(
          p,
          p.x - p.drift * 0.6 * rest + swing,
          p.y - p.height * rest,
          p.turn - p.spin * 0.7 * rest,
          p.flip - p.flipRate * 0.7 * rest,
          p.tilt - p.tiltRate * 0.7 * rest,
          1 + 0.15 * rest,
        );
      }
    };

    const moving = () => !reduced.matches;

    const advance = () => {
      const L = live.current;
      if (phase === "revealing" && clock >= revealEnd) {
        phase = "revealed";
        clock = 0;
        L.onComplete?.();
      } else if (phase === "revealed" && looping && clock >= L.loopDelay) {
        phase = "covering";
        clock = 0;
      } else if (phase === "covering" && clock >= L.duration + LAND) {
        phase = "covered";
        clock = 0;
      } else if (phase === "covered" && looping && clock >= L.loopDelay) {
        phase = "revealing";
        clock = 0;
        L.onStart?.();
      }
    };

    const active = () => phase === "revealing" || phase === "covering" || (looping && moving());

    const tick = (now: number) => {
      raf = 0;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      clock += dt;
      const before = phase;
      advance();
      if (phase === "revealing" || phase === "covering" || phase !== before) draw();
      if (active() && visible && !document.hidden) raf = requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };

    const play = () => {
      const L = live.current;
      played = true;
      clock = 0;
      L.onStart?.();
      if (!moving()) {
        looping = false;
        phase = "revealed";
        L.onComplete?.();
        draw();
        return;
      }
      looping = L.loop;
      phase = "revealing";
      schedule();
    };

    const cover = () => {
      looping = false;
      clock = 0;
      phase = moving() ? "covering" : "covered";
      if (phase === "covered") draw();
      else schedule();
    };

    const reset = () => {
      looping = false;
      played = false;
      clock = 0;
      phase = "covered";
      draw();
    };

    controls.current = { play, cover, reset };

    syncRef.current = () => {
      layout();
      draw();
      if (active()) schedule();
    };

    layout();
    draw();
    if (autoStart && !inView) play();

    const ro = new ResizeObserver(() => syncRef.current?.());
    ro.observe(host);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && active()) schedule();
    });
    io.observe(host);

    const trigger = new IntersectionObserver(
      ([entry]) => {
        if (!inView || !entry.isIntersecting) return;
        if (once && played) return;
        play();
      },
      { rootMargin: "-10% 0px -10% 0px" },
    );
    trigger.observe(host);

    const onVisibility = () => {
      if (!document.hidden && active()) schedule();
    };
    const onMotion = () => {
      if (!moving() && phase !== "covered") {
        looping = false;
        phase = "revealed";
        draw();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    reduced.addEventListener("change", onMotion);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      controls.current = null;
      syncRef.current = null;
      ro.disconnect();
      io.disconnect();
      trigger.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", onMotion);
    };
  }, [autoStart, inView, once]);

  return (
    <div ref={hostRef} className={cn("relative overflow-hidden", className)} {...props}>
      {children && <div className="relative h-full w-full">{children}</div>}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 block h-full w-full"
      />
    </div>
  );
}

export { PetalReveal };
