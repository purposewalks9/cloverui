"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RichProgress } from "@/registry/clover-ui/rich-progress";
import { cn } from "@/lib/utils";
import type { ControlDef } from "@/lib/playground";
import { ColorField } from "@/components/garden/color-field";
import { ColorSelector } from "@/components/ui/color-selector";

interface ControlPanelProps {
  controls: ControlDef[];
  values: Record<string, unknown>;
  onChange: (prop: string, value: unknown) => void;
}

function isColorControl(control: ControlDef) {
  if (control.type === "color") return true;
  if (control.type !== "select") return false;
  return control.prop === "color" || control.options.every((opt) => Boolean(opt.swatch));
}

function controlGroup(control: ControlDef) {
  if (isColorControl(control)) return 0;
  if (control.type === "select") return 1;
  if (control.type === "text" || control.type === "text-list") return 2;
  if (control.type === "number") return 3;
  return 4;
}

function isPatternControl(control: ControlDef) {
  return control.prop === "pattern" || control.prop === "theme";
}

function groupControls(controls: ControlDef[]) {
  return [0, 1, 2, 3, 4]
    .map((rank) =>
      controls
        .filter((control) => controlGroup(control) === rank)
        .sort((a, b) => Number(isPatternControl(b)) - Number(isPatternControl(a))),
    )
    .filter((group) => group.length > 0);
}

export function ControlPanel({ controls, values, onChange }: ControlPanelProps) {
  const groups = groupControls(controls);

  return (
    <div className="divide-border/60 flex flex-col divide-y">
      {groups.map((group) => (
        <div
          key={group[0].prop}
          className={cn("flex flex-col px-4 py-4", group[0].type === "boolean" ? "gap-3" : "gap-4")}
        >
          {group.map((control) => (
            <Field
              key={control.prop}
              control={control}
              value={values[control.prop]}
              values={values}
              onChange={(value, prop = control.prop) => onChange(prop, value)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-muted-foreground text-sm font-normal">{children}</span>;
}

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
      className={joined ? "grid w-full overflow-hidden rounded-md" : "flex flex-wrap gap-1.5"}
      style={
        joined ? { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` } : undefined
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
                ? cn("px-2.5 py-1.5", i > 0 && "border-input border-l")
                : "border-input rounded-md border px-2 py-1",
              active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {opt.label}
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
            className="inline-flex overflow-hidden rounded-md"
          >
            <button
              type="button"
              onClick={() => onChange(false)}
              aria-pressed={!value}
              className={cn(
                "px-2.5 py-1 text-xs font-medium transition-colors",
                !value
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              Off
            </button>
            <button
              type="button"
              onClick={() => onChange(true)}
              aria-pressed={Boolean(value)}
              className={cn(
                "border-input border-l px-2.5 py-1 text-xs font-medium transition-colors",
                value ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              On
            </button>
          </div>
        </div>
      );

    case "select": {
      if (isColorControl(control)) {
        const active = control.options.find((opt) => opt.value === value);
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <FieldLabel>{control.label}</FieldLabel>
              <span className="text-muted-foreground text-[11px]">{active?.label ?? ""}</span>
            </div>
            <ColorSelector
              colors={control.options.map((opt) => opt.value)}
              swatches={Object.fromEntries(
                control.options
                  .filter((opt) => opt.swatch)
                  .map((opt) => [opt.value, opt.swatch as string]),
              )}
              value={value as string}
              onColorSelect={onChange}
              className="flex-wrap p-0.5"
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
      const decimals = step && step < 1 ? (String(step).split(".")[1]?.length ?? 2) : 0;

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
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <FieldLabel>{control.label}</FieldLabel>
            <span className="text-muted-foreground font-mono text-[11px] uppercase">
              {value as string}
            </span>
          </div>
          <ColorField value={value as string} onChange={onChange} />
        </div>
      );

    default:
      return null;
  }
}
