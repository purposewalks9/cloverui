"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export type CityLocatorStatus =
  "idle" | "locating" | "located" | "denied" | "unavailable" | "timeout" | "unsupported";

export type CityLocatorPermission = "prompt" | "granted" | "denied";

export interface CityLocatorCoordinates {
  lat: number;
  lng: number;
}

export interface CityLocatorPosition extends CityLocatorCoordinates {
  accuracy: number;
  timestamp: number;
}

export interface CityLocatorMarker {
  color?: string;
  ringColor?: string;
}

export interface CityLocatorProps extends Omit<React.ComponentProps<"div">, "children"> {
  size?: number;
  location?: CityLocatorCoordinates;
  place?: string;
  geocoder?: CityLocatorGeocoder;
  reverseGeocoder?: CityLocatorReverseGeocoder | null;
  locate?: boolean;
  interactive?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  showAtmosphere?: boolean;
  marker?: boolean | CityLocatorMarker;
  markerZoom?: boolean;
  label?: string;
  texture?: string;
  onLocationChange?: (position: CityLocatorPosition) => void;
  onPermissionChange?: (permission: CityLocatorPermission) => void;
  onStatusChange?: (status: CityLocatorStatus) => void;
}

type View = { lng: number; lat: number };

type Earth = {
  draw: (view: View, atmosphere: boolean) => void;
  destroy: () => void;
};

const DEFAULT_TEXTURE = "https://cloverui.vercel.app/textures/earth.jpg";
const DEFAULT_MARKER: Required<CityLocatorMarker> = { color: "#ff0004", ringColor: "#ffffff" };
const RADIANS = Math.PI / 180;
const RADIUS = 0.84;
const TILT = 0.6;
const IDLE_LATITUDE = 0.32;
const RECENTER_DEGREES = 6;
const LOOKUP_TIMEOUT = 8000;

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
uniform vec2 uView;
uniform float uRadius;
uniform float uPixel;
uniform float uReady;
uniform float uAtmosphere;
in vec2 vPosition;
out vec4 outColor;
const float PI = 3.141592653589793;
void main() {
  vec2 point = vPosition / uRadius;
  float distance = length(point);
  float edge = uPixel / uRadius;
  vec3 air = vec3(0.38, 0.62, 1.0);
  float halo = pow(clamp(1.0 - (distance - 1.0) / 0.07, 0.0, 1.0), 2.0) * 0.45 * uAtmosphere;
  float body = smoothstep(1.0 + edge, 1.0 - edge, distance);
  vec3 normal = vec3(point, sqrt(max(0.0, 1.0 - distance * distance)));
  float cosLat = cos(uView.y);
  float sinLat = sin(uView.y);
  vec3 tilted = vec3(normal.x, normal.y * cosLat + normal.z * sinLat, -normal.y * sinLat + normal.z * cosLat);
  float cosLng = cos(uView.x);
  float sinLng = sin(uView.x);
  vec3 world = vec3(tilted.x * cosLng + tilted.z * sinLng, tilted.y, -tilted.x * sinLng + tilted.z * cosLng);
  float lat = asin(clamp(world.y, -1.0, 1.0));
  float lng = atan(world.x, world.z);
  vec2 uv = vec2(lng / (2.0 * PI) + 0.5, 0.5 - lat / PI);
  vec2 wrapped = vec2(fract(uv.x + 0.5) - 0.5, uv.y);
  vec2 dx = dFdx(uv);
  vec2 dy = dFdy(uv);
  vec2 wrappedDx = dFdx(wrapped);
  vec2 wrappedDy = dFdy(wrapped);
  if (abs(wrappedDx.x) < abs(dx.x)) dx.x = wrappedDx.x;
  if (abs(wrappedDy.x) < abs(dy.x)) dy.x = wrappedDy.x;
  vec3 surface = mix(vec3(0.03, 0.08, 0.2), textureGrad(uMap, uv, dx * 0.5, dy * 0.5).rgb, uReady);
  surface = mix(vec3(dot(surface, vec3(0.299, 0.587, 0.114))), surface, 1.18);
  surface = pow(max(surface, 0.0), vec3(1.06)) * vec3(0.96, 1.0, 1.05);
  vec3 light = normalize(vec3(-0.4, 0.45, 0.8));
  float shade = 0.7 + 0.42 * max(dot(normal, light), 0.0);
  vec3 color = surface * shade;
  float rim = pow(1.0 - normal.z, 3.5);
  color = mix(color, air, rim * 0.22 * uAtmosphere);
  vec3 glow = air * halo;
  outColor = vec4(color * body + glow * (1.0 - body), body + halo * (1.0 - body));
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error("shader");
  return shader;
}

function createEarth(canvas: HTMLCanvasElement, texture: string): Earth {
  const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: true });
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
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([8, 20, 51, 255]),
  );

  const uniforms = {
    view: gl.getUniformLocation(program, "uView"),
    radius: gl.getUniformLocation(program, "uRadius"),
    pixel: gl.getUniformLocation(program, "uPixel"),
    ready: gl.getUniformLocation(program, "uReady"),
    atmosphere: gl.getUniformLocation(program, "uAtmosphere"),
  };

  let loaded = false;
  let ready = 0;
  let last = "";
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.decoding = "async";
  image.onload = () => {
    if (gl.isContextLost()) return;
    gl.bindTexture(gl.TEXTURE_2D, map);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
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
    loaded = true;
  };
  image.src = texture;

  return {
    draw(view, atmosphere) {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const size = Math.max(1, Math.round(canvas.clientWidth * dpr));
      if (loaded && ready < 1) ready = Math.min(1, ready + 0.08);
      const key = `${size}:${view.lng.toFixed(5)}:${view.lat.toFixed(5)}:${ready}:${atmosphere}`;
      if (key === last) return;
      last = key;
      if (canvas.width !== size || canvas.height !== size) {
        canvas.width = size;
        canvas.height = size;
      }
      gl.viewport(0, 0, size, size);
      gl.uniform2f(uniforms.view, view.lng, view.lat);
      gl.uniform1f(uniforms.radius, RADIUS);
      gl.uniform1f(uniforms.pixel, 2 / size);
      gl.uniform1f(uniforms.ready, ready);
      gl.uniform1f(uniforms.atmosphere, atmosphere ? 1 : 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    destroy() {
      image.onload = null;
      gl.deleteTexture(map);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

function wrapDegrees(value: number) {
  return ((((value + 180) % 360) + 360) % 360) - 180;
}

function wrapRadians(value: number) {
  return Math.atan2(Math.sin(value), Math.cos(value));
}

function distanceDegrees(a: CityLocatorCoordinates, b: CityLocatorCoordinates) {
  const dLat = (b.lat - a.lat) * RADIANS;
  const dLng = (b.lng - a.lng) * RADIANS;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * RADIANS) * Math.cos(b.lat * RADIANS) * Math.sin(dLng / 2) ** 2;
  return (2 * Math.asin(Math.min(1, Math.sqrt(h)))) / RADIANS;
}

function project({ lat, lng }: CityLocatorCoordinates, view: View) {
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

export interface CityLocatorPlace extends CityLocatorCoordinates {
  name: string;
}

export type CityLocatorGeocoder = (
  query: string,
  signal: AbortSignal,
) => Promise<CityLocatorPlace | null>;

type PhotonResponse = {
  features?: {
    geometry?: { coordinates?: [number, number] };
    properties?: { name?: string };
  }[];
};

export const photonGeocoder: CityLocatorGeocoder = async (query, signal) => {
  const response = await fetch(
    `https://photon.komoot.io/api/?limit=1&q=${encodeURIComponent(query)}`,
    { signal },
  );
  if (!response.ok) return null;
  const data = (await response.json()) as PhotonResponse;
  const feature = data.features?.[0];
  const coordinates = feature?.geometry?.coordinates;
  if (!coordinates) return null;
  return { name: feature?.properties?.name ?? query, lat: coordinates[1], lng: coordinates[0] };
};

export type CityLocatorReverseGeocoder = (
  coordinates: CityLocatorCoordinates,
  signal: AbortSignal,
) => Promise<string | null>;

type BigDataCloudResponse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
};

export const bigDataCloudReverseGeocoder: CityLocatorReverseGeocoder = async (
  { lat, lng },
  signal,
) => {
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat.toFixed(2)}&longitude=${lng.toFixed(2)}&localityLanguage=en`,
    { signal },
  );
  if (!response.ok) return null;
  const data = (await response.json()) as BigDataCloudResponse;
  return data.city || data.locality || data.principalSubdivision || data.countryName || null;
};

function isCoordinates(value: CityLocatorCoordinates | undefined | null) {
  return (
    !!value && Number.isFinite(value.lat) && Number.isFinite(value.lng) && Math.abs(value.lat) <= 90
  );
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

function CityLocator({
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
}: CityLocatorProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const markerRef = React.useRef<HTMLDivElement>(null);
  const earthRef = React.useRef<Earth | null>(null);
  const dragRef = React.useRef<{ x: number; y: number; view: View } | null>(null);
  const viewRef = React.useRef<View>({ lng: 0, lat: IDLE_LATITUDE });
  const goalRef = React.useRef<View>({ lng: 0, lat: IDLE_LATITUDE });
  const fixRef = React.useRef<CityLocatorPosition | null>(null);
  const shownRef = React.useRef<CityLocatorCoordinates | null>(null);
  const anchorRef = React.useRef<CityLocatorCoordinates | null>(null);
  const visibleRef = React.useRef(true);
  const widthRef = React.useRef(0);
  const locationRef = React.useRef(location);
  const callbacksRef = React.useRef({ onLocationChange, onPermissionChange, onStatusChange });
  const permissionRef = React.useRef<CityLocatorPermission | null>(null);
  const [result, setResult] = React.useState<CityLocatorStatus | null>(null);
  const [failed, setFailed] = React.useState(false);
  const supported = useGeolocationSupport();
  const reduceMotion = useReducedMotion();
  const motionEnabled = !reduceMotion;
  const [lookup, setLookup] = React.useState<CityLocatorPlace | null>(null);
  const geocoderRef = React.useRef(geocoder);
  const reverseGeocoderRef = React.useRef(reverseGeocoder);
  const [cityName, setCityName] = React.useState<string | null>(null);
  const query = place?.trim() ?? "";
  const found = query ? lookup : null;
  const gradientId = React.useId();
  const zooming = markerZoom && motionEnabled;
  const markerStyle = {
    ...DEFAULT_MARKER,
    ...(typeof marker === "object" ? marker : {}),
  };
  const status: CityLocatorStatus = !locate
    ? "idle"
    : !supported
      ? "unsupported"
      : (result ?? "locating");

  React.useEffect(() => {
    locationRef.current = found ?? location;
    geocoderRef.current = geocoder;
    reverseGeocoderRef.current = reverseGeocoder;
    callbacksRef.current = { onLocationChange, onPermissionChange, onStatusChange };
  });

  React.useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    const expire = window.setTimeout(() => controller.abort(), LOOKUP_TIMEOUT);
    const timer = window.setTimeout(() => {
      geocoderRef
        .current(query, controller.signal)
        .then((result) => {
          if (result && isCoordinates(result)) setLookup(result);
        })
        .catch(() => {});
    }, 350);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(expire);
      controller.abort();
    };
  }, [query]);

  React.useEffect(() => {
    callbacksRef.current.onStatusChange?.(status);
  }, [status]);

  React.useEffect(() => {
    if (!locate || !supported) return;

    let cancelled = false;
    let permissionStatus: PermissionStatus | null = null;
    const lookup = new AbortController();
    const expire = window.setTimeout(() => lookup.abort(), LOOKUP_TIMEOUT * 2);
    const report = (permission: CityLocatorPermission) => {
      if (cancelled || permissionRef.current === permission) return;
      permissionRef.current = permission;
      callbacksRef.current.onPermissionChange?.(permission);
    };

    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((answer) => {
        if (cancelled) return;
        permissionStatus = answer;
        report(answer.state as CityLocatorPermission);
        answer.onchange = () => report(answer.state as CityLocatorPermission);
      })
      .catch(() => {});

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        const { coords } = position;
        const next: CityLocatorPosition = {
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
          timestamp: position.timestamp,
        };
        fixRef.current = next;
        report("granted");
        setResult("located");
        callbacksRef.current.onLocationChange?.(next);
        reverseGeocoderRef
          .current?.({ lat: next.lat, lng: next.lng }, lookup.signal)
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
      fixRef.current = null;
      setCityName(null);
      setResult(null);
    };
  }, [locate, supported]);

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage || failed) return;

    const canvas = document.createElement("canvas");
    canvas.className = "absolute inset-0 block size-full";
    canvas.setAttribute("aria-hidden", "true");
    stage.append(canvas);

    try {
      earthRef.current = createEarth(canvas, texture);
    } catch {
      canvas.remove();
      setFailed(true);
      return;
    }

    return () => {
      earthRef.current?.destroy();
      earthRef.current = null;
      canvas.remove();
    };
  }, [failed, texture]);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
    });
    const resizeObserver = new ResizeObserver(() => {
      widthRef.current = host.clientWidth;
    });
    widthRef.current = host.clientWidth;
    observer.observe(host);
    resizeObserver.observe(host);
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  React.useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const spin = (autoRotateSpeed * RADIANS) / 1000;

    const render = (time: number) => {
      const elapsed = Math.min(time - last, 64);
      last = time;
      frame = requestAnimationFrame(render);
      if (!visibleRef.current || document.hidden) return;

      const ease = (rate: number) => (motionEnabled ? 1 - Math.exp(-elapsed * rate) : 1);
      const fix = fixRef.current;
      const fallback = locationRef.current;
      const point = fix ?? (isCoordinates(fallback) ? fallback! : null);

      if (point) {
        const shown = shownRef.current;
        if (!shown) {
          shownRef.current = { lat: point.lat, lng: point.lng };
        } else {
          const step = ease(0.004);
          shown.lat += (point.lat - shown.lat) * step;
          shown.lng = wrapDegrees(shown.lng + wrapDegrees(point.lng - shown.lng) * step);
        }
        const anchor = anchorRef.current;
        if (!anchor || distanceDegrees(anchor, point) > RECENTER_DEGREES) {
          anchorRef.current = { lat: point.lat, lng: point.lng };
        }
      } else {
        shownRef.current = null;
        anchorRef.current = null;
      }

      const view = viewRef.current;
      const anchor = anchorRef.current;
      if (dragRef.current) {
        const step = ease(0.02);
        view.lng += (goalRef.current.lng - view.lng) * step;
        view.lat += (goalRef.current.lat - view.lat) * step;
      } else if (anchor) {
        const alive = motionEnabled && autoRotate;
        const sway = alive ? Math.sin(time * 0.00026) * Math.min(spin * 3500, 0.45) : 0;
        const bob = alive ? Math.sin(time * 0.00019) * 0.06 : 0;
        const goalLng = anchor.lng * RADIANS + sway;
        const step = ease(0.0028);
        view.lng += wrapRadians(goalLng - view.lng) * step;
        view.lat += (anchor.lat * RADIANS * TILT + bob - view.lat) * step;
      } else {
        if (motionEnabled && autoRotate) view.lng -= spin * elapsed;
        view.lat += (IDLE_LATITUDE - view.lat) * ease(0.002);
      }

      earthRef.current?.draw(view, showAtmosphere);

      const markerNode = markerRef.current;
      const shown = shownRef.current;
      if (markerNode) {
        if (shown) {
          const spot = project(shown, view);
          const width = widthRef.current;
          const depth = Math.max(0, spot.z);
          markerNode.style.transform = `translate3d(${spot.x * width}px, ${spot.y * width}px, 0) scale(${0.62 + 0.38 * Math.sqrt(depth)})`;
          markerNode.style.opacity = String(Math.min(1, depth * 5));
        } else {
          markerNode.style.opacity = "0";
        }
      }
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [autoRotate, autoRotateSpeed, motionEnabled, showAtmosphere]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const view = { ...viewRef.current };
    dragRef.current = { x: event.clientX, y: event.clientY, view };
    goalRef.current = view;
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    goalRef.current = {
      lng: drag.view.lng - (event.clientX - drag.x) * 0.008,
      lat: Math.max(-1.2, Math.min(1.2, drag.view.lat + (event.clientY - drag.y) * 0.006)),
    };
  };

  const stopDragging = () => {
    dragRef.current = null;
  };

  const label = labelProp ?? (status === "located" ? cityName : found?.name) ?? undefined;

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
            "absolute inset-0 touch-none",
            interactive ? "cursor-grab active:cursor-grabbing" : "",
          )}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
        />
      )}
      {marker !== false && (
        <div
          ref={markerRef}
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 size-0 opacity-0 will-change-transform"
        >
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            className="absolute -top-[23px] -left-3.5 h-7 w-7 overflow-visible"
            style={{
              transformOrigin: "50% 92%",
              filter: "drop-shadow(0 1px 2px rgb(0 0 0 / 0.45))",
            }}
            initial={{ scale: 1 }}
            animate={zooming ? { scale: [1, 1.14, 1] } : undefined}
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
          {label && (
            <span
              className="absolute top-2 left-0 -translate-x-1/2 text-[11px] leading-none font-medium tracking-wide whitespace-nowrap"
              style={{
                color: markerStyle.ringColor,
                textShadow: `0 1px 3px color-mix(in srgb, ${markerStyle.color} 15%, black)`,
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

CityLocator.displayName = "CityLocator";

export { CityLocator };
