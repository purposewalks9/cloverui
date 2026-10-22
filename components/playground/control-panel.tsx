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

const MAX_SWATCHES = 5;

const SWATCHES_CLASS = "min-w-0 justify-end gap-2 overflow-x-auto p-1";

const TILE_WIDTH = 208;
const WIDE_TILE_WIDTH = 256;

function optionSpan(label: string, options: { label: string }[]) {
  const optionsWidth = options.reduce((total, option) => total + option.label.length * 6.5 + 24, 6);
  const needed = 36 + label.length * 7.5 + optionsWidth;
  if (needed <= TILE_WIDTH) return "";
  if (needed <= WIDE_TILE_WIDTH) return "@md:col-span-2 @3xl:col-span-1";
  if (needed <= TILE_WIDTH * 2) return "@md:col-span-2";
  return "col-span-full";
}

function limitSwatches<T extends { value: string }>(options: T[], value: unknown) {
  if (options.length <= MAX_SWATCHES) return options;
  const shown = options.slice(0, MAX_SWATCHES);
  const picked = options.find((option) => option.value === value);
  if (!picked || shown.includes(picked)) return shown;
  return [...shown.slice(0, MAX_SWATCHES - 1), picked];
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
      <ColorField value={value} onChange={onChange} />
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
  const span = optionSpan(label, options);
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
    <div className={cn(TILE_CLASS, "has-[:focus-visible]:ring-0", span, span && "flex-wrap py-2")}>
      <span id={`${id}-label`} className={cn(LABEL_CLASS, "shrink-0")}>
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        onKeyDown={onKeyDown}
        className={cn(
          "bg-foreground/[0.06] flex min-w-0 flex-wrap gap-0.5 p-0.5",
          span === "col-span-full" ? "w-full justify-start" : "justify-end",
        )}
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
                "focus-visible:ring-ring h-7 shrink-0 cursor-pointer rounded-none border px-2.5 text-xs whitespace-nowrap transition-colors outline-none focus-visible:ring-2",
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
      <div
        aria-hidden="true"
        className="bg-foreground/10 pointer-events-none absolute inset-y-0 left-0"
        style={{ width: `${percent}%` }}
      />
      <div
        aria-hidden="true"
        className="bg-foreground/60 pointer-events-none absolute inset-y-2.5 w-0.5"
        style={{ left: `calc(${percent}% - ${percent / 100} * 2px)` }}
      />
      <label htmlFor={id} className={cn(LABEL_CLASS, "pointer-events-none")}>
        {label}
      </label>
      <span className="text-foreground pointer-events-none relative shrink-0 text-sm tabular-nums">
        {value.toFixed(decimals)}
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(Number(e.target.value).toFixed(decimals)))}
        className="absolute inset-0 size-full cursor-ew-resize opacity-0"
      />
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
        const swatches = limitSwatches(control.options, value);
        return (
          <div className={TILE_CLASS}>
            <span className={cn(LABEL_CLASS, "shrink-0")}>{control.label}</span>
            <ColorSelector
              size="sm"
              colors={swatches.map((opt) => opt.value)}
              swatches={Object.fromEntries(
                swatches
                  .filter((opt) => opt.swatch)
                  .map((opt) => [opt.value, opt.swatch as string]),
              )}
              value={value as string}
              onColorSelect={onChange}
              className={SWATCHES_CLASS}
            />
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
