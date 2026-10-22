import Image from "next/image";

import { SponsorButton } from "@/components/shared/sponsor-button";
import { getSponsors, type Sponsor } from "@/lib/sponsors";
import { cn } from "@/lib/utils";

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
