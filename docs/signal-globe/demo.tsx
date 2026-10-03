import {
  SignalGlobe,
  type GlobeRequest,
  type GlobeServer,
} from "@/registry/clover-ui/signal-globe";

const server: GlobeServer = {
  id: "fra-1",
  label: "Frankfurt",
  region: "eu-central-1",
  lat: 50.1109,
  lng: 8.6821,
};

const requests: GlobeRequest[] = [
  { id: "tokyo", origin: { lat: 35.6762, lng: 139.6503 }, kind: "api" },
  { id: "lima", origin: { lat: -12.0464, lng: -77.0428 }, kind: "upload" },
  { id: "cape-town", origin: { lat: -33.9249, lng: 18.4241 }, kind: "stream" },
];

export function Demo() {
  return <SignalGlobe server={server} requests={requests} className="h-[400px]" />;
}
