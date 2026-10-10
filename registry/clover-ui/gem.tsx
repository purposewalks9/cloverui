"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface GemProps extends Omit<React.ComponentProps<"div">, "color" | "children"> {
  color?: string;
  glow?: number;
  speed?: number;
  backdrop?: boolean;
  interactive?: boolean;
}

const VERTEX = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform mat3 uRot;
uniform vec3 uColor;
uniform float uGlow;
uniform float uBackdrop;
uniform float uLift;

const float R = 0.40;
const float H = 0.50;
const float T = 0.50;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}

float fbm(vec3 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * noise(p);
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    amp *= 0.5;
  }
  return sum;
}

void facet(int i, out vec3 n, out float d) {
  float k = float(i - (i / 6) * 6);
  float a = k * 1.0471976 + 0.5235988;
  vec2 u = vec2(cos(a), sin(a));
  if (i < 6) {
    n = vec3(u.x, 0.0, u.y);
    d = R;
  } else {
    float s = i < 12 ? 1.0 : -1.0;
    vec3 m = vec3(u.x * T, s * R, u.y * T);
    float l = length(m);
    n = m / l;
    d = R * (H + T) / l;
  }
}

bool hitGem(vec3 ro, vec3 rd, out float tn, out vec3 nn, out float fn) {
  tn = -1e9;
  float tf = 1e9;
  nn = vec3(0.0);
  fn = 0.0;
  for (int i = 0; i < 18; i++) {
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
  for (int i = 0; i < 18; i++) {
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

float edgeDist(vec3 p, float own) {
  float m = 1e9;
  for (int i = 0; i < 18; i++) {
    if (float(i) == own) continue;
    vec3 n;
    float d;
    facet(i, n, d);
    m = min(m, d - dot(n, p));
  }
  return m;
}

float shellDist(vec3 p) {
  float m = -1e9;
  for (int i = 0; i < 18; i++) {
    vec3 n;
    float d;
    facet(i, n, d);
    m = max(m, dot(n, p) - d);
  }
  return m;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec3 ro = vec3(0.0, -uLift, 4.4);
  vec3 rd = normalize(vec3(uv, -1.65));
  vec3 oro = uRot * ro;
  vec3 ord = uRot * rd;

  vec3 hot = mix(uColor, vec3(1.0), 0.35);
  vec3 deep = uColor * uColor * 0.3;
  vec3 col = vec3(0.0);
  float alpha = 0.0;

  vec3 bg = vec3(0.0);
  if (uBackdrop > 0.5) {
    float vignette = 1.0 - smoothstep(0.15, 1.1, length(uv * vec2(0.95, 0.75)));
    bg = mix(vec3(0.0002), uColor * 0.0022, vignette);
    float fog = fbm(vec3(uv.x * 2.4 + uTime * 0.03, uv.y * 3.2 - uTime * 0.02, uTime * 0.05));
    bg += uColor * fog * fog * smoothstep(0.0, -0.55, uv.y) * 0.1 * uGlow;
    vec2 q = (uv - vec2(0.0, -0.44)) / vec2(0.09, 0.016);
    vec2 wide = (uv - vec2(0.0, -0.44)) / vec2(0.22, 0.05);
    float pool = exp(-dot(q, q));
    float spread = exp(-dot(wide, wide));
    float grit = 0.8 + 0.4 * fbm(vec3(uv * 14.0, 2.0));
    bg += (hot * pool * 0.3 + uColor * spread * 0.07) * grit * uGlow;
  }

  float tc = max(0.0, -dot(oro, ord));
  float sd = max(shellDist(oro + ord * tc), 0.0);
  vec3 halo = uColor * (exp(-sd * 9.0) * 0.28 + exp(-sd * 3.2) * 0.022) * uGlow;

  float tn;
  vec3 nn;
  float fn;
  if (hitGem(oro, ord, tn, nn, fn)) {
    vec3 p = oro + ord * tn;
    vec3 rr = refract(ord, nn, 1.0 / 1.6);
    vec3 ne;
    float fe;
    float te = exitGem(p, rr, ne, fe);
    vec3 pe = p + rr * te;

    vec3 inside = vec3(0.0);
    for (int i = 0; i < 18; i++) {
      float s = (float(i) + 0.5) / 18.0;
      vec3 q = p + rr * te * s;
      float core = exp(-dot(q.xz, q.xz) * 160.0) * exp(-(q.y + 0.3) * (q.y + 0.3) * 1.6);
      vec3 flow = vec3(0.0, -uTime * 0.1, uTime * 0.04);
      float warp = fbm(q * 2.0 + flow);
      float cloud = smoothstep(0.38, 0.78, fbm(q * 2.6 - flow * 0.7 + warp));
      float n = noise(q * 3.2 + warp * 2.0 + flow * 1.5);
      float veins = 1.0 - smoothstep(0.0, 0.2, abs(sin(n * 10.0)));
      inside += uColor * (0.003 + cloud * 0.09 + veins * 2.2 + core * 9.0) * 0.05;
    }
    inside *= uGlow;

    float backFacet = 0.3 + 0.7 * hash(vec3(fe * 1.3, fe * 2.1 + 4.0, 7.0));
    inside = inside * backFacet + deep * 0.12;
    float sparkle = noise(pe * 46.0 + vec3(uTime * 0.5));
    inside += hot * smoothstep(0.93, 1.0, sparkle) * 0.8 * uGlow;
    inside += uColor * (1.0 - smoothstep(0.0, 0.02, edgeDist(pe, fe))) * 0.35;

    vec3 v = -ord;
    float facing = max(dot(v, nn), 0.0);
    float fresnel = 0.04 + 0.96 * pow(1.0 - facing, 5.0);
    vec3 refl = reflect(ord, nn);
    vec3 light = uRot * normalize(vec3(0.45, 0.85, 0.55));
    vec3 fill = uRot * normalize(vec3(-0.7, 0.2, 0.6));
    float spec = pow(max(dot(refl, light), 0.0), 70.0);
    float sheen = pow(max(dot(refl, light), 0.0), 5.0) + 0.4 * pow(max(dot(refl, fill), 0.0), 8.0);
    float frontFacet = 0.7 + 0.5 * hash(vec3(fn * 1.7, 3.3, fn * 0.9 + 1.0));
    frontFacet *= 0.3 + 1.0 * max(dot(nn, light) * 0.5 + 0.5, 0.0);

    col = inside * frontFacet * (1.0 - fresnel * 0.5);
    float softbox = smoothstep(0.62, 0.86, dot(refl, light));
    col += (vec3(1.0) * spec * 1.8 + hot * sheen * 0.12 + hot * softbox * 0.55) * (0.25 + fresnel);
    col += hot * (1.0 - smoothstep(0.0, 0.01, edgeDist(p, fn))) * 0.8;
    col += uColor * pow(1.0 - facing, 2.5) * 0.2;
    col += halo * 0.15;
    alpha = 1.0;
  } else {
    col = bg + halo;
    alpha = uBackdrop > 0.5 ? 1.0 : 0.0;
  }

  col = vec3(1.0) - exp(-col * 1.6);
  col = pow(col, vec3(1.0 / 2.2));
  if (alpha < 0.5) alpha = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}`;

function toLinear(input: string): [number, number, number] {
  let hex = input.trim().replace("#", "");
  if (hex.length === 3) hex = [...hex].map((c) => c + c).join("");
  const value = Number.parseInt(hex.slice(0, 6), 16);
  if (Number.isNaN(value) || hex.length < 6) return [1, 0.03, 0.09];
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

const PITCH = 0.14;

function Gem({
  color = "#ff2d55",
  glow = 1,
  speed = 1,
  backdrop = true,
  interactive = true,
  className,
  style,
  ...props
}: GemProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = React.useState(false);
  const live = React.useRef({ color: toLinear(color), glow, speed, backdrop, interactive });

  React.useEffect(() => {
    live.current = { color: toLinear(color), glow, speed, backdrop, interactive };
  }, [color, glow, speed, backdrop, interactive]);

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

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
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
      setFailed(true);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFailed(true);
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const uRes = uniform("uRes");
    const uTime = uniform("uTime");
    const uRot = uniform("uRot");
    const uColor = uniform("uColor");
    const uGlow = uniform("uGlow");
    const uBackdrop = uniform("uBackdrop");
    const uLift = uniform("uLift");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let clock = 0;
    let yaw = 0.5;
    let pitch = PITCH;
    let spin = 0;
    let dragging = false;
    let pointerX = 0;
    let pointerY = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(host.clientWidth * dpr));
      const height = Math.max(1, Math.round(host.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
    };

    const draw = () => {
      const L = live.current;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, clock);
      gl.uniformMatrix3fv(uRot, false, rotation(yaw, pitch));
      gl.uniform3f(uColor, L.color[0], L.color[1], L.color[2]);
      gl.uniform1f(uGlow, Math.max(0, L.glow));
      gl.uniform1f(uBackdrop, L.backdrop ? 1 : 0);
      gl.uniform1f(uLift, reduced ? 0 : Math.sin(clock * 1.1) * 0.035);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const L = live.current;
      if (!reduced) {
        clock += dt * Math.max(L.speed, 0);
        if (!dragging) {
          yaw += dt * 0.35 * L.speed + spin * dt;
          spin *= Math.exp(-dt * 2.2);
          pitch += (PITCH - pitch) * Math.min(1, dt * 3);
        }
      }
      draw();
      raf = visible && !document.hidden ? requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onDown = (event: PointerEvent) => {
      if (!live.current.interactive) return;
      dragging = true;
      spin = 0;
      pointerX = event.clientX;
      pointerY = event.clientY;
      host.setPointerCapture(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - pointerX;
      const dy = event.clientY - pointerY;
      pointerX = event.clientX;
      pointerY = event.clientY;
      yaw += dx * 0.012;
      pitch = Math.max(-0.5, Math.min(0.6, pitch + dy * 0.006));
      spin = dx * 0.6;
      if (reduced || !raf) draw();
    };
    const onUp = (event: PointerEvent) => {
      dragging = false;
      if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
    };

    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", onUp);

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(host);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(host);
    const onVisibility = () => {
      if (!document.hidden) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    resize();
    draw();
    start();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label="Glowing gem"
      className={cn(
        "relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl select-none",
        interactive && "cursor-grab touch-none active:cursor-grabbing",
        className,
      )}
      style={style}
      {...props}
    >
      {failed ? (
        <div
          className="absolute inset-[18%_32%] [clip-path:polygon(50%_0,100%_26%,100%_74%,50%_100%,0_74%,0_26%)]"
          style={{
            background: `linear-gradient(160deg, white, ${color} 35%, color-mix(in oklab, ${color} 40%, black))`,
            filter: `drop-shadow(0 0 24px ${color})`,
          }}
        />
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      )}
    </div>
  );
}

export { Gem };
