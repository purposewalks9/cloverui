"use client";

import * as React from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { motion, useReducedMotion } from "motion/react";
import "maplibre-gl/dist/maplibre-gl.css";

import { cn } from "@/lib/utils";

export type PinDropStatus =
  "idle" | "locating" | "located" | "denied" | "unavailable" | "timeout" | "unsupported";

export type PinDropPermission = "prompt" | "granted" | "denied";

export type PinDropTheme = "auto" | "light" | "dark";

export interface PinDropCoordinates {
  lat: number;
  lng: number;
}

export interface PinDropPosition extends PinDropCoordinates {
  accuracy: number;
  timestamp: number;
}

export type PinDropBounds = [west: number, south: number, east: number, north: number];

export interface PinDropPlace extends PinDropCoordinates {
  name: string;
  bounds?: PinDropBounds;
}

export interface PinDropMarker {
  color?: string;
  ringColor?: string;
}

export interface PinDropMapStyles {
  light: string;
  dark: string;
}

export type PinDropGeocoder = (query: string, signal: AbortSignal) => Promise<PinDropPlace | null>;

export type PinDropReverseGeocoder = (
  coordinates: PinDropCoordinates,
  signal: AbortSignal,
) => Promise<string | null>;

export interface PinDropProps extends Omit<React.ComponentProps<"div">, "children"> {
  height?: number;
  location?: PinDropCoordinates;
  place?: string;
  label?: string;
  geocoder?: PinDropGeocoder;
  reverseGeocoder?: PinDropReverseGeocoder | null;
  locate?: boolean;
  locateButton?: boolean;
  zoom?: number;
  interactive?: boolean;
  theme?: PinDropTheme;
  mapStyle?: Partial<PinDropMapStyles>;
  marker?: boolean | PinDropMarker;
  onLocationChange?: (position: PinDropPosition) => void;
  onPermissionChange?: (permission: PinDropPermission) => void;
  onStatusChange?: (status: PinDropStatus) => void;
}

export const pinDropMapStyles: PinDropMapStyles = {
  light: "https://tiles.openfreemap.org/styles/liberty",
  dark: "https://tiles.openfreemap.org/styles/dark",
};

const DEFAULT_MARKER: Required<PinDropMarker> = { color: "#ff0004", ringColor: "#ffffff" };
const WORKER_URL = (version: string) =>
  `https://cdn.jsdelivr.net/npm/maplibre-gl@${version}/dist/maplibre-gl-worker.mjs`;
const WORLD_CENTER: [number, number] = [15, 25];
const WORLD_ZOOM = 1;
const LOOKUP_DELAY = 350;
const LOOKUP_TIMEOUT = 8000;
const CACHE_LIMIT = 50;
const FIT_PADDING = 48;

const ERROR_TEXT: Partial<Record<PinDropStatus, string>> = {
  denied: "Location access is blocked",
  unavailable: "Couldn't find your location",
  timeout: "Finding your location took too long",
  unsupported: "This browser can't share its location",
};

function isCoordinates(value: PinDropCoordinates | undefined | null): value is PinDropCoordinates {
  return (
    !!value &&
    Number.isFinite(value.lat) &&
    Number.isFinite(value.lng) &&
    Math.abs(value.lat) <= 90 &&
    Math.abs(value.lng) <= 180
  );
}

export const photonGeocoder: PinDropGeocoder = async (query, signal) => {
  const response = await fetch(
    `https://photon.komoot.io/api/?limit=1&q=${encodeURIComponent(query)}`,
    { signal },
  );
  if (!response.ok) return null;
  const data = (await response.json()) as {
    features?: {
      geometry?: { coordinates?: [number, number] };
      properties?: { name?: string; extent?: [number, number, number, number] };
    }[];
  };
  const feature = data.features?.[0];
  const coordinates = feature?.geometry?.coordinates;
  if (!coordinates) return null;
  const extent = feature?.properties?.extent;
  return {
    name: feature?.properties?.name ?? query,
    lat: coordinates[1],
    lng: coordinates[0],
    bounds: extent ? [extent[0], extent[3], extent[2], extent[1]] : undefined,
  };
};

export const bigDataCloudReverseGeocoder: PinDropReverseGeocoder = async ({ lat, lng }, signal) => {
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat.toFixed(2)}&longitude=${lng.toFixed(2)}&localityLanguage=en`,
    { signal },
  );
  if (!response.ok) return null;
  const data = (await response.json()) as {
    city?: string;
    locality?: string;
    principalSubdivision?: string;
    countryName?: string;
  };
  return data.city || data.locality || data.principalSubdivision || data.countryName || null;
};

const places = new WeakMap<PinDropGeocoder, Map<string, PinDropPlace>>();

function placesFor(geocoder: PinDropGeocoder) {
  let cache = places.get(geocoder);
  if (!cache) {
    cache = new Map();
    places.set(geocoder, cache);
  }
  return cache;
}

function usePlace(query: string, geocoder: PinDropGeocoder) {
  const geocoderRef = React.useRef(geocoder);
  const [found, setFound] = React.useState<PinDropPlace | null>(null);

  React.useEffect(() => {
    geocoderRef.current = geocoder;
  });

  React.useEffect(() => {
    if (!query) return;
    const lookup = geocoderRef.current;
    const cache = placesFor(lookup);
    if (cache.get(query)) return;
    const controller = new AbortController();
    const expire = window.setTimeout(() => controller.abort(), LOOKUP_DELAY + LOOKUP_TIMEOUT);
    const timer = window.setTimeout(() => {
      lookup(query, controller.signal)
        .then((result) => {
          if (!result || !isCoordinates(result)) return;
          if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value!);
          cache.set(query, result);
          setFound(result);
        })
        .catch(() => {});
    }, LOOKUP_DELAY);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(expire);
      controller.abort();
    };
  }, [query]);

  if (!query) return null;
  return placesFor(geocoder).get(query) ?? found;
}

function subscribeNothing() {
  return () => {};
}

function useGeolocationSupport() {
  return React.useSyncExternalStore(
    subscribeNothing,
    () => "geolocation" in navigator,
    () => true,
  );
}

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", callback);
  };
}

function readDarkMode() {
  const root = document.documentElement.classList;
  if (root.contains("dark")) return true;
  if (root.contains("light")) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function useDarkMode(theme: PinDropTheme) {
  const dark = React.useSyncExternalStore(subscribeTheme, readDarkMode, () => false);
  return theme === "auto" ? dark : theme === "dark";
}

type LocateCallbacks = Pick<
  PinDropProps,
  "reverseGeocoder" | "onLocationChange" | "onPermissionChange"
>;

function useVisitorLocation(enabled: boolean, callbacks: LocateCallbacks) {
  const callbacksRef = React.useRef(callbacks);
  const permissionRef = React.useRef<PinDropPermission | null>(null);
  const [result, setResult] = React.useState<PinDropStatus | null>(null);
  const [position, setPosition] = React.useState<PinDropPosition | null>(null);
  const [cityName, setCityName] = React.useState<string | null>(null);

  React.useEffect(() => {
    callbacksRef.current = callbacks;
  });

  React.useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let permissionStatus: PermissionStatus | null = null;
    const lookup = new AbortController();
    const expire = window.setTimeout(() => lookup.abort(), LOOKUP_TIMEOUT * 2);
    const report = (permission: PinDropPermission) => {
      if (cancelled || permissionRef.current === permission) return;
      permissionRef.current = permission;
      callbacksRef.current.onPermissionChange?.(permission);
    };

    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((answer) => {
        if (cancelled) return;
        permissionStatus = answer;
        report(answer.state as PinDropPermission);
        answer.onchange = () => report(answer.state as PinDropPermission);
      })
      .catch(() => {});

    navigator.geolocation.getCurrentPosition(
      ({ coords, timestamp }) => {
        if (cancelled) return;
        const next: PinDropPosition = {
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
          timestamp,
        };
        report("granted");
        setPosition(next);
        setResult("located");
        callbacksRef.current.onLocationChange?.(next);
        callbacksRef.current
          .reverseGeocoder?.({ lat: next.lat, lng: next.lng }, lookup.signal)
          .then((name) => {
            if (!cancelled && name) setCityName(name);
          })
          .catch(() => {});
      },
      (error) => {
        if (cancelled) return;
        if (error.code === error.PERMISSION_DENIED) {
          report("denied");
          setResult("denied");
        } else {
          setResult(error.code === error.TIMEOUT ? "timeout" : "unavailable");
        }
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 15000 },
    );

    return () => {
      cancelled = true;
      window.clearTimeout(expire);
      lookup.abort();
      if (permissionStatus) permissionStatus.onchange = null;
      setPosition(null);
      setCityName(null);
      setResult(null);
    };
  }, [enabled]);

  return { result, position, cityName };
}

function targetKeyOf(target: PinDropPlace | PinDropCoordinates | null) {
  if (!target) return "";
  const bounds = "bounds" in target && target.bounds ? target.bounds.join(",") : "";
  return `${target.lat.toFixed(5)},${target.lng.toFixed(5)},${bounds}`;
}

function PinDrop({
  height = 400,
  location,
  place,
  label: labelProp,
  geocoder = photonGeocoder,
  reverseGeocoder = bigDataCloudReverseGeocoder,
  locate = false,
  locateButton = true,
  zoom = 12,
  interactive = true,
  theme = "auto",
  mapStyle,
  marker = true,
  onLocationChange,
  onPermissionChange,
  onStatusChange,
  className,
  style,
  ...props
}: PinDropProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const pinRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<MapLibreMap | null>(null);
  const shownRef = React.useRef<PinDropCoordinates | null>(null);
  const targetRef = React.useRef<PinDropPlace | PinDropCoordinates | null>(null);
  const styleRef = React.useRef("");
  const appliedStyleRef = React.useRef("");
  const onStatusChangeRef = React.useRef(onStatusChange);
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [dropped, setDropped] = React.useState("");
  const [requested, setRequested] = React.useState(false);
  const [recenter, setRecenter] = React.useState(0);
  const gradientId = React.useId();
  const motionEnabled = !useReducedMotion();
  const dark = useDarkMode(theme);
  const supported = useGeolocationSupport();
  const locating = locate || requested;
  const found = usePlace(place?.trim() ?? "", geocoder);
  const visitor = useVisitorLocation(locating && supported, {
    reverseGeocoder,
    onLocationChange,
    onPermissionChange,
  });
  const status: PinDropStatus = !locating
    ? "idle"
    : !supported
      ? "unsupported"
      : (visitor.result ?? "locating");
  const target = visitor.position ?? found ?? (isCoordinates(location) ? location : null);
  const targetKey = targetKeyOf(target);
  const styles = { ...pinDropMapStyles, ...mapStyle };
  const styleUrl = dark ? styles.dark : styles.light;
  const markerStyle = { ...DEFAULT_MARKER, ...(typeof marker === "object" ? marker : {}) };
  const maxZoom = Number.isFinite(zoom) ? Math.max(2, Math.min(18, zoom)) : 12;

  React.useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
    targetRef.current = target;
    styleRef.current = styleUrl;
  });

  React.useEffect(() => {
    onStatusChangeRef.current?.(status);
  }, [status]);

  const placePin = React.useCallback(() => {
    const map = mapRef.current;
    const node = pinRef.current;
    const shown = shownRef.current;
    if (!map || !node || !shown) return;
    const point = map.project([shown.lng, shown.lat]);
    node.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
  }, []);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let map: MapLibreMap | null = null;

    import("maplibre-gl")
      .then(({ Map, getVersion, getWorkerUrl, setWorkerUrl }) => {
        if (cancelled) return;
        if (!getWorkerUrl()) setWorkerUrl(WORKER_URL(getVersion()));
        try {
          map = new Map({
            container,
            style: styleRef.current,
            center: WORLD_CENTER,
            zoom: WORLD_ZOOM,
            attributionControl: { compact: true },
            dragRotate: false,
            touchPitch: false,
            pitchWithRotate: false,
          });
        } catch {
          setFailed(true);
          return;
        }
        appliedStyleRef.current = styleRef.current;
        map.touchZoomRotate.disableRotation();
        map.keyboard.disableRotation();
        map.on("move", placePin);
        map.on("resize", placePin);
        map.once("load", () => {
          if (!cancelled) setReady(true);
        });
        mapRef.current = map;
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
      shownRef.current = null;
      setReady(false);
    };
  }, [placePin]);

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || appliedStyleRef.current === styleUrl) return;
    appliedStyleRef.current = styleUrl;
    map.setStyle(styleUrl);
  }, [ready, styleUrl]);

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const handlers = [
      map.dragPan,
      map.scrollZoom,
      map.boxZoom,
      map.doubleClickZoom,
      map.touchZoomRotate,
      map.keyboard,
    ];
    for (const handler of handlers) {
      if (interactive) handler.enable();
      else handler.disable();
    }
    if (interactive) map.cooperativeGestures.enable();
    else map.cooperativeGestures.disable();
  }, [ready, interactive]);

  React.useEffect(() => {
    const map = mapRef.current;
    const next = targetRef.current;
    if (!map || !ready || !next || !targetKey) return;

    const finish = () => {
      map.off("moveend", finish);
      shownRef.current = next;
      placePin();
      setDropped(targetKey);
    };

    map.stop();
    map.on("moveend", finish);
    const bounds = "bounds" in next ? next.bounds : undefined;
    if (bounds) {
      map.fitBounds(bounds, {
        padding: FIT_PADDING,
        maxZoom,
        animate: motionEnabled,
        duration: 2400,
      });
    } else if (motionEnabled) {
      map.flyTo({ center: [next.lng, next.lat], zoom: maxZoom, speed: 1.1, curve: 1.5 });
    } else {
      map.jumpTo({ center: [next.lng, next.lat], zoom: maxZoom });
    }

    return () => {
      map.off("moveend", finish);
    };
  }, [ready, targetKey, maxZoom, motionEnabled, recenter, placePin]);

  const onLocateClick = () => {
    if (status === "located") setRecenter((value) => value + 1);
    else setRequested(true);
  };

  const showPin = marker !== false && !!targetKey && dropped === targetKey;
  const label = labelProp ?? (status === "located" ? visitor.cityName : found?.name) ?? undefined;
  const error = ERROR_TEXT[status];
  const description =
    status === "located"
      ? "Map showing your location"
      : target
        ? "Map showing a location"
        : "World map";

  return (
    <div
      role="region"
      aria-label={label ? `${description}: ${label}` : description}
      className={cn(
        "border-border bg-muted relative isolate w-full overflow-hidden rounded-2xl border",
        "[&_.maplibregl-ctrl-attrib]:text-[10px]",
        className,
      )}
      style={{ height, ...style }}
      {...props}
    >
      {failed ? (
        <div className="text-muted-foreground absolute inset-0 flex items-center justify-center p-6 text-center text-sm">
          The map couldn&apos;t load in this browser.
        </div>
      ) : (
        <div ref={containerRef} className="absolute inset-0" />
      )}

      {marker !== false && (
        <div
          ref={pinRef}
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 z-10 size-0 will-change-transform"
        >
          {showPin && (
            <>
              <motion.span
                key={`shadow-${dropped}`}
                className="absolute -top-1 -left-2.5 h-2 w-5 rounded-[50%] bg-black/35 blur-[1px]"
                initial={motionEnabled ? { scale: 0.2, opacity: 0 } : false}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
              {motionEnabled && (
                <motion.span
                  key={`ripple-${dropped}`}
                  className="absolute -top-3 -left-3 size-6 rounded-full border-2"
                  style={{ borderColor: markerStyle.color }}
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: [0.3, 2.6], opacity: [0.7, 0] }}
                  transition={{
                    duration: 1.8,
                    delay: 0.45,
                    ease: "easeOut",
                    repeat: Infinity,
                    repeatDelay: 0.6,
                  }}
                />
              )}
              <motion.svg
                key={`pin-${dropped}`}
                viewBox="0 0 24 24"
                fill="none"
                className="absolute -top-[33px] -left-[18px] size-9 overflow-visible"
                style={{
                  transformOrigin: "50% 92%",
                  filter: "drop-shadow(0 2px 3px rgb(0 0 0 / 0.4))",
                }}
                initial={motionEnabled ? { y: -70, opacity: 0, scaleY: 1 } : false}
                animate={{ y: 0, opacity: 1, scaleY: motionEnabled ? [1, 1, 0.82, 1] : 1 }}
                transition={{
                  y: { type: "spring", stiffness: 520, damping: 18, mass: 0.9 },
                  opacity: { duration: 0.15 },
                  scaleY: { duration: 0.6, times: [0, 0.45, 0.6, 1] },
                }}
              >
                <defs>
                  <linearGradient
                    id={gradientId}
                    x1="12"
                    y1="2"
                    x2="12"
                    y2="22"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop
                      offset="0"
                      stopColor={`color-mix(in srgb, ${markerStyle.color} 70%, ${markerStyle.ringColor})`}
                    />
                    <stop offset="0.55" stopColor={markerStyle.color} />
                    <stop
                      offset="1"
                      stopColor={`color-mix(in srgb, ${markerStyle.color} 78%, black)`}
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M6.34 4.34A8 8 0 0 1 20 10c0 1.89-.4 3.13-1.5 4.5L12 22l-6.5-7.5C4.4 13.13 4 11.89 4 10a8 8 0 0 1 2.34-5.66Z"
                  fill={`url(#${gradientId})`}
                  stroke={markerStyle.ringColor}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="10"
                  r="3"
                  fill={markerStyle.color}
                  stroke={markerStyle.ringColor}
                  strokeWidth={2}
                />
              </motion.svg>
              {label && (
                <motion.span
                  key={`label-${dropped}-${label}`}
                  className="absolute top-3 left-0 max-w-44 -translate-x-1/2 truncate rounded-full border px-2.5 py-1 text-xs leading-none font-semibold whitespace-nowrap backdrop-blur-sm"
                  style={{
                    color: markerStyle.ringColor,
                    backgroundColor: `color-mix(in srgb, color-mix(in srgb, ${markerStyle.color} 18%, black) 82%, transparent)`,
                    borderColor: `color-mix(in srgb, ${markerStyle.ringColor} 22%, transparent)`,
                    boxShadow: "0 2px 6px rgb(0 0 0 / 0.35)",
                  }}
                  initial={motionEnabled ? { opacity: 0, y: -4 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: motionEnabled ? 0.35 : 0 }}
                >
                  {label}
                </motion.span>
              )}
            </>
          )}
        </div>
      )}

      {locateButton && !failed && (
        <button
          type="button"
          onClick={onLocateClick}
          aria-label={status === "located" ? "Go back to my location" : "Show my location"}
          className="border-border bg-background/90 text-foreground hover:bg-background focus-visible:ring-ring absolute top-3 right-3 z-20 inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border shadow-sm backdrop-blur transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("size-4", status === "located" && "text-[#1a73e8]")}
            animate={status === "locating" && motionEnabled ? { rotate: 360 } : { rotate: 0 }}
            transition={
              status === "locating" && motionEnabled
                ? { duration: 1.2, ease: "linear", repeat: Infinity }
                : { duration: 0.2 }
            }
          >
            <circle cx="12" cy="12" r="7" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </motion.svg>
        </button>
      )}

      {error && (
        <div
          role="status"
          className="bg-background/90 text-foreground border-border absolute top-3 left-3 z-20 max-w-[calc(100%-4.5rem)] truncate rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap shadow-sm backdrop-blur"
        >
          {error}
        </div>
      )}
    </div>
  );
}

PinDrop.displayName = "PinDrop";

export { PinDrop };
