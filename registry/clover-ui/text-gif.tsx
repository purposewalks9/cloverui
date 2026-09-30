"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextGifProps extends React.HTMLAttributes<HTMLSpanElement> {
  src: string;
  children: React.ReactNode;
  fallbackColor?: string;
}

const TextGif = React.forwardRef<HTMLSpanElement, TextGifProps>(
  ({ src, children, fallbackColor = "currentColor", className, style, ...props }, ref) => {
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
  },
);

TextGif.displayName = "TextGif";

export { TextGif };
