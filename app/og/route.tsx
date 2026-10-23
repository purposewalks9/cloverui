import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { siteConfig } from "@/lib/config";
import { getDoc } from "@/lib/doc";

const size = { width: 1200, height: 630 };

const colors = {
  background: "#ffffff",
  foreground: "#0a0a0a",
  muted: "#262626",
};

const stroke = ["#a855f7", "#dc2626", "#db2777"];
const strokeGradient = (angle: number) =>
  `linear-gradient(${angle}deg, ${stroke[0]} 0%, ${stroke[1]} 33%, ${stroke[2]} 66%, ${stroke[0]} 100%)`;

const INSET = 64;

const CLOVER_PATH =
  "M10.8749 0.713967C9.25885 0.716155 7.7156 1.79219 7.46463 3.43222C7.25238 4.81925 8.14901 6.29025 9.5911 6.49459C10.6459 6.64409 11.7522 5.97378 11.8833 4.90772C11.9755 4.15797 11.4786 3.36353 10.7031 3.28106C10.5384 3.2635 10.3717 3.28584 10.2194 3.34075C9.98566 3.39975 9.79323 3.562 9.69291 3.77606C9.64291 3.86892 9.61279 3.97117 9.60448 4.07631C9.59213 4.23256 9.63929 4.3935 9.72791 4.51831C9.86666 4.75362 10.1225 4.91162 10.4154 4.91162C10.6603 4.91162 10.8794 4.80119 11.0257 4.62744C10.9886 4.83659 10.8671 5.01412 10.7156 5.13056C10.5344 5.26975 10.3104 5.33922 10.0805 5.32712C9.39741 5.29144 8.97382 4.64425 9.02235 4.03025C9.09188 3.14978 9.95216 2.6139 10.7649 2.70031C11.8966 2.82069 12.5922 3.92781 12.4629 4.979C12.2876 6.40344 10.8607 7.26431 9.50913 7.07275C8.40116 6.91575 7.56132 6.172 7.14345 5.22712C6.34651 4.83769 5.45016 4.66225 4.57082 4.74062C2.28426 4.94437 0.334946 6.95556 0.564571 9.3275C0.741821 11.1584 2.32779 12.7119 4.17879 12.5072C5.57295 12.3531 6.7616 11.1058 6.58591 9.6595C6.45741 8.60159 5.52395 7.70647 4.46073 7.85584C3.71291 7.9609 3.07416 8.64678 3.19516 9.4175C3.26376 9.85444 3.60973 10.2327 4.02104 10.2805C4.06801 10.2892 4.11635 10.2938 4.16582 10.2938C4.60635 10.2938 4.96341 9.93672 4.96341 9.49619C4.96341 9.15925 4.75445 8.87137 4.45904 8.7545C4.65341 8.74981 4.8377 8.81894 4.97801 8.92653C5.15926 9.06553 5.28426 9.26394 5.33213 9.48915C5.47426 10.1582 4.95907 10.735 4.35354 10.8472C3.4851 11.008 2.7451 10.3155 2.61832 9.50797C2.44182 8.38353 3.33082 7.4249 4.37951 7.27756C5.80045 7.07787 7.00095 8.23366 7.16557 9.589C7.22245 10.0572 7.1662 10.5063 7.02213 10.918C7.0966 11.771 7.3901 12.6008 7.87985 13.2982C9.19923 15.1768 11.9149 15.8592 13.854 14.474C15.3508 13.4048 15.9031 11.2539 14.8007 9.75297C13.9704 8.62244 12.2965 8.21672 11.1319 9.09225C10.2801 9.73272 9.97154 10.9891 10.6323 11.8354C11.0971 12.4305 12.0101 12.6407 12.617 12.1505C13.0228 11.8227 13.1651 11.2014 12.832 10.8112C12.7646 10.7322 12.6772 10.6707 12.5821 10.6304C12.5317 10.6046 12.4788 10.5841 12.4241 10.5694C11.9986 10.4554 11.5612 10.708 11.4473 11.1335C11.4234 11.2221 11.4151 11.3142 11.4226 11.4057C11.3122 11.2357 11.2769 11.0336 11.3008 10.8517C11.3305 10.6252 11.4398 10.4177 11.6109 10.2636C12.1192 9.80581 12.8764 9.96362 13.2761 10.4321C13.8496 11.1038 13.6198 12.0911 12.9839 12.6047C12.0985 13.32 10.8239 13.0294 10.1721 12.1947C9.28901 11.0638 9.68963 9.446 10.7809 8.62556C11.3229 8.21812 11.9474 8.03237 12.5699 8.03206C12.9483 8.03184 13.3258 8.1005 13.6835 8.22912C14.2895 7.55106 14.7072 6.71122 14.8631 5.81975C15.2585 3.55772 13.8211 1.15428 11.4712 0.762561C11.2741 0.72978 11.0746 0.713495 10.8748 0.713874L10.8749 0.713967Z";

async function loadFont(weight: 400 | 500, file: string) {
  const data = await readFile(join(process.cwd(), "app/fonts", file));
  return { name: "Geist", data, weight, style: "normal" as const };
}

function clamp(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const end = cut.lastIndexOf(" ");
  return `${(end > 0 ? cut.slice(0, end) : cut).replace(/[\s,.;:]+$/, "")}…`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get("slug");
  const doc = slug ? await getDoc(slug) : undefined;

  const title = clamp(doc?.title ?? searchParams.get("title") ?? siteConfig.name, 60);
  const description = clamp(
    doc?.description ?? searchParams.get("description") ?? siteConfig.description,
    170,
  );

  const fonts = await Promise.all([
    loadFont(400, "Geist-Regular.ttf"),
    loadFont(500, "Geist-Medium.ttf"),
  ]);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: colors.background,
        color: colors.foreground,
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          bottom: 0,
          left: INSET,
          width: 1,
          backgroundImage: strokeGradient(180),
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          bottom: 0,
          right: INSET,
          width: 1,
          backgroundImage: strokeGradient(180),
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          left: 0,
          right: 0,
          top: INSET,
          height: 1,
          backgroundImage: strokeGradient(90),
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          left: 0,
          right: 0,
          bottom: INSET,
          height: 1,
          backgroundImage: strokeGradient(90),
        }}
      />

      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 120,
        }}
      >
        <svg width="68" height="68" viewBox="0 0 16 16" fill="none">
          <path d={CLOVER_PATH} fill={colors.foreground} />
        </svg>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 500,
              letterSpacing: "-0.025em",
              lineHeight: 1,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 40,
              fontSize: 36,
              lineHeight: 1.3,
              letterSpacing: "-0.025em",
              color: colors.muted,
            }}
          >
            {description}
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
