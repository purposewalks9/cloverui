"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ControlDef } from "@/lib/playground";
import { ColorField } from "@/components/playground/color-field";
import { ColorSelector } from "@/components/ui/color-selector";

interface ControlPanelProps {
  controls: ControlDef[];
  values: Record<string, unknown>;
  onChange: (prop: string, value: unknown) => void;
}

const TILE_CLASS =
  "border-border bg-background has-[:focus-visible]:ring-ring relative flex min-h-11 min-w-0 items-center justify-between gap-3 overflow-hidden rounded-none border px-3 has-[:focus-visible]:ring-2";

const LABEL_CLASS = "text-muted-foreground relative min-w-0 truncate text-sm whitespace-nowrap";

const SWATCHES_CLASS = "ml-auto w-max flex-nowrap gap-2 p-1";

const SELECTED = '[aria-checked="true"], [aria-pressed="true"]';

const FADE = 16;

function useScrollStrip(selection: unknown) {
  const ref = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [edges, setEdges] = React.useState({ start: false, end: false });

  React.useEffect(() => {
    const strip = ref.current;
    if (!strip) return;
    const node = strip;

    function measure() {
      const max = node.scrollWidth - node.clientWidth;
      setEdges({ start: node.scrollLeft > 1, end: node.scrollLeft < max - 1 });
    }

    function onWheel(event: WheelEvent) {
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      const max = node.scrollWidth - node.clientWidth;
      const next = node.scrollLeft + event.deltaY;
      if (
        max <= 0 ||
        (event.deltaY < 0 && node.scrollLeft <= 0) ||
        (event.deltaY > 0 && node.scrollLeft >= max)
      )
        return;
      event.preventDefault();
      node.scrollLeft = Math.min(max, Math.max(0, next));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    if (node.firstElementChild) observer.observe(node.firstElementChild);
    node.addEventListener("scroll", measure, { passive: true });
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      observer.disconnect();
      node.removeEventListener("scroll", measure);
      node.removeEventListener("wheel", onWheel);
    };
  }, []);

  React.useEffect(() => {
    const strip = ref.current;
    const picked = strip?.querySelector<HTMLElement>(SELECTED);
    if (!strip || !picked) return;
    const box = strip.getBoundingClientRect();
    const item = picked.getBoundingClientRect();
    const offset =
      item.left < box.left + FADE
        ? item.left - box.left - FADE
        : item.right > box.right - FADE
          ? item.right - box.right + FADE
          : 0;
    if (!offset) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    strip.scrollBy({ left: offset, behavior: reduce ? "auto" : "smooth" });
  }, [selection]);

  const scrollable = edges.start || edges.end;

  const stripProps = {
    ref,
    style: {
      maskImage: `linear-gradient(to right, ${edges.start ? "transparent" : "black"}, black ${FADE}px, black calc(100% - ${FADE}px), ${edges.end ? "transparent" : "black"})`,
    },
    onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
      if (!scrollable || event.pointerType !== "mouse" || event.button !== 0) return;
      drag.current = { x: event.clientX, left: event.currentTarget.scrollLeft, moved: false };
    },
    onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
      const state = drag.current;
      if (!state) return;
      const distance = event.clientX - state.x;
      if (!state.moved && Math.abs(distance) < 4) return;
      if (!state.moved) event.currentTarget.setPointerCapture(event.pointerId);
      state.moved = true;
      event.currentTarget.scrollLeft = state.left - distance;
    },
    onPointerUp() {
      if (drag.current && !drag.current.moved) drag.current = null;
    },
    onClickCapture(event: React.MouseEvent<HTMLDivElement>) {
      if (drag.current?.moved) {
        event.preventDefault();
        event.stopPropagation();
      }
      drag.current = null;
    },
  };

  return stripProps;
}

function ScrollStrip({ selection, children }: { selection: unknown; children: React.ReactNode }) {
  const stripProps = useScrollStrip(selection);

  return (
    <div
      {...stripProps}
      className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {children}
    </div>
  );
}

function isColorControl(control: ControlDef) {
  if (control.type === "color" || control.type === "color-list") return true;
  if (control.type !== "select") return false;
  return control.prop === "color" || control.options.every((opt) => Boolean(opt.swatch));
}

function controlRank(control: ControlDef) {
  if (isColorControl(control)) return 0;
  if (control.type === "select") return 1;
  if (control.type === "text" || control.type === "text-list") return 2;
  if (control.type === "number") return 5;
  return 4;
}

function isPatternControl(control: ControlDef) {
  return control.prop === "pattern" || control.prop === "theme";
}

function sortControls(controls: ControlDef[]) {
  return [...controls].sort(
    (a, b) =>
      controlRank(a) - controlRank(b) || Number(isPatternControl(b)) - Number(isPatternControl(a)),
  );
}

function ControlPanel({ controls, values, onChange }: ControlPanelProps) {
  return (
    <div className="@container">
      <div className="grid grid-flow-dense grid-cols-1 gap-2 @md:grid-cols-2 @3xl:grid-cols-3">
        {sortControls(controls).flatMap((control) => {
          if (control.type === "text-list") {
            return control.items.map((item) => (
              <TextTile
                key={item.prop}
                id={item.prop}
                label={item.label}
                value={values[item.prop] as string}
                onChange={(next) => onChange(item.prop, next)}
              />
            ));
          }
          if (control.type === "color-list") {
            return control.items.map((item) => (
              <ColorTile
                key={item.prop}
                label={item.label}
                value={values[item.prop] as string}
                onChange={(next) => onChange(item.prop, next)}
              />
            ));
          }
          return (
            <Tile
              key={control.prop}
              control={control}
              value={values[control.prop]}
              onChange={(next) => onChange(control.prop, next)}
            />
          );
        })}
      </div>
    </div>
  );
}

function TextTile({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={cn(TILE_CLASS, "has-[:focus-visible]:ring-0")}>
      <label htmlFor={id} className={cn(LABEL_CLASS, "shrink-0")}>
        {label}
      </label>
      <input
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="border-border bg-background text-foreground hover:border-foreground/30 focus-visible:border-foreground/40 focus-visible:ring-ring/40 h-7 w-full max-w-[65%] min-w-0 cursor-text rounded-none border px-2 text-sm transition-colors outline-none focus-visible:ring-2"
      />
    </div>
  );
}

function ColorTile({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={TILE_CLASS}>
      <span className={cn(LABEL_CLASS, "shrink-0")}>{label}</span>
      <ScrollStrip selection={value}>
        <ColorField value={value} onChange={onChange} />
      </ScrollStrip>
    </div>
  );
}

function SwitchTile({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className={TILE_CLASS}>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 cursor-pointer rounded-none border transition-colors outline-none",
          checked ? "border-foreground bg-foreground" : "border-border bg-background",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-3.5 rounded-none transition-transform duration-150",
            checked ? "bg-background translate-x-4" : "bg-muted-foreground",
          )}
        />
      </button>
    </div>
  );
}

function OptionsTile({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const selected = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (selected + step + options.length) % options.length;
    onChange(options[next].value);
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
  }

  return (
    <div className={cn(TILE_CLASS, "has-[:focus-visible]:ring-0")}>
      <span id={`${id}-label`} className={cn(LABEL_CLASS, "shrink-0")}>
        {label}
      </span>
      <ScrollStrip selection={value}>
        <div
          role="radiogroup"
          aria-labelledby={`${id}-label`}
          onKeyDown={onKeyDown}
          className="bg-foreground/[0.06] ml-auto flex w-max gap-0.5 p-0.5"
        >
          {options.map((option, index) => {
            const checked = index === selected;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={checked}
                tabIndex={checked ? 0 : -1}
                onClick={() => onChange(option.value)}
                className={cn(
                  "focus-visible:ring-ring h-7 shrink-0 cursor-pointer rounded-none border px-2.5 text-xs whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset",
                  checked
                    ? "border-border bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground border-transparent",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </ScrollStrip>
    </div>
  );
}

function SliderTile({
  id,
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const decimals = step < 1 ? (String(step).split(".")[1]?.length ?? 2) : 0;

  return (
    <div className={TILE_CLASS}>
      <label htmlFor={id} className={cn(LABEL_CLASS, "shrink-0")}>
        {label}
      </label>
      <div className="relative h-4 min-w-0 flex-1">
        <div
          aria-hidden="true"
          className="bg-foreground/15 absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2"
        >
          <div className="bg-foreground h-full" style={{ width: `${percent}%` }} />
        </div>
        <div
          aria-hidden="true"
          className="bg-foreground pointer-events-none absolute top-1/2 size-2.5 -translate-y-1/2"
          style={{ left: `calc(${percent}% - ${percent / 100} * 0.625rem)` }}
        />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(Number(e.target.value).toFixed(decimals)))}
          className="absolute inset-0 size-full cursor-default opacity-0"
        />
      </div>
      <span className="text-foreground min-w-[3ch] shrink-0 text-right text-sm tabular-nums">
        {value.toFixed(decimals)}
      </span>
    </div>
  );
}

function Tile({
  control,
  value,
  onChange,
}: {
  control: ControlDef;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (control.type) {
    case "text":
      return (
        <TextTile
          id={control.prop}
          label={control.label}
          value={value as string}
          onChange={onChange}
        />
      );

    case "boolean":
      return (
        <SwitchTile
          id={control.prop}
          label={control.label}
          checked={Boolean(value)}
          onChange={onChange}
        />
      );

    case "color":
      return <ColorTile label={control.label} value={value as string} onChange={onChange} />;

    case "select":
      if (isColorControl(control)) {
        return (
          <div className={TILE_CLASS}>
            <span className={cn(LABEL_CLASS, "shrink-0")}>{control.label}</span>
            <ScrollStrip selection={value}>
              <ColorSelector
                size="sm"
                colors={control.options.map((opt) => opt.value)}
                swatches={Object.fromEntries(
                  control.options
                    .filter((opt) => opt.swatch)
                    .map((opt) => [opt.value, opt.swatch as string]),
                )}
                value={value as string}
                onColorSelect={onChange}
                className={SWATCHES_CLASS}
              />
            </ScrollStrip>
          </div>
        );
      }
      return (
        <OptionsTile
          id={control.prop}
          label={control.label}
          options={control.options}
          value={value as string}
          onChange={onChange}
        />
      );

    case "number": {
      const min = control.min ?? 0;
      return (
        <SliderTile
          id={control.prop}
          label={control.label}
          min={min}
          max={control.max ?? 100}
          step={control.step ?? 1}
          value={typeof value === "number" ? value : min}
          onChange={onChange}
        />
      );
    }

    default:
      return null;
  }
}

export { ControlPanel };
