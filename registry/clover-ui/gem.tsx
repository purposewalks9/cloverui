"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type GemMaterial = "glass" | "solid";

export interface GemProps extends Omit<React.ComponentProps<"span">, "color" | "children"> {
  color?: string;
  size?: number;
  material?: GemMaterial;
  grain?: number;
  glow?: number;
  animate?: boolean;
  speed?: number;
  interactive?: boolean;
}

const DEFAULT_PITCH = 0.12;
const DEFAULT_YAW = 0.4;

function toLinear(input: string): [number, number, number] {
  let hex = input.trim().replace("#", "");
  if (hex.length === 3) hex = [...hex].map((c) => c + c).join("");
  const value = Number.parseInt(hex.slice(0, 6), 16);
  if (Number.isNaN(value) || hex.length < 6) return [0.8, 0.82, 0.85];
  const channel = (shift: number) => Math.pow(((value >> shift) & 255) / 255, 2.2);
  return [channel(16), channel(8), channel(0)];
}

function rotation(yaw: number, pitch: number) {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return new Float32Array([cy, 0, sy, sp * sy, cp, -sp * cy, -cp * sy, sp, cp * cy]);
}

const VERTEX = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform mat3 uRot;
uniform vec3 uColor;
uniform float uGlow;
uniform float uGrain;
uniform float uGlass;

const float R = 0.38;
const float RC = 0.416;

vec3 environment(vec3 dir) {
  float panel = smoothstep(0.4, 0.95, dot(dir, normalize(vec3(-0.65, 0.5, 0.8))));
  float offset = (dir.x - 0.35) * 5.0;
  float strip = exp(-offset * offset);
  strip *= smoothstep(-0.8, -0.2, dir.y) * (1.0 - smoothstep(0.6, 0.95, dir.y));
  return vec3(0.04 + panel * 1.2 + strip * 0.55);
}

void facet(int i, out vec3 n, out float d) {
  int ring = i / 12;
  int k = i - ring * 12;
  int side = k / 6;
  float a = float(k - side * 6) * 1.0471976 + float(side) * 0.5235988;
  float r = side == 0 ? R : RC;
  vec2 u = vec2(cos(a), sin(a));
  if (ring == 0) {
    n = vec3(u.x, 0.0, u.y);
    d = r;
  } else {
    float s = ring == 1 ? 1.0 : -1.0;
    float h = 0.42;
    float taper = 1.0 - h;
    float lean = 0.0;
    vec3 m = vec3(u.x * taper, s * r - s * u.x * lean, u.y * taper);
    float l = length(m);
    n = m / l;
    d = r / l;
  }
}

bool hitGem(vec3 ro, vec3 rd, out float tn, out vec3 nn, out float fn) {
  tn = -1e9;
  float tf = 1e9;
  nn = vec3(0.0);
  fn = 0.0;
  for (int i = 0; i < 36; i++) {
    vec3 n;
    float d;
    facet(i, n, d);
    float den = dot(n, rd);
    float num = d - dot(n, ro);
    if (abs(den) < 1e-6) {
      if (num < 0.0) return false;
      continue;
    }
    float t = num / den;
    if (den < 0.0) {
      if (t > tn) { tn = t; nn = n; fn = float(i); }
    } else {
      tf = min(tf, t);
    }
  }
  return tn < tf && tn > 0.0;
}

float exitGem(vec3 p, vec3 rd, out vec3 ne, out float fe) {
  float te = 1e9;
  ne = vec3(0.0);
  fe = 0.0;
  for (int i = 0; i < 36; i++) {
    vec3 n;
    float d;
    facet(i, n, d);
    float den = dot(n, rd);
    if (den > 1e-5) {
      float t = (d - dot(n, p)) / den;
      if (t < te) { te = t; ne = n; fe = float(i); }
    }
  }
  return te;
}


float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 fc = gl_FragCoord.xy - 0.5 * uRes;
  float px = 2.25 / uRes.y;
  vec3 rd = uRot * vec3(0.0, 0.0, -1.0);
  float coverage = 0.0;
  vec3 p = vec3(0.0);
  vec3 n = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    vec2 offset = i == 0 ? vec2(-0.25, -0.125) : (i == 1 ? vec2(0.125, -0.25) : (i == 2 ? vec2(0.25, 0.125) : vec2(-0.125, 0.25)));
    vec3 ro = uRot * vec3((fc + offset) * px, 6.0);
    float t;
    vec3 normal;
    float face;
    if (hitGem(ro, rd, t, normal, face)) {
      if (coverage == 0.0) { p = ro + rd * t; n = normal; }
      coverage += 0.25;
    }
  }
  if (coverage == 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec3 worldNormal = n * uRot;
  vec3 worldPoint = p * uRot;
  vec3 light = normalize(vec3(-1.5, 2.5, 3.0) - worldPoint);
  float diffuse = max(dot(worldNormal, light), 0.0);
  float facing = max(dot(-rd, n), 0.0);
  float fresnel = 0.06 + 0.94 * pow(1.0 - facing, 5.0);
  vec3 reflected = reflect(rd, n) * uRot;
  vec3 reflectedLight = environment(normalize(reflected + worldPoint * 0.45));
  float polish = clamp(uGlow, 0.0, 2.0);
  float baseOffset = (p.y + 0.85) * 2.5;
  float gradient = smoothstep(0.05, 0.95, p.y) * 0.55
    + exp(-baseOffset * baseOffset) * 0.6
    + smoothstep(-0.38, 0.38, p.x) * 0.12;
  vec3 solid = uColor * (0.07 + diffuse * 0.35 + gradient);
  solid += reflectedLight * (0.25 + fresnel * 0.55) * (0.5 + polish * 0.5);

  vec3 refracted = refract(rd, n, 1.0 / 1.46);
  vec3 exitNormal;
  float exitFace;
  float thickness = exitGem(p - n * 0.001, refracted, exitNormal, exitFace);
  vec3 transmitted = refract(refracted, -exitNormal, 1.46);
  if (length(transmitted) < 0.001) transmitted = reflect(refracted, exitNormal);
  vec3 absorption = exp(-((vec3(1.0) - uColor) * 1.8 + 0.18) * thickness);
  vec3 glass = absorption * (uColor * (0.05 + diffuse * 0.16 + gradient * 0.85) + environment(normalize(transmitted * uRot + worldPoint * 0.3)) * 0.6);
  glass += reflectedLight * (0.2 + fresnel * 0.9) * (0.5 + polish * 0.5);

  vec3 col = mix(solid, glass, uGlass);
  col = vec3(1.0) - exp(-col * 1.6);
  col = pow(max(col, vec3(0.0)), vec3(1.0 / 2.2));
  col += (hash(gl_FragCoord.xy) - 0.5) * uGrain * 0.06;
  float alpha = mix(1.0, 0.7 + fresnel * 0.3, uGlass) * coverage;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0) * alpha, alpha);
}
`;

function Gem({
  color = "#e6e8ec",
  size = 160,
  material = "glass",
  grain = 0.02,
  glow = 1,
  animate = false,
  speed = 1,
  interactive = true,
  className,
  style,
  onKeyDown,
  ...props
}: GemProps) {
  const hostRef = React.useRef<HTMLSpanElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const syncRef = React.useRef<(() => void) | null>(null);
  const turnRef = React.useRef<((yaw: number, pitch: number) => void) | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [nonce, setNonce] = React.useState(0);
  const live = React.useRef({
    color: toLinear(color),
    material,
    grain,
    glow,
    animate,
    speed,
    interactive,
  });

  React.useEffect(() => {
    live.current = { color: toLinear(color), material, grain, glow, animate, speed, interactive };
    syncRef.current?.();
  }, [color, material, grain, glow, animate, speed, interactive]);

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
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("Gem shader:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compile(gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      gl.deleteProgram(program);
      setFailed(true);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("Gem link:", gl.getProgramInfoLog(program));
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteProgram(program);
      setFailed(true);
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.clearColor(0, 0, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const loc = {
      res: u("uRes"),
      rot: u("uRot"),
      color: u("uColor"),
      glow: u("uGlow"),
      grain: u("uGrain"),
      glass: u("uGlass"),
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motionQuery.matches;
    const rot = { yaw: DEFAULT_YAW, pitch: DEFAULT_PITCH, vel: 0, dragging: false, x: 0, y: 0 };
    let raf = 0;
    let visible = true;
    let contextLost = false;
    let last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const res = 1;
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
      gl.uniformMatrix3fv(loc.rot, false, rotation(rot.yaw, rot.pitch));
      gl.uniform3fv(loc.color, L.color);
      gl.uniform1f(loc.glow, Math.max(0, L.glow));
      gl.uniform1f(loc.grain, Math.max(0, Math.min(1, L.grain)));
      gl.uniform1f(loc.glass, L.material === "glass" ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const tick = (now: number) => {
      raf = 0;
      const L = live.current;
      const moving = L.animate && !reduced;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;

      if (moving) {
        if (!rot.dragging) rot.yaw += dt * L.speed * 0.5;
      }
      if (!rot.dragging && !reduced) {
        rot.yaw += rot.vel * dt;
        rot.vel *= Math.pow(0.05, dt);
        rot.pitch += (DEFAULT_PITCH - rot.pitch) * Math.min(1, dt * 2.5);
      }
      draw();

      const settling =
        rot.dragging ||
        (!reduced && (Math.abs(rot.vel) > 0.01 || Math.abs(rot.pitch - DEFAULT_PITCH) > 0.002));
      if ((moving || settling) && visible && !document.hidden) raf = requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (raf || contextLost || !visible || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };

    turnRef.current = (yaw, pitch) => {
      rot.yaw += yaw;
      rot.pitch = Math.min(1.2, Math.max(-1.2, rot.pitch + pitch));
      rot.vel = 0;
      schedule();
    };

    syncRef.current = () => {
      host.style.cursor = live.current.interactive ? (rot.dragging ? "grabbing" : "grab") : "";
      resize();
      schedule();
    };

    const onDown = (e: PointerEvent) => {
      if (!live.current.interactive || (e.pointerType === "mouse" && e.button !== 0)) return;
      e.preventDefault();
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
      if (reduced || e.type === "pointercancel") rot.vel = 0;
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
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(host);

    const onVisibility = () => {
      if (!document.hidden) schedule();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    const onMotionChange = () => {
      reduced = motionQuery.matches;
      if (reduced) rot.vel = 0;
      schedule();
    };
    motionQuery.addEventListener("change", onMotionChange);

    const onLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const onRestored = () => setNonce((n) => n + 1);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      syncRef.current = null;
      turnRef.current = null;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener("change", onMotionChange);
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
    <span
      ref={hostRef}
      role="img"
      aria-label={interactive ? "3D gem. Drag or use arrow keys to rotate." : "3D gem"}
      tabIndex={interactive ? 0 : undefined}
      className={cn(
        "focus-visible:ring-ring relative inline-block shrink-0 align-middle outline-none select-none focus-visible:ring-2 focus-visible:ring-offset-2",
        className,
      )}
      style={{
        width: size * 0.95,
        height: size,
        cursor: interactive ? "grab" : undefined,
        touchAction: interactive ? "none" : undefined,
        ...style,
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || !interactive) return;
        const turns: Record<string, [number, number]> = {
          ArrowLeft: [-0.15, 0],
          ArrowRight: [0.15, 0],
          ArrowUp: [0, -0.1],
          ArrowDown: [0, 0.1],
        };
        const turn = turns[event.key];
        if (!turn) return;
        event.preventDefault();
        turnRef.current?.(...turn);
      }}
      {...props}
    >
      {failed ? (
        <span
          aria-hidden
          className="absolute inset-x-[24%] inset-y-[5%] [clip-path:polygon(50%_0,100%_28%,100%_72%,50%_100%,0_72%,0_28%)]"
          style={{
            background: `linear-gradient(145deg, white, ${color} 45%, color-mix(in oklab, ${color} 40%, black))`,
          }}
        />
      ) : (
        <canvas ref={canvasRef} aria-hidden className="pointer-events-none block h-full w-full" />
      )}
    </span>
  );
}

Gem.displayName = "Gem";

export { Gem };
