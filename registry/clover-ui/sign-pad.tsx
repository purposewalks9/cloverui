"use client";

import * as React from "react";
import { Eraser, Signature } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SignPoint {
  x: number;
  y: number;
  w: number;
}

export type SignStroke = SignPoint[];

export interface SignPadValue {
  dataUrl: string;
  svg: string;
  width: number;
  height: number;
  strokes: SignStroke[];
}

export interface SignPadLabels {
  start: string;
  finish: string;
  done: string;
  title: string;
  hint: string;
  tooShort: string;
  edit: string;
  undo: string;
  clear: string;
  close: string;
}

export interface SignPadProps {
  onComplete?: (value: SignPadValue) => void;
  onCancel?: () => void;
  onChange?: (value: SignPadValue | null) => void;
  defaultValue?: SignPadValue | null;
  accent?: string;
  strokeWidth?: number;
  minInk?: number;
  labels?: Partial<SignPadLabels>;
  className?: string;
}

const DEFAULT_LABELS: SignPadLabels = {
  start: "Start signing",
  finish: "Done",
  done: "Signing done",
  title: "Sign",
  hint: "Sign here",
  tooShort: "That looks short. Sign a little more.",
  edit: "Edit signature",
  undo: "Undo last stroke",
  clear: "Clear signature",
  close: "Close",
};

type Phase = "idle" | "signing" | "done";

const f = (n: number) => Math.round(n * 100) / 100;

function edge(pts: { x: number; y: number }[]) {
  let d = "";

  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;

    d += `Q${f(pts[i].x)} ${f(pts[i].y)} ${f(mx)} ${f(my)}`;
  }

  const last = pts[pts.length - 1];

  return d + `L${f(last.x)} ${f(last.y)}`;
}

function outlinePath(stroke: SignStroke, s: number) {
  const n = stroke.length;

  if (n === 0) return "";

  const P = stroke.map((p) => ({
    x: p.x * s,
    y: p.y * s,
    r: Math.max((p.w * s) / 2, 0.3),
  }));

  if (n === 1) {
    const { x, y, r } = P[0];

    return `M${f(x - r)} ${f(y)}a${f(r)} ${f(r)} 0 1 0 ${f(
      r * 2,
    )} 0a${f(r)} ${f(r)} 0 1 0 ${f(-r * 2)} 0Z`;
  }

  const left: { x: number; y: number }[] = [];
  const right: { x: number; y: number }[] = [];

  for (let i = 0; i < n; i++) {
    const a = P[Math.max(0, i - 1)];
    const b = P[Math.min(n - 1, i + 1)];

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;

    const nx = -dy / len;
    const ny = dx / len;

    left.push({
      x: P[i].x + nx * P[i].r,
      y: P[i].y + ny * P[i].r,
    });

    right.push({
      x: P[i].x - nx * P[i].r,
      y: P[i].y - ny * P[i].r,
    });
  }

  const first = P[0];
  const last = P[n - 1];
  const rl = right[n - 1];
  const l0 = left[0];

  return (
    `M${f(l0.x)} ${f(l0.y)}` +
    edge(left) +
    `A${f(last.r)} ${f(last.r)} 0 0 0 ${f(rl.x)} ${f(rl.y)}` +
    edge(right.slice().reverse()) +
    `A${f(first.r)} ${f(first.r)} 0 0 0 ${f(l0.x)} ${f(l0.y)}Z`
  );
}

function inkLength(strokes: SignStroke[]) {
  let total = 0;

  for (const s of strokes) {
    for (let i = 1; i < s.length; i++) {
      total += Math.hypot(s[i].x - s[i - 1].x, s[i].y - s[i - 1].y);
    }
  }

  return total;
}

function cloneStrokes(strokes: SignStroke[]) {
  return strokes.map((s) => s.map((p) => ({ ...p })));
}

function exportSignature(strokes: SignStroke[], s: number, ink: string): SignPadValue {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;

  for (const stroke of strokes) {
    for (const p of stroke) {
      const r = p.w / 2;

      x0 = Math.min(x0, p.x - r);
      y0 = Math.min(y0, p.y - r);
      x1 = Math.max(x1, p.x + r);
      y1 = Math.max(y1, p.y + r);
    }
  }

  const pad = 10;

  const width = Math.ceil((x1 - x0) * s + pad * 2);
  const height = Math.ceil((y1 - y0) * s + pad * 2);

  const ox = -x0 * s + pad;
  const oy = -y0 * s + pad;

  const d = strokes.map((st) => outlinePath(st, s)).join("");

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">` +
    `<path transform="translate(${f(ox)} ${f(oy)})" d="${d}" fill="${ink}"/></svg>`;

  const scale = 3;
  const canvas = document.createElement("canvas");

  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.scale(scale, scale);
    ctx.translate(ox, oy);
    ctx.fillStyle = ink;

    for (const st of strokes) {
      ctx.fill(new Path2D(outlinePath(st, s)));
    }
  }

  return {
    dataUrl: canvas.toDataURL("image/png"),
    svg,
    width,
    height,
    strokes: cloneStrokes(strokes),
  };
}

function IconButton({
  label,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "border-input bg-background text-muted-foreground inline-flex size-8 items-center justify-center rounded-md border outline-none",
        "hover:bg-accent hover:text-foreground active:bg-muted",
        "focus-visible:ring-ring focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

interface PanelProps {
  initial: SignStroke[];
  ink: string;
  accent: string;
  strokeWidth: number;
  minInk: number;
  labels: SignPadLabels;
  onCancel: () => void;
  onFinish: (value: SignPadValue) => void;
}

function SigningPanel({
  initial,
  ink,
  accent,
  strokeWidth,
  minInk,
  labels,
  onCancel,
  onFinish,
}: PanelProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const strokesRef = React.useRef<SignStroke[]>(cloneStrokes(initial));
  const sizeRef = React.useRef({ w: 0, h: 0, dpr: 1 });
  const drawingRef = React.useRef<{ id: number; t: number } | null>(null);
  const rafRef = React.useRef<number | null>(null);

  const [stats, setStats] = React.useState(() => ({
    count: initial.length,
    length: inkLength(initial),
  }));

  const sync = React.useCallback(() => {
    setStats({
      count: strokesRef.current.length,
      length: inkLength(strokesRef.current),
    });
  }, []);

  const redraw = React.useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const { w, h, dpr } = sizeRef.current;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = ink;

    for (const stroke of strokesRef.current) {
      ctx.fill(new Path2D(outlinePath(stroke, w)));
    }
  }, [ink]);

  const schedule = React.useCallback(() => {
    if (rafRef.current != null) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      redraw();
      sync();
    });
  }, [redraw, sync]);

  React.useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const fit = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      sizeRef.current = { w, h, dpr };

      redraw();
    };

    fit();

    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    return () => ro.disconnect();
  }, [redraw]);

  React.useEffect(
    () => () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    },
    [],
  );

  const toLocal = (e: { clientX: number; clientY: number }) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();

    const sx = r.width / (c.offsetWidth || 1) || 1;
    const sy = r.height / (c.offsetHeight || 1) || 1;

    return {
      x: (e.clientX - r.left) / sx,
      y: (e.clientY - r.top) / sy,
    };
  };

  const addPoint = (ev: PointerEvent) => {
    const stroke = strokesRef.current[strokesRef.current.length - 1];
    const drawing = drawingRef.current;

    if (!stroke || !drawing) return;

    const { w } = sizeRef.current;
    const p = toLocal(ev);
    const last = stroke[stroke.length - 1];

    const dist = Math.hypot(p.x - last.x * w, p.y - last.y * w);

    if (dist < 1.2) return;

    const dt = Math.max(2, ev.timeStamp - drawing.t);

    drawing.t = ev.timeStamp;

    const speed = dist / dt;

    const target =
      ev.pointerType === "pen" && ev.pressure > 0
        ? strokeWidth * (0.55 + ev.pressure)
        : strokeWidth * (1.45 - Math.min(1, speed / 2.4));

    const width = last.w * w * 0.72 + target * 0.28;

    stroke.push({
      x: p.x / w,
      y: p.y / w,
      w: width / w,
    });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    e.currentTarget.setPointerCapture(e.pointerId);

    const { w } = sizeRef.current;
    const p = toLocal(e);

    strokesRef.current.push([
      {
        x: p.x / w,
        y: p.y / w,
        w: (strokeWidth * 0.9) / w,
      },
    ]);

    drawingRef.current = {
      id: e.pointerId,
      t: e.timeStamp,
    };

    schedule();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || drawingRef.current.id !== e.pointerId) {
      return;
    }

    const events = e.nativeEvent.getCoalescedEvents?.() ?? [];

    (events.length ? events : [e.nativeEvent]).forEach(addPoint);

    schedule();
  };

  const endStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || drawingRef.current.id !== e.pointerId) {
      return;
    }

    drawingRef.current = null;
    schedule();
  };

  const undo = () => {
    if (!strokesRef.current.length) return;

    strokesRef.current.pop();
    schedule();
  };

  const clear = () => {
    if (!strokesRef.current.length) return;

    strokesRef.current = [];
    redraw();
    sync();
  };

  const finish = () => {
    if (inkLength(strokesRef.current) < minInk) return;

    onFinish(exportSignature(strokesRef.current, sizeRef.current.w, ink));
  };

  const canFinish = inkLength(strokesRef.current) >= minInk;

  const fillPercent = Math.min(100, (stats.length / minInk) * 100);

  const latest = React.useRef({
    undo,
    finish,
    onCancel,
  });

  latest.current = {
    undo,
    finish,
    onCancel,
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      if (e.key === "Escape") {
        e.preventDefault();
        latest.current.onCancel();
      } else if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        latest.current.undo();
      } else if (mod && e.key === "Enter") {
        e.preventDefault();
        latest.current.finish();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      role="group"
      aria-label={labels.title}
      className="relative w-[17.5rem] max-w-[calc(100vw-2rem)]"
    >
      <div className="border-input bg-background relative mx-1.5 mt-1 h-32 overflow-hidden rounded-lg border dark:bg-zinc-950">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Signature area. Draw with your finger, pen or mouse."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          className="absolute inset-0 size-full cursor-crosshair touch-none"
        />
      </div>

      <div className="mx-1.5 mt-2 mb-1.5 flex gap-2">
        <button
          type="button"
          onClick={finish}
          disabled={!canFinish}
          className="focus-visible:ring-ring focus-visible:ring-offset-background relative inline-flex h-9 flex-1 items-center justify-center gap-2 overflow-hidden rounded-md border border-black/10 px-4 text-sm font-medium text-black transition-all outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-offset-2 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-40 dark:text-white"
          style={{
            backgroundColor: accent,
            backgroundImage: `linear-gradient(90deg, transparent 0%, transparent ${fillPercent}%, rgba(0,0,0,0.05) ${fillPercent}%, rgba(0,0,0,0.05) 100%)`,
          }}
        >
          <Signature className="size-4" strokeWidth={2} />
          {labels.finish}
        </button>

        <IconButton
          label={labels.clear}
          onClick={clear}
          disabled={stats.count === 0}
          className="size-9 shrink-0"
        >
          <Eraser className="size-4" strokeWidth={2.1} />
        </IconButton>
      </div>
    </div>
  );
}

const SignPad = React.forwardRef<HTMLDivElement, SignPadProps>(
  (
    {
      onComplete,
      onCancel,
      onChange,
      defaultValue = null,
      accent = "var(--brand, #e1e900)",
      strokeWidth = 3,
      minInk = 0.3,
      labels: labelOverrides,
      className,
    },
    ref,
  ) => {
    const labels = React.useMemo(
      () => ({
        ...DEFAULT_LABELS,
        ...labelOverrides,
      }),
      [labelOverrides],
    );

    const [signature, setSignature] = React.useState<SignPadValue | null>(defaultValue);

    const [phase, setPhase] = React.useState<Phase>(defaultValue ? "done" : "idle");

    const [resolvedInk, setResolvedInk] = React.useState("#111827");

    React.useEffect(() => {
      const root = document.documentElement;

      const updateInk = () => {
        setResolvedInk(root.classList.contains("dark") ? "#f5f5f5" : "#111827");
      };

      updateInk();

      const observer = new MutationObserver(updateInk);

      observer.observe(root, {
        attributes: true,
        attributeFilter: ["class"],
      });

      return () => observer.disconnect();
    }, []);

    const cancel = () => {
      setPhase(signature ? "done" : "idle");
      onCancel?.();
    };

    const finish = (value: SignPadValue) => {
      setSignature(value);
      setPhase("done");
      onChange?.(value);
      onComplete?.(value);
    };

    return (
      <div ref={ref} className={cn("text-foreground inline-flex items-center", className)}>
        {phase === "idle" && (
          <button
            type="button"
            onClick={() => setPhase("signing")}
            className="border-input bg-background text-foreground hover:bg-accent focus-visible:ring-ring inline-flex h-9 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium outline-none focus-visible:ring-1"
          >
            <Signature className="size-4" strokeWidth={2} />
            {labels.start}
          </button>
        )}

        {phase === "signing" && (
          <SigningPanel
            initial={signature?.strokes ?? []}
            ink={resolvedInk}
            strokeWidth={strokeWidth}
            minInk={minInk}
            accent={accent}
            labels={labels}
            onCancel={cancel}
            onFinish={finish}
          />
        )}

        {phase === "done" && (
          <button
            type="button"
            aria-label={labels.edit}
            onClick={() => setPhase("signing")}
            className="border-input bg-background text-foreground hover:bg-accent focus-visible:ring-ring inline-flex h-9 items-center gap-2 rounded-md border px-4 text-sm font-medium outline-none focus-visible:ring-1"
          >
            <Signature className="size-4" strokeWidth={2} />
            {labels.edit}
          </button>
        )}
      </div>
    );
  },
);

SignPad.displayName = "SignPad";

export { SignPad };
