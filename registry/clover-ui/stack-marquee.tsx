"use client";

/* eslint-disable @next/next/no-img-element */

import * as React from "react";

import { cn } from "@/lib/utils";

export type StackMarqueeDirection = "left" | "right";
export type StackMarqueeLogo = { name: string } & (
  { icon: React.ReactNode; src?: never } | { src: string; icon?: never }
);

export interface StackMarqueeProps extends Omit<React.ComponentProps<"div">, "children"> {
  logos: StackMarqueeLogo[];
  speed?: number;
  direction?: StackMarqueeDirection;
  iconSize?: number;
  gap?: number;
  edgeWidth?: number;
  paused?: boolean;
  pauseOnHover?: boolean;
  label?: string;
}

function StackMarquee({
  logos,
  speed = 28,
  direction = "left",
  iconSize = 18,
  gap = 28,
  edgeWidth = 48,
  paused = false,
  pauseOnHover = true,
  label = "Agent tools",
  className,
  style,
  onMouseEnter,
  onMouseLeave,
  onFocusCapture,
  onBlurCapture,
  ...props
}: StackMarqueeProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const groupRef = React.useRef<HTMLDivElement>(null);
  const animationRef = React.useRef<Animation | null>(null);
  const phaseRef = React.useRef(0);
  const [layout, setLayout] = React.useState({ distance: 0, copies: 2 });
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [reduced, setReduced] = React.useState(true);
  const [visible, setVisible] = React.useState(true);
  const [hidden, setHidden] = React.useState(false);
  const size = Math.max(1, iconSize);
  const spacing = Math.max(0, gap);
  const stopped = paused || reduced || !visible || hidden || focused || (pauseOnHover && hovered);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduced(media.matches);
    const updateVisibility = () => setHidden(document.hidden);
    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (hostRef.current) observer.observe(hostRef.current);
    return () => {
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
      observer.disconnect();
    };
  }, [logos.length]);

  React.useEffect(() => {
    const host = hostRef.current;
    const group = groupRef.current;
    if (!host || !group) return;
    const measure = () => {
      const distance = group.getBoundingClientRect().width;
      const copies = distance > 0 ? Math.max(2, Math.ceil(host.clientWidth / distance) + 1) : 2;
      setLayout((previous) =>
        previous.distance === distance && previous.copies === copies
          ? previous
          : { distance, copies },
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    observer.observe(group);
    measure();
    return () => observer.disconnect();
  }, [logos.length, size, spacing]);

  React.useEffect(() => {
    const track = trackRef.current;
    if (!track || logos.length === 0 || layout.distance <= 0 || speed <= 0 || !track.animate)
      return;
    const distance = layout.distance;
    const duration = (distance / Math.max(0.1, speed)) * 1000;
    const positions = direction === "left" ? [0, -distance] : [-distance, 0];
    const animation = track.animate(
      positions.map((x) => ({ transform: `translate3d(${x}px, 0, 0)` })),
      { duration, iterations: Infinity, easing: "linear" },
    );
    animation.pause();
    animation.currentTime = phaseRef.current * duration;
    animationRef.current = animation;
    return () => {
      phaseRef.current = (Number(animation.currentTime ?? 0) % duration) / duration;
      animation.cancel();
      animationRef.current = null;
    };
  }, [layout.distance, speed, direction, logos.length]);

  React.useEffect(() => {
    const animation = animationRef.current;
    if (!animation) return;
    if (stopped) animation.pause();
    else animation.play();
  }, [stopped, layout.distance, speed, direction, logos.length]);

  if (logos.length === 0) return null;

  const width = `min(${Math.max(0, edgeWidth)}px, 25%)`;
  const mask = `linear-gradient(to right, transparent, black ${width}, black calc(100% - ${width}), transparent)`;

  return (
    <div
      ref={hostRef}
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cn(
        "text-foreground focus-visible:ring-ring w-full overflow-hidden py-4 outline-none focus-visible:ring-2",
        className,
      )}
      style={{ maskImage: mask, WebkitMaskImage: mask, ...style }}
      onMouseEnter={(event) => {
        setHovered(true);
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        setHovered(false);
        onMouseLeave?.(event);
      }}
      onFocusCapture={(event) => {
        setFocused(true);
        onFocusCapture?.(event);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        onBlurCapture?.(event);
      }}
      {...props}
    >
      <ul className="sr-only">
        {logos.map((logo, index) => (
          <li key={`${logo.name}-${index}`}>{logo.name}</li>
        ))}
      </ul>
      <div
        ref={trackRef}
        aria-hidden
        inert
        className="flex w-max items-center will-change-transform"
      >
        {Array.from({ length: layout.copies }, (_, copy) => (
          <div
            key={copy}
            ref={copy === 0 ? groupRef : undefined}
            className="flex shrink-0 items-center"
            style={{ gap: spacing, paddingRight: spacing }}
          >
            {logos.map((logo, index) => (
              <span
                key={`${logo.name}-${index}`}
                className="flex shrink-0 items-center justify-center [&_svg]:h-full [&_svg]:w-full"
                style={{ width: size, height: size }}
              >
                {logo.src ? (
                  <img
                    src={logo.src}
                    alt=""
                    width={size}
                    height={size}
                    draggable={false}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  logo.icon
                )}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

StackMarquee.displayName = "StackMarquee";

export { StackMarquee };
