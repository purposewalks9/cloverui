import { LogoStorm, logoStormLogos } from "@/registry/clover-ui/logo-storm";

const logos = logoStormLogos.map((logo) => ({
  ...logo,
  src: logo.src.replace("https://cloverui.vercel.app", ""),
}));

export function Demo() {
  return (
    <div className="flex min-h-[320px] w-full items-center justify-center px-6">
      <LogoStorm logos={logos} className="max-w-2xl" />
    </div>
  );
}
