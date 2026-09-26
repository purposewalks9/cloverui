"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RichProgress } from "@/registry/clover-ui/rich-progress";
import { cn } from "@/lib/utils";
import type { ControlDef } from "@/lib/playground";
import { ColorField } from "./color-field";

interface ControlPanelProps {
  controls: ControlDef[];
  values: Record<string, unknown>;
  onChange: (prop: string, value: unknown) => void;
}

export function ControlPanel({ controls, values, onChange }: ControlPanelProps) {
  return (
    <div className="flex flex-col">
      {controls.map((control) => (
        <div key={control.prop} className="px-4 py-3.5">
          <Field
            control={control}
            value={values[control.prop]}
            values={values}
            onChange={(value, prop = control.prop) => onChange(prop, value)}
          />
        </div>
      ))}
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-sm font-normal text-muted-foreground">{children}</span>
  );
}

/**
 * Every option is listed up front (no dropdowns). Up to three options render as
 * a joined On/Off-style toggle; longer lists wrap as chips.
 */
function OptionGroup({
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
  const joined = options.length <= 3;

  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={label}
      className={
        joined
          ? "grid w-full overflow-hidden rounded-md"
          : "flex flex-wrap gap-1.5"
      }
      style={
        joined
          ? { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }
          : undefined
      }
    >
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "truncate text-xs font-medium transition-colors",
              joined
                ? cn("px-2.5 py-1.5", i > 0 && "border-l border-input")
                : "rounded-md border border-input px-2 py-1",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * A compact, wrapping grid of color swatches. Used instead of OptionGroup
 * whenever every option in a select carries a `swatch` hex, so picking a
 * color is a single tap on the color itself rather than reading a row of
 * text chips.
 */
function ColorSwatchGroup({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: { label: string; value: string; swatch: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={label}
      className="flex flex-wrap gap-2"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={opt.label}
            title={opt.label}
            onClick={() => onChange(opt.value)}
            className="group relative flex size-7 shrink-0 items-center justify-center rounded-full outline-none"
          >
            <span
              className={cn(
                "size-6 rounded-full border border-white/15 shadow-sm transition-transform duration-150",
                "group-hover:scale-110 group-focus-visible:scale-110",
                active && "scale-110",
              )}
              style={{ background: opt.swatch }}
            />
            {active && (
              <span
                className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-offset-2 ring-offset-background"
                style={{ ["--tw-ring-color" as string]: opt.swatch }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function Field({
  control,
  value,
  values,
  onChange,
}: {
  control: ControlDef;
  value: unknown;
  values: Record<string, unknown>;
  onChange: (value: unknown, prop?: string) => void;
}) {
  switch (control.type) {
    case "text":
      return (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={control.prop}>
            <FieldLabel>{control.label}</FieldLabel>
          </Label>
          <Input
            id={control.prop}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-full text-xs"
          />
        </div>
      );

    case "text-list":
      return (
        <div className="flex flex-col gap-3">
          <FieldLabel>{control.label}</FieldLabel>
          {control.items.map((item) => (
            <div key={item.prop} className="flex flex-col gap-1.5">
              <Label htmlFor={item.prop}>
                <FieldLabel>{item.label}</FieldLabel>
              </Label>
              <Input
                id={item.prop}
                value={(values[item.prop] as string) ?? ""}
                onChange={(e) => onChange(item.prop, e.target.value)}
                className="h-8 w-full text-xs"
              />
            </div>
          ))}
        </div>
      );

    case "boolean":
      return (
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={control.prop}>
            <FieldLabel>{control.label}</FieldLabel>
          </Label>
          <div
            id={control.prop}
            role="group"
            aria-label={control.label}
            className="inline-flex overflow-hidden rounded-md "
          >
            <button
              type="button"
              onClick={() => onChange(false)}
              aria-pressed={!value}
              className={cn(
                "px-2.5 py-1 text-xs font-medium transition-colors",
                !value
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              Off
            </button>
            <button
              type="button"
              onClick={() => onChange(true)}
              aria-pressed={Boolean(value)}
              className={cn(
                "border-l border-input px-2.5 py-1 text-xs font-medium transition-colors",
                value
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              On
            </button>
          </div>
        </div>
      );

    case "select": {
      const isPalette = control.options.every((opt) => Boolean(opt.swatch));

      if (isPalette) {
        const active = control.options.find((opt) => opt.value === value);
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <FieldLabel>{control.label}</FieldLabel>
              <span className="text-[11px] text-muted-foreground">
                {active?.label ?? ""}
              </span>
            </div>
            <ColorSwatchGroup
              id={control.prop}
              label={control.label}
              options={control.options as { label: string; value: string; swatch: string }[]}
              value={value as string}
              onChange={onChange}
            />
          </div>
        );
      }

      return (
        <div className="flex flex-col gap-2">
          <FieldLabel>{control.label}</FieldLabel>
          <OptionGroup
            id={control.prop}
            label={control.label}
            options={control.options}
            value={value as string}
            onChange={onChange}
          />
        </div>
      );
    }

    case "number": {
      const min = control.min ?? 0;
      const max = control.max ?? 100;
      const step = control.step ?? 1;
      const raw = typeof value === "number" ? value : min;
      const percent = max === min ? 0 : ((raw - min) / (max - min)) * 100;
      const decimals = step && step < 1 ? String(step).split(".")[1]?.length ?? 2 : 0;

      return (
        <RichProgress
          value={percent}
          onChange={(next) => {
            const mapped = min + (next / 100) * (max - min);
            const stepped = Math.round(mapped / step) * step;
            const clamped = Math.min(max, Math.max(min, stepped));
            onChange(Number(clamped.toFixed(decimals)));
          }}
          label={control.label}
          valueLabel={raw.toFixed(decimals)}
          size="sm"
          knob
        />
      );
    }

    case "color":
      return (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <FieldLabel>{control.label}</FieldLabel>
            <span className="font-mono text-[11px] text-muted-foreground">
              {(value as string) ?? ""}
            </span>
          </div>
          <ColorField value={value as string} onChange={onChange} bare />
        </div>
      );

    default:
      return null;
  }
}
