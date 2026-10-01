"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export interface AppleMusicCardProps {
  url?: string;
  urls?: string[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
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

  const res = await fetch(`https://itunes.apple.com/lookup?id=${parsed.id}&entity=song`);
  if (!res.ok) throw new Error("iTunes lookup failed");

  const data = await res.json();
  if (!data.resultCount) throw new Error("No results for that link");

  const result =
    data.results.find((r: { wrapperType: string }) => r.wrapperType === "track") ?? data.results[0];

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
    aria-hidden
  >
    <path
      d="M16.6638 23.0371C15.3716 24.3036 13.9606 24.1036 12.6024 23.5037C11.1651 22.8904 9.84643 22.8638 8.32999 23.5037C6.43114 24.3303 5.42897 24.0903 4.29493 23.0371C-2.14006 16.3313 -1.19063 6.11923 6.11466 5.74594C7.89483 5.83926 9.13436 6.73248 10.1761 6.81247C11.7321 6.49251 13.2222 5.57263 14.8837 5.69261C16.8748 5.85259 18.3781 6.65249 19.3671 8.09231C15.2529 10.5853 16.2287 16.0646 20 17.5978C19.2484 19.5975 18.2726 21.5839 16.6506 23.0504L16.6638 23.0371ZM10.0442 5.66595C9.84643 2.69299 12.2332 0.23997 14.976 0C15.3584 3.43957 11.8903 5.99924 10.0442 5.66595Z"
      fill="currentColor"
    />
  </svg>
);

const CardFrame = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div
    className={cn(
      "relative isolate w-full max-w-[240px] overflow-hidden rounded-[28px]",
      className,
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
  <CardFrame className={cn("bg-muted/50 ring-border ring-1 ring-inset", className)}>
    <div className="relative p-4" aria-busy="true" aria-label="Loading Apple Music track">
      <div className="bg-muted aspect-square w-full animate-pulse rounded-2xl" />

      <div className="mt-4 flex flex-col gap-2 px-0.5">
        <div>
          <div className="bg-muted my-1 h-4 w-3/4 animate-pulse rounded" />
          <div className="bg-muted my-[3px] h-3.5 w-1/2 animate-pulse rounded" />
        </div>
        <div className="bg-muted my-[3px] h-3.5 w-14 animate-pulse rounded" />
      </div>
    </div>
  </CardFrame>
);

const AppleMusicCardError = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => (
  <CardFrame className={className}>
    <NeutralBackdrop />
    <div className="relative flex aspect-square w-full items-center justify-center p-4">
      <p className="px-4 text-center text-sm text-white/60">Failed to load Apple Music data</p>
    </div>
    {children && <div className="relative flex justify-end px-4 pb-4">{children}</div>}
  </CardFrame>
);

function useTracks(urls: string[]) {
  const key = urls.join("\n");
  const [tracks, setTracks] = React.useState<(TrackData | null)[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setTracks(null);
    Promise.allSettled(key.split("\n").map((url) => fetchTrackData(url))).then((results) => {
      if (cancelled) return;
      setTracks(results.map((result) => (result.status === "fulfilled" ? result.value : null)));
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return tracks;
}

function TrackTabs({
  tracks,
  active,
  panelId,
  onSelect,
}: {
  tracks: (TrackData | null)[];
  active: number;
  panelId: string;
  onSelect: (index: number) => void;
}) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = tracks.length - 1;
    const next =
      event.key === "ArrowRight"
        ? (active + 1) % tracks.length
        : event.key === "ArrowLeft"
          ? (active - 1 + tracks.length) % tracks.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    onSelect(next);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Songs"
      className="flex items-center gap-1"
      onKeyDown={onKeyDown}
    >
      {tracks.map((track, i) => {
        const selected = i === active;
        return (
          <button
            key={i}
            ref={(node) => {
              refs.current[i] = node;
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId}
            aria-label={track ? `${track.title} by ${track.artist}` : `Song ${i + 1}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(i)}
            className={cn(
              "relative flex size-6 cursor-pointer items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors after:absolute after:-inset-2 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none",
              selected
                ? "bg-white/90 text-black"
                : "text-white/60 hover:bg-white/15 hover:text-white",
            )}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

function AppleMusicCard({
  url,
  urls,
  index,
  defaultIndex = 0,
  onIndexChange,
  className,
}: AppleMusicCardProps) {
  const list = urls?.length ? urls : url ? [url] : [];
  const tracks = useTracks(list);
  const [ownIndex, setOwnIndex] = React.useState(defaultIndex);
  const reduceMotion = useReducedMotion();
  const panelId = React.useId();

  const count = Math.max(list.length, 1);
  const active = (((index ?? ownIndex) % count) + count) % count;
  const select = (next: number) => {
    if (index === undefined) setOwnIndex(next);
    onIndexChange?.(next);
  };

  if (!tracks) return <AppleMusicCardSkeleton className={className} />;
  const data = tracks[active];
  const tabs = tracks.length > 1 && (
    <TrackTabs tracks={tracks} active={active} panelId={panelId} onSelect={select} />
  );
  if (!data) return <AppleMusicCardError className={className}>{tabs}</AppleMusicCardError>;

  const fade = { duration: reduceMotion ? 0 : 0.45, ease: "easeOut" } as const;

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

      <AnimatePresence initial={false}>
        <motion.div
          key={data.image}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fade}
        >
          <img
            src={data.image}
            alt=""
            className="h-full w-full object-cover blur-3xl brightness-125 saturate-[1.8] motion-safe:animate-[appleMusicDrift_22s_ease-in-out_infinite]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/25 to-black/75" />
        </motion.div>
      </AnimatePresence>

      <div
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay motion-safe:animate-[appleMusicSheenDrift_14s_ease-in-out_infinite]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 100%)",
          backgroundSize: "200% 200%",
        }}
      />

      <div className="relative p-4">
        <div id={panelId} role={tracks.length > 1 ? "tabpanel" : undefined}>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-[0_10px_24px_-8px_rgba(0,0,0,0.6)]">
            <AnimatePresence initial={false}>
              <motion.img
                key={data.image}
                src={data.image}
                alt={`${data.title} artwork`}
                className="absolute inset-0 h-full w-full object-cover select-none"
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={fade}
              />
            </AnimatePresence>
          </div>

          <div className="mt-4 px-0.5">
            <h2 className="truncate text-base font-bold tracking-[-.01em] text-white/95">
              {data.title}
            </h2>
            <h3 className="truncate text-sm font-medium text-white/60">{data.artist}</h3>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 px-0.5">
          <span className="flex items-center gap-0.5 text-white/60">
            <AppleMusicGlyph className="h-3 w-3" />
            <span className="text-sm font-medium">Music</span>
          </span>
          {tabs}
        </div>
      </div>
    </CardFrame>
  );
}

AppleMusicCard.displayName = "AppleMusicCard";

export { AppleMusicCard };
