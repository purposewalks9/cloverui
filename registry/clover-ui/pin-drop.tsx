"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export type PinDropStatus =
  "idle" | "locating" | "located" | "denied" | "unavailable" | "timeout" | "unsupported";

export type PinDropPermission = "prompt" | "granted" | "denied";

export interface PinDropCoordinates {
  lat: number;
  lng: number;
}

export interface PinDropPosition extends PinDropCoordinates {
  accuracy: number;
  timestamp: number;
}

export interface PinDropPlace extends PinDropCoordinates {
  name: string;
}

export interface PinDropMarker {
  color?: string;
  ringColor?: string;
}

export interface PinDropColors {
  ocean: string;
  deepOcean: string;
  land: string;
  coast: string;
  glow: string;
}

export type PinDropGeocoder = (query: string, signal: AbortSignal) => Promise<PinDropPlace | null>;

export type PinDropReverseGeocoder = (
  coordinates: PinDropCoordinates,
  signal: AbortSignal,
) => Promise<string | null>;

export interface PinDropProps extends Omit<React.ComponentProps<"div">, "children"> {
  size?: number;
  location?: PinDropCoordinates;
  place?: string;
  geocoder?: PinDropGeocoder;
  reverseGeocoder?: PinDropReverseGeocoder | null;
  locate?: boolean;
  interactive?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  showAtmosphere?: boolean;
  colors?: Partial<PinDropColors>;
  relief?: number;
  marker?: boolean | PinDropMarker;
  markerZoom?: boolean;
  label?: string;
  texture?: string;
  onLocationChange?: (position: PinDropPosition) => void;
  onPermissionChange?: (permission: PinDropPermission) => void;
  onStatusChange?: (status: PinDropStatus) => void;
}

export const pinDropColors: PinDropColors = {
  ocean: "#2e94ed",
  deepOcean: "#14339e",
  land: "#78e05c",
  coast: "#339e42",
  glow: "#73b8ff",
};

const DEFAULT_TEXTURE = "https://cloverui.vercel.app/textures/earth-land.png";
const DEFAULT_MARKER: Required<PinDropMarker> = { color: "#ff0004", ringColor: "#ffffff" };
const RADIANS = Math.PI / 180;
const RADIUS = 0.84;
const TILT = 0.6;
const IDLE_LATITUDE = 0.32;
const MAX_LATITUDE = 1.2;
const RECENTER_DEGREES = 6;
const LOOKUP_DELAY = 350;
const LOOKUP_TIMEOUT = 8000;
const FADE_MS = 300;
const MAX_PIXEL_RATIO = 2;
const SETTLED = 3e-4;
const FLING_DECAY = 0.004;
const MAX_FLING = 0.006;
const CACHE_LIMIT = 50;

const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;
out vec2 vPosition;
void main() {
  vPosition = aPosition;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform sampler2D uMap;
uniform mat3 uTurn;
uniform float uPixel;
uniform float uReady;
uniform float uAtmosphere;
uniform float uRelief;
uniform vec3 uOcean;
uniform vec3 uDeepOcean;
uniform vec3 uLand;
uniform vec3 uCoast;
uniform vec3 uGlow;
in vec2 vPosition;
out vec4 outColor;
const float PI = 3.141592653589793;
const float RADIUS = ${RADIUS.toFixed(2)};
const vec2 RAISE = vec2(0.009, -0.013);
const vec3 LIGHT = normalize(vec3(-0.45, 0.55, 0.75));
vec3 sphere(vec2 point) {
  float flat2 = dot(point, point);
  if (flat2 > 0.9998) {
    point *= 0.9999 * inversesqrt(flat2);
    flat2 = 0.9998;
  }
  return vec3(point, sqrt(1.0 - flat2));
}
vec2 toUv(vec3 normal) {
  vec3 world = uTurn * normal;
  return vec2(atan(world.x, world.z) / (2.0 * PI) + 0.5, 0.5 - asin(clamp(world.y, -1.0, 1.0)) / PI);
}
float landAt(vec2 point, vec2 dx, vec2 dy) {
  return textureGrad(uMap, toUv(sphere(point)), dx, dy).r;
}
void main() {
  vec2 point = vPosition / RADIUS;
  float distance = length(point);
  float edge = uPixel / RADIUS;
  float halo = pow(clamp(1.0 - (distance - 1.0) / 0.06, 0.0, 1.0), 2.0) * 0.3 * uAtmosphere;
  vec3 normal = sphere(point);
  vec2 uv = toUv(normal);
  vec2 wrapped = vec2(fract(uv.x + 0.5) - 0.5, uv.y);
  vec2 dx = dFdx(uv);
  vec2 dy = dFdy(uv);
  vec2 wrappedDx = dFdx(wrapped);
  vec2 wrappedDy = dFdy(wrapped);
  if (abs(wrappedDx.x) < abs(dx.x)) dx.x = wrappedDx.x;
  if (abs(wrappedDy.x) < abs(dy.x)) dy.x = wrappedDy.x;
  if (distance > 1.0 + edge) {
    outColor = vec4(uGlow * halo, halo);
    return;
  }
  float body = smoothstep(1.0 + edge, 1.0 - edge, distance);
  float top = textureGrad(uMap, uv, dx, dy).r;
  float side = 0.0;
  float shadow = 0.0;
  if (uRelief > 0.0) {
    vec2 depth = RAISE * uRelief * (0.35 + 0.65 * normal.z);
    side = max(landAt(point - depth * 0.5, dx, dy), landAt(point - depth, dx, dy));
    shadow = landAt(point - depth * 1.8, dx * 6.0, dy * 6.0);
  }
  top *= uReady;
  side *= uReady;
  shadow *= uReady;
  float lit = max(dot(normal, LIGHT), 0.0);
  vec3 ocean = mix(uDeepOcean, uOcean, smoothstep(0.05, 0.95, lit));
  ocean *= 1.0 - 0.28 * shadow * (1.0 - side);
  vec3 coast = uCoast * mix(0.65, 1.0, lit);
  vec3 land = uLand * mix(0.7, 1.0, smoothstep(0.1, 0.95, lit));
  vec3 color = mix(mix(ocean, coast, side), land, top);
  float rim = pow(1.0 - normal.z, 3.0);
  color = mix(color, uDeepOcean * 0.45, rim * 0.35);
  color = mix(color, uGlow, rim * 0.15 * uAtmosphere);
  outColor = vec4(color * body + uGlow * halo * (1.0 - body), body + halo * (1.0 - body));
}`;

type View = { lng: number; lat: number };

type Rgb = [number, number, number];

type Drag = {
  x: number;
  y: number;
  view: View;
  lastX: number;
  lastY: number;
  lastTime: number;
};

type Globe = {
  view: View;
  velocity: View;
  drag: Drag | null;
  shown: PinDropCoordinates | null;
  anchor: PinDropCoordinates | null;
};

type Settings = { spin: number; autoRotate: boolean; motion: boolean };

type Renderer = {
  setMap: (map: ImageBitmap) => void;
  setColors: (colors: Record<keyof PinDropColors, Rgb>) => void;
  setRelief: (relief: number) => void;
  setAtmosphere: (on: boolean) => void;
  draw: (view: View, width: number, time: number) => boolean;
  destroy: () => void;
};

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error("shader");
  return shader;
}

function createRenderer(canvas: HTMLCanvasElement): Renderer {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
  });
  if (!gl) throw new Error("webgl2");

  const program = gl.createProgram();
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("program");
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const map = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, map);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, 1, 1, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array([0]));

  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const uniforms = {
    turn: uniform("uTurn"),
    pixel: uniform("uPixel"),
    ready: uniform("uReady"),
    atmosphere: uniform("uAtmosphere"),
    relief: uniform("uRelief"),
    ocean: uniform("uOcean"),
    deepOcean: uniform("uDeepOcean"),
    land: uniform("uLand"),
    coast: uniform("uCoast"),
    glow: uniform("uGlow"),
  };
  const turn = new Float32Array(9);

  let hasMap = false;
  let mapTime = -1;
  let ready = 0;
  let dirty = true;
  let lastLng = NaN;
  let lastLat = NaN;
  let lastSize = 0;

  return {
    setMap(bitmap) {
      if (gl.isContextLost()) return;
      gl.bindTexture(gl.TEXTURE_2D, map);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, bitmap);
      gl.generateMipmap(gl.TEXTURE_2D);
      const anisotropy = gl.getExtension("EXT_texture_filter_anisotropic");
      if (anisotropy) {
        gl.texParameterf(
          gl.TEXTURE_2D,
          anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,
          Math.min(8, gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT)),
        );
      }
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      hasMap = true;
      mapTime = -1;
      ready = 0;
      dirty = true;
    },
    setColors(colors) {
      gl.uniform3fv(uniforms.ocean, colors.ocean);
      gl.uniform3fv(uniforms.deepOcean, colors.deepOcean);
      gl.uniform3fv(uniforms.land, colors.land);
      gl.uniform3fv(uniforms.coast, colors.coast);
      gl.uniform3fv(uniforms.glow, colors.glow);
      dirty = true;
    },
    setRelief(relief) {
      gl.uniform1f(uniforms.relief, relief);
      dirty = true;
    },
    setAtmosphere(on) {
      gl.uniform1f(uniforms.atmosphere, on ? 1 : 0);
      dirty = true;
    },
    draw(view, width, time) {
      if (hasMap && ready < 1) {
        if (mapTime < 0) mapTime = time;
        ready = Math.min(1, (time - mapTime) / FADE_MS);
        dirty = true;
      }
      const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      const size = Math.max(1, Math.round(width * ratio));
      if (!dirty && view.lng === lastLng && view.lat === lastLat && size === lastSize) {
        return false;
      }
      dirty = false;
      lastLng = view.lng;
      lastLat = view.lat;
      if (size !== lastSize) {
        lastSize = size;
        canvas.width = size;
        canvas.height = size;
        gl.viewport(0, 0, size, size);
        gl.uniform1f(uniforms.pixel, 2 / size);
      }
      const cosLng = Math.cos(view.lng);
      const sinLng = Math.sin(view.lng);
      const cosLat = Math.cos(view.lat);
      const sinLat = Math.sin(view.lat);
      turn[0] = cosLng;
      turn[1] = 0;
      turn[2] = -sinLng;
      turn[3] = -sinLng * sinLat;
      turn[4] = cosLat;
      turn[5] = -cosLng * sinLat;
      turn[6] = sinLng * cosLat;
      turn[7] = sinLat;
      turn[8] = cosLng * cosLat;
      gl.uniformMatrix3fv(uniforms.turn, false, turn);
      gl.uniform1f(uniforms.ready, ready);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      return hasMap && ready < 1;
    },
    destroy() {
      gl.deleteTexture(map);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

const maps = new Map<string, Promise<ImageBitmap>>();

function loadMap(url: string) {
  let map = maps.get(url);
  if (!map) {
    map = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error("texture");
        return response.blob();
      })
      .then((blob) =>
        createImageBitmap(blob, { premultiplyAlpha: "none", colorSpaceConversion: "none" }),
      );
    map.catch(() => maps.delete(url));
    maps.set(url, map);
  }
  return map;
}

let probe: CanvasRenderingContext2D | null | undefined;

function toRgb(color: string, fallback: string): Rgb {
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!probe) return [0.5, 0.5, 0.5];
  probe.fillStyle = fallback;
  probe.fillStyle = color;
  probe.clearRect(0, 0, 1, 1);
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

function wrapDegrees(value: number) {
  return ((((value + 180) % 360) + 360) % 360) - 180;
}

function wrapRadians(value: number) {
  return Math.atan2(Math.sin(value), Math.cos(value));
}

function clampLatitude(value: number) {
  return Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, value));
}

function distanceDegrees(a: PinDropCoordinates, b: PinDropCoordinates) {
  const dLat = (b.lat - a.lat) * RADIANS;
  const dLng = (b.lng - a.lng) * RADIANS;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * RADIANS) * Math.cos(b.lat * RADIANS) * Math.sin(dLng / 2) ** 2;
  return (2 * Math.asin(Math.min(1, Math.sqrt(h)))) / RADIANS;
}

function project({ lat, lng }: PinDropCoordinates, view: View) {
  const latitude = lat * RADIANS;
  const longitude = lng * RADIANS;
  const x = Math.cos(latitude) * Math.sin(longitude);
  const y = Math.sin(latitude);
  const z = Math.cos(latitude) * Math.cos(longitude);
  const turnedX = x * Math.cos(view.lng) - z * Math.sin(view.lng);
  const turnedZ = x * Math.sin(view.lng) + z * Math.cos(view.lng);
  const tiltedY = y * Math.cos(view.lat) - turnedZ * Math.sin(view.lat);
  const tiltedZ = y * Math.sin(view.lat) + turnedZ * Math.cos(view.lat);
  return { x: (1 + turnedX * RADIUS) / 2, y: (1 - tiltedY * RADIUS) / 2, z: tiltedZ };
}

function isCoordinates(value: PinDropCoordinates | undefined | null): value is PinDropCoordinates {
  return (
    !!value && Number.isFinite(value.lat) && Number.isFinite(value.lng) && Math.abs(value.lat) <= 90
  );
}

function advance(
  globe: Globe,
  target: PinDropCoordinates | null,
  settings: Settings,
  elapsed: number,
  time: number,
) {
  const ease = (rate: number) => (settings.motion ? 1 - Math.exp(-elapsed * rate) : 1);
  let moving = false;

  if (target) {
    const shown = globe.shown;
    if (!shown) {
      globe.shown = { lat: target.lat, lng: target.lng };
    } else {
      const step = ease(0.004);
      const dLat = target.lat - shown.lat;
      const dLng = wrapDegrees(target.lng - shown.lng);
      shown.lat += dLat * step;
      shown.lng = wrapDegrees(shown.lng + dLng * step);
      if (Math.abs(dLat) > SETTLED || Math.abs(dLng) > SETTLED) moving = true;
    }
    if (!globe.anchor || distanceDegrees(globe.anchor, target) > RECENTER_DEGREES) {
      globe.anchor = { lat: target.lat, lng: target.lng };
    }
  } else {
    globe.shown = null;
    globe.anchor = null;
  }

  const view = globe.view;
  if (globe.drag) return true;

  const velocity = globe.velocity;
  if (velocity.lng !== 0 || velocity.lat !== 0) {
    view.lng += velocity.lng * elapsed;
    view.lat = clampLatitude(view.lat + velocity.lat * elapsed);
    const decay = Math.exp(-elapsed * FLING_DECAY);
    velocity.lng *= decay;
    velocity.lat *= decay;
    if (Math.hypot(velocity.lng, velocity.lat) < 1e-5) {
      velocity.lng = 0;
      velocity.lat = 0;
    }
    moving = true;
  }

  const alive = settings.motion && settings.autoRotate;
  const anchor = globe.anchor;
  if (anchor) {
    const sway = alive ? Math.sin(time * 0.00026) * Math.min(settings.spin * 3500, 0.45) : 0;
    const bob = alive ? Math.sin(time * 0.00019) * 0.06 : 0;
    const dLng = wrapRadians(anchor.lng * RADIANS + sway - view.lng);
    const dLat = anchor.lat * RADIANS * TILT + bob - view.lat;
    const step = ease(0.0028);
    view.lng += dLng * step;
    view.lat += dLat * step;
    if (alive || Math.abs(dLng) > SETTLED || Math.abs(dLat) > SETTLED) moving = true;
  } else {
    if (alive) {
      view.lng -= settings.spin * elapsed;
      moving = true;
    }
    const dLat = IDLE_LATITUDE - view.lat;
    view.lat += dLat * ease(0.002);
    if (Math.abs(dLat) > SETTLED) moving = true;
  }

  view.lng = wrapRadians(view.lng);
  return moving;
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
      properties?: { name?: string };
    }[];
  };
  const feature = data.features?.[0];
  const coordinates = feature?.geometry?.coordinates;
  if (!coordinates) return null;
  return { name: feature?.properties?.name ?? query, lat: coordinates[1], lng: coordinates[0] };
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
    const cached = cache.get(query);
    if (cached) return;
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
      { enableHighAccuracy: false, maximumAge: 600000, timeout: 15000 },
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

function PinDrop({
  size = 360,
  location,
  place,
  geocoder = photonGeocoder,
  reverseGeocoder = bigDataCloudReverseGeocoder,
  locate = false,
  interactive = true,
  autoRotate = true,
  autoRotateSpeed = 6,
  showAtmosphere = true,
  colors,
  relief = 1,
  marker = true,
  markerZoom = true,
  label: labelProp,
  texture = DEFAULT_TEXTURE,
  onLocationChange,
  onPermissionChange,
  onStatusChange,
  className,
  style,
  ...props
}: PinDropProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const markerRef = React.useRef<HTMLDivElement>(null);
  const pinRef = React.useRef<HTMLDivElement>(null);
  const rendererRef = React.useRef<Renderer | null>(null);
  const wakeRef = React.useRef<() => void>(() => {});
  const globeRef = React.useRef<Globe>({
    view: { lng: 0, lat: IDLE_LATITUDE },
    velocity: { lng: 0, lat: 0 },
    drag: null,
    shown: null,
    anchor: null,
  });
  const targetRef = React.useRef<PinDropCoordinates | null>(null);
  const settingsRef = React.useRef<Settings>({ spin: 0, autoRotate: true, motion: true });
  const visibleRef = React.useRef(true);
  const widthRef = React.useRef(0);
  const onStatusChangeRef = React.useRef(onStatusChange);
  const [failed, setFailed] = React.useState(false);
  const [generation, setGeneration] = React.useState(0);
  const gradientId = React.useId();
  const supported = useGeolocationSupport();
  const motionEnabled = !useReducedMotion();
  const found = usePlace(place?.trim() ?? "", geocoder);
  const visitor = useVisitorLocation(locate && supported, {
    reverseGeocoder,
    onLocationChange,
    onPermissionChange,
  });
  const status: PinDropStatus = !locate
    ? "idle"
    : !supported
      ? "unsupported"
      : (visitor.result ?? "locating");
  const markerStyle = { ...DEFAULT_MARKER, ...(typeof marker === "object" ? marker : {}) };
  const palette = { ...pinDropColors, ...colors };
  const paletteKey = `${palette.ocean}|${palette.deepOcean}|${palette.land}|${palette.coast}|${palette.glow}`;
  const reliefAmount = Number.isFinite(relief) ? Math.max(0, Math.min(3, relief)) : 1;

  React.useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
    targetRef.current = visitor.position ?? found ?? (isCoordinates(location) ? location : null);
    settingsRef.current = {
      spin: (autoRotateSpeed * RADIANS) / 1000,
      autoRotate,
      motion: motionEnabled,
    };
    wakeRef.current();
  });

  React.useEffect(() => {
    onStatusChangeRef.current?.(status);
  }, [status]);

  React.useEffect(() => {
    let frame = 0;
    let last = 0;

    const placeMarker = () => {
      const node = markerRef.current;
      if (!node) return;
      const shown = globeRef.current.shown;
      if (!shown) {
        node.style.opacity = "0";
        return;
      }
      const spot = project(shown, globeRef.current.view);
      const width = widthRef.current;
      const depth = Math.max(0, spot.z);
      node.style.transform = `translate3d(${spot.x * width}px, ${spot.y * width}px, 0)`;
      if (pinRef.current)
        pinRef.current.style.transform = `scale(${0.62 + 0.38 * Math.sqrt(depth)})`;
      node.style.opacity = String(Math.min(1, depth * 5));
    };

    const canRun = () => visibleRef.current && !document.hidden;

    const tick = (time: number) => {
      frame = 0;
      const elapsed = Math.max(0, Math.min(time - last, 64));
      last = time;
      const moving = advance(
        globeRef.current,
        targetRef.current,
        settingsRef.current,
        elapsed,
        time,
      );
      const fading = rendererRef.current?.draw(globeRef.current.view, widthRef.current, time);
      placeMarker();
      if ((moving || fading) && canRun()) frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (frame || !canRun()) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    wakeRef.current = wake;
    document.addEventListener("visibilitychange", wake);
    wake();
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", wake);
      wakeRef.current = () => {};
    };
  }, []);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const visibility = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      wakeRef.current();
    });
    const resize = new ResizeObserver(([entry]) => {
      widthRef.current = entry.contentRect.width;
      wakeRef.current();
    });
    widthRef.current = host.clientWidth;
    visibility.observe(host);
    resize.observe(host);
    return () => {
      visibility.disconnect();
      resize.disconnect();
    };
  }, []);

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage || failed) return;

    const canvas = document.createElement("canvas");
    canvas.className = "absolute inset-0 block size-full";
    canvas.setAttribute("aria-hidden", "true");
    const onLost = (event: Event) => event.preventDefault();
    const onRestored = () => setGeneration((value) => value + 1);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    stage.append(canvas);

    try {
      rendererRef.current = createRenderer(canvas);
    } catch {
      canvas.remove();
      setFailed(true);
      return;
    }
    wakeRef.current();

    return () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      rendererRef.current?.destroy();
      rendererRef.current = null;
      canvas.remove();
    };
  }, [failed, generation]);

  React.useEffect(() => {
    let cancelled = false;
    loadMap(texture)
      .then((bitmap) => {
        if (cancelled) return;
        rendererRef.current?.setMap(bitmap);
        wakeRef.current();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [texture, failed, generation]);

  React.useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    const [ocean, deepOcean, land, coast, glow] = paletteKey.split("|");
    renderer.setColors({
      ocean: toRgb(ocean, pinDropColors.ocean),
      deepOcean: toRgb(deepOcean, pinDropColors.deepOcean),
      land: toRgb(land, pinDropColors.land),
      coast: toRgb(coast, pinDropColors.coast),
      glow: toRgb(glow, pinDropColors.glow),
    });
    renderer.setRelief(reliefAmount);
    renderer.setAtmosphere(showAtmosphere);
    wakeRef.current();
  }, [paletteKey, reliefAmount, showAtmosphere, failed, generation]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const globe = globeRef.current;
    globe.velocity = { lng: 0, lat: 0 };
    globe.drag = {
      x: event.clientX,
      y: event.clientY,
      view: { ...globe.view },
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: event.timeStamp,
    };
    wakeRef.current();
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const globe = globeRef.current;
    const drag = globe.drag;
    if (!drag) return;
    const perPixel = 2 / (Math.max(widthRef.current, 1) * RADIUS);
    globe.view.lng = drag.view.lng - (event.clientX - drag.x) * perPixel;
    globe.view.lat = clampLatitude(drag.view.lat + (event.clientY - drag.y) * perPixel);
    const dt = event.timeStamp - drag.lastTime;
    if (dt > 0) {
      const fling = (value: number) =>
        Math.max(-MAX_FLING, Math.min(MAX_FLING, (value * perPixel) / dt));
      globe.velocity = {
        lng: globe.velocity.lng * 0.4 - fling(event.clientX - drag.lastX) * 0.6,
        lat: globe.velocity.lat * 0.4 + fling(event.clientY - drag.lastY) * 0.6,
      };
    }
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastTime = event.timeStamp;
    wakeRef.current();
  };

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    const globe = globeRef.current;
    const drag = globe.drag;
    if (!drag) return;
    if (!motionEnabled || event.timeStamp - drag.lastTime > 80) {
      globe.velocity = { lng: 0, lat: 0 };
    }
    globe.drag = null;
    wakeRef.current();
  };

  const label = labelProp ?? (status === "located" ? visitor.cityName : found?.name) ?? undefined;

  const description =
    status === "located"
      ? "Globe showing your city"
      : found || isCoordinates(location)
        ? "Globe showing a location"
        : "Globe";

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label={label ? `${description}: ${label}` : description}
      className={cn("relative isolate aspect-square max-w-full shrink-0 select-none", className)}
      style={{ width: size, ...style }}
      {...props}
    >
      {failed ? (
        <div className="border-border bg-muted absolute inset-[8%] rounded-full border" />
      ) : (
        <div
          ref={stageRef}
          className={cn(
            "absolute inset-0",
            interactive && "cursor-grab touch-none active:cursor-grabbing",
          )}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onLostPointerCapture={stopDragging}
        />
      )}
      {marker !== false && (
        <div
          ref={markerRef}
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 size-0 opacity-0 will-change-transform"
        >
          <div ref={pinRef} className="absolute top-0 left-0 size-0 origin-top-left">
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              className="absolute -top-[23px] -left-3.5 h-7 w-7 overflow-visible"
              style={{
                transformOrigin: "50% 92%",
                filter: "drop-shadow(0 1px 2px rgb(0 0 0 / 0.45))",
              }}
              initial={{ scale: 1 }}
              animate={markerZoom && motionEnabled ? { scale: [1, 1.14, 1] } : undefined}
              transition={{ duration: 2.6, ease: [0.45, 0, 0.55, 1], repeat: Infinity }}
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
          </div>
          {label && (
            <span
              className="absolute top-2.5 left-0 max-w-40 -translate-x-1/2 truncate rounded-full border px-2 py-[3px] text-xs leading-none font-semibold whitespace-nowrap backdrop-blur-sm"
              style={{
                color: markerStyle.ringColor,
                backgroundColor: `color-mix(in srgb, color-mix(in srgb, ${markerStyle.color} 18%, black) 82%, transparent)`,
                borderColor: `color-mix(in srgb, ${markerStyle.ringColor} 22%, transparent)`,
                boxShadow: "0 2px 6px rgb(0 0 0 / 0.35)",
              }}
            >
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

PinDrop.displayName = "PinDrop";

export { PinDrop };
