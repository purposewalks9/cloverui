"use client";

import { AppleMusicCard } from "@/registry/clover-ui/apple-music-card";
import { PlaygroundShell } from "@/components/garden/playground-shell";

const songs = [
  "https://music.apple.com/us/song/blinding-lights/1499378607",
  "https://music.apple.com/us/song/levitating/1538003843",
  "https://music.apple.com/us/song/as-it-was/1615585008",
];

export function AppleMusicCardPlayground() {
  return (
    <PlaygroundShell
      componentName="AppleMusicCard"
      controls={[]}
      defaultProps={{}}
      render={() => (
        <div className="flex flex-wrap items-start justify-center gap-4">
          {songs.map((url) => (
            <AppleMusicCard key={url} url={url} className="w-[200px]" />
          ))}
        </div>
      )}
    />
  );
}
