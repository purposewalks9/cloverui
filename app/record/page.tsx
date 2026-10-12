import type { Metadata } from "next";
import { RecordingStudio } from "./recording-studio";

export const metadata: Metadata = {
  title: "Recording studio · Clover UI",
  description: "A clean stage for recording Clover UI components.",
  robots: { index: false, follow: false },
};

export default function RecordPage() {
  return <RecordingStudio />;
}
