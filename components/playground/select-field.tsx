"use client";

import * as React from "react";
import { Select } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectFieldOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  id: string;
  options: SelectFieldOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const SURFACE_CLASS = cn(
  "border border-transparent [background:linear-gradient(var(--popover),var(--popover))_padding-box,linear-gradient(180deg,var(--select-edge-top),var(--select-edge-mid)_50%,var(--select-edge-bottom))_border-box]",
  "[--select-edge-top:color-mix(in_oklab,var(--foreground)_22%,transparent)] [--select-edge-mid:color-mix(in_oklab,var(--foreground)_8%,transparent)] [--select-edge-bottom:color-mix(in_oklab,var(--foreground)_14%,transparent)]",
  "dark:[--select-edge-top:color-mix(in_oklab,var(--foreground)_34%,transparent)] dark:[--select-edge-mid:color-mix(in_oklab,var(--foreground)_9%,transparent)] dark:[--select-edge-bottom:color-mix(in_oklab,var(--foreground)_16%,transparent)]",
);

function SelectField({ id, options, value, onChange, className }: SelectFieldProps) {
  return (
    <Select.Root
      items={options}
      value={value}
      onValueChange={(next) => {
        if (typeof next === "string") onChange(next);
      }}
    >
      <Select.Trigger
        id={id}
        className={cn(
          "text-foreground focus-visible:ring-ring flex max-w-full min-w-0 cursor-pointer items-center gap-1 rounded-md py-1 pl-1.5 text-sm whitespace-nowrap outline-none focus-visible:ring-2",
          className,
        )}
      >
        <Select.Value className="truncate" />
        <Select.Icon className="text-muted-foreground flex shrink-0 transition-transform duration-150 data-[popup-open]:rotate-180">
          <ChevronDown className="size-3.5" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          side="bottom"
          align="end"
          sideOffset={8}
          alignItemWithTrigger={false}
          className="z-50 outline-none"
        >
          <Select.Popup
            className={cn(
              SURFACE_CLASS,
              "text-popover-foreground max-h-[var(--available-height)] min-w-40 origin-[var(--transform-origin)] overflow-y-auto rounded-2xl p-1 outline-none",
              "transition-[opacity,scale] duration-150 ease-out data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0 motion-reduce:transition-none",
            )}
          >
            <Select.List>
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="data-[highlighted]:bg-muted flex h-8 cursor-pointer items-center gap-2 rounded-xl px-2 text-sm whitespace-nowrap outline-none select-none data-[selected]:font-medium"
                >
                  <Select.ItemText className="flex-1 truncate">{option.label}</Select.ItemText>
                  <Select.ItemIndicator className="flex shrink-0">
                    <Check className="size-4" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

export { SelectField };
