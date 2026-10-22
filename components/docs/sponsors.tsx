import Image from "next/image";
import { Heart } from "lucide-react";

import { SponsorButton } from "@/components/shared/sponsor-button";
import { getSponsors, type Sponsor } from "@/lib/sponsors";
import { cn } from "@/lib/utils";

export async function SponsorTiers() {
  const { tiers } = await getSponsors();

  if (!tiers.length) {
    return (
      <div className="not-prose my-6 flex flex-wrap items-center justify-between gap-4 border p-5">
        <p className="text-muted-foreground m-0 text-sm">
          Pick a monthly or one-time amount on GitHub Sponsors.
        </p>
        <SponsorButton label="Sponsor on GitHub" />
      </div>
    );
  }

  return (
    <div className="not-prose my-6 grid gap-3 sm:grid-cols-2">
      {tiers.map((tier) => (
        <div key={tier.id} className="flex flex-col gap-3 border p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="m-0 text-base font-semibold">{tier.name}</h3>
            <p className="text-muted-foreground m-0 shrink-0 text-sm whitespace-nowrap">
              <span className="text-foreground font-semibold">${tier.monthly}</span>
              {tier.oneTime ? " once" : " a month"}
            </p>
          </div>
          {tier.description && (
            <p className="text-muted-foreground m-0 line-clamp-4 flex-1 text-sm whitespace-pre-line">
              {tier.description}
            </p>
          )}
          <div>
            <SponsorButton />
          </div>
        </div>
      ))}
    </div>
  );
}

function Avatar({ sponsor, large }: { sponsor: Sponsor; large: boolean }) {
  const size = large ? 64 : 44;
  return (
    <a
      href={sponsor.url}
      target="_blank"
      rel="noreferrer"
      title={sponsor.tier ? `${sponsor.name} · ${sponsor.tier}` : sponsor.name}
      className="focus-visible:ring-ring flex w-20 flex-col items-center gap-2 text-center no-underline focus-visible:ring-2 focus-visible:outline-none"
    >
      <Image
        src={sponsor.avatarUrl}
        alt=""
        width={size}
        height={size}
        className={cn("bg-muted rounded-full border", large ? "size-16" : "size-11")}
      />
      <span className="text-muted-foreground w-full truncate text-xs">{sponsor.name}</span>
    </a>
  );
}

export async function SponsorWall() {
  const { sponsors } = await getSponsors();

  if (!sponsors.length) {
    return (
      <div className="not-prose my-6 flex flex-col items-center gap-4 border border-dashed p-8 text-center">
        <Heart aria-hidden className="size-5 text-[#db2777] dark:text-[#f472b6]" />
        <p className="text-muted-foreground m-0 text-sm">
          No public sponsors yet. Yours could be the first face here.
        </p>
        <SponsorButton label="Become a sponsor" />
      </div>
    );
  }

  const top = sponsors[0].monthly;

  return (
    <div className="not-prose my-6 flex flex-wrap gap-4">
      {sponsors.map((sponsor) => (
        <Avatar
          key={sponsor.login}
          sponsor={sponsor}
          large={sponsor.monthly > 0 && sponsor.monthly >= Math.max(25, top / 2)}
        />
      ))}
    </div>
  );
}
