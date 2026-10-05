"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export const SPOOKY_TV_PALETTES = {
  pumpkin: {
    screen: "#120a1c",
    body: "#ff8a1f",
    rib: "#b4410c",
    face: "#ffe066",
    stem: "#5b8c2a",
    alert: "#ff3b3b",
    knobs: ["#ff8a1f", "#8b5cf6"],
  },
  ghoul: {
    screen: "#06130b",
    body: "#9be15d",
    rib: "#3f7a1f",
    face: "#f4ff8a",
    stem: "#7a4a24",
    alert: "#ff4fd8",
    knobs: ["#9be15d", "#ff4fd8"],
  },
  witch: {
    screen: "#0d0618",
    body: "#a35cff",
    rib: "#5b21b6",
    face: "#7dffb2",
    stem: "#2f9e5b",
    alert: "#ff5c5c",
    knobs: ["#a35cff", "#7dffb2"],
  },
  blood: {
    screen: "#12040a",
    body: "#e0263a",
    rib: "#7a0d1c",
    face: "#ffd27a",
    stem: "#4a4a52",
    alert: "#ffffff",
    knobs: ["#e0263a", "#ffd27a"],
  },
} as const;

export type SpookyTvPalette = keyof typeof SPOOKY_TV_PALETTES;

export type SpookyTvState = "idle" | "thinking" | "working" | "done" | "error";

export interface SpookyTvProps extends Omit<React.ComponentProps<"div">, "children"> {
  palette?: SpookyTvPalette;
  state?: SpookyTvState;
  interactive?: boolean;
  animate?: boolean;
}

type Point = [number, number];
type Spring = { x: number; v: number; t: number };

type Face = {
  open: number;
  happy: number;
  tilt: number;
  width: number;
  curve: number;
  mouth: number;
  teeth: number;
  alarm: number;
  think: number;
  work: number;
};

const FACES: Record<SpookyTvState, Face> = {
  idle: {
    open: 1,
    happy: 0,
    tilt: 0,
    width: 20,
    curve: 7,
    mouth: 9,
    teeth: 1,
    alarm: 0,
    think: 0,
    work: 0,
  },
  thinking: {
    open: 0.8,
    happy: 0,
    tilt: 0,
    width: 7,
    curve: -1,
    mouth: 5,
    teeth: 0,
    alarm: 0,
    think: 1,
    work: 0,
  },
  working: {
    open: 0.55,
    happy: 0,
    tilt: 0.35,
    width: 15,
    curve: 0,
    mouth: 3.5,
    teeth: 0.5,
    alarm: 0,
    think: 0,
    work: 1,
  },
  done: {
    open: 1,
    happy: 1,
    tilt: 0,
    width: 23,
    curve: 10,
    mouth: 11,
    teeth: 1,
    alarm: 0,
    think: 0,
    work: 0,
  },
  error: {
    open: 0.9,
    happy: 0,
    tilt: 1,
    width: 18,
    curve: -7,
    mouth: 8,
    teeth: 1,
    alarm: 1,
    think: 0,
    work: 0,
  },
};

const STATE_LABELS: Record<SpookyTvState, string> = {
  idle: "grinning",
  thinking: "thinking",
  working: "working",
  done: "happy because it is done",
  error: "angry because something went wrong",
};

const W = 200;
const H = 132;
const D = 104;
const SCREEN = { x0: -88, x1: 40, z0: 14, z1: 118 };
const YAW = (24 * Math.PI) / 180;
const PITCH = (28 * Math.PI) / 180;
const SCALE = 1.08;
const CENTER: Point = [190, 196];
const FACE_DEPTH = -0.6;
const EYE_X = 13;
const EYE_Y = 2;
const MOUTH_Y = 19;
const MOUTH_STEPS = 10;
const GAZE = { x: 3.5, y: 2.5 };

const cosA = Math.cos(YAW);
const sinA = Math.sin(YAW);
const cosE = Math.cos(PITCH);
const sinE = Math.sin(PITCH);

function project(x: number, y: number, z: number): Point {
  const u = x * cosA + y * sinA;
  const depth = -x * sinA + y * cosA;
  return [CENTER[0] + SCALE * u, CENTER[1] - SCALE * (z * cosE + depth * sinE)];
}

function roundedRect(x0: number, z0: number, x1: number, z1: number, r: number, steps = 6) {
  const radius = Math.min(r, (x1 - x0) / 2, (z1 - z0) / 2);
  const corners = [
    [x1 - radius, z1 - radius, 0],
    [x0 + radius, z1 - radius, 90],
    [x0 + radius, z0 + radius, 180],
    [x1 - radius, z0 + radius, 270],
  ];
  const points: Point[] = [];
  for (const [cx, cz, start] of corners) {
    for (let i = 0; i <= steps; i++) {
      const angle = ((start + (90 * i) / steps) * Math.PI) / 180;
      points.push([cx + radius * Math.cos(angle), cz + radius * Math.sin(angle)]);
    }
  }
  return points;
}

function circle(cx: number, cz: number, r: number, steps = 28) {
  return Array.from({ length: steps }, (_, i) => {
    const angle = (i / steps) * Math.PI * 2;
    return [cx + r * Math.cos(angle), cz + r * Math.sin(angle)] as Point;
  });
}

function hull(points: Point[]) {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Point, a: Point, b: Point) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Point[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper: Point[] = [];
  for (const p of sorted.reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

function closed(points: Point[]) {
  return `M${points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L")}Z`;
}

function line(a: Point, b: Point) {
  return `M${a[0].toFixed(2)} ${a[1].toFixed(2)}L${b[0].toFixed(2)} ${b[1].toFixed(2)}`;
}

function front(points: Point[], y = 0) {
  return points.map(([x, z]) => project(x, y, z));
}

function toRgb(hex: string) {
  return [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
}

function mixRgb(a: number[], b: number[], t: number) {
  return `rgb(${a.map((value, i) => Math.round(value + (b[i] - value) * t)).join(" ")})`;
}

function stepSpring(spring: Spring, dt: number, stiffness = 120, damping = 16) {
  const force = -stiffness * (spring.x - spring.t) - damping * spring.v;
  spring.v += force * dt;
  spring.x += spring.v * dt;
  if (Math.abs(spring.x - spring.t) < 0.001 && Math.abs(spring.v) < 0.001) {
    spring.x = spring.t;
    spring.v = 0;
    return false;
  }
  return true;
}

function pt(x: number, y: number) {
  return `${x.toFixed(2)} ${y.toFixed(2)}`;
}

function eyePath(cx: number, cy: number, side: number, face: Face, blink: number) {
  const w = 7;
  const h = 12 * Math.max(0.08, face.open * blink);
  const top = cy - h * 0.6;
  const base = cy + h * 0.4;
  const apexX = cx + side * w * face.tilt * 0.9;
  const apexY = top + face.tilt * h * 0.15;
  const notch = base - face.happy * h * 0.75;
  return `M${pt(apexX, apexY)}L${pt(cx + w, base)}L${pt(cx, notch)}L${pt(cx - w, base)}Z`;
}

function mouthPath(face: Face, shift: number) {
  const tooth = face.teeth * Math.min(face.mouth * 0.42, 4.5);
  const top: string[] = [];
  const bottom: string[] = [];
  for (let i = 0; i <= MOUTH_STEPS; i++) {
    const s = (2 * i) / MOUTH_STEPS - 1;
    const arc = 1 - s * s;
    const x = s * face.width + shift;
    const edge = MOUTH_Y + face.curve * (arc - 0.5);
    const inner = i > 0 && i < MOUTH_STEPS;
    top.push(pt(x, edge + (inner && i % 2 === 1 ? tooth : 0)));
    bottom.push(
      pt(x, edge + face.mouth * Math.sqrt(arc) - (inner && i % 4 === 2 ? tooth * 0.8 : 0)),
    );
  }
  return `M${top.join("L")}L${bottom.reverse().join("L")}Z`;
}

const BODY = (() => {
  const ring = roundedRect(-W / 2, 0, W / 2, H, 22, 8);
  const silhouette = hull(front(ring, 0).concat(front(ring, D)));
  const crease = front(roundedRect(-W / 2 + 4, 4, W / 2 - 4, H - 4, 18, 8), 0);
  const top = [project(-W / 2 + 16, D - 6, H), project(W / 2 - 16, D - 6, H)];
  return { silhouette: closed(silhouette), crease: closed(crease), top: line(top[0], top[1]) };
})();

const BEZEL = closed(
  front(roundedRect(SCREEN.x0 - 6, SCREEN.z0 - 6, SCREEN.x1 + 6, SCREEN.z1 + 6, 20, 8)),
);
const GLASS = closed(front(roundedRect(SCREEN.x0, SCREEN.z0, SCREEN.x1, SCREEN.z1, 16, 8), -0.5));

const SCREEN_TRANSFORM = (() => {
  const [e, f] = project(0, FACE_DEPTH, 0);
  const [ax, ay] = project(1, FACE_DEPTH, 0);
  const [cx, cy] = project(0, FACE_DEPTH, 1);
  const x = (SCREEN.x0 + SCREEN.x1) / 2;
  const z = (SCREEN.z0 + SCREEN.z1) / 2;
  const n = (value: number) => value.toFixed(4);
  return `matrix(${n(ax - e)} ${n(ay - f)} ${n(cx - e)} ${n(cy - f)} ${n(e)} ${n(f)}) translate(${x} ${z}) scale(1 -1)`;
})();

const FACE_CENTER = project(
  (SCREEN.x0 + SCREEN.x1) / 2,
  FACE_DEPTH,
  (SCREEN.z0 + SCREEN.z1) / 2 - 8,
);

const SCANLINES = Array.from({ length: 26 }, (_, i) => -52 + i * 4);

const LEGS = [
  [-1, 24],
  [1, 24],
  [-1, D - 24],
  [1, D - 24],
].map(([side, y]) => {
  const top = project(side * (W / 2 - 30), y, 0);
  const foot = project(side * (W / 2 - 18), y, -30);
  return { d: line(top, foot), foot };
});

const ANTENNA = [-1, 1].map((side) => {
  const base = project(side * 6, D * 0.55, H + 6);
  const tip = project(side * 62, D * 0.55 + 14, H + 96);
  return { d: line(base, tip), tip };
});

const ANTENNA_BASE = closed(
  hull(
    Array.from({ length: 20 }, (_, i) => {
      const angle = (i / 20) * Math.PI * 2;
      return [
        project(16 * Math.cos(angle), D * 0.55 + 12 * Math.sin(angle), H),
        project(8 * Math.cos(angle), D * 0.55 + 6 * Math.sin(angle), H + 9),
      ];
    }).flat(),
  ),
);

const KNOBS = [
  { cx: 66, cz: 94, r: 12 },
  { cx: 66, cz: 62, r: 9 },
].map(({ cx, cz, r }) => ({
  outer: closed(front(circle(cx, cz, r), -1)),
  inner: closed(front(circle(cx, cz, r * 0.45), -1.5)),
  mark: line(project(cx, -1.5, cz), project(cx + r * 0.7, -1.5, cz + r * 0.7)),
}));

const BOUNDS = (() => {
  const points: Point[] = [
    ...front(roundedRect(-W / 2, 0, W / 2, H, 22, 8), 0),
    ...front(roundedRect(-W / 2, 0, W / 2, H, 22, 8), D),
    ...ANTENNA.map((rod) => rod.tip),
    ...LEGS.map((leg) => leg.foot),
  ];
  const pad = 10;
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const x = Math.min(...xs) - pad;
  const y = Math.min(...ys) - pad;
  const width = Math.max(...xs) + pad - x;
  const height = Math.max(...ys) + pad - y;
  return {
    viewBox: `${x.toFixed(1)} ${y.toFixed(1)} ${width.toFixed(1)} ${height.toFixed(1)}`,
    ratio: width / height,
  };
})();

const GRILLE = Array.from({ length: 12 }, (_, i) =>
  project(56 + (i % 3) * 10, -0.5, 18 + Math.floor(i / 3) * 8),
);

const LOBES = [
  { cx: -17, cy: 9, rx: 26, ry: 31 },
  { cx: 17, cy: 9, rx: 26, ry: 31 },
  { cx: 0, cy: 8, rx: 24, ry: 33 },
];

const DOTS = [
  { cx: 31, cy: -28, r: 1.8 },
  { cx: 38, cy: -36, r: 2.4 },
  { cx: 47, cy: -44, r: 3.2 },
];

function SpookyTv({
  palette = "pumpkin",
  state = "idle",
  interactive = true,
  animate = true,
  className,
  style,
  ...props
}: SpookyTvProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const pumpkinRef = React.useRef<SVGGElement>(null);
  const faceRef = React.useRef<SVGGElement>(null);
  const eyeRefs = React.useRef<(SVGPathElement | null)[]>([]);
  const mouthRef = React.useRef<SVGPathElement>(null);
  const glowRef = React.useRef<SVGUseElement>(null);
  const lightRef = React.useRef<SVGCircleElement>(null);
  const dotRefs = React.useRef<(SVGCircleElement | null)[]>([]);
  const scanRef = React.useRef<SVGRectElement>(null);
  const pointerRef = React.useRef<Point | null>(null);
  const stateRef = React.useRef(state);
  const wakeRef = React.useRef<() => void>(() => {});
  const reduceMotion = useReducedMotion();
  const motionEnabled = animate && !reduceMotion;
  const colors = SPOOKY_TV_PALETTES[palette] ?? SPOOKY_TV_PALETTES.pumpkin;
  const tintRef = React.useRef({ face: toRgb(colors.face), alert: toRgb(colors.alert) });
  const id = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");

  React.useEffect(() => {
    stateRef.current = state;
    tintRef.current = { face: toRgb(colors.face), alert: toRgb(colors.alert) };
    wakeRef.current();
  });

  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const start = FACES[stateRef.current];
    const springs = Object.fromEntries(
      (Object.keys(start) as (keyof Face)[]).map((key) => [
        key,
        { x: start[key], v: 0, t: start[key] },
      ]),
    ) as Record<keyof Face, Spring>;
    const gaze = { x: { x: 0, v: 0, t: 0 }, y: { x: 0, v: 0, t: 0 } };
    const face = { ...start };
    let frame = 0;
    let last = 0;
    let visible = true;
    let blinkAt = -1;
    let nextBlink = performance.now() + 1800;

    const draw = (time: number) => {
      for (const key of Object.keys(springs) as (keyof Face)[]) face[key] = springs[key].x;
      let blink = 1;
      if (motionEnabled && blinkAt >= 0) {
        const u = (time - blinkAt) / 150;
        if (u >= 0 && u <= 1) blink = 1 - (1 - Math.abs(2 * u - 1)) * 0.92;
      }
      const gx = gaze.x.x;
      const gy = gaze.y.x;
      eyeRefs.current[0]?.setAttribute("d", eyePath(-EYE_X + gx, EYE_Y + gy, -1, face, blink));
      eyeRefs.current[1]?.setAttribute("d", eyePath(EYE_X + gx, EYE_Y + gy, 1, face, blink));
      mouthRef.current?.setAttribute("d", mouthPath(face, gx * 0.5));

      const tint = tintRef.current;
      faceRef.current?.setAttribute("fill", mixRgb(tint.face, tint.alert, face.alarm));
      const flicker = motionEnabled
        ? 0.86 +
          0.07 * Math.sin(time * 0.013) +
          0.04 * Math.sin(time * 0.031 + 1.3) +
          0.03 * Math.sin(time * 0.057 + 2.1)
        : 1;
      glowRef.current?.setAttribute("opacity", (0.75 * flicker).toFixed(3));
      lightRef.current?.setAttribute("opacity", (0.55 * flicker + 0.2 * face.alarm).toFixed(3));

      const burst = time % 1700 < 280 ? 1 : 0.12;
      const shake = motionEnabled ? face.alarm * burst * Math.sin(time * 0.11) * 1.8 : 0;
      pumpkinRef.current?.setAttribute("transform", `translate(${shake.toFixed(2)} 0)`);

      dotRefs.current.forEach((dot, i) => {
        const pulse = motionEnabled
          ? 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 0.006 - i * 1.1))
          : 1;
        dot?.setAttribute("opacity", (face.think * pulse).toFixed(3));
      });

      const scan = scanRef.current;
      if (scan) {
        const y = motionEnabled ? -64 + ((time * 0.045) % 128) : -6;
        scan.setAttribute("y", y.toFixed(2));
        scan.setAttribute("opacity", (face.work * 0.9).toFixed(3));
      }
    };

    const aim = (time: number) => {
      const current = stateRef.current;
      const pointer = pointerRef.current;
      let x = 0;
      let y = 0;
      if (current === "thinking") {
        x = GAZE.x * 0.85;
        y = -GAZE.y;
      } else if (current === "working") {
        x = motionEnabled ? Math.sin(time * 0.004) * GAZE.x : 0;
        y = GAZE.y * 0.4;
      } else if (pointer) {
        x = Math.max(-1, Math.min(1, (pointer[0] - FACE_CENTER[0]) / 70)) * GAZE.x;
        y = Math.max(-1, Math.min(1, (pointer[1] - FACE_CENTER[1]) / 70)) * GAZE.y;
      }
      gaze.x.t = x;
      gaze.y.t = y;
      const target = FACES[current];
      for (const key of Object.keys(springs) as (keyof Face)[]) springs[key].t = target[key];
    };

    const tick = (time: number) => {
      frame = 0;
      const dt = Math.max(0, Math.min(0.05, (time - last) / 1000));
      last = time;
      aim(time);
      if (motionEnabled && time >= nextBlink) {
        blinkAt = time;
        nextBlink = time + 2400 + Math.random() * 3400;
      }
      let moving = false;
      for (const spring of Object.values(springs)) {
        if (!motionEnabled) {
          spring.x = spring.t;
          spring.v = 0;
        } else if (stepSpring(spring, dt)) {
          moving = true;
        }
      }
      for (const spring of [gaze.x, gaze.y]) {
        if (!motionEnabled) {
          spring.x = spring.t;
          spring.v = 0;
        } else if (stepSpring(spring, dt, 260, 28)) {
          moving = true;
        }
      }
      draw(time);
      if ((moving || motionEnabled) && visible && !document.hidden) {
        frame = requestAnimationFrame(tick);
      }
    };

    const wake = () => {
      if (frame || !visible || document.hidden) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    observer.observe(svg);
    document.addEventListener("visibilitychange", wake);
    wakeRef.current = wake;
    draw(performance.now());
    wake();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", wake);
      wakeRef.current = () => {};
    };
  }, [motionEnabled]);

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!interactive) return;
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    pointerRef.current = [point.x, point.y];
    wakeRef.current();
  };

  const onPointerLeave = () => {
    pointerRef.current = null;
    wakeRef.current();
  };

  return (
    <div
      role="img"
      aria-label={`A retro TV showing a jack-o'-lantern that is ${STATE_LABELS[state] ?? STATE_LABELS.idle}`}
      className={cn("relative w-full max-w-md select-none", className)}
      style={{ aspectRatio: BOUNDS.ratio, ...style }}
      {...props}
    >
      <svg
        ref={svgRef}
        viewBox={BOUNDS.viewBox}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-full overflow-visible"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <defs>
          <clipPath id={`${id}-glass`}>
            <path d={GLASS} />
          </clipPath>
          <radialGradient id={`${id}-light`}>
            <stop offset="0" stopColor={colors.face} stopOpacity="0.55" />
            <stop offset="1" stopColor={colors.face} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-lobe`} cx="0.38" cy="0.32" r="0.8">
            <stop offset="0" stopColor={colors.body} />
            <stop offset="0.7" stopColor={colors.body} />
            <stop offset="1" stopColor={colors.rib} />
          </radialGradient>
          <linearGradient id={`${id}-scan`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={colors.face} stopOpacity="0" />
            <stop offset="1" stopColor={colors.face} stopOpacity="0.22" />
          </linearGradient>
          <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={colors.face} stopOpacity="0.1" />
            <stop offset="0.45" stopColor={colors.face} stopOpacity="0" />
          </linearGradient>
          <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.6" />
          </filter>
        </defs>

        {LEGS.map((leg, i) => (
          <g key={i}>
            <path d={leg.d} className="stroke-foreground" strokeWidth={2.4} />
            <circle cx={leg.foot[0]} cy={leg.foot[1]} r={2.2} className="fill-foreground" />
          </g>
        ))}

        <path d={BODY.silhouette} className="fill-background stroke-foreground" strokeWidth={1.6} />
        <path d={BODY.crease} className="stroke-foreground/30" strokeWidth={1.1} />
        <path d={BODY.top} className="stroke-foreground/20" strokeWidth={1.1} />

        <path d={ANTENNA_BASE} className="fill-background stroke-foreground" strokeWidth={1.3} />
        {ANTENNA.map((rod, i) => (
          <g key={i}>
            <path d={rod.d} className="stroke-foreground" strokeWidth={1.4} />
            <circle cx={rod.tip[0]} cy={rod.tip[1]} r={3.6} fill={colors.knobs[i]} />
          </g>
        ))}

        <path d={BEZEL} className="stroke-foreground/45" strokeWidth={1.2} />
        <path d={GLASS} fill={colors.screen} className="stroke-foreground" strokeWidth={1.4} />
        <g clipPath={`url(#${id}-glass)`}>
          <g transform={SCREEN_TRANSFORM}>
            {SCANLINES.map((y) => (
              <path key={y} d={`M-64 ${y}H64`} stroke={colors.face} strokeOpacity={0.05} />
            ))}
            <circle ref={lightRef} cx={0} cy={8} r={62} fill={`url(#${id}-light)`} />
            <g ref={pumpkinRef}>
              {LOBES.map((lobe, i) => (
                <ellipse
                  key={i}
                  {...lobe}
                  fill={`url(#${id}-lobe)`}
                  stroke={colors.rib}
                  strokeWidth={1.3}
                />
              ))}
              <path
                d="M-4 -22C-4 -30-3 -35-1 -38L5 -36C3 -32 3 -27 4 -22Z"
                fill={colors.stem}
                stroke={colors.rib}
                strokeWidth={1}
              />
              <path
                d="M4 -30C10 -35 17 -33 16 -27C15 -23 11 -24 12 -28"
                stroke={colors.stem}
                strokeWidth={1.3}
              />
              <use ref={glowRef} href={`#${id}-face`} filter={`url(#${id}-glow)`} />
              <g ref={faceRef} id={`${id}-face`} fill={colors.face}>
                <path
                  ref={(node) => {
                    eyeRefs.current[0] = node;
                  }}
                />
                <path
                  ref={(node) => {
                    eyeRefs.current[1] = node;
                  }}
                />
                <path d="M0 9L3.5 15L-3.5 15Z" />
                <path ref={mouthRef} />
              </g>
            </g>
            {DOTS.map((dot, i) => (
              <circle
                key={i}
                ref={(node) => {
                  dotRefs.current[i] = node;
                }}
                {...dot}
                fill={colors.face}
                opacity={0}
              />
            ))}
            <rect
              ref={scanRef}
              x={-64}
              width={128}
              height={12}
              fill={`url(#${id}-scan)`}
              opacity={0}
            />
          </g>
          <path d={GLASS} fill={`url(#${id}-sheen)`} />
        </g>

        {KNOBS.map((knob, i) => (
          <g key={i}>
            <path
              d={knob.outer}
              fill={colors.knobs[i]}
              className="stroke-foreground"
              strokeWidth={1.3}
            />
            <path
              d={knob.inner}
              className="fill-background/25 stroke-foreground/50"
              strokeWidth={1}
            />
            <path d={knob.mark} className="stroke-background" strokeWidth={1.6} />
          </g>
        ))}
        {GRILLE.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.6} className="fill-foreground/35" />
        ))}
      </svg>
    </div>
  );
}

SpookyTv.displayName = "SpookyTv";

export { SpookyTv };
