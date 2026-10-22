"use client";

import { AppleMusicCard, type AppleMusicCardView } from "@/registry/clover-ui/apple-music-card";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { jsx, type ControlDef } from "@/lib/playground";

const songs = [
  "https://music.apple.com/us/song/blinding-lights/1499378607",
  "https://music.apple.com/us/song/levitating/1538003843",
  "https://music.apple.com/us/song/as-it-was/1615585008",
];

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "view",
    label: "View",
    options: [
      { label: "Full", value: "full" },
      { label: "Mini", value: "mini" },
    ],
  },
];

const defaultProps = {
  view: "full",
};

export function AppleMusicCardPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      code={(values) => jsx("AppleMusicCard", { url: songs[0], view: values.view })}
      render={(values) => (
        <div className="flex flex-wrap items-start justify-center gap-3">
          {songs.map((url) => (
            <AppleMusicCard key={url} url={url} view={values.view as AppleMusicCardView} />
          ))}
        </div>
      )}
    />
  );
}
