"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextGifProps extends React.HTMLAttributes<HTMLSpanElement> {
  ref?: React.Ref<HTMLSpanElement>;
  src: string;
  children: React.ReactNode;
  fallbackColor?: string;
}

function TextGif({
  ref,
  src,
  children,
  fallbackColor = "currentColor",
  className,
  style,
  ...props
}: TextGifProps) {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-block bg-clip-text text-transparent",
        "bg-cover bg-center bg-no-repeat",
        "selection:bg-foreground/10",
        className,
      )}
      style={{
        ...style,
        color: fallbackColor,
        backgroundColor: fallbackColor,
        backgroundImage: `url("${src}")`,
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      {...props}
    >
      {children}
    </span>
  );
}

export { TextGif };
