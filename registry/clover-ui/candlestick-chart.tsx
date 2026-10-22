"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const VIEWBOX_W = 640;
const VIEWBOX_H = 220;
const PAD_X = 0;
const PAD_Y_TOP = 24;
const PAD_Y_BOTTOM = 12;
const LINE_WIDTH = 2;
const TRANSITION = "160ms cubic-bezier(0.22, 1, 0.36, 1)";
const MIN_VISIBLE = 8;

const TOOLTIP_SHADOW = [
  "0 0 0 1px rgba(0, 0, 0, 0.04)",
  "0 1px 2px rgba(0, 0, 0, 0.04)",
  "0 4px 16px -4px rgba(0, 0, 0, 0.12)",
  "0 12px 32px -8px rgba(0, 0, 0, 0.08)",
].join(", ");
const DOT_SHADOW = "0 0 0 2px var(--background), 0 0 8px 2px rgba(0, 0, 0, 0.12)";

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface CandlestickChartProps {
  data: Candle[];
  name?: string;
  upColor?: string;
  downColor?: string;
  width?: number;
  formatValue?: (v: number) => React.ReactNode;
  defaultIndex?: number;
  defaultVisibleCount?: number;
  showXAxis?: boolean;
  animated?: boolean;
  tickCount?: number;
  bodyWidthRatio?: number;
  maxBodyWidth?: number;
  zoomable?: boolean;
  className?: string;
}

function CandlestickChart({
  data,
  name,
  upColor = "#22c55e",
  downColor = "#ef4444",
  width = 640,
  formatValue = (v) => v.toLocaleString(),
  defaultIndex,
  defaultVisibleCount,
  showXAxis = true,
  animated = true,
  tickCount = 6,
  bodyWidthRatio = 0.6,
  maxBodyWidth = 14,
  zoomable = true,
  className,
}: CandlestickChartProps) {
  const transition = animated ? TRANSITION : "0ms";
  const root = React.useRef<HTMLDivElement>(null);

  const initialVisible = Math.min(defaultVisibleCount ?? Math.min(100, data.length), data.length);

  const [rangeStart, setRangeStart] = React.useState(Math.max(0, data.length - initialVisible));

  const [visibleCount, setVisibleCount] = React.useState(initialVisible);
  const [containerWidth, setContainerWidth] = React.useState(width);

  const [activeLocalIndex, setActiveLocalIndex] = React.useState(
    defaultIndex !== undefined
      ? Math.max(0, Math.min(defaultIndex, initialVisible - 1))
      : initialVisible - 1,
  );
  const [seenLength, setSeenLength] = React.useState(data.length);
  if (seenLength !== data.length) {
    setSeenLength(data.length);
    if (visibleCount === 0 && initialVisible > 0) {
      setVisibleCount(initialVisible);
      setRangeStart(Math.max(0, data.length - initialVisible));
      setActiveLocalIndex(
        defaultIndex === undefined
          ? initialVisible - 1
          : Math.max(0, Math.min(defaultIndex, initialVisible - 1)),
      );
    } else {
      setRangeStart((start) => Math.max(0, Math.min(start, data.length - visibleCount)));
    }
  }

  const [isDragging, setIsDragging] = React.useState(false);

  const dragState = React.useRef<{
    startX: number;
    startRange: number;
  } | null>(null);

  const rafRef = React.useRef<number | null>(null);
  const dragRafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      if (dragRafRef.current !== null) {
        cancelAnimationFrame(dragRafRef.current);
      }
    };
  }, []);

  const clampRange = React.useCallback(
    (start: number, count: number) => {
      const c = Math.max(
        Math.min(MIN_VISIBLE, data.length),
        Math.min(Math.round(count), data.length),
      );

      const s = Math.max(0, Math.min(start, data.length - c));

      return { start: s, count: c };
    },
    [data.length],
  );

  const visibleData = React.useMemo(
    () => data.slice(rangeStart, rangeStart + visibleCount),
    [data, rangeStart, visibleCount],
  );
  const hasVisibleData = visibleData.length > 0;

  React.useEffect(() => {
    if (!root.current) return;

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerWidth(w);
    });

    ro.observe(root.current);

    return () => ro.disconnect();
  }, [hasVisibleData]);

  const { candles, colWidth } = React.useMemo(() => {
    const n = visibleData.length;

    if (n === 0) {
      return { candles: [], colWidth: 0 };
    }

    const allLows = visibleData.map((d) => d.low);
    const allHighs = visibleData.map((d) => d.high);

    const minV = Math.min(...allLows);
    const maxV = Math.max(...allHighs);
    const range = maxV - minV || 1;

    const innerW = VIEWBOX_W - 2 * PAD_X;
    const innerH = VIEWBOX_H - PAD_Y_TOP - PAD_Y_BOTTOM;
    const col = innerW / n;

    const toY = (v: number) => PAD_Y_TOP + (1 - (v - minV) / range) * innerH;

    const mapped = visibleData.map((d, i) => {
      const cx = PAD_X + (i + 0.5) * col;
      const isUp = d.close >= d.open;
      const yOpen = toY(d.open);
      const yClose = toY(d.close);

      return {
        ...d,
        index: i,
        cx,
        isUp,
        yHigh: toY(d.high),
        yLow: toY(d.low),
        yClose,
        bodyTop: Math.min(yOpen, yClose),
        bodyHeight: Math.max(1, Math.abs(yClose - yOpen)),
      };
    });

    return { candles: mapped, colWidth: col };
  }, [visibleData]);

  const active = candles[Math.max(0, Math.min(activeLocalIndex, candles.length - 1))] ?? candles[0];

  const activeXPct = active ? active.cx / VIEWBOX_W : 0;
  const activeYPct = active ? active.yClose / VIEWBOX_H : 0;

  const handleHover = React.useCallback(
    (clientX: number) => {
      if (!root.current || candles.length === 0 || colWidth === 0) return;

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        if (!root.current) return;

        const rect = root.current.getBoundingClientRect();
        const relPx = (clientX - rect.left) / rect.width;
        const relSvgX = relPx * VIEWBOX_W;

        const idx = Math.floor((relSvgX - PAD_X) / colWidth);

        setActiveLocalIndex(Math.max(0, Math.min(candles.length - 1, idx)));
      });
    },
    [candles.length, colWidth],
  );

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!zoomable || e.button !== 0) return;

    dragState.current = {
      startX: e.clientX,
      startRange: rangeStart,
    };

    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (dragState.current && root.current && colWidth > 0) {
      const dxPx = e.clientX - dragState.current.startX;
      const dxSvg = (dxPx / root.current.getBoundingClientRect().width) * VIEWBOX_W;
      const dCandles = -(dxSvg / colWidth);

      const { start } = clampRange(dragState.current.startRange + dCandles, visibleCount);

      if (dragRafRef.current !== null) {
        cancelAnimationFrame(dragRafRef.current);
      }

      dragRafRef.current = requestAnimationFrame(() => {
        setRangeStart(Math.round(start));
      });

      return;
    }

    handleHover(e.clientX);
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (dragState.current) {
      dragState.current = null;
      setIsDragging(false);

      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    }
  }

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (!zoomable || !root.current) return;

    e.preventDefault();

    const rect = root.current.getBoundingClientRect();
    const relPx = (e.clientX - rect.left) / rect.width;

    const zoomFactor = e.deltaY > 0 ? 1.12 : 1 / 1.12;
    const newCount = visibleCount * zoomFactor;

    const cursorIndexInWindow = relPx * visibleCount;
    const cursorAbsIndex = rangeStart + cursorIndexInWindow;

    const { start, count } = clampRange(cursorAbsIndex - relPx * newCount, newCount);

    setVisibleCount(count);
    setRangeStart(start);
  }

  const axisVisible = showXAxis && candles.length > 0;

  const tickIndices = React.useMemo(() => {
    if (!axisVisible) return [];

    const n = candles.length;
    const maxFit = Math.max(2, Math.floor(containerWidth / 88));
    const count = Math.min(tickCount, maxFit, n);

    if (count <= 1) return [0];

    return Array.from({ length: count }, (_, i) => Math.round((i * (n - 1)) / (count - 1)));
  }, [axisVisible, candles.length, tickCount, containerWidth]);

  if (candles.length === 0 || !active) return null;

  const bw = Math.min(colWidth * bodyWidthRatio, maxBodyWidth);
  const activeColor = active.isUp ? upColor : downColor;

  return (
    <div
      style={
        {
          maxWidth: width,
          "--chart-up": upColor,
          "--chart-down": downColor,
        } as React.CSSProperties
      }
      className={cn(
        "w-full select-none",
        "[--spell-line:#c7c7c7]",
        "dark:[--spell-line:#4f4f4f]",
        className,
      )}
    >
      <div
        ref={root}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
        className={cn(
          "relative aspect-[640/220] w-full touch-none",
          zoomable && (isDragging ? "cursor-grabbing" : "cursor-grab"),
        )}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          fill="none"
          preserveAspectRatio="xMidYMid meet"
          style={{
            overflow: "visible",
            shapeRendering: "geometricPrecision",
          }}
        >
          {candles.map((c) => {
            const color = c.isUp ? upColor : downColor;

            return (
              <g key={rangeStart + c.index}>
                <line
                  x1={c.cx}
                  x2={c.cx}
                  y1={c.yHigh}
                  y2={c.yLow}
                  stroke={color}
                  strokeWidth={1.4}
                  strokeLinecap="round"
                />

                <rect
                  x={c.cx - bw / 2}
                  y={c.bodyTop}
                  width={bw}
                  height={c.bodyHeight}
                  rx={Math.min(1.5, bw / 4)}
                  fill={color}
                />
              </g>
            );
          })}
        </svg>

        {!isDragging &&
          (() => {
            const cursorPx = activeXPct * containerWidth;
            const containerHeight = (containerWidth * VIEWBOX_H) / VIEWBOX_W;
            const cursorYpx = activeYPct * containerHeight;
            const tooltipOnLeft = activeXPct > 0.5;

            return (
              <>
                <div
                  className="pointer-events-none absolute left-0 rounded-full bg-[var(--spell-line)]"
                  style={{
                    width: LINE_WIDTH,
                    top: `${(PAD_Y_TOP / VIEWBOX_H) * 100}%`,
                    height: `${((VIEWBOX_H - PAD_Y_TOP - PAD_Y_BOTTOM / 2) / VIEWBOX_H) * 100}%`,
                    transform: `translate3d(${cursorPx - LINE_WIDTH / 2}px, 0, 0)`,
                    transition: `transform ${transition}`,
                    willChange: "transform",
                  }}
                />

                <div
                  className="pointer-events-none absolute top-0 left-0 z-10 size-3 rounded-full"
                  style={{
                    background: activeColor,
                    transform: `translate3d(${cursorPx - 6}px, ${cursorYpx - 6}px, 0)`,
                    boxShadow: DOT_SHADOW,
                    transition: `transform ${transition}`,
                    willChange: "transform",
                  }}
                />

                <div
                  className="bg-background pointer-events-none absolute top-0 left-0 z-20 grid min-w-36 items-start gap-1 rounded-lg px-2.5 py-1.5 text-xs"
                  style={{
                    transform: tooltipOnLeft
                      ? `translate3d(calc(${cursorPx}px - 100% - 12px), calc(${cursorYpx}px - 50%), 0)`
                      : `translate3d(${cursorPx + 12}px, calc(${cursorYpx}px - 50%), 0)`,
                    transition: `transform ${transition}`,
                    willChange: "transform",
                    boxShadow: TOOLTIP_SHADOW,
                  }}
                >
                  <div className="text-foreground font-medium whitespace-nowrap">{active.time}</div>

                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ background: activeColor }}
                    />

                    {name && (
                      <span className="text-muted-foreground whitespace-nowrap">{name}</span>
                    )}
                  </div>

                  <div className="text-foreground grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono tabular-nums">
                    <span>O {formatValue(active.open)}</span>
                    <span>H {formatValue(active.high)}</span>
                    <span>L {formatValue(active.low)}</span>
                    <span>C {formatValue(active.close)}</span>
                  </div>
                </div>
              </>
            );
          })()}
      </div>

      {axisVisible && (
        <div className="relative mt-2 h-5">
          {tickIndices.map((i, tick) => {
            const c = candles[i];
            const xPct = (c.cx / VIEWBOX_W) * 100;
            const align = tick === 0 ? "0%" : tick === tickIndices.length - 1 ? "-100%" : "-50%";

            return (
              <div
                key={`${rangeStart}-${visibleCount}-${i}`}
                className="text-muted-foreground absolute top-0 text-[11px] leading-none whitespace-nowrap tabular-nums antialiased"
                style={{
                  left: `${xPct}%`,
                  transform: `translateX(${align})`,
                  transition: `left ${transition}, opacity ${transition}`,
                  willChange: "left",
                  fontVariantNumeric: "tabular-nums",
                  WebkitFontSmoothing: "antialiased",
                  MozOsxFontSmoothing: "grayscale",
                }}
              >
                {c.time}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { CandlestickChart };
