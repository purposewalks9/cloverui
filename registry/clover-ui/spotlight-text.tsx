"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";
import { RichText, type RichTextColor } from "@/registry/clover-ui/rich-text";

export type SpotlightTextColor = RichTextColor;

export interface SpotlightTextProps {
  items: string[];
  color?: SpotlightTextColor;
  interval?: number;
  duration?: number;
  className?: string;
  itemClassName?: string;
  pauseOnHover?: boolean;
}

function SpotlightText({
  items,
  color = "default",
  interval = 2200,
  duration = 0.45,
  className,
  itemClassName,
  pauseOnHover = true,
}: SpotlightTextProps) {
  const validItems = React.useMemo(() => items.filter((item) => item.trim().length > 0), [items]);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [width, setWidth] = React.useState<number | null>(null);
  const measureRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (validItems.length < 2 || paused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % validItems.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [interval, paused, validItems.length]);

  React.useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(validItems.length - 1, 0)));
  }, [validItems.length]);

  React.useLayoutEffect(() => {
    const element = measureRef.current;
    if (!element) return;

    const update = () => setWidth(element.getBoundingClientRect().width);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, [activeIndex, validItems]);

  if (validItems.length === 0) return null;

  const activeItem = validItems[activeIndex] ?? validItems[0];

  return (
    <motion.span
      className={cn(
        "relative inline-block overflow-hidden align-baseline leading-[inherit]",
        className,
      )}
      animate={{ width: width ?? "auto" }}
      transition={{ duration: Math.min(duration, 0.35), ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={pauseOnHover ? () => setPaused(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setPaused(false) : undefined}
    >
      <span
        ref={measureRef}
        aria-hidden="true"
        className="invisible inline-block font-semibold whitespace-nowrap"
      >
        {activeItem}
      </span>

      <AnimatePresence initial={false} mode="sync">
        <motion.span
          key={`${activeIndex}-${activeItem}`}
          className={cn("absolute inset-y-0 left-0 inline-block whitespace-nowrap", itemClassName)}
          initial={{ opacity: 0, x: "1em", filter: "blur(3px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: "-1em", filter: "blur(3px)" }}
          transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
        >
          <RichText color={color}>{activeItem}</RichText>
        </motion.span>
      </AnimatePresence>

      <span className="sr-only" aria-live="polite">
        {activeItem}
      </span>
    </motion.span>
  );
}

SpotlightText.displayName = "SpotlightText";

export { SpotlightText };
