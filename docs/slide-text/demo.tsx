import { SlideText } from "@/registry/clover-ui/slide-text";

export function Demo() {
  return (
    <SlideText
      color="#E1E900"
      stagger={0.08}
      className="text-2xl font-medium"
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
      stagger={0.035}
      className="text-2xl font-medium"
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
      className="text-2xl font-medium"
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
      autoStart
      className="text-2xl font-medium"
    >
      Slide text out.
    </SlideText>
  );
}
