"use client";

import { motion } from "motion/react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export interface CycleListProps {
  /** The items that take turns being "active". */
  items: string[];

  /** Color of the idle track. */
  color?: string;

  /** Color the active item and the dot switch to. Defaults to green. */
  activeColor?: string;

  /** Color of items that aren't currently active. */
  mutedColor?: string;

  /** Small tilt applied to inactive items, in degrees. */
  itemRotation?: number;

  /** How far the arc bulges outward from the text, in pixels. */
  curvature?: number;

  /** Time each item stays active before moving to the next, in ms. */
  interval?: number;

  className?: string;
  listClassName?: string;
  itemClassName?: string;

  autoStart?: boolean;
  inView?: boolean;
  once?: boolean;

  onStart?: () => void;
  onChange?: (index: number) => void;
}

export interface CycleListRef {
  play: () => void;
  pause: () => void;
  reset: () => void;
}

const CycleList = forwardRef<CycleListRef, CycleListProps>(
  (
    {
      items,
      color = "#ffffff",
      activeColor = "#22C55E",
      mutedColor = "#71717a",
      itemRotation = 4,
      curvature = 26,
      interval = 1800,
      className,
      listClassName,
      itemClassName,
      autoStart = true,
      inView = false,
      once = true,
      onStart,
      onChange,
    },
    ref
  ) => {
    const [running, setRunning] = useState(!inView && autoStart);
    const [activeIndex, setActiveIndex] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const contentRef = useRef<HTMLUListElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const [trackHeight, setTrackHeight] = useState(0);
    const [dotPos, setDotPos] = useState({ x: 0, y: 0 });

    const clear = useCallback(() => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, []);

    const play = useCallback(() => {
      setRunning(true);
      onStart?.();
    }, [onStart]);

    const pause = useCallback(() => {
      setRunning(false);
      clear();
    }, [clear]);

    const reset = useCallback(() => {
      clear();
      setActiveIndex(0);
      setRunning(!inView && autoStart);
    }, [clear, inView, autoStart]);

    useImperativeHandle(ref, () => ({ play, pause, reset }), [play, pause, reset]);

    useEffect(() => {
      if (!running || items.length <= 1) return;

      timerRef.current = setInterval(() => {
        setActiveIndex((current) => {
          const next = (current + 1) % items.length;
          onChange?.(next);
          return next;
        });
      }, interval);

      return clear;
    }, [running, items.length, interval, clear, onChange]);

    const handleViewportEnter = useCallback(() => {
      if (once && running) return;
      play();
    }, [once, running, play]);

    // Measure the list so the arc's height always matches it exactly.
    useLayoutEffect(() => {
      const el = contentRef.current;
      if (!el) return;

      const measure = () => setTrackHeight(el.offsetHeight);
      measure();

      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }, [items.length]);

    // Walk the dot along the curve to match the active item's position.
    useEffect(() => {
      const path = pathRef.current;
      if (!path || trackHeight === 0) return;

      const total = path.getTotalLength();
      const percent =
        items.length > 1 ? activeIndex / (items.length - 1) : 0;
      const point = path.getPointAtLength(percent * total);

      setDotPos({ x: point.x, y: point.y });
    }, [activeIndex, trackHeight, items.length]);

    const trackWidth = curvature + 12;

    return (
      <motion.div
        className={cn("relative flex items-start gap-4", className)}
        viewport={{ once, margin: "-10% 0px -10% 0px" }}
        onViewportEnter={inView ? handleViewportEnter : undefined}
      >
        {/* Curved track + shifting dot — mirrored so the arc bulges the other way */}
        <svg
          width={trackWidth}
          height={trackHeight || 1}
          viewBox={`0 0 ${trackWidth} ${trackHeight || 1}`}
          className="shrink-0 overflow-visible"
        >
          <g transform={`scale(-1, 1) translate(${-trackWidth}, 0)`}>
            <path
              ref={pathRef}
              d={`M ${trackWidth - 4} 0 Q ${curvature - trackWidth} ${
                (trackHeight || 1) / 2
              } ${trackWidth - 4} ${trackHeight || 1}`}
              stroke={color}
              strokeOpacity={0.18}
              strokeWidth={1}
              fill="none"
            />
            <motion.circle
              r={5}
              fill={activeColor}
              animate={{ cx: dotPos.x, cy: dotPos.y }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </g>
        </svg>

        <ul
          ref={contentRef}
          className={cn("flex list-none flex-col gap-2.5", listClassName)}
        >
          {items.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <motion.li
                key={item}
                className={cn(
                  "origin-left text-xl font-medium tracking-tight sm:text-2xl",
                  itemClassName
                )}
                animate={{
                  color: isActive ? activeColor : mutedColor,
                  opacity: isActive ? 1 : 0.6,
                  x: isActive ? 6 : 0,
                  rotate: isActive ? 0 : itemRotation,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {item}
              </motion.li>
            );
          })}
        </ul>
      </motion.div>
    );
  }
);

CycleList.displayName = "CycleList";

export { CycleList };