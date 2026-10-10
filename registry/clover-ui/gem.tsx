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
const float CAM = 6.0;
const float FOCAL = 2.31;

vec3 environment(vec3 dir) {
  float shift = sin(uTime * 0.18) * 0.06;
  float panel = smoothstep(0.72, 0.91, dot(dir, normalize(vec3(-0.65 + shift, 0.5, 0.8))));
  float strip = exp(-pow((dir.x - 0.35 - shift) * 9.0, 2.0));
  strip *= smoothstep(-0.7, -0.25, dir.y) * (1.0 - smoothstep(0.65, 0.9, dir.y));
  float top = pow(max(dot(dir, normalize(vec3(0.2, 0.95, -0.3))), 0.0), 18.0);
  return vec3(0.025) + vec3(1.0, 0.94, 1.0) * panel * 1.8
    + vec3(0.85, 0.9, 1.0) * strip * 1.25 + vec3(1.0) * top * 0.7;
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
    float h = ring == 1 ? 0.48 : -0.18;
    float taper = 1.0 - h;
    float lean = ring == 1 ? -0.1 : 0.06;
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

    vec3 absorption = (vec3(1.0) - uColor) * 4.0 + vec3(0.15);
    vec3 transmission = exp(-absorption * te);
    vec3 outgoing = refract(rr, -ne, 1.7);
    vec3 backLight = environment(length(outgoing) > 0.001 ? outgoing : reflect(rr, ne));
    vec3 inside = transmission * (uColor * 0.38 + backLight * 0.85);
    vec3 bounce = reflect(rr, ne);
    vec3 n2;
    float f2;
    float t2 = exitGem(pe + bounce * 0.002, bounce, n2, f2);
    vec3 bouncedLight = environment(reflect(bounce, n2));
    inside += bouncedLight * exp(-absorption * (te + t2)) * 0.35;
    inside += hot * (1.0 - smoothstep(0.0, px * 1.2, edgeDist(pe, fe))) * 0.08;

    vec3 v = -ord;
    float facing = max(dot(v, nn), 0.0);
    float fresnel = 0.04 + 0.96 * pow(1.0 - facing, 5.0);
    vec3 refl = reflect(ord, nn);
    vec3 light = uRot * normalize(vec3(-0.55, 0.8, 0.65));
    float lambert = max(dot(nn, light) * 0.5 + 0.5, 0.0);
    vec3 reflection = environment(refl);
    float polish = clamp(uGlow, 0.0, 2.0);

    col = inside * (0.45 + 0.55 * lambert) * (1.0 - fresnel);
    col += reflection * (0.05 + fresnel * 0.95) * (0.65 + polish * 0.35);
    col += hot * (1.0 - smoothstep(0.0, px * 1.1, edgeDist(p, fn))) * 0.28;
    alpha = 1.0;
  }

  col = vec3(1.0) - exp(-col * 1.6);
  col = pow(col, vec3(1.0 / 2.2));
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
  color = "#c026ff",
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
