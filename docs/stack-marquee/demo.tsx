"use client";

import {
  SiClaude,
  SiGithub,
  SiGooglegemini,
  SiHuggingface,
  SiLangchain,
  SiMistralai,
  SiModelcontextprotocol,
  SiOpenai,
  SiVercel,
} from "@icons-pack/react-simple-icons";
import { StackMarquee, type StackMarqueeLogo } from "@/registry/clover-ui/stack-marquee";

function OpenClawIcon() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient
          id="openclaw-coral"
          x1="15"
          y1="10"
          x2="100"
          y2="110"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ff4d4d" />
          <stop offset="1" stopColor="#e43d36" />
        </linearGradient>
      </defs>
      <g transform="translate(0 2)">
        <path
          d="M60 10 C30 10 15 35 15 55 C15 75 30 95 45 100 L45 110 L55 110 L55 100 C55 100 60 102 65 100 L65 110 L75 110 L75 100 C90 95 105 75 105 55 C105 35 90 10 60 10Z"
          fill="url(#openclaw-coral)"
        />
        <path
          d="M20 45 C5 40 0 50 5 60 C10 70 20 65 25 55 C28 48 25 45 20 45Z"
          fill="url(#openclaw-coral)"
        />
        <path
          d="M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z"
          fill="url(#openclaw-coral)"
        />
        <path
          d="M45 15 Q35 5 30 8 M75 15 Q85 5 90 8"
          stroke="#ff4d4d"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="45" cy="35" r="6" fill="#050810" />
        <circle cx="75" cy="35" r="6" fill="#050810" />
        <circle cx="46" cy="34" r="2.5" fill="#00e5cc" />
        <circle cx="76" cy="34" r="2.5" fill="#00e5cc" />
      </g>
    </svg>
  );
}

function GrokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        d="M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815"
      />
    </svg>
  );
}

function CursorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23" />
    </svg>
  );
}

export const stackMarqueeLogos: StackMarqueeLogo[] = [
  { name: "Claude", icon: <SiClaude color="default" /> },
  { name: "OpenAI", icon: <SiOpenai /> },
  { name: "OpenClaw", icon: <OpenClawIcon /> },
  { name: "Grok", icon: <GrokIcon /> },
  { name: "GitHub", icon: <SiGithub /> },
  { name: "Vercel", icon: <SiVercel /> },
  { name: "Cursor", icon: <CursorIcon /> },
  { name: "Gemini", icon: <SiGooglegemini color="default" /> },
  { name: "Mistral AI", icon: <SiMistralai color="default" /> },
  { name: "Hugging Face", icon: <SiHuggingface color="default" /> },
  { name: "Model Context Protocol", icon: <SiModelcontextprotocol /> },
  { name: "LangChain", icon: <SiLangchain /> },
];

export function Demo() {
  return <StackMarquee logos={stackMarqueeLogos} className="max-w-lg" />;
}
