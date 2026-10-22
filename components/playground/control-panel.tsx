"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
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
  "border-border bg-muted/40 focus-within:ring-ring relative flex min-h-11 min-w-0 items-center justify-between gap-3 overflow-hidden rounded-none border px-3 focus-within:ring-2";

const LABEL_CLASS = "text-muted-foreground relative min-w-0 truncate text-sm whitespace-nowrap";

function isColorControl(control: ControlDef) {
  if (control.type === "color" || control.type === "color-list") return true;
  if (control.type !== "select") return false;
  return control.prop === "color" || control.options.every((opt) => Boolean(opt.swatch));
}

function controlRank(control: ControlDef) {
  if (isColorControl(control)) return 0;
  if (control.type === "select") return 1;
  if (control.type === "text" || control.type === "text-list") return 2;
  if (control.type === "number") return 3;
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

function isWide(control: ControlDef) {
  return control.type === "select" && isColorControl(control) && control.options.length > 6;
}

function ControlPanel({ controls, values, onChange }: ControlPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
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
    <div className={TILE_CLASS}>
      <label htmlFor={id} className={cn(LABEL_CLASS, "shrink-0")}>
        {label}
      </label>
      <input
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="text-foreground min-w-0 flex-1 bg-transparent text-right text-sm outline-none"
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
    <div className={cn(TILE_CLASS, "flex-wrap py-2")}>
      <span className={LABEL_CLASS}>{label}</span>
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

function SelectTile({
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
  return (
    <div className={TILE_CLASS}>
      <label htmlFor={id} className={cn(LABEL_CLASS, "shrink-0")}>
        {label}
      </label>
      <div className="relative flex min-w-0 items-center">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-foreground [&>option]:bg-popover [&>option]:text-popover-foreground max-w-full min-w-0 cursor-pointer appearance-none truncate bg-transparent py-1 pr-5 text-right text-sm outline-none"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="text-muted-foreground pointer-events-none absolute right-0 size-3.5" />
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
        return (
          <div className={cn(TILE_CLASS, "flex-wrap py-2", isWide(control) && "sm:col-span-2")}>
            <span className={LABEL_CLASS}>{control.label}</span>
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
              className="flex-wrap justify-end gap-2 p-0.5"
            />
          </div>
        );
      }
      return (
        <SelectTile
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
