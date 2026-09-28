import { cn } from "@/lib/utils";

interface CloverLogoProps {
  className?: string;
  size?: number;
}

export function CloverLogo({ className, size = 24 }: CloverLogoProps) {
  return (
    <img
      src="/icon.svg"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      alt="Clover"
      aria-hidden
    />
  );
}
