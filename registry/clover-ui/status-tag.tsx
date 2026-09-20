import * as React from "react";
import {
  CircleDashed,
  Contrast,
  Clock,
  Check,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "draft" | "in-progress" | "in-review" | "completed";

interface StatusTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: Status;
  /** Overrides the default label for this status (e.g. "Shipped" instead of "Completed"). */
  label?: string;
}

type StatusConfig = {
  label: string;
  icon: LucideIcon;
  bg: string;
  text: string;
  /** completed uses a filled circle + white check instead of an outline icon */
  solid?: boolean;
};

const statusMap: Record<Status, StatusConfig> = {
  draft: {
    label: "Draft",
    icon: CircleDashed,
    bg: "bg-zinc-100 dark:bg-zinc-800/70",
    text: "text-zinc-600 dark:text-zinc-300",
  },
  "in-progress": {
    label: "In-progress",
    icon: Contrast,
    bg: "bg-orange-50 dark:bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
  },
  "in-review": {
    label: "In-review",
    icon: Clock,
    bg: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
  },
  completed: {
    label: "Completed",
    icon: Check,
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    solid: true,
  },
};

/**
 * A compact status pill: shows just an icon at rest, and expands on hover
 * to reveal its label. Drop it anywhere — it's self-contained and doesn't
 * rely on a parent `group`, so it works standalone or nested inside cards
 * that already use their own hover groups.
 */
const StatusTag = React.forwardRef<HTMLSpanElement, StatusTagProps>(
  ({ status, label, className, ...props }, ref) => {
    const config = statusMap[status];
    const Icon = config.icon;

    return (
      <span
        ref={ref}
        className={cn(
          "group/tag inline-flex h-8 cursor-pointer items-center rounded-full",
          config.bg,
          className,
        )}
        {...props}
      >
        <span className="flex size-8 shrink-0 items-center justify-center">
          {config.solid ? (
            <span className="flex size-4.5 items-center justify-center rounded-full bg-emerald-600">
              <Icon className="size-3 text-white" strokeWidth={3} />
            </span>
          ) : (
            <Icon className={cn("size-4", config.text)} strokeWidth={2} />
          )}
        </span>

        <span
          className={cn(
            "max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-[max-width,opacity,padding-right] duration-300 ease-out group-hover/tag:max-w-[10rem] group-hover/tag:pr-3.5 group-hover/tag:opacity-100",
            config.text,
          )}
        >
          {label ?? config.label}
        </span>
      </span>
    );
  },
);

StatusTag.displayName = "StatusTag";

export { StatusTag };
export type { Status };