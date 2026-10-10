"use client";

import {
  SiAnthropic,
  SiCloudflare,
  SiFigma,
  SiGithub,
  SiLinear,
  SiNotion,
  SiSupabase,
  SiVercel,
} from "@icons-pack/react-simple-icons";
import { LogoFlow, type LogoFlowLogo } from "@/registry/clover-ui/logo-flow";

export const logoFlowLogos: LogoFlowLogo[] = [
  { name: "Vercel", icon: <SiVercel /> },
  { name: "Figma", icon: <SiFigma color="#f24e1e" /> },
  { name: "GitHub", icon: <SiGithub /> },
  { name: "Linear", icon: <SiLinear color="#5e6ad2" /> },
  { name: "Notion", icon: <SiNotion /> },
  { name: "Supabase", icon: <SiSupabase color="#3ecf8e" /> },
  { name: "Anthropic", icon: <SiAnthropic /> },
  { name: "Cloudflare", icon: <SiCloudflare color="#f38020" /> },
];

export function Demo() {
  return <LogoFlow logos={logoFlowLogos} className="max-w-lg" />;
}
