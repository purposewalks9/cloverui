import { LogoMarquee, logoMarqueeLogos } from "@/registry/clover-ui/logo-marquee";

const logos = logoMarqueeLogos.map((logo) => ({
  ...logo,
  src: logo.src.replace("https://cloverui.vercel.app", ""),
}));

export function Demo() {
  return (
    <div className="flex min-h-[320px] w-full items-center justify-center px-6">
      <LogoMarquee logos={logos} className="max-w-2xl" />
    </div>
  );
}
