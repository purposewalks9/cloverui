import { Heart } from "lucide-react";

export function SponsorButton({ label = "Sponsor" }: { label?: string }) {
  return (
    <span
      aria-disabled="true"
      title="Coming soon"
      className="border-border text-muted-foreground inline-flex h-9 shrink-0 cursor-not-allowed items-center justify-center gap-2 border px-4 text-sm font-medium whitespace-nowrap opacity-60 select-none"
    >
      <Heart aria-hidden className="size-3.5" />
      {label}
    </span>
  );
}
