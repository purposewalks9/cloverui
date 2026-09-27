"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Matter from "matter-js";

export interface TokenPalette {
  bg: string;
  fg: string;
}

export interface TokenMeta {
  id: number;
  size: number;
  palette: TokenPalette;
  angle: number;
}

export interface TokenFallProps {
  count?: number;

  minSize?: number;

  maxSize?: number;

  palettes?: TokenPalette[];

  renderToken?: (token: TokenMeta) => ReactNode;

  gravity?: number;

  restitution?: number;

  repelRadius?: number;

  repelStrength?: number;

  spawnInterval?: number;

  className?: string;
  tokenClassName?: string;
}

const DEFAULT_PALETTES: TokenPalette[] = [
  { bg: "#EA6D00", fg: "#FFC24B" },
  { bg: "#C82929", fg: "#EB8900" },
  { bg: "#1F6F50", fg: "#2ECC71" },
  { bg: "#5B3AA0", fg: "#9B6EF3" },
  { bg: "#1E5FA8", fg: "#4FA8FF" },
];
const TOKEN_PATH =
  "M7.48501 2.26812C7.18501 2.09812 6.81501 2.09812 6.51501 2.26812L3.01501 4.21312L5.55001 5.61812C5.91501 5.23812 6.43001 4.99813 7.00001 4.99813C7.57001 4.99813 8.08501 5.23812 8.45001 5.61812L10.985 4.20813L7.48501 2.26812ZM6.00001 6.99813C6.00001 6.44813 6.45001 5.99813 7.00001 5.99813C7.55001 5.99813 8.00001 6.44813 8.00001 6.99813C8.00001 7.54813 7.55001 7.99813 7.00001 7.99813C6.45001 7.99813 6.00001 7.54813 6.00001 6.99813ZM2.50001 5.06813L5.06501 6.49312C5.02001 6.65312 5.00001 6.82313 5.00001 6.99813C5.00001 7.92813 5.63501 8.71313 6.50001 8.93313V11.7181L3.01501 9.78312C2.85852 9.69694 2.72812 9.57022 2.6375 9.41626C2.54688 9.26229 2.49939 9.08677 2.50001 8.90812V5.06813ZM7.50001 11.7181V8.93313C8.36501 8.71313 9.00001 7.92813 9.00001 6.99813C9.00001 6.82313 8.98001 6.65312 8.93501 6.49312L11.5 5.06813V8.90812C11.5 9.27312 11.305 9.60812 10.985 9.78312L7.50001 11.7181Z";

function TokenGlyph({ size, palette }: { size: number; palette: TokenPalette }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <rect width="14" height="14" rx="7" fill={palette.bg} />
      <path d={TOKEN_PATH} fill={palette.fg} />
    </svg>
  );
}

type TokenBody = TokenMeta & { body: Matter.Body };

export function TokenFall({
  count = 55,
  minSize = 14,
  maxSize = 28,
  palettes = DEFAULT_PALETTES,
  renderToken,
  gravity = 0.35,
  restitution = 0.75,
  repelRadius = 150,
  repelStrength = 0.0015,
  spawnInterval = 180,
  className,
  tokenClassName,
}: TokenFallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const domRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [tokens, setTokens] = useState<TokenBody[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const engine = Matter.Engine.create();
    engine.gravity.y = gravity;

    const floor = Matter.Bodies.rectangle(width / 2, height + 20, width + 80, 40, {
      isStatic: true,
    });
    const leftWall = Matter.Bodies.rectangle(-20, height / 2, 40, height * 2, {
      isStatic: true,
    });
    const rightWall = Matter.Bodies.rectangle(width + 20, height / 2, 40, height * 2, {
      isStatic: true,
    });

    Matter.World.add(engine.world, [floor, leftWall, rightWall]);

    const created: TokenBody[] = [];

    const mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    let nextId = 0;
    const spawnToken = () => {
      if (created.length >= count) return;

      const size = minSize + Math.random() * (maxSize - minSize);
      const palette = palettes[Math.floor(Math.random() * palettes.length)];
      const x = Math.random() * width;
      const y = -size - Math.random() * 80;

      const body = Matter.Bodies.circle(x, y, size / 2, {
        restitution,
        friction: 0.05,
        frictionAir: 0.003,
        density: 0.0012,
      });
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 2.5,
        y: Math.random() * 1.5 + 0.5,
      });
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3);

      Matter.World.add(engine.world, body);

      created.push({
        id: nextId++,
        body,
        size,
        palette,
        angle: body.angle,
      });

      setTokens([...created]);
    };
    const spawnLoop = window.setInterval(spawnToken, spawnInterval);
    spawnToken();
    const beforeUpdate = () => {
      created.forEach((token) => {
        const dx = token.body.position.x - mouse.x;
        const dy = token.body.position.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0 && distance < repelRadius) {
          const strength = (1 - distance / repelRadius) * repelStrength;
          Matter.Body.applyForce(token.body, token.body.position, {
            x: (dx / distance) * strength,
            y: (dy / distance) * strength,
          });
        }
      });
    };

    Matter.Events.on(engine, "beforeUpdate", beforeUpdate);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    let frame: number;
    const sync = () => {
      created.forEach((token) => {
        const el = domRefs.current[token.id];
        if (!el) return;

        const { x, y } = token.body.position;
        el.style.transform =
          `translate3d(${x - token.size / 2}px, ${y - token.size / 2}px, 0) ` +
          `rotate(${token.body.angle}rad)`;
      });

      frame = requestAnimationFrame(sync);
    };
    frame = requestAnimationFrame(sync);

    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(spawnLoop);

      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);

      Matter.Events.off(engine, "beforeUpdate", beforeUpdate);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
    };
  }, [count, minSize, maxSize, palettes, gravity, restitution, repelRadius, repelStrength, spawnInterval]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {tokens.map((token) => (
        <div
          key={token.id}
          ref={(el) => {
            domRefs.current[token.id] = el;
          }}
          className={`pointer-events-auto absolute left-0 top-0 cursor-grab rounded-full will-change-transform active:cursor-grabbing ${tokenClassName ?? ""}`}
          style={{ width: token.size, height: token.size }}
        >
          {renderToken ? renderToken(token) : <TokenGlyph size={token.size} palette={token.palette} />}
        </div>
      ))}
    </div>
  );
}

export default TokenFall;