import Image from "next/image";
import Link from "next/link";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Heart } from "lucide-react";
import { CloverLogo } from "@/components/icons/clover-logo";
import { siteConfig } from "@/lib/config";
import { getSponsors } from "@/lib/sponsors";

const focusClass =
  "focus-visible:ring-ring rounded-none transition-colors focus-visible:ring-2 focus-visible:outline-none";

const linkClass = `${focusClass} hover:text-foreground whitespace-nowrap`;

const xUsername = siteConfig.links.x.split("/").filter(Boolean).pop();

async function FooterSponsors() {
  const { sponsors } = await getSponsors();

  return (
    <div className="flex flex-col gap-3 md:items-end">
      <p className="text-foreground/70 text-xs font-medium tracking-wider uppercase">Sponsors</p>
      {sponsors.length ? (
        <ul className="flex flex-wrap gap-2 md:justify-end">
          {sponsors.slice(0, 12).map((sponsor) => (
            <li key={sponsor.login}>
              <a
                href={sponsor.url}
                target="_blank"
                rel="noreferrer"
                title={sponsor.name}
                className={`${focusClass} block rounded-full`}
              >
                <Image
                  src={sponsor.avatarUrl}
                  alt={sponsor.name}
                  width={32}
                  height={32}
                  className="bg-muted ring-foreground/10 size-8 rounded-full ring-1"
                />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <Link
          href="/docs/sponsors"
          className={`${focusClass} border-border hover:border-foreground/30 hover:text-foreground inline-flex h-10 items-center gap-2 border border-dashed px-4 whitespace-nowrap`}
        >
          <Heart aria-hidden className="size-3.5 shrink-0 text-[#db2777] dark:text-[#f472b6]" />
          Become the first sponsor
        </Link>
      )}
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-border text-muted-foreground w-full border-t text-sm">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 pt-10 pb-8 sm:px-6 md:grid-cols-[1fr_auto] md:items-start md:pt-12">
        <div className="flex max-w-sm flex-col gap-3">
          <Link
            href="/"
            className={`${focusClass} text-foreground inline-flex w-fit items-center gap-2 font-medium tracking-tight`}
          >
            <CloverLogo size={20} />
            {siteConfig.name}
          </Link>
          <p className="leading-relaxed text-pretty">
            Animated React components for Tailwind CSS. Free and open source.
          </p>
        </div>
        <FooterSponsors />
      </div>

      <div className="border-border border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 font-medium sm:px-6 md:flex-row md:items-center md:justify-between">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              Made with care by
              <Link
                href={siteConfig.links.x}
                target="_blank"
                rel="noreferrer"
                className={`${linkClass} text-foreground inline-flex items-center gap-1.5`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://unavatar.io/x/${xUsername}?v=2`}
                  alt=""
                  width={20}
                  height={20}
                  className="bg-muted ring-foreground/10 size-5 rounded-full object-cover ring-1"
                />
                Purpose
              </Link>
            </span>
            <span className="whitespace-nowrap">
              © {new Date().getFullYear()}. All rights reserved.
            </span>
          </p>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className={`${linkClass} text-foreground inline-flex items-center gap-1.5`}
            >
              <SiGithub size={14} aria-hidden className="shrink-0" />
              Open source
            </Link>
            <Link
              href={siteConfig.links.sponsor}
              target="_blank"
              rel="noreferrer"
              className={`${linkClass} inline-flex items-center gap-1.5`}
            >
              <Heart aria-hidden className="size-3.5 shrink-0 text-[#db2777] dark:text-[#f472b6]" />
              <span className="sponsor-gradient">Sponsor</span>
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
