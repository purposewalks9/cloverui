import { cn } from "@/lib/utils";

interface CloverLogoProps {
  className?: string;
  size?: number;
}

export function CloverLogo({ className, size = 24 }: CloverLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      style={{ color: "var(--brand, currentColor)" }}
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
        fill="currentColor"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}
