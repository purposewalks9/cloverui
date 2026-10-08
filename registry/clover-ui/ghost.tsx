"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cva, type VariantProps } from "class-variance-authority";
import {
  AnimatePresence,
  animate as animateValue,
  motion,
  type MotionValue,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

const ghostVariants = cva("shrink-0 overflow-visible", {
  variants: {
    color: {
      lime: "[--ghost-top:var(--color-lime-300)] [--ghost-body:var(--color-lime-500)] [--ghost-line:var(--color-lime-900)]",
      white:
        "[--ghost-top:var(--color-white)] [--ghost-body:var(--color-zinc-300)] [--ghost-line:var(--color-zinc-900)]",
      pink: "[--ghost-top:var(--color-pink-300)] [--ghost-body:var(--color-pink-500)] [--ghost-line:var(--color-pink-900)]",
      peach:
        "[--ghost-top:var(--color-orange-300)] [--ghost-body:var(--color-orange-500)] [--ghost-line:var(--color-orange-900)]",
      lemon:
        "[--ghost-top:var(--color-yellow-200)] [--ghost-body:var(--color-yellow-400)] [--ghost-line:var(--color-yellow-900)]",
      mint: "[--ghost-top:var(--color-emerald-300)] [--ghost-body:var(--color-emerald-500)] [--ghost-line:var(--color-emerald-900)]",
      sky: "[--ghost-top:var(--color-sky-300)] [--ghost-body:var(--color-sky-500)] [--ghost-line:var(--color-sky-900)]",
      lilac:
        "[--ghost-top:var(--color-violet-300)] [--ghost-body:var(--color-violet-500)] [--ghost-line:var(--color-violet-900)]",
    },
    size: {
      sm: "size-12",
      md: "size-18",
      lg: "size-26",
    },
  },
  defaultVariants: {
    color: "lime",
    size: "md",
  },
});

export type GhostColor = NonNullable<VariantProps<typeof ghostVariants>["color"]>;
export type GhostSize = NonNullable<VariantProps<typeof ghostVariants>["size"]>;
export type GhostBoundary = "parent" | "page";
export type GhostWord = string | { hover?: string; press?: string };
export type GhostReaction = (target: Element, kind: "hover" | "press") => string | null | undefined;
export type GhostReactions = Record<string, GhostWord> | GhostReaction;

export interface GhostProps extends Omit<React.ComponentProps<"div">, "color"> {
  color?: GhostColor;
  size?: GhostSize;
  boundary?: GhostBoundary;
  thoughts?: boolean | string[];
  onStateChange?: (state: GhostState) => void;
  reactions?: GhostReactions;
  message?: string;
}

type GhostBodyProps = Omit<React.ComponentProps<"svg">, "color"> & {
  color?: GhostColor;
  size?: GhostSize;
  facing?: MotionValue<number>;
};

const sheet = (w: number) =>
  [
    "M515 632",
    "C470 632 445 668 438 720",
    "C430 780 432 850 420 900",
    `C410 935 ${385 - w * 4} ${950 + w * 3} ${362 - w * 6} ${968 + w * 4}`,
    `C390 ${985 + w * 2} 425 990 450 1000`,
    `C480 1012 ${500 + w * 4} 1040 ${520 + w * 6} 1075`,
    `C${540 + w * 8} 1110 ${575 + w * 12} 1125 ${612 + w * 16} ${1118 + w * 4}`,
    `C${592 + w * 10} 1104 ${585 + w * 6} 1080 600 1050`,
    "C615 1020 650 1000 680 960",
    "C665 935 650 900 645 860",
    "C640 800 600 760 595 720",
    "C588 668 560 632 515 632Z",
  ].join("");

const between = (min: number, max: number) => min + Math.random() * (max - min);

const DRIPS = [
  { cx: 452, cy: 1004, rx: 13, ry: 16, time: 2.8 },
  { cx: 560, cy: 1092, rx: 10, ry: 13, time: 3.4 },
  { cx: 650, cy: 990, rx: 11, ry: 14, time: 3.1 },
];

function GhostBody({ color, size, facing, className, ref, ...props }: GhostBodyProps) {
  const still = Boolean(useReducedMotion());
  const id = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const lookX = useSpring(0, { stiffness: 700, damping: 40 });
  const lookY = useSpring(0, { stiffness: 700, damping: 40 });
  const blink = useMotionValue(1);
  const turn = (v: number, near: boolean) =>
    near ? 1 + (Math.abs(v) / 10) * 0.08 : 1 - (Math.abs(v) / 10) * 0.3;
  const leftEye = useTransform(lookX, (v) => turn(v, v <= 0));
  const rightEye = useTransform(lookX, (v) => turn(v, v >= 0));
  const leftShift = useTransform(lookX, (v) => Math.max(0, v) * 0.3);
  const rightShift = useTransform(lookX, (v) => Math.min(0, v) * 0.3);

  const setRef = (node: SVGSVGElement | null) => {
    svgRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  React.useEffect(() => {
    if (still) return;
    let lastMove = 0;
    let glance = 0;
    let blinking = 0;
    let running: ReturnType<typeof animateValue> | null = null;

    const onMove = (event: PointerEvent) => {
      const box = svgRef.current?.getBoundingClientRect();
      if (!box) return;
      const dx = event.clientX - (box.left + box.width * 0.48);
      const dy = event.clientY - (box.top + box.height * 0.22);
      const reach = Math.min(1, Math.hypot(dx, dy) / (box.width * 1.5));
      const angle = Math.atan2(dy, dx);
      const side = (facing?.get() ?? 1) < 0 ? -1 : 1;
      lookX.set(Math.max(-10, Math.min(9, Math.cos(angle) * 15 * reach * side)));
      lookY.set(Math.sin(angle) * 10 * reach);
      lastMove = performance.now();
    };

    const look = () => {
      if (performance.now() - lastMove > 1600) {
        const center = Math.random() < 0.3;
        lookX.set(center ? 0 : between(-10, 9));
        lookY.set(center ? 0 : between(-8, 9));
      }
      glance = window.setTimeout(look, between(700, 2600));
    };

    const shut = () => {
      const twice = Math.random() < 0.2;
      running = animateValue(blink, twice ? [1, 0.08, 1, 0.08, 1] : [1, 0.08, 1], {
        duration: twice ? 0.38 : 0.18,
        ease: "easeInOut",
      });
      blinking = window.setTimeout(shut, between(2200, 6000));
    };

    window.addEventListener("pointermove", onMove);
    glance = window.setTimeout(look, between(400, 1200));
    blinking = window.setTimeout(shut, between(1500, 3500));

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.clearTimeout(glance);
      window.clearTimeout(blinking);
      running?.stop();
    };
  }, [still, lookX, lookY, blink, facing]);

  const ripple = { duration: 2.2, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <svg
      ref={setRef}
      aria-hidden
      viewBox="320 600 420 560"
      className={cn(ghostVariants({ color, size }), className)}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <defs>
        <clipPath id={`${id}-body`}>
          <path d={sheet(0)} />
        </clipPath>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--ghost-top)" />
          <stop offset="0.75" stopColor="var(--ghost-body)" />
        </linearGradient>
      </defs>
      <motion.g
        animate={still ? undefined : { y: [0, -14, 0], rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.g
          style={{ transformBox: "view-box", transformOrigin: "520px 1080px" }}
          animate={still ? undefined : { scaleX: [1, 1.035, 0.98, 1], scaleY: [1, 0.97, 1.02, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <g fill="var(--ghost-body)">
            {DRIPS.map((drip) => (
              <motion.ellipse
                key={drip.cx}
                cx={drip.cx}
                cy={drip.cy}
                rx={drip.rx}
                ry={drip.ry}
                animate={
                  still
                    ? undefined
                    : {
                        ry: [drip.ry, drip.ry * 1.9, drip.ry],
                        cy: [drip.cy, drip.cy + drip.ry * 0.9, drip.cy],
                      }
                }
                transition={{ duration: drip.time, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </g>
          <motion.path
            d={sheet(0)}
            fill={`url(#${id}-fill)`}
            animate={still ? undefined : { d: [sheet(0), sheet(1), sheet(-1), sheet(0)] }}
            transition={ripple}
          />
          <g clipPath={`url(#${id}-body)`}>
            <ellipse cx={612} cy={960} rx={10} ry={26} fill="white" opacity={0.35} />
            <motion.g style={{ x: lookX, y: lookY, scaleY: blink }}>
              <motion.g style={{ scaleX: leftEye, x: leftShift }}>
                <ellipse
                  cx={518}
                  cy={708}
                  rx={18}
                  ry={33}
                  fill="var(--ghost-line)"
                  transform="rotate(-4 518 708)"
                />
                <circle cx={524} cy={693} r={7} fill="white" />
              </motion.g>
              <motion.g style={{ scaleX: rightEye, x: rightShift }}>
                <ellipse
                  cx={561}
                  cy={706}
                  rx={18}
                  ry={33}
                  fill="var(--ghost-line)"
                  transform="rotate(4 561 706)"
                />
                <circle cx={567} cy={691} r={7} fill="white" />
              </motion.g>
            </motion.g>
          </g>
        </motion.g>
      </motion.g>
    </svg>
  );
}

const SIZES: Record<GhostSize, number> = { sm: 48, md: 72, lg: 104 };
const HEAD_X = 0.47;
const HEAD_TOP = 0.08;

const IDLE_THOUGHTS = ["hmm", "boo", "👻", "lalala", "nice"];
const GIGGLES = ["hehe", "missed", "nope", "heh", "boo"];
const CLICKABLE = ["ooh", "click", "shiny"];

const react = (reactions: GhostReactions | undefined, target: Element, kind: "hover" | "press") => {
  if (!reactions) return null;
  if (typeof reactions === "function") return reactions(target, kind);
  for (const [selector, word] of Object.entries(reactions)) {
    let match: Element | null = null;
    try {
      match = target.closest(selector);
    } catch {
      continue;
    }
    if (!match) continue;
    if (typeof word === "string") return word;
    return (kind === "press" ? word.press : word.hover) ?? word.hover ?? word.press ?? null;
  }
  return null;
};

const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];

const cloud = (() => {
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
    return [100 + Math.cos(angle) * 84, 60 + Math.sin(angle) * 46];
  });
  return (
    points
      .map(([px, py], i) => {
        const [nx, ny] = points[(i + 1) % points.length];
        const radius = Math.hypot(nx - px, ny - py) * 0.6;
        return `${i === 0 ? `M${px} ${py}` : ""}A${radius} ${radius} 0 0 1 ${nx} ${ny}`;
      })
      .join("") + "Z"
  );
})();

type Thought = { id: number; text: string; shift: number };

function ThoughtBubble({ thought, box }: { thought: Thought; box: number }) {
  const dots = [7, 5, 3.5];
  return (
    <motion.div
      className="absolute flex -translate-x-1/2 flex-col items-center"
      style={{ left: box * HEAD_X, bottom: box * (1 - HEAD_TOP) + 2, transformOrigin: "50% 100%" }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
    >
      <div className="relative px-6 py-5" style={{ translate: `${thought.shift}px 0` }}>
        <svg
          aria-hidden
          viewBox="0 0 200 120"
          preserveAspectRatio="none"
          className="fill-background stroke-foreground absolute inset-0 size-full overflow-visible"
        >
          <path d={cloud} strokeWidth={2} vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="text-foreground relative block text-sm font-medium whitespace-nowrap">
          {thought.text}
        </span>
      </div>
      {dots.map((dot, index) => (
        <motion.span
          key={dot}
          className="bg-background border-foreground mt-0.5 block shrink-0 rounded-full border-[1.5px]"
          style={{ width: dot, height: dot, translateX: (2 - index) * 2 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: (2 - index) * 0.06 }}
        />
      ))}
    </motion.div>
  );
}

export type GhostState = { thought: string | null; visible: boolean; hopping: boolean };

export type GhostApi = {
  state: GhostState;
  say: (word: string) => void;
  poof: () => void;
  visit: (target: Element | null, word?: string) => void;
  hide: () => void;
  show: () => void;
};

type GhostCommands = Omit<GhostApi, "state">;

const IDLE_STATE: GhostState = { thought: null, visible: true, hopping: false };

function createGhostStore() {
  let state = IDLE_STATE;
  let commands: Partial<GhostCommands> = {};
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (next: Partial<GhostState>) => {
      state = { ...state, ...next };
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    bind: (next: Partial<GhostCommands>) => {
      commands = next;
      return () => {
        if (commands === next) commands = {};
      };
    },
    run: <K extends keyof GhostCommands>(name: K, ...args: Parameters<GhostCommands[K]>) =>
      (commands[name] as ((...input: Parameters<GhostCommands[K]>) => void) | undefined)?.(...args),
  };
}

type GhostStore = ReturnType<typeof createGhostStore>;

const GhostContext = React.createContext<GhostStore | null>(null);

const ignore = () => () => {};
const idle = () => IDLE_STATE;

function useGhost(): GhostApi {
  const store = React.useContext(GhostContext);
  const state = React.useSyncExternalStore(store?.subscribe ?? ignore, store?.get ?? idle, idle);
  const commands = React.useMemo<GhostCommands>(
    () => ({
      say: (word) => store?.run("say", word),
      poof: () => store?.run("poof"),
      visit: (target, word) => store?.run("visit", target, word),
      hide: () => store?.run("hide"),
      show: () => store?.run("show"),
    }),
    [store],
  );
  return React.useMemo(() => ({ ...commands, state }), [commands, state]);
}

type GhostProviderProps = GhostProps & { ghost?: boolean };

function GhostProvider({ children, ghost = true, ...props }: GhostProviderProps) {
  const [store] = React.useState(createGhostStore);
  return (
    <GhostContext.Provider value={store}>
      {children}
      {ghost && <Ghost {...props} />}
    </GhostContext.Provider>
  );
}

function Ghost({
  color,
  size = "md",
  boundary = "page",
  thoughts = true,
  reactions,
  message,
  onStateChange,
  className,
  style,
  ...props
}: GhostProps) {
  const still = Boolean(useReducedMotion());
  const reactionsRef = React.useRef(reactions);
  const store = React.useContext(GhostContext);
  const onStateRef = React.useRef(onStateChange);
  const sayRef = React.useRef<((text: string, force?: boolean) => void) | null>(null);
  const messageRef = React.useRef(message);
  const layerRef = React.useRef<HTMLDivElement>(null);
  const anchorRef = React.useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = React.useState(false);
  const box = SIZES[size];
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const face = useSpring(1, { stiffness: 60, damping: 14 });
  const wiggle = useMotionValue(0);
  const squashX = useMotionValue(1);
  const squashY = useMotionValue(1);
  const shown = useMotionValue(1);
  const turnY = useTransform(() => (1 - face.get()) * 90);
  const [thought, setThought] = React.useState<Thought | null>(null);
  const ideas = Array.isArray(thoughts) && thoughts.length ? thoughts : IDLE_THOUGHTS;
  const ideasRef = React.useRef(ideas);
  const chattyRef = React.useRef(thoughts !== false);

  React.useEffect(() => {
    ideasRef.current = ideas;
    chattyRef.current = thoughts !== false;
    reactionsRef.current = reactions;
    onStateRef.current = onStateChange;
    messageRef.current = message;
  });

  React.useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => sayRef.current?.(message, true), 600);
    return () => window.clearTimeout(t);
  }, [message]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const layer = layerRef.current;
    if (!mounted || !layer) return;
    const edge = 8;
    const headroom = 72;
    const gap = box * 0.85;
    const comfort = box * 2.6;
    const area = () => layer.getBoundingClientRect();
    const pos = { x: 0, y: 0 };
    const place = (px: number, py: number) => {
      const { width, height } = area();
      pos.x = Math.min(width - box - edge, Math.max(edge, px));
      pos.y = Math.min(height - box - edge, Math.max(Math.min(headroom, height - box - edge), py));
      x.set(pos.x);
      y.set(pos.y);
    };

    const host = (boundary === "page" ? anchorRef.current : layer)?.parentElement;
    if (host) {
      const spot = host.getBoundingClientRect();
      const frame = area();
      place(
        spot.left + spot.width / 2 - frame.left - box / 2,
        spot.top + spot.height / 2 - frame.top - box / 2,
      );
    } else {
      place(area().width - box - 24, area().height - box - 24);
    }

    let current = IDLE_STATE;
    const publish = (next: Partial<GhostState>) => {
      current = { ...current, ...next };
      store?.set(next);
      onStateRef.current?.(current);
    };

    if (still) {
      const unbind = store?.bind({
        say: () => {},
        poof: () => {},
        visit: (target) => {
          if (!target) return;
          const spot = target.getBoundingClientRect();
          const frame = area();
          place(
            spot.left + spot.width / 2 - frame.left - box / 2,
            spot.top + spot.height / 2 - frame.top - box / 2,
          );
        },
        hide: () => {
          shown.set(0);
          publish({ visible: false });
        },
        show: () => {
          shown.set(1);
          publish({ visible: true });
        },
      });
      return () => unbind?.();
    }

    const running: ReturnType<typeof animateValue>[] = [];
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const t = window.setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
      return t;
    };
    let cursor: { x: number; y: number } | null = null;
    let pointer = { x: -1, y: -1 };
    let scrolling = 0;
    let settle = 0;
    let busy = false;
    let lastMove = 0;
    let hush = 0;
    let idle = 0;
    let lastSaid = 0;
    let lastText = "";
    let count = 0;
    let away = false;
    let guide: unknown = null;
    let dwell = 0;
    let shy = 0;
    const close = () =>
      !!cursor && Math.hypot(pos.x + box / 2 - cursor.x, pos.y + box / 2 - cursor.y) < box * 1.1;
    let hidden = false;

    const think = (next: Thought | null) => {
      setThought(next);
      publish({ thought: next?.text ?? null });
    };

    const say = (text: string, force = false) => {
      const now = performance.now();
      if (hidden || !chattyRef.current || (!force && now - lastSaid < 3500)) return;
      lastSaid = now;
      lastText = text;
      count += 1;
      const { width } = area();
      const half = (text.length * 7.5 + 60) / 2;
      const head = pos.x + box * HEAD_X + 12;
      const shift = 12 + Math.max(edge - (head - half), Math.min(0, width - edge - (head + half)));
      think({ id: count, text, shift });
      window.clearTimeout(hush);
      hush = window.setTimeout(() => think(null), 2600);
    };
    sayRef.current = say;

    const play = (value: typeof x, keyframes: number[], duration: number) =>
      new Promise<void>((resolve) => {
        running.push(
          animateValue(value, keyframes, { duration, ease: "easeInOut", onComplete: resolve }),
        );
      });

    const melt = () =>
      Promise.all([
        play(squashY, [1, 1.08, 0.25], 0.32),
        play(squashX, [1, 0.94, 1.35], 0.32),
        play(shown, [1, 1, 0], 0.32),
      ]);

    const pop = () =>
      Promise.all([
        play(squashY, [0.25, 1.15, 0.94, 1], 0.55),
        play(squashX, [1.35, 0.9, 1.04, 1], 0.55),
        play(shown, [0, 1, 1, 1], 0.55),
      ]);

    const beside = () => {
      if (!cursor) return { x: pos.x, y: pos.y };
      const { width } = area();
      const right = cursor.x + gap + box < width - edge;
      return { x: right ? cursor.x + gap : cursor.x - gap - box, y: cursor.y - gap * 0.9 };
    };

    const nearby = () => {
      const { width, height } = area();
      const from = cursor ?? { x: width / 2, y: height / 2 };
      for (let i = 0; i < 12; i++) {
        const angle = between(0, Math.PI * 2);
        const radius = between(box * 1.6, box * 2.4);
        const spot = {
          x: from.x + Math.cos(angle) * radius - box / 2,
          y: from.y + Math.sin(angle) * radius - box / 2,
        };
        if (
          spot.x > edge &&
          spot.x < width - box - edge &&
          spot.y > headroom &&
          spot.y < height - box - edge
        )
          return spot;
      }
      return beside();
    };

    const hop = async (to: { x: number; y: number }, line?: string) => {
      if (busy || hidden) return;
      busy = true;
      publish({ hopping: true });
      const carry = line ?? (performance.now() - lastSaid < 1500 ? lastText : undefined);
      think(null);
      await melt();
      place(to.x, to.y);
      if (cursor) face.jump(cursor.x < pos.x + box / 2 ? -1 : 1);
      await pop();
      busy = false;
      publish({ hopping: false });
      if (carry) say(carry, true);
      if (line) {
        running.push(
          animateValue(wiggle, [0, -9, 9, -7, 7, -4, 0], { duration: 0.6, ease: "easeInOut" }),
        );
      }
    };

    const check = () => {
      if (!cursor || busy || hidden) return;
      const far = Math.hypot(pos.x + box / 2 - cursor.x, pos.y + box / 2 - cursor.y) > comfort;
      if (far) hop(beside());
      else face.set(cursor.x < pos.x + box / 2 ? -1 : 1);
    };

    const onScroll = () => {
      scrolling = performance.now() + 300;
    };

    const onPointer = (event: PointerEvent) => {
      const moved = event.clientX !== pointer.x || event.clientY !== pointer.y;
      pointer = { x: event.clientX, y: event.clientY };
      if (event.type === "pointermove" && (!moved || performance.now() < scrolling)) return;
      const rect = area();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside) {
        if (cursor) {
          cursor = null;
          away = true;
          say("bye", true);
        }
        return;
      }
      cursor = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      lastMove = performance.now();

      if (!close()) {
        window.clearTimeout(shy);
        shy = 0;
      } else if (!shy) {
        shy = later(() => {
          shy = 0;
          if (close() && !busy && !hidden) hop(nearby(), pick(GIGGLES));
        }, 3000);
      }

      if (
        event.type === "pointerdown" &&
        !hidden &&
        cursor.x >= pos.x &&
        cursor.x <= pos.x + box &&
        cursor.y >= pos.y &&
        cursor.y <= pos.y + box
      ) {
        hop(nearby(), pick(GIGGLES));
        return;
      }

      const target = event.target instanceof Element ? event.target : null;
      const kind = event.type === "pointerdown" ? "press" : "hover";
      const marked = target?.closest("[data-ghost]") ?? null;
      const custom = target && !marked ? react(reactionsRef.current, target, kind) : null;
      const clickable =
        marked || custom ? null : (target?.closest("a, button, [role='button']") ?? null);
      const text = marked
        ? (kind === "press" && marked.getAttribute("data-ghost-press")) ||
          marked.getAttribute("data-ghost") ||
          "ooh"
        : custom;
      const key: unknown = text ?? clickable;
      if (kind === "press") {
        guide = key;
        window.clearTimeout(dwell);
        if (text || clickable) say(text ?? pick(["click", "boop", "tap"]), true);
      } else if (key !== guide) {
        guide = key;
        window.clearTimeout(dwell);
        if (text || clickable) {
          dwell = later(() => {
            if (guide !== key) return;
            if (text) say(text, true);
            else say(pick(CLICKABLE));
          }, 300);
        }
      }

      if (away) {
        away = false;
        say("yay", true);
      }

      window.clearTimeout(settle);
      settle = later(check, 350);
    };

    const daydream = () => {
      if (cursor && performance.now() - lastMove > 9000) say("zzz");
      else if (Math.random() < 0.2) say(pick(ideasRef.current));
      idle = window.setTimeout(daydream, between(3000, 5000));
    };

    const onResize = () => place(pos.x, pos.y);

    const unbind = store?.bind({
      say: (word) => {
        window.clearTimeout(dwell);
        say(word, true);
      },
      poof: () => hop(nearby(), pick(GIGGLES)),
      visit: (target, word) => {
        if (!target) return;
        const spot = target.getBoundingClientRect();
        const frame = area();
        hop(
          {
            x: spot.left + spot.width / 2 - frame.left - box / 2,
            y: spot.top + spot.height / 2 - frame.top - box / 2,
          },
          word,
        );
      },
      hide: async () => {
        if (hidden || busy) return;
        busy = true;
        think(null);
        await melt();
        hidden = true;
        busy = false;
        publish({ visible: false });
      },
      show: async () => {
        if (!hidden) return;
        hidden = false;
        busy = true;
        const spot = beside();
        place(spot.x, spot.y);
        await pop();
        busy = false;
        publish({ visible: true });
      },
    });

    window.addEventListener("pointermove", onPointer);
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    idle = window.setTimeout(daydream, 3000);
    if (!messageRef.current) later(() => say("boo", true), 1200);

    return () => {
      unbind?.();
      sayRef.current = null;
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.clearTimeout(idle);
      window.clearTimeout(hush);
      timers.forEach((t) => window.clearTimeout(t));
      running.forEach((animation) => animation.stop());
    };
  }, [mounted, still, box, boundary, store, x, y, face, wiggle, squashX, squashY, shown]);

  const layer = (
    <div
      ref={layerRef}
      aria-hidden
      className={cn(
        "pointer-events-none inset-0 z-50 overflow-visible",
        boundary === "page" ? "fixed" : "absolute",
        className,
      )}
      style={style}
      {...props}
    >
      <motion.div
        className="absolute top-0 left-0"
        style={{ x, y, width: box, height: box, perspective: box * 8 }}
      >
        <motion.div
          style={{
            rotateY: turnY,
            rotateZ: wiggle,
            scaleX: squashX,
            scaleY: squashY,
            opacity: shown,
            transformOrigin: "50% 100%",
          }}
        >
          <GhostBody color={color} size={size} facing={face} />
        </motion.div>
        <AnimatePresence>
          {thought && <ThoughtBubble key={thought.id} thought={thought} box={box} />}
        </AnimatePresence>
      </motion.div>
    </div>
  );

  if (boundary === "parent") return layer;
  return (
    <>
      <span ref={anchorRef} hidden />
      {mounted && createPortal(layer, document.body)}
    </>
  );
}

Ghost.displayName = "Ghost";
GhostProvider.displayName = "GhostProvider";

export { Ghost, GhostProvider, ghostVariants, useGhost };
