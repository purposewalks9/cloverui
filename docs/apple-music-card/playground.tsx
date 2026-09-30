"use client";

import { AppleMusicCard } from "@/registry/clover-ui/apple-music-card";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [{ type: "text", prop: "url", label: "Apple Music link" }];

const defaultProps = {
  url: "https://music.apple.com/us/song/blinding-lights/1499378108",
};

export function AppleMusicCardPlayground() {
  return (
    <PlaygroundShell
      componentName="AppleMusicCard"
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <div className="flex w-full items-center justify-center px-6 py-8">
          <AppleMusicCard url={values.url as string} />
        </div>
      )}
    />
  );
}
