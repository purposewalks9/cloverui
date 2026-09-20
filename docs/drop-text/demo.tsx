import { DropText } from "@/registry/clover-ui/drop-text";

export function Demo() {
  return (
    <DropText className="text-3xl font-medium text-center">
      Dropping into place.
    </DropText>
  );
}

export function CharacterDemo() {
  return (
    <DropText
      splitBy="characters"
      stagger={0.025}
      className="text-2xl font-medium"
    >
      Every letter falls.
    </DropText>
  );
}

export function FastDemo() {
  return (
    <DropText speed={2.5} className="text-2xl font-medium">
      Quick drop, no delay.
    </DropText>
  );
}

export function NoBounceDemo() {
  return (
    <DropText bounce={0} speed={1.5} className="text-2xl font-medium">
      A crisp, weightless fall.
    </DropText>
  );
}