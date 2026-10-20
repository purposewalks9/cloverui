"use client";

import { TextGif } from "@/registry/clover-ui/text-gif";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import { jsx, type ControlDef } from "@/lib/playground";
import { gifs } from "./demo";

const controls: ControlDef[] = [
  { type: "text", prop: "children", label: "Text" },
  {
    type: "select",
    prop: "src",
    label: "GIF",
    options: Object.entries(gifs).map(([label, value]) => ({ label, value })),
  },
  { type: "color", prop: "fallbackColor", label: "Fallback color" },
];

const defaultProps = {
  children: "CLOVER",
  src: gifs.fire,
  fallbackColor: "#888888",
};

export function TextGifPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      code={(values) =>
        jsx(
          "TextGif",
          {
            src: values.src,
            fallbackColor: values.fallbackColor,
            className: "text-center text-6xl font-black tracking-[-0.05em] sm:text-7xl",
          },
          values.children as string,
        )
      }
      render={(values) => (
        <div className="flex w-full justify-center">
          <div className="flex min-h-[260px] items-center justify-center px-6">
            <TextGif
              src={values.src as string}
              fallbackColor={values.fallbackColor as string}
              className="text-center text-6xl font-black tracking-[-0.05em] sm:text-7xl"
            >
              {values.children as string}
            </TextGif>
          </div>
        </div>
      )}
    />
  );
}
