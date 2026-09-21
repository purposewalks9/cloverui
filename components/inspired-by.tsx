import Link from "next/link";
import Image from "next/image";

const TOM_TWITTER_URL = "https://x.com/tomm_ui";
const TOM_AVATAR_URL =
  "https://pbs.twimg.com/profile_images/1863135999087505408/5qjunahh_400x400.jpg";

export function InspiredBy() {
  return (
    <Link
      href={TOM_TWITTER_URL}
      target="_blank"
      rel="noreferrer"
      className="hidden sm:inline-flex h-8 shrink-0 items-center gap-2 rounded-full border border-input bg-background pl-2.5 pr-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
    >
      <span>Inspired by</span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/5 pl-2 pr-0.5 py-0.5 font-semibold text-foreground">
        tom
        <Image
          src={TOM_AVATAR_URL}
          alt="tom"
          width={20}
          height={20}
          className="rounded-full"
        />
      </span>
    </Link>
  );
}