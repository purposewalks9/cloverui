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
