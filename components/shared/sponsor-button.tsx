import { Heart } from "lucide-react";

import { siteConfig } from "@/lib/config";

export function SponsorButton({ label = "Sponsor" }: { label?: string }) {
  return (
    <a
      href={siteConfig.links.sponsor}
      target="_blank"
      rel="noreferrer"
      className="border-border text-foreground hover:bg-secondary focus-visible:ring-ring inline-flex h-9 shrink-0 items-center justify-center gap-2 border px-4 text-sm font-medium whitespace-nowrap no-underline transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <Heart aria-hidden className="size-3.5 text-[#db2777] dark:text-[#f472b6]" />
      <span className="sponsor-gradient">{label}</span>
    </a>
  );
}
