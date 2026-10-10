"use client";

import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export type ElementName = "lava" | "ocean" | "stone" | "sky";
export type ElementColors = [string, string, string];

type ElementLook = {
  colors: ElementColors;
  text: string;
  ring: string;
  shape: number;
  scale: number;
  swirl: number;
  distortion: number;
  speed: number;
  sparkle: number;
  grain: number;
};

export const elementPalettes: Record<ElementName, ElementLook> = {
  lava: {
    colors: ["#d42a1a", "#9e1408", "#3a0300"],
    text: "#ffffff",
    ring: "#d42a1a",
    shape: 0,
    scale: 34,
    swirl: 0.9,
    distortion: 0.35,
    speed: 0.6,
    sparkle: 0.04,
    grain: 0,
  },
  ocean: {
    colors: ["#1d6fc4", "#0f4a94", "#031a40"],
    text: "#ffffff",
    ring: "#1d6fc4",
    shape: 0,
    scale: 42,
    swirl: 1.1,
    distortion: 0.2,
    speed: 0.45,
    sparkle: 0.12,
    grain: 0,
  },
  stone: {
    colors: ["#8a5a2b", "#5a3818", "#1f1309"],
    text: "#fff7eb",
    ring: "#8a5a2b",
    shape: 1,
    scale: 26,
    swirl: 0.35,
    distortion: 0.5,
    speed: 0.14,
    sparkle: 0,
    grain: 0.16,
  },
  sky: {
    colors: ["#3f6d96", "#2c5276", "#142a40"],
    text: "#ffffff",
    ring: "#3f6d96",
    shape: 1,
    scale: 56,
    swirl: 0.7,
    distortion: 0.3,
    speed: 0.75,
    sparkle: 0,
    grain: 0,
  },
};

const VERTEX = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAGMENT = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform float t;uniform float dpr;uniform vec2 seed;
uniform float shape;uniform float scale;uniform float swirl;uniform float distortion;
uniform float sparkle;uniform float grain;uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
void main(){
vec2 px=gl_FragCoord.xy;
vec2 uv=px/(dpr*scale)+seed;
float a=n(uv+t*.5)*6.2831;
uv+=distortion*n(uv*2.-t*.5)*vec2(cos(a),sin(a));
for(int i=1;i<=5;i++){float fi=float(i);
uv.x+=swirl/fi*cos(t+fi*1.5*uv.y);uv.y+=swirl/fi*cos(t+fi*uv.x);}
float m;
if(shape<.5){m=.5+.5*sin(uv.x)*cos(uv.y);}
else{float f=fract(uv.y*.5);m=smoothstep(0.,.55,f)*smoothstep(1.,.45,f);}
vec3 col=mix(c3,c2,smoothstep(.12,.55,m));
col=mix(col,c1,smoothstep(.52,.92,m));
col+=c1*sparkle*pow(max(0.,sin(uv.x*2.1)*sin(uv.y*1.7)),12.);
col*=1.-grain*.5+grain*h(floor(px));
gl_FragColor=vec4(col,1.);}`;

function toRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value.slice(0, 6);
  const number = parseInt(full, 16);
  return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255];
}

export function elementGradient(colors: ElementColors) {
  return `linear-gradient(0deg, ${colors[2]}, ${colors[1]}, ${colors[0]})`;
}

type Surface = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  look: ElementLook;
  rgb: [number, number, number][];
  seed: [number, number];
  time: number;
  speed: number;
  boost: number;
  visible: boolean;
  still: boolean;
  dirty: boolean;
  onReady: () => void;
};

type Renderer = {
  gl: WebGLRenderingContext;
  canvas: HTMLCanvasElement;
  uniforms: Record<string, WebGLUniformLocation | null>;
  surfaces: Set<Surface>;
  frame: number;
  last: number;
};

let renderer: Renderer | null | undefined;

function getRenderer() {
  if (renderer !== undefined) return renderer;
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", {
    antialias: false,
    alpha: false,
    depth: false,
    powerPreference: "low-power",
  });
  renderer = null;
  if (!gl) return renderer;
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return renderer;
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const names = ["t", "dpr", "seed", "shape", "scale", "swirl", "distortion"];
  const uniforms = Object.fromEntries(
    [...names, "sparkle", "grain", "c1", "c2", "c3"].map((name) => [
      name,
      gl.getUniformLocation(program, name),
    ]),
  );
  renderer = { gl, canvas, uniforms, surfaces: new Set(), frame: 0, last: 0 };
  return renderer;
}

function paint(r: Renderer, surface: Surface) {
  const { gl, canvas, uniforms: u } = r;
  const { width, height } = surface.canvas;
  if (!width || !height) return;
  if (canvas.width < width || canvas.height < height) {
    canvas.width = Math.max(canvas.width, width);
    canvas.height = Math.max(canvas.height, height);
  }
  const { look } = surface;
  gl.viewport(0, 0, width, height);
  gl.uniform1f(u.t, surface.time);
  gl.uniform1f(u.dpr, width / Math.max(1, surface.canvas.clientWidth));
  gl.uniform2f(u.seed, surface.seed[0], surface.seed[1]);
  gl.uniform1f(u.shape, look.shape);
  gl.uniform1f(u.scale, look.scale);
  gl.uniform1f(u.swirl, look.swirl);
  gl.uniform1f(u.distortion, look.distortion);
  gl.uniform1f(u.sparkle, look.sparkle);
  gl.uniform1f(u.grain, look.grain);
  surface.rgb.forEach((rgb, index) => gl.uniform3f(u[`c${index + 1}`], ...rgb));
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  surface.ctx.drawImage(canvas, 0, canvas.height - height, width, height, 0, 0, width, height);
  if (surface.dirty) {
    surface.dirty = false;
    surface.onReady();
  }
}

function tick(now: number) {
  const r = renderer;
  if (!r) return;
  const dt = r.last ? Math.min(0.05, (now - r.last) / 1000) : 0;
  r.last = now;
  let animating = false;
  for (const surface of r.surfaces) {
    if (!surface.visible) continue;
    if (surface.still) {
      if (surface.dirty) paint(r, surface);
      continue;
    }
    surface.speed += (surface.boost - surface.speed) * Math.min(1, dt * 6);
    surface.time += dt * surface.look.speed * surface.speed;
    if (!document.hidden) paint(r, surface);
    animating = true;
  }
  r.frame = animating ? requestAnimationFrame(tick) : 0;
  if (!animating) r.last = 0;
}

function wake() {
  const r = renderer;
  if (r && !r.frame) r.frame = requestAnimationFrame(tick);
}

export function useElementSurface(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  element: ElementName,
  colors: ElementColors | undefined,
  still: boolean,
) {
  const [ready, setReady] = React.useState(false);
  const surfaceRef = React.useRef<Surface | null>(null);
  const look = elementPalettes[element];
  const [a, b, c] = colors ?? look.colors;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const r = getRenderer();
    if (!canvas || !ctx || !r) return;

    const surface: Surface = {
      canvas,
      ctx,
      look: elementPalettes.lava,
      rgb: [],
      seed: [Math.random() * 40, Math.random() * 40],
      time: Math.random() * 20,
      speed: 1,
      boost: 1,
      visible: true,
      still: false,
      dirty: true,
      onReady: () => setReady(true),
    };
    surfaceRef.current = surface;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      surface.dirty = true;
      wake();
    };
    const sizer = new ResizeObserver(resize);
    sizer.observe(canvas);
    const viewer = new IntersectionObserver(([entry]) => {
      surface.visible = entry.isIntersecting;
      wake();
    });
    viewer.observe(canvas);

    r.surfaces.add(surface);
    resize();

    return () => {
      sizer.disconnect();
      viewer.disconnect();
      r.surfaces.delete(surface);
      surfaceRef.current = null;
    };
  }, [canvasRef]);

  React.useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    surface.look = look;
    surface.rgb = [toRgb(a), toRgb(b), toRgb(c)];
    surface.still = still;
    surface.dirty = true;
    wake();
  }, [look, a, b, c, still]);

  const boost = React.useCallback((value: number) => {
    if (surfaceRef.current) surfaceRef.current.boost = value;
    wake();
  }, []);

  return { ready, boost };
}

const elementButtonVariants = cva(
  [
    "group/element relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden font-semibold whitespace-nowrap select-none",
    "transition-transform duration-150 ease-out outline-none active:scale-[0.96] active:duration-75",
    "focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-[var(--element-ring)] focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      size: {
        sm: "h-8 rounded-md px-3 text-xs",
        default: "h-9 rounded-lg px-4 text-sm",
        lg: "h-11 rounded-lg px-6 text-base",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export type ElementButtonSize = NonNullable<VariantProps<typeof elementButtonVariants>["size"]>;

export interface ElementButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof elementButtonVariants> {
  element?: ElementName;
  colors?: ElementColors;
  asChild?: boolean;
}

function ElementButton({
  element = "lava",
  colors,
  size,
  asChild = false,
  className,
  style,
  children,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: ElementButtonProps) {
  const still = Boolean(useReducedMotion());
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const palette = elementPalettes[element];
  const { ready, boost } = useElementSurface(canvasRef, element, colors, still);
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-element={element}
      className={cn(elementButtonVariants({ size }), className)}
      style={
        {
          backgroundImage: elementGradient(colors ?? palette.colors),
          color: palette.text,
          "--element-ring": palette.ring,
          ...style,
        } as React.CSSProperties
      }
      onPointerEnter={(event: React.PointerEvent<HTMLButtonElement>) => {
        onPointerEnter?.(event);
        boost(2.6);
      }}
      onPointerLeave={(event: React.PointerEvent<HTMLButtonElement>) => {
        onPointerLeave?.(event);
        boost(1);
      }}
      onFocus={(event: React.FocusEvent<HTMLButtonElement>) => {
        onFocus?.(event);
        boost(2.6);
      }}
      onBlur={(event: React.FocusEvent<HTMLButtonElement>) => {
        onBlur?.(event);
        boost(1);
      }}
      {...(asChild ? {} : { type: "button" as const })}
      {...props}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 size-full transition-opacity duration-500",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-px -z-10 rounded-[inherit] bg-[linear-gradient(180deg,rgb(255_255_255/0.12),transparent_55%)] opacity-80 transition-opacity duration-300 group-hover/element:opacity-100"
      />
      <Slottable>{children}</Slottable>
    </Comp>
  );
}

export { ElementButton, elementButtonVariants };
