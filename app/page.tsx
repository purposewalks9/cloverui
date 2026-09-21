import { RootHeader } from "@/components/root-header";
import { HeroComponentGridLoader } from "@/components/hero-component-grid-loader";


export default function Home() {
  return (
    <div className="relative flex flex-col min-h-dvh">
      <RootHeader />
      <div className="">
        <HeroComponentGridLoader />
      </div>
    </div>
  );
}