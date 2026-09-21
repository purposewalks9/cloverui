import { DropText } from "@/registry/clover-ui/drop-text";

export function Demo() {
  return (
    <DropText
      stagger={0.065}
      className="text-center text-3xl font-semibold tracking-tight"
    >
      Dropping into place.
    </DropText>
  );
}

export function CharacterDemo() {
  return (
    <DropText
      splitBy="characters"
      stagger={0.022}
      bounce={0.28}
      className="text-2xl font-semibold"
    >
      Every letter falls.
    </DropText>
  );
}

export function FastDemo() {
  return (
    <DropText speed={2.5} bounce={0.2} className="text-2xl font-semibold">
      Quick drop, no delay.
    </DropText>
  );
}

export function NoBounceDemo() {
  return (
    <DropText bounce={0} speed={1.5} className="text-2xl font-semibold">
      A crisp, weightless fall.
    </DropText>
  );
}

export function HeavyDemo() {
  return (
    <DropText
      dropDistance={72}
      duration={0.8}
      stagger={0.08}
      bounce={0.5}
      className="text-center text-3xl font-black tracking-tight"
    >
      Make an entrance.
    </DropText>
  );
}
