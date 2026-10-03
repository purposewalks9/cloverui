"use client";

import * as React from "react";
import createGlobe, { type Arc, type Globe, type Marker } from "cobe";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export type GlobeRequestStatus = "pending" | "success" | "error";

export interface GlobeCoordinates {
  lat: number;
  lng: number;
  label?: string;
}

export interface GlobeServer extends GlobeCoordinates {
  id: string;
  label: string;
  region?: string;
  color?: string;
}

export interface GlobeRequest {
  id: string;
  origin: GlobeCoordinates;
  destination?: GlobeCoordinates;
  startedAt?: number;
  duration?: number;
  kind?: string;
  status?: GlobeRequestStatus;
  color?: string;
}

export interface SignalGlobeProps extends Omit<React.ComponentProps<"div">, "children"> {
  server: GlobeServer;
  requests?: GlobeRequest[];
  maxFlights?: number;
  flightDuration?: number;
  retention?: number;
  autoRotate?: boolean;
  interactive?: boolean;
  animate?: boolean;
}

type Flight = GlobeRequest & {
  destination: GlobeCoordinates;
  startedAt: number;
  duration: number;
  timed: boolean;
};

const DEFAULT_REQUESTS: GlobeRequest[] = [
  { id: "demo-tokyo", origin: { lat: 35.6762, lng: 139.6503, label: "Tokyo" }, kind: "api" },
  { id: "demo-lagos", origin: { lat: 6.5244, lng: 3.3792, label: "Lagos" }, kind: "api" },
  {
    id: "demo-sao-paulo",
    origin: { lat: -23.5505, lng: -46.6333, label: "São Paulo" },
    kind: "upload",
  },
  { id: "demo-sydney", origin: { lat: -33.8688, lng: 151.2093, label: "Sydney" }, kind: "stream" },
  {
    id: "demo-reykjavik",
    origin: { lat: 64.1466, lng: -21.9426, label: "Reykjavík" },
    kind: "api",
  },
];

const STATUS_COLORS: Record<GlobeRequestStatus, [number, number, number]> = {
  pending: [0.23, 0.86, 0.98],
  success: [0.34, 0.9, 0.55],
  error: [0.98, 0.4, 0.43],
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isCoordinates(value: GlobeCoordinates) {
  return Number.isFinite(value.lat) && Number.isFinite(value.lng) && Math.abs(value.lat) <= 90;
}

function toColor(value: string | undefined, fallback: [number, number, number]) {
  if (!value?.startsWith("#")) return fallback;
  const hex = value.slice(1);
  const normalized =
    hex.length === 3
      ? hex
          .split("")
          .map((part) => part + part)
          .join("")
      : hex;
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return fallback;
  return [
    Number.parseInt(normalized.slice(0, 2), 16) / 255,
    Number.parseInt(normalized.slice(2, 4), 16) / 255,
    Number.parseInt(normalized.slice(4, 6), 16) / 255,
  ] as [number, number, number];
}

function hash(value: string) {
  let result = 0;
  for (let index = 0; index < value.length; index++)
    result = (result * 31 + value.charCodeAt(index)) >>> 0;
  return result;
}

function travelLocation(
  from: GlobeCoordinates,
  to: GlobeCoordinates,
  progress: number,
): [number, number] {
  const radians = Math.PI / 180;
  const vector = (point: GlobeCoordinates) => {
    const lat = point.lat * radians;
    const lng = point.lng * radians;
    return [Math.cos(lat) * Math.cos(lng), Math.sin(lat), Math.cos(lat) * Math.sin(lng)];
  };
  const start = vector(from);
  const end = vector(to);
  const dot = clamp(start[0] * end[0] + start[1] * end[1] + start[2] * end[2], -1, 1);
  const angle = Math.acos(dot);
  const sin = Math.sin(angle) || 1;
  const startWeight = Math.sin((1 - progress) * angle) / sin;
  const endWeight = Math.sin(progress * angle) / sin;
  const x = start[0] * startWeight + end[0] * endWeight;
  const y = start[1] * startWeight + end[1] * endWeight;
  const z = start[2] * startWeight + end[2] * endWeight;
  return [Math.atan2(y, Math.hypot(x, z)) / radians, Math.atan2(z, x) / radians];
}

function normalizeFlights(
  requests: GlobeRequest[],
  server: GlobeServer,
  now: number,
  flightDuration: number,
  retention: number,
  maxFlights: number,
) {
  const ids = new Set<string>();
  const flights: Flight[] = [];

  for (const request of requests) {
    const destination = request.destination ?? server;
    const timed = request.startedAt !== undefined;
    const startedAt = request.startedAt ?? 0;
    const duration = clamp(request.duration ?? flightDuration, 400, 10000);
    if (
      ids.has(request.id) ||
      !request.id ||
      !isCoordinates(request.origin) ||
      !isCoordinates(destination) ||
      (timed && now > startedAt + duration + retention)
    ) {
      continue;
    }
    ids.add(request.id);
    flights.push({ ...request, destination, startedAt, duration, timed });
  }

  return flights
    .sort((a, b) => b.startedAt - a.startedAt || a.id.localeCompare(b.id))
    .slice(0, maxFlights);
}

function GlobeFallback({ server, flights }: { server: GlobeServer; flights: Flight[] }) {
  const position = (point: GlobeCoordinates) => ({
    left: `${50 + (point.lng / 180) * 43}%`,
    top: `${50 - (point.lat / 90) * 36}%`,
  });

  return (
    <div
      className="bg-muted relative flex h-full min-h-[320px] items-center justify-center overflow-hidden"
      aria-hidden
    >
      <div className="border-border bg-background/80 relative aspect-square w-[min(78%,420px)] rounded-full border shadow-2xl">
        <div className="border-border/70 absolute top-[12%] bottom-[12%] left-1/2 w-px -translate-x-1/2 border-l border-dashed" />
        <div className="border-border/70 absolute top-1/2 right-[6%] left-[6%] h-px -translate-y-1/2 border-t border-dashed" />
        {[...flights, { id: server.id, origin: server }].map((flight) => (
          <span
            key={flight.id}
            className={cn(
              "ring-background absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4",
              flight.id === server.id ? "bg-primary" : "bg-chart-2",
            )}
            style={position(flight.origin)}
          />
        ))}
      </div>
    </div>
  );
}

function SignalGlobe({
  server,
  requests = DEFAULT_REQUESTS,
  maxFlights = 96,
  flightDuration = 1800,
  retention = 2200,
  autoRotate = true,
  interactive = true,
  animate = true,
  className,
  ...props
}: SignalGlobeProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const globeRef = React.useRef<Globe | null>(null);
  const rotationRef = React.useRef(0.55);
  const draggingRef = React.useRef<{ x: number; rotation: number } | null>(null);
  const visibleRef = React.useRef(true);
  const [failed, setFailed] = React.useState(false);
  const [now, setNow] = React.useState(() => Date.now());
  const reduceMotion = useReducedMotion();
  const motionEnabled = animate && !reduceMotion;
  const safeMaxFlights = clamp(Math.round(maxFlights), 16, 300);
  const flights = React.useMemo(
    () => normalizeFlights(requests, server, now, flightDuration, retention, safeMaxFlights),
    [requests, server, now, flightDuration, retention, safeMaxFlights],
  );
  const serverColor = toColor(server.color, [0.96, 0.8, 0.28]);

  const globeData = React.useMemo(() => {
    const markers: Marker[] = [
      {
        location: [server.lat, server.lng],
        size: 0.12,
        color: serverColor,
        id: `server-${server.id}`,
      },
    ];
    const arcs: Arc[] = [];

    for (const flight of flights) {
      const color = toColor(flight.color, STATUS_COLORS[flight.status ?? "pending"]);
      markers.push({
        location: [flight.origin.lat, flight.origin.lng],
        size: 0.035,
        color,
        id: flight.id,
      });
      arcs.push({
        from: [flight.origin.lat, flight.origin.lng],
        to: [flight.destination.lat, flight.destination.lng],
        color,
        id: `route-${flight.id}`,
      });
    }

    return { markers, arcs, flights };
  }, [flights, server, serverColor]);
  const globeDataRef = React.useRef(globeData);

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 300);
    return () => window.clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas || failed) return;

    const sync = () => {
      const size = Math.max(320, Math.min(host.clientWidth, host.clientHeight || host.clientWidth));
      const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 640 ? 1.25 : 1.5);
      globeRef.current?.update({ width: size * dpr, height: size * dpr, devicePixelRatio: dpr });
    };

    try {
      globeRef.current = createGlobe(canvas, {
        width: 640,
        height: 640,
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
        phi: rotationRef.current,
        theta: 0.15,
        dark: 1,
        diffuse: 1.15,
        mapSamples: 16000,
        mapBrightness: 5.8,
        mapBaseBrightness: 0.05,
        baseColor: [0.04, 0.11, 0.19],
        markerColor: [0.23, 0.86, 0.98],
        glowColor: [0.12, 0.45, 0.68],
        opacity: 1,
        scale: 1,
        offset: [0, 0],
        markerElevation: 0.025,
        arcColor: [0.23, 0.86, 0.98],
        arcWidth: 0.75,
        arcHeight: 0.28,
        context: { antialias: false, powerPreference: "high-performance" },
      });
      sync();
    } catch {
      setFailed(true);
      return;
    }

    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(host);
    return () => {
      resizeObserver.disconnect();
      globeRef.current?.destroy();
      globeRef.current = null;
    };
  }, [failed]);

  React.useEffect(() => {
    globeRef.current?.update({ markers: globeData.markers, arcs: globeData.arcs });
    globeDataRef.current = globeData;
  }, [globeData]);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let lastFlightUpdate = 0;
    const render = (time: number) => {
      const elapsed = time - last;
      last = time;
      if (
        motionEnabled &&
        autoRotate &&
        visibleRef.current &&
        !document.hidden &&
        !draggingRef.current
      ) {
        rotationRef.current += elapsed * 0.00009;
        globeRef.current?.update({ phi: rotationRef.current });
      }
      if (motionEnabled && visibleRef.current && time - lastFlightUpdate > 33) {
        lastFlightUpdate = time;
        const data = globeDataRef.current;
        const movingMarkers = data.flights.map((flight) => {
          const progress = flight.timed
            ? clamp((Date.now() - flight.startedAt) / flight.duration, 0, 1)
            : ((time + hash(flight.id)) % flight.duration) / flight.duration;
          const color = toColor(flight.color, STATUS_COLORS[flight.status ?? "pending"]);
          return {
            location: travelLocation(flight.origin, flight.destination, progress),
            size: 0.046,
            color,
          };
        });
        globeRef.current?.update({ markers: [...data.markers, ...movingMarkers] });
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [autoRotate, motionEnabled]);

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = { x: event.clientX, rotation: rotationRef.current };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = draggingRef.current;
    if (!drag) return;
    rotationRef.current = drag.rotation + (event.clientX - drag.x) * 0.008;
    globeRef.current?.update({ phi: rotationRef.current });
  };

  const stopDragging = () => {
    draggingRef.current = null;
  };

  const destination = server.region ? `${server.label} · ${server.region}` : server.label;
  const liveText = `${flights.length} live request${flights.length === 1 ? "" : "s"} routing to ${destination}`;

  return (
    <div
      ref={hostRef}
      className={cn(
        "bg-muted border-border relative isolate min-h-[360px] w-full overflow-hidden rounded-2xl border",
        className,
      )}
      {...props}
    >
      {failed ? (
        <GlobeFallback server={server} flights={flights} />
      ) : (
        <canvas
          ref={canvasRef}
          aria-hidden
          className={cn(
            "absolute inset-0 size-full touch-none",
            interactive ? "cursor-grab active:cursor-grabbing" : "",
          )}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
        />
      )}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="bg-background/80 text-foreground max-w-[70%] rounded-xl border px-3 py-2 shadow-sm backdrop-blur">
          <p className="text-muted-foreground text-[10px] font-medium tracking-[0.18em] uppercase">
            Live traffic
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold">{destination}</p>
        </div>
        <div className="bg-background/80 text-foreground rounded-xl border px-3 py-2 text-right shadow-sm backdrop-blur">
          <p className="text-lg leading-none font-semibold tabular-nums">{flights.length}</p>
          <p className="text-muted-foreground mt-1 text-[10px] tracking-[0.14em] uppercase">
            active
          </p>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {liveText}
      </p>
      <div className="from-background/90 via-background/35 pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent px-4 pt-12 pb-4 sm:px-5 sm:pb-5">
        <p className="text-muted-foreground text-xs">
          {interactive ? "Drag the globe to explore request origins" : liveText}
        </p>
      </div>
    </div>
  );
}

SignalGlobe.displayName = "SignalGlobe";

export { SignalGlobe };
