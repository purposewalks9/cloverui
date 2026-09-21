import { TokenFall } from "@/registry/clover-ui/token-fall";

export function Demo() {
  return (
    <div className="relative h-72 w-full max-w-md overflow-hidden rounded-2xl">
      <TokenFall count={34} minSize={12} maxSize={25} />
    </div>
  );
}

export function DenseDemo() {
  return (
    <div className="relative h-72 w-full max-w-md overflow-hidden rounded-2xl">
      <TokenFall
        count={90}
        minSize={8}
        maxSize={16}
        spawnInterval={60}
        gravity={0.3}
      />
    </div>
  );
}

export function SlowDemo() {
  return (
    <div className="relative h-72 w-full max-w-md overflow-hidden rounded-2xl">
      <TokenFall
        count={26}
        minSize={16}
        maxSize={30}
        spawnInterval={260}
        gravity={0.22}
        restitution={0.9}
        repelRadius={190}
        repelStrength={0.002}
      />
    </div>
  );
}

export function TinyDemo() {
  return (
    <div className="relative h-60 w-full max-w-md overflow-hidden rounded-2xl">
      <TokenFall
        count={120}
        minSize={5}
        maxSize={10}
        spawnInterval={35}
        gravity={0.4}
        restitution={0.55}
      />
    </div>
  );
}
