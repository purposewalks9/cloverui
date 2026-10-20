"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type AppleMusicCardView = "mini" | "full";

export interface AppleMusicCardProps extends Omit<React.ComponentProps<"a">, "children" | "href"> {
  url: string;
  view?: AppleMusicCardView;
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
    if (url.hostname !== "music.apple.com" || !["https:", "http:"].includes(url.protocol))
      return null;

    const trackId = url.searchParams.get("i");
    if (trackId) return /^\d+$/.test(trackId) ? { id: trackId, kind: "song" } : null;

    const segments = url.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    if (last && /^\d+$/.test(last)) return { id: last, kind: "album" };

    return null;
  } catch {
    return null;
  }
}

const artwork = (url: string, size: number) => url.replace(/\d+x\d+bb/, `${size}x${size}bb`);

async function fetchTrackData(url: string, signal: AbortSignal): Promise<TrackData> {
  const parsed = extractAppleMusicId(url);
  if (!parsed) throw new Error("Not a valid music.apple.com link");

  const res = await fetch(`https://itunes.apple.com/lookup?id=${parsed.id}&entity=song`, {
    signal,
  });
  if (!res.ok) throw new Error("iTunes lookup failed");

  const data = await res.json();
  if (!data.resultCount) throw new Error("No results for that link");

  const result =
    data.results.find(
      (r: { wrapperType: string }) =>
        r.wrapperType === (parsed.kind === "song" ? "track" : "collection"),
    ) ?? data.results[0];

  return {
    title: result.trackName ?? result.collectionName ?? "Unknown title",
    artist: result.artistName,
    image: result.artworkUrl100 as string,
    link: result.trackViewUrl ?? result.collectionViewUrl ?? url,
  };
}

const AppleMusicGlyph = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 20 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("overflow-visible", className)}
    aria-hidden
  >
    <path
      d="M16.6638 23.0371C15.3716 24.3036 13.9606 24.1036 12.6024 23.5037C11.1651 22.8904 9.84643 22.8638 8.32999 23.5037C6.43114 24.3303 5.42897 24.0903 4.29493 23.0371C-2.14006 16.3313 -1.19063 6.11923 6.11466 5.74594C7.89483 5.83926 9.13436 6.73248 10.1761 6.81247C11.7321 6.49251 13.2222 5.57263 14.8837 5.69261C16.8748 5.85259 18.3781 6.65249 19.3671 8.09231C15.2529 10.5853 16.2287 16.0646 20 17.5978C19.2484 19.5975 18.2726 21.5839 16.6506 23.0504L16.6638 23.0371ZM10.0442 5.66595C9.84643 2.69299 12.2332 0.23997 14.976 0C15.3584 3.43957 11.8903 5.99924 10.0442 5.66595Z"
      fill="currentColor"
    />
  </svg>
);

const frameClass = "relative isolate block w-[200px] shrink-0 overflow-hidden rounded-[20px]";

const MusicTag = () => (
  <p className="px-1 pt-2 pb-0.5 text-[12px] leading-none font-semibold whitespace-nowrap text-white/55">
    <AppleMusicGlyph className="mr-[0.08em] inline-block h-[0.8em] w-[0.67em] align-baseline" />
    Music
  </p>
);

const AppleMusicCardSkeleton = ({
  view,
  className,
}: {
  view: AppleMusicCardView;
  className?: string;
}) => (
  <div
    className={cn(frameClass, "bg-muted/50 ring-border ring-1 ring-inset", className)}
    aria-busy="true"
    aria-label="Loading Apple Music track"
  >
    <div className="p-2">
      <div className="bg-muted aspect-square w-full animate-pulse rounded-[13px]" />
      {view === "full" && (
        <div className="px-1 pt-2.5">
          <div className="bg-muted my-[3px] h-4 w-3/4 animate-pulse rounded" />
          <div className="bg-muted my-[3px] h-3.5 w-1/2 animate-pulse rounded" />
        </div>
      )}
      <div className="bg-muted mx-1 mt-2 mb-0.5 h-3 w-12 animate-pulse rounded" />
    </div>
  </div>
);

const AppleMusicCardError = ({ className }: { className?: string }) => (
  <div className={cn(frameClass, "bg-neutral-900", className)}>
    <div className="p-2">
      <div className="flex aspect-square w-full items-center justify-center rounded-[13px] bg-neutral-800">
        <p className="px-3 text-center text-xs text-white/60">Failed to load Apple Music data</p>
      </div>
      <MusicTag />
    </div>
  </div>
);

function useTrack(url: string) {
  const [state, setState] = React.useState<{ url: string; data: TrackData | null } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    fetchTrackData(url, controller.signal).then(
      (data) => !cancelled && setState({ url, data }),
      () => !cancelled && setState({ url, data: null }),
    );
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [url]);

  if (!state || state.url !== url) return undefined;
  return state.data;
}

function AppleMusicCard({ url, view = "full", className, ...props }: AppleMusicCardProps) {
  const data = useTrack(url);
  const expanded = view === "full";

  if (data === undefined) return <AppleMusicCardSkeleton view={view} className={className} />;
  if (!data) return <AppleMusicCardError className={className} />;

  return (
    <a
      href={data.link}
      target="_blank"
      rel="noopener noreferrer"
      draggable={false}
      aria-label={`Open ${data.title} by ${data.artist} in Apple Music`}
      className={cn(
        frameClass,
        "group focus-visible:ring-ring bg-neutral-900 focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <img
          src={artwork(data.image, 100)}
          alt=""
          aria-hidden
          draggable={false}
          decoding="async"
          className="h-full w-full scale-125 transform-gpu object-cover blur-3xl brightness-125 saturate-[1.7] transition-transform duration-700 group-hover:scale-[1.32] motion-reduce:transition-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/20 to-black/75" />
      </div>

      <div className="p-2">
        <div className="aspect-square overflow-hidden rounded-[13px] shadow-lg">
          <img
            src={artwork(data.image, 400)}
            alt={`${data.title} artwork`}
            draggable={false}
            decoding="async"
            className="h-full w-full bg-neutral-800 object-cover select-none"
          />
        </div>

        <div
          aria-hidden={!expanded}
          className={cn(
            "grid grid-cols-[minmax(0,1fr)] transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="min-h-0 min-w-0 overflow-hidden">
            <div
              className={cn(
                "px-1 pt-2.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
                !expanded && "-translate-y-3",
              )}
            >
              <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-white">
                {data.title}
              </p>
              <p className="truncate text-[13px] text-white/60">{data.artist}</p>
            </div>
          </div>
        </div>

        <MusicTag />
      </div>
    </a>
  );
}

AppleMusicCard.displayName = "AppleMusicCard";

export { AppleMusicCard };
