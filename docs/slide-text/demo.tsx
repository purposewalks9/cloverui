import { SlideText } from "@/registry/clover-ui/slide-text";

export function Demo() {
  return (
    <SlideText
      color="#E1E900"
      stagger={0.065}
      className="text-center text-2xl font-semibold tracking-tight"
    >
      Clover UI, one word at a time.
    </SlideText>
  );
}

export function CharacterDemo() {
  return (
    <SlideText
      splitBy="characters"
      color="#8B5CF6"
      stagger={0.028}
      className="text-2xl font-semibold tracking-tight"
    >
      Every letter moves.
    </SlideText>
  );
}

export function CenterDemo() {
  return (
    <SlideText
      from="center"
      direction="left"
      color="#60A5FA"
      stagger={0.07}
      className="text-2xl font-semibold tracking-tight"
    >
      Start from the center.
    </SlideText>
  );
}

export function OutDemo() {
  return (
    <SlideText
      mode="out"
      direction="right"
      color="#F43F5E"
      className="text-2xl font-semibold tracking-tight"
    >
      Slide text out.
    </SlideText>
  );
}

export function GradientDemo() {
  return (
    <SlideText
      splitBy="words"
      color="#E1E900"
      landedClassName="text-foreground"
      className="text-center text-3xl tracking-[-0.04em]"
    >
      Motion gives static type a pulse.
    </SlideText>
  );
}
