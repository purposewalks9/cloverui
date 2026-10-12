"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type GrainCubeTheme = "green" | "ember" | "ice" | "violet" | "mono";

export const GRAIN_CUBE_THEMES: Record<GrainCubeTheme, string[]> = {
  green: ["#52c4dc", "#f2f6ea", "#25e15f", "#0b5a2b", "#020604", "#5a410c", "#e6b92c", "#25e15f"],
  ember: ["#ffe9c2", "#ffb02e", "#ff5a1f", "#7a1408", "#050101", "#3a0f3a", "#e0459b", "#ff5a1f"],
  ice: ["#eaf7ff", "#7fd0ff", "#2b6cff", "#0a1f6b", "#02040f", "#1a2a5e", "#6f8bff", "#7fd0ff"],
  violet: ["#f5ecff", "#d18bff", "#7a2cf0", "#2a0a6b", "#050212", "#5a1a5a", "#ff6ad5", "#7a2cf0"],
  mono: ["#ffffff", "#cfcfcf", "#8a8a8a", "#3a3a3a", "#050505", "#2a2a2a", "#9a9a9a", "#ffffff"],
};

export interface GrainCubeProps {
  theme?: GrainCubeTheme;
  colors?: string[];
  size?: number;
  scale?: number;
  warp?: number;
  grain?: number;
  animate?: boolean;
  speed?: number;
  interactive?: boolean;
  resolution?: number;
  style?: React.CSSProperties;
  className?: string;
}

const MAX_STOPS = 8;
const DEFAULT_PITCH = 0.6155;
const DEFAULT_YAW = Math.PI / 4;

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
  for (let i = 0; i < MAX_STOPS; i++) data.set(rgb[Math.min(i, rgb.length - 1)], i * 3);
  return { data, count: rgb.length };
}

function rotation(yaw: number, pitch: number) {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return new Float32Array([cy, 0, sy, sp * sy, cp, -sp * cy, -cp * sy, sp, cp * cy]);
}

type Live = {
  palette: { data: Float32Array; count: number };
  size: number;
  scale: number;
  warp: number;
  grain: number;
  animate: boolean;
  speed: number;
  interactive: boolean;
  resolution: number;
};

const VERTEX = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_pal[8];
uniform float u_n;
uniform mat3 u_rinv;
uniform float u_size;
uniform float u_scale;
uniform float u_warp;
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

bool box(vec3 ro, vec3 rd, out float tN, out vec3 nrm) {
  vec3 inv = 1.0 / rd;
  vec3 t1 = (-1.0 - ro) * inv;
  vec3 t2 = (1.0 - ro) * inv;
  vec3 tmin = min(t1, t2);
  vec3 tmax = max(t1, t2);
  tN = max(max(tmin.x, tmin.y), tmin.z);
  float tF = min(min(tmax.x, tmax.y), tmax.z);
  if (tF <= tN || tF <= 0.0) return false;
  vec3 s = -sign(rd);
  nrm = tN == tmin.x ? vec3(s.x, 0.0, 0.0) : (tN == tmin.y ? vec3(0.0, s.y, 0.0) : vec3(0.0, 0.0, s.z));
  return true;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 fc = gl_FragCoord.xy - 0.5 * u_res;
  float px = 2.0 * (1.732 / u_size) / u_res.y;
  vec3 rd = u_rinv * vec3(0.0, 0.0, -1.0) + vec3(1e-5);

  float cov = 0.0;
  bool any = false;
  vec3 hitP = vec3(0.0);
  vec3 hitN = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    vec2 o = i == 0 ? vec2(-0.25, -0.125) : (i == 1 ? vec2(0.125, -0.25) : (i == 2 ? vec2(0.25, 0.125) : vec2(-0.125, 0.25)));
    vec3 ro = u_rinv * vec3((fc + o) * px, 6.0);
    float t;
    vec3 n;
    if (box(ro, rd, t, n)) {
      cov += 0.25;
      if (!any) {
        any = true;
        hitP = ro + rd * t;
        hitN = n;
      }
    }
  }
  if (!any) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec2 fu;
  float seed;
  vec3 a = abs(hitN);
  if (a.x > 0.5) {
    fu = hitP.yz;
    seed = hitN.x > 0.0 ? 1.0 : 2.0;
  } else if (a.y > 0.5) {
    fu = hitP.xz;
    seed = hitN.y > 0.0 ? 3.0 : 4.0;
  } else {
    fu = hitP.xy;
    seed = hitN.z > 0.0 ? 5.0 : 6.0;
  }

  vec2 p = fu * 0.3 / u_scale + vec2(seed * 13.7, seed * 7.3);
  float t = u_time * 0.15;
  vec2 q = vec2(fbm(p + vec2(t, 0.0)), fbm(p + vec2(5.2, 1.3 - t)));
  float f = fbm(p + u_warp * 0.9 * q);

  float g = hash(gl_FragCoord.xy);
  float lean = 0.24 + 0.4 * fract(sin(seed * 91.7) * 437.5);
  float v = f * 1.0 + lean + (g - 0.5) * u_grain * 0.25;
  vec3 c = pal(v);

  vec3 nw = hitN * u_rinv;
  float lit = clamp(dot(nw, normalize(vec3(-0.35, 0.8, 0.5))), 0.0, 1.0);
  c *= 0.86 + 0.14 * lit;
  c += (g - 0.5) * u_grain * 0.06;
  c = clamp(c, 0.0, 1.0);

  gl_FragColor = vec4(c * cov, cov);
}
`;

function GrainCube({
  theme = "green",
  colors,
  size = 0.7,
  scale = 1,
  warp = 1,
  grain = 0.05,
  animate = true,
  speed = 1,
  interactive = true,
  resolution = 1,
  style,
  className,
}: GrainCubeProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const syncRef = React.useRef<(() => void) | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [nonce, setNonce] = React.useState(0);

  const list = colors && colors.length >= 2 ? colors : GRAIN_CUBE_THEMES[theme];
  const listKey = JSON.stringify(list);
  const palette = React.useMemo(() => buildPalette(JSON.parse(listKey)), [listKey]);

  const live = React.useRef<Live>({
    palette,
    size,
    scale,
    warp,
    grain,
    animate,
    speed,
    interactive,
    resolution,
  });

  React.useEffect(() => {
    live.current = { palette, size, scale, warp, grain, animate, speed, interactive, resolution };
    syncRef.current?.();
  });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    if (!gl) {
      setFailed(true);
      return;
    }

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("GrainCube shader:", gl.getShaderInfoLog(shader));
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
      console.warn("GrainCube link:", gl.getProgramInfoLog(program));
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
    gl.clearColor(0, 0, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const loc = {
      res: u("u_res"),
      time: u("u_time"),
      pal: u("u_pal[0]"),
      n: u("u_n"),
      rinv: u("u_rinv"),
      size: u("u_size"),
      scale: u("u_scale"),
      warp: u("u_warp"),
      grain: u("u_grain"),
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rot = { yaw: DEFAULT_YAW, pitch: DEFAULT_PITCH, vel: 0, dragging: false, x: 0, y: 0 };
    let raf = 0;
    let visible = true;
    let last = 0;
    let time = Math.random() * 50;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const res = Math.min(1, Math.max(0.5, live.current.resolution));
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
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(loc.res, canvas.width, canvas.height);
      gl.uniform1f(loc.time, time);
      gl.uniform3fv(loc.pal, L.palette.data);
      gl.uniform1f(loc.n, L.palette.count);
      gl.uniformMatrix3fv(loc.rinv, false, rotation(rot.yaw, rot.pitch));
      gl.uniform1f(loc.size, Math.min(1, Math.max(0.2, L.size)));
      gl.uniform1f(loc.scale, Math.max(0.1, L.scale));
      gl.uniform1f(loc.warp, L.warp);
      gl.uniform1f(loc.grain, L.grain);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const tick = (now: number) => {
      raf = 0;
      const L = live.current;
      const moving = L.animate && L.speed !== 0 && !reduced;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;

      if (moving) {
        time += dt * L.speed;
        if (!rot.dragging) rot.yaw += dt * L.speed * 0.5;
      }
      if (!rot.dragging) {
        rot.yaw += rot.vel * dt;
        rot.vel *= Math.pow(0.05, dt);
        rot.pitch += (DEFAULT_PITCH - rot.pitch) * Math.min(1, dt * 2.5);
      }
      draw();

      const settling =
        rot.dragging || Math.abs(rot.vel) > 0.01 || Math.abs(rot.pitch - DEFAULT_PITCH) > 0.002;
      if ((moving || settling) && visible && !document.hidden) raf = requestAnimationFrame(tick);
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

    const onDown = (e: PointerEvent) => {
      if (!live.current.interactive) return;
      rot.dragging = true;
      rot.vel = 0;
      rot.x = e.clientX;
      rot.y = e.clientY;
      host.setPointerCapture(e.pointerId);
      host.style.cursor = "grabbing";
      schedule();
    };
    const onMove = (e: PointerEvent) => {
      if (!rot.dragging) return;
      const dx = e.clientX - rot.x;
      const dy = e.clientY - rot.y;
      rot.x = e.clientX;
      rot.y = e.clientY;
      rot.yaw += dx * 0.012;
      rot.pitch = Math.min(1.2, Math.max(-1.2, rot.pitch + dy * 0.008));
      rot.vel = dx * 0.012 * 60;
      schedule();
    };
    const onUp = (e: PointerEvent) => {
      if (!rot.dragging) return;
      rot.dragging = false;
      if (host.hasPointerCapture(e.pointerId)) host.releasePointerCapture(e.pointerId);
      host.style.cursor = live.current.interactive ? "grab" : "";
      schedule();
    };
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", onUp);

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
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [nonce]);

  return (
    <div
      ref={hostRef}
      className={cn("relative aspect-square w-full select-none", className)}
      style={{
        cursor: interactive ? "grab" : undefined,
        touchAction: interactive ? "pan-y" : undefined,
        ...style,
      }}
    >
      {failed ? (
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-md"
          style={{
            width: `${size * 55}%`,
            backgroundImage: `linear-gradient(135deg, ${list.join(", ")})`,
          }}
        />
      ) : (
        <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" />
      )}
    </div>
  );
}

GrainCube.displayName = "GrainCube";

export { GrainCube };
