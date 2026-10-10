"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface GemProps extends Omit<React.ComponentProps<"span">, "color" | "children"> {
  color?: string;
  size?: number;
  glow?: number;
  animate?: boolean;
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

const float R = 0.34;
const float RC = 0.372;
const float H = 0.44;
const float T = 0.56;
const float CAM = 6.0;
const float FOCAL = 2.31;

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
  for (int i = 0; i < 3; i++) {
    sum += amp * noise(p);
    p = p * 2.07 + vec3(1.7, 9.2, 3.1);
    amp *= 0.5;
  }
  return sum;
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
    vec3 m = vec3(u.x * T, s * r, u.y * T);
    float l = length(m);
    n = m / l;
    d = r * (H + T) / l;
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

float edgeDist(vec3 p, float own) {
  float m = 1e9;
  for (int i = 0; i < 36; i++) {
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
  for (int i = 0; i < 36; i++) {
    vec3 n;
    float d;
    facet(i, n, d);
    m = max(m, dot(n, p) - d);
  }
  return m;
}

vec2 shards(vec3 q, float warp) {
  vec3 w = q * 12.0 + warp * 1.4;
  float a = dot(w, vec3(0.82, 0.31, 0.48));
  float b = dot(w, vec3(-0.58, 0.74, 0.34));
  float c = dot(w, vec3(0.12, -0.52, 0.85));
  float line = max(abs(fract(a) - 0.5), max(abs(fract(b) - 0.5), abs(fract(c) - 0.5)));
  float glint = hash(floor(vec3(a, b, c)));
  return vec2(1.0 - smoothstep(0.0, 0.05, 0.5 - line), smoothstep(0.9, 1.0, glint));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float px = (CAM / FOCAL) / uRes.y;
  vec3 ro = vec3(0.0, 0.0, CAM);
  vec3 rd = normalize(vec3(uv, -FOCAL));
  vec3 oro = uRot * ro;
  vec3 ord = uRot * rd;

  vec3 hot = mix(uColor, vec3(1.0), 0.4);
  vec3 col = vec3(0.0);
  float alpha = 0.0;

  float tc = max(0.0, -dot(oro, ord));
  float sd = max(shellDist(oro + ord * tc), 0.0);
  vec2 edge = abs(uv) / vec2(0.5 * uRes.x / uRes.y, 0.5);
  float fade = (1.0 - smoothstep(0.42, 0.85, edge.x)) * (1.0 - smoothstep(0.6, 0.92, edge.y));
  vec3 halo = uColor * (exp(-sd * 16.0) * 0.3 + exp(-sd * 7.0) * 0.04) * uGlow * fade;

  float tn;
  vec3 nn;
  float fn;
  if (hitGem(oro, ord, tn, nn, fn)) {
    vec3 p = oro + ord * tn;
    vec3 rr = refract(ord, nn, 1.0 / 1.7);
    vec3 ne;
    float fe;
    float te = exitGem(p, rr, ne, fe);
    vec3 pe = p + rr * te;

    vec3 inside = vec3(0.0);
    for (int i = 0; i < 14; i++) {
      float s = (float(i) + 0.5) / 14.0;
      vec3 q = p + rr * te * s;
      vec3 flow = vec3(0.0, -uTime * 0.08, uTime * 0.03);
      float warp = fbm(q * 2.2 + flow);
      float cloud = smoothstep(0.45, 0.8, fbm(q * 3.0 - flow + warp));
      float core = exp(-dot(q.xz, q.xz) * 60.0) * exp(-(q.y + 0.32) * (q.y + 0.32) * 7.0);
      inside += uColor * (0.005 + cloud * 0.16 + core * 16.0) * 0.08;
    }
    float drift = fbm(pe * 2.2 + vec3(0.0, -uTime * 0.08, uTime * 0.03));
    vec2 back = shards(pe, drift);
    vec3 mid = p + rr * te * 0.5;
    vec2 middle = shards(mid * 1.3 + 0.37, fbm(mid * 2.2 + vec3(uTime * 0.05)));
    inside += uColor * (back.x * 0.28 + middle.x * 0.16 + back.y * 0.5 + middle.y * 0.35) + hot * (back.y + middle.y) * 0.12;
    inside *= uGlow;

    float backFacet = 0.35 + 0.65 * hash(vec3(fe * 1.3, fe * 2.1 + 4.0, 7.0));
    inside = inside * backFacet + uColor * uColor * 0.06;
    inside += uColor * (1.0 - smoothstep(0.0, px * 2.5, edgeDist(pe, fe))) * 0.6;
    vec3 bounce = reflect(rr, ne);
    vec3 n2;
    float f2;
    float t2 = exitGem(pe + bounce * 0.002, bounce, n2, f2);
    vec3 p2 = pe + bounce * t2;
    inside += hot * (1.0 - smoothstep(0.0, px * 2.0, edgeDist(p2, f2))) * 0.3;

    vec3 v = -ord;
    float facing = max(dot(v, nn), 0.0);
    float fresnel = 0.04 + 0.96 * pow(1.0 - facing, 5.0);
    vec3 refl = reflect(ord, nn);
    vec3 light = uRot * normalize(vec3(0.55, 0.8, 0.45));
    vec3 rim = uRot * normalize(vec3(-0.9, 0.1, 0.25));
    float spec = pow(max(dot(refl, light), 0.0), 60.0);
    float softbox = smoothstep(0.55, 0.85, dot(refl, light));
    float rimLight = pow(max(dot(nn, rim), 0.0), 6.0) * (1.0 - smoothstep(0.0, px * 6.0, edgeDist(p, fn)) * 0.7);
    float lambert = max(dot(nn, light) * 0.5 + 0.5, 0.0);
    float frontFacet = (0.7 + 0.5 * hash(vec3(fn * 1.7, 3.3, fn * 0.9 + 1.0))) * (0.22 + 1.1 * lambert);

    col = inside * frontFacet * (1.0 - fresnel * 0.4);
    col += (vec3(1.0) * spec * 2.0 + hot * softbox * 0.7) * (0.3 + fresnel);
    col += hot * rimLight * 0.45;
    col += hot * (1.0 - smoothstep(0.0, px * 1.4, edgeDist(p, fn))) * 0.75;
    col += uColor * pow(1.0 - facing, 2.5) * 0.25;
    alpha = 1.0;
  } else {
    col = halo;
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

const ROTATION = rotation(0.32, 0.1);

function Gem({
  color = "#ff2d55",
  size = 160,
  glow = 1,
  animate = true,
  className,
  style,
  ...props
}: GemProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = React.useState(false);
  const live = React.useRef({ color: toLinear(color), glow, animate });
  const redrawRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    live.current = { color: toLinear(color), glow, animate };
    redrawRef.current?.();
  }, [color, glow, animate]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
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

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uRot = gl.getUniformLocation(program, "uRot");
    const uColor = gl.getUniformLocation(program, "uColor");
    const uGlow = gl.getUniformLocation(program, "uGlow");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let clock = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
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
      gl.uniformMatrix3fv(uRot, false, ROTATION);
      gl.uniform3f(uColor, L.color[0], L.color[1], L.color[2]);
      gl.uniform1f(uGlow, Math.max(0, L.glow));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const moving = () => live.current.animate && !reduced && visible && !document.hidden;

    const tick = (now: number) => {
      clock += Math.min((now - last) / 1000, 0.05);
      last = now;
      draw();
      raf = moving() ? requestAnimationFrame(tick) : 0;
    };

    const refresh = () => {
      if (moving()) {
        if (!raf) {
          last = performance.now();
          raf = requestAnimationFrame(tick);
        }
      } else {
        draw();
      }
    };
    redrawRef.current = refresh;

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      refresh();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", refresh);

    resize();
    refresh();

    return () => {
      redrawRef.current = null;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", refresh);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <span
      role="img"
      aria-label="Gem"
      className={cn("relative inline-block shrink-0 align-middle", className)}
      style={{ width: size * 0.42, height: size, ...style }}
      {...props}
    >
      {failed ? (
        <span
          className="absolute inset-0 [clip-path:polygon(50%_0,100%_28%,100%_72%,50%_100%,0_72%,0_28%)]"
          style={{
            background: `linear-gradient(160deg, white, ${color} 35%, color-mix(in oklab, ${color} 40%, black))`,
          }}
        />
      ) : (
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute -inset-x-[50%] -inset-y-[15%] h-[130%] w-[200%]"
        />
      )}
    </span>
  );
}

export { Gem };
