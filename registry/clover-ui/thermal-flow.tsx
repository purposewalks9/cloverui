"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type ThermalFlowTheme =
  "thermal" | "aurora" | "sunset" | "ocean" | "ember" | "candy" | "mono";

export const THERMAL_FLOW_THEMES: Record<ThermalFlowTheme, string[]> = {
  thermal: ["#04040c", "#0b1fd6", "#2a7cff", "#59b8f5", "#f6e04a", "#f79a20", "#f0401a"],
  aurora: ["#02030a", "#0b2a5b", "#0aa3a3", "#3df2a7", "#c5f56b", "#ff8bd0", "#b14dff"],
  sunset: ["#0a0414", "#3a0ca3", "#b5179e", "#f72585", "#ff7a3d", "#ffd166", "#fff1b8"],
  ocean: ["#020617", "#0b2a6f", "#0e6bd8", "#22d3ee", "#a5f3fc", "#e0fbff", "#ffffff"],
  ember: ["#050203", "#3b0a0a", "#8f1d0f", "#e8420f", "#ff9a1f", "#ffd36b", "#fff3c4"],
  candy: ["#12061f", "#5b21b6", "#a855f7", "#f472b6", "#fda4af", "#fde68a", "#a7f3d0"],
  mono: ["#050505", "#1a1a1a", "#4a4a4a", "#8a8a8a", "#c8c8c8", "#f2f2f2", "#ffffff"],
};

export interface ThermalFlowProps {
  theme?: ThermalFlowTheme;
  colors?: string[];
  bands?: number;
  scale?: number;
  warp?: number;
  softness?: number;
  grain?: number;
  animate?: boolean;
  speed?: number;
  resolution?: number;
  radius?: string;
  backgroundColor?: string;
  style?: React.CSSProperties;
  className?: string;
}

const MAX_STOPS = 8;

function parseColor(input: string): [number, number, number] {
  const s = input.trim();
  if (s.startsWith("#")) {
    let c = s.slice(1);
    if (c.length === 3 || c.length === 4)
      c = c
        .split("")
        .map((x) => x + x)
        .join("");
    if (c.length >= 6) {
      return [
        parseInt(c.slice(0, 2), 16) / 255,
        parseInt(c.slice(2, 4), 16) / 255,
        parseInt(c.slice(4, 6), 16) / 255,
      ];
    }
  }
  const m = s.match(/rgba?\(([^)]+)\)/i);
  if (m) {
    const [r, g, b] = m[1].split(",").map((x) => parseFloat(x));
    return [r / 255, g / 255, b / 255];
  }
  return [0, 0, 0];
}

function buildPalette(colors: string[]) {
  const rgb = colors.slice(0, MAX_STOPS).map(parseColor);
  const data = new Float32Array(MAX_STOPS * 3);
  for (let i = 0; i < MAX_STOPS; i++) {
    const c = rgb[Math.min(i, rgb.length - 1)];
    data.set(c, i * 3);
  }
  return { data, count: rgb.length };
}

type Live = {
  palette: { data: Float32Array; count: number };
  bands: number;
  scale: number;
  warp: number;
  softness: number;
  grain: number;
  animate: boolean;
  speed: number;
  resolution: number;
};

const VERTEX = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAGMENT = `
#extension GL_OES_standard_derivatives : enable
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_pal[8];
uniform float u_n;
uniform float u_bands;
uniform float u_scale;
uniform float u_warp;
uniform float u_soft;
uniform float u_grain;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  return 0.6 * snoise(p) + 0.25 * snoise(p * 2.0 + vec2(17.1, 9.3));
}

vec3 pal(float t) {
  t = clamp(t, 0.0, 1.0) * (u_n - 1.0);
  vec3 c = u_pal[0];
  for (int i = 0; i < 7; i++) {
    float k = clamp(t - float(i), 0.0, 1.0);
    k = k * k * (3.0 - 2.0 * k);
    c = mix(c, u_pal[i + 1], k);
  }
  return c;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (uv - 0.5) * vec2(u_res.x / u_res.y, 1.0) * 0.6 / u_scale;
  float t = u_time * 0.12;

  vec2 q = vec2(fbm(p + vec2(t * 0.5, 0.0)), fbm(p + vec2(5.2, 1.3 - t * 0.4)));
  float f = fbm(p + u_warp * 0.6 * q);

  float v = (f * 0.85 + 0.5) * u_bands + u_time * 0.03;
  float fr = fract(v);

#ifdef GL_OES_standard_derivatives
  float fw = fwidth(v);
#else
  float fw = 0.004;
#endif

  float w = u_soft + fw * 1.5;
  float d = min(fr, 1.0 - fr);
  vec3 c = pal(fr);
  vec3 across = fr < 0.5 ? pal(1.0) : pal(0.0);
  float k = clamp(d / w, 0.0, 1.0);
  c = mix(c, across, 0.5 * (1.0 - k * k * (3.0 - 2.0 * k)));

  float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  c += n * u_grain * 0.06;

  gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}
`;

function ThermalFlow({
  theme = "thermal",
  colors,
  bands = 1,
  scale = 1,
  warp = 1,
  softness = 0.005,
  grain = 0.35,
  animate = true,
  speed = 1,
  resolution = 0.75,
  radius,
  backgroundColor,
  style,
  className,
}: ThermalFlowProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const syncRef = React.useRef<(() => void) | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [nonce, setNonce] = React.useState(0);

  const list = colors && colors.length >= 2 ? colors : THERMAL_FLOW_THEMES[theme];
  const listKey = JSON.stringify(list);
  const palette = React.useMemo(() => buildPalette(JSON.parse(listKey)), [listKey]);

  const live = React.useRef<Live>({
    palette,
    bands,
    scale,
    warp,
    softness,
    grain,
    animate,
    speed,
    resolution,
  });

  React.useEffect(() => {
    live.current = { palette, bands, scale, warp, softness, grain, animate, speed, resolution };
    syncRef.current?.();
  });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    if (!gl) {
      setFailed(true);
      return;
    }
    gl.getExtension("OES_standard_derivatives");

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("ThermalFlow shader:", gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    const vs = compile(gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram()!;
    if (!vs || !fs) {
      setFailed(true);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("ThermalFlow link:", gl.getProgramInfoLog(program));
      setFailed(true);
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const loc = {
      res: u("u_res"),
      time: u("u_time"),
      pal: u("u_pal[0]"),
      n: u("u_n"),
      bands: u("u_bands"),
      scale: u("u_scale"),
      warp: u("u_warp"),
      soft: u("u_soft"),
      grain: u("u_grain"),
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = true;
    let last = 0;
    let time = Math.random() * 50;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const res = Math.min(1, Math.max(0.25, live.current.resolution));
      const w = Math.max(1, Math.round(host.clientWidth * dpr * res));
      const h = Math.max(1, Math.round(host.clientHeight * dpr * res));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const draw = () => {
      const L = live.current;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(loc.res, canvas.width, canvas.height);
      gl.uniform1f(loc.time, time);
      gl.uniform3fv(loc.pal, L.palette.data);
      gl.uniform1f(loc.n, L.palette.count);
      gl.uniform1f(loc.bands, L.bands);
      gl.uniform1f(loc.scale, Math.max(0.1, L.scale));
      gl.uniform1f(loc.warp, L.warp);
      gl.uniform1f(loc.soft, L.softness);
      gl.uniform1f(loc.grain, L.grain);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const tick = (now: number) => {
      raf = 0;
      const L = live.current;
      const moving = L.animate && L.speed !== 0 && !reduced;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      if (moving) time += dt * L.speed;
      draw();
      if (moving && visible && !document.hidden) raf = requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };

    syncRef.current = () => {
      resize();
      schedule();
    };

    resize();
    schedule();

    const ro = new ResizeObserver(() => syncRef.current?.());
    ro.observe(host);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
    });
    io.observe(host);

    const onVisibility = () => {
      if (!document.hidden) schedule();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onLost = (e: Event) => {
      e.preventDefault();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const onRestored = () => setNonce((n) => n + 1);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      syncRef.current = null;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [nonce]);

  const first = list[0];
  const fallbackGradient = `linear-gradient(135deg, ${list.join(", ")})`;

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{
        borderRadius: radius,
        backgroundColor: backgroundColor ?? first,
        backgroundImage: failed ? fallbackGradient : undefined,
        ...style,
      }}
    >
      {!failed && <canvas ref={canvasRef} className="block h-full w-full" />}
    </div>
  );
}

ThermalFlow.displayName = "ThermalFlow";

export { ThermalFlow };
