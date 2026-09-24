"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AppleMusicCardProps {
  url: string;
  className?: string;
}

interface TrackData {
  title: string;
  artist: string;
  image: string;
  link: string;
}

function extractAppleMusicId(rawUrl: string): { id: string; kind: "song" | "album" } | null {
  try {
    const url = new URL(rawUrl);
    if (!url.hostname.includes("music.apple.com")) return null;

    const trackId = url.searchParams.get("i");
    if (trackId) return { id: trackId, kind: "song" };

    const segments = url.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    if (last && /^\d+$/.test(last)) return { id: last, kind: "album" };

    return null;
  } catch {
    return null;
  }
}

async function fetchTrackData(url: string): Promise<TrackData> {
  const parsed = extractAppleMusicId(url);
  if (!parsed) throw new Error("Not a valid music.apple.com link");

  const res = await fetch(
    `https://itunes.apple.com/lookup?id=${parsed.id}&entity=song`
  );
  if (!res.ok) throw new Error("iTunes lookup failed");

  const data = await res.json();
  if (!data.resultCount) throw new Error("No results for that link");

  const result =
    data.results.find((r: { wrapperType: string }) => r.wrapperType === "track") ??
    data.results[0];

  return {
    title: result.trackName ?? result.collectionName ?? "Unknown title",
    artist: result.artistName,
    image: (result.artworkUrl100 as string).replace("100x100bb", "600x600bb"),
    link: result.trackViewUrl ?? result.collectionViewUrl ?? url,
  };
}

const AppleMusicGlyph = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 20 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M16.6638 23.0371C15.3716 24.3036 13.9606 24.1036 12.6024 23.5037C11.1651 22.8904 9.84643 22.8638 8.32999 23.5037C6.43114 24.3303 5.42897 24.0903 4.29493 23.0371C-2.14006 16.3313 -1.19063 6.11923 6.11466 5.74594C7.89483 5.83926 9.13436 6.73248 10.1761 6.81247C11.7321 6.49251 13.2222 5.57263 14.8837 5.69261C16.8748 5.85259 18.3781 6.65249 19.3671 8.09231C15.2529 10.5853 16.2287 16.0646 20 17.5978C19.2484 19.5975 18.2726 21.5839 16.6506 23.0504L16.6638 23.0371ZM10.0442 5.66595C9.84643 2.69299 12.2332 0.23997 14.976 0C15.3584 3.43957 11.8903 5.99924 10.0442 5.66595Z"
      fill="currentColor"
    />
  </svg>
);

const CardFrame = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      "relative isolate w-full max-w-[240px] overflow-hidden rounded-[28px]",
      className
    )}
  >
    {children}
  </div>
);

const NeutralBackdrop = () => (
  <div
    className="absolute inset-0"
    style={{ background: "linear-gradient(165deg, #3a3a3c 0%, #1c1c1e 100%)" }}
  />
);

const AppleMusicCardSkeleton = ({ className }: { className?: string }) => (
  <CardFrame className={className}>
    <NeutralBackdrop />
    <div className="relative p-4">
      <div className="aspect-square w-full animate-pulse rounded-2xl bg-white/15" />
      <div className="mt-4 flex flex-col gap-2">
        <div className="h-5 w-3/4 animate-pulse rounded bg-white/20" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-white/15" />
        <div className="h-4 w-16 animate-pulse rounded bg-white/15" />
      </div>
    </div>
  </CardFrame>
);

const AppleMusicCardError = ({ className }: { className?: string }) => (
  <CardFrame className={className}>
    <NeutralBackdrop />
    <div className="relative flex aspect-square w-full items-center justify-center p-4">
      <p className="px-4 text-center text-sm text-white/60">Failed to load Apple Music data</p>
    </div>
  </CardFrame>
);

const AppleMusicCard = ({ url, className }: AppleMusicCardProps) => {
  const [data, setData] = React.useState<TrackData | null>(null);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");

  React.useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setData(null);

    fetchTrackData(url)
      .then((track) => {
        if (cancelled) return;
        setData(track);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (status === "loading") return <AppleMusicCardSkeleton className={className} />;
  if (status === "error" || !data) return <AppleMusicCardError className={className} />;

  return (
    <CardFrame className={className}>
      <style>{`
        @keyframes appleMusicDrift {
          0%   { transform: scale(1.28) translate(0%, 0%) rotate(0deg); }
          33%  { transform: scale(1.36) translate(-3%, 2%) rotate(1.5deg); }
          66%  { transform: scale(1.32) translate(2%, -3%) rotate(-1.5deg); }
          100% { transform: scale(1.28) translate(0%, 0%) rotate(0deg); }
        }
        @keyframes appleMusicSheenDrift {
          0%   { background-position: 20% 10%; }
          50%  { background-position: 80% 90%; }
          100% { background-position: 20% 10%; }
        }
      `}</style>

      <div className="absolute inset-0">
        <img
          src={data.image}
          alt=""
          className="h-full w-full object-cover blur-3xl brightness-125 saturate-[1.8]"
          style={{ animation: "appleMusicDrift 22s ease-in-out infinite" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/25 to-black/75" />
      </div>


      <div
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 100%)",
          backgroundSize: "200% 200%",
          animation: "appleMusicSheenDrift 14s ease-in-out infinite",
        }}
      />

      <div className="relative p-4">
        <div className="aspect-square w-full overflow-hidden rounded-2xl shadow-[0_10px_24px_-8px_rgba(0,0,0,0.6)]">
          <img
            src={data.image}
            alt={data.title}
            className="h-full w-full select-none object-cover"
          />
        </div>

        <div className="mt-4 flex flex-col gap-2 px-0.5">
          <div>
            <h2 className="truncate text-base font-bold tracking-[-.01em] text-white/95">
              {data.title}
            </h2>
            <h3 className="truncate text-sm font-medium text-white/60">
              {data.artist}
            </h3>
          </div>

          <a
            href={data.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit items-center gap-0.5 text-white/60 transition-opacity hover:opacity-70"
          >
            <AppleMusicGlyph className="h-3 w-3" />
            <span className="text-sm font-medium">Music</span>
          </a>
        </div>
      </div>
    </CardFrame>
  );
};

AppleMusicCard.displayName = "AppleMusicCard";

export { AppleMusicCard };