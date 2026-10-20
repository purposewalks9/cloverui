"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export type AuthProvider =
  | "google"
  | "github"
  | "microsoft"
  | "discord"
  | "spotify"
  | "gitlab"
  | "linkedin"
  | "slack"
  | "twitch"
  | "notion"
  | "chatgpt"
  | "dropbox";

export interface AuthBrand {
  name: string;
  logo: string;
  mono?: boolean;
  colors?: string[];
}

export type AuthButtonSize = "sm" | "default" | "lg";
export type AuthButtonIntent = "signin" | "signup";

export interface AuthButtonProps extends React.ComponentProps<"button"> {
  provider?: AuthProvider | AuthBrand;
  size?: AuthButtonSize;
  intent?: AuthButtonIntent;
}

const svg = (source: string) => `data:image/svg+xml,${encodeURIComponent(source)}`;

const providerBrands: Record<AuthProvider, AuthBrand> = {
  google: {
    name: "Google",
    colors: ["#EA4335", "#FBBC05", "#34A853", "#4285F4"],
    logo: svg(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.87 23.87 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>',
    ),
  },
  github: {
    name: "GitHub",
    mono: true,
    logo: svg(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="#181717" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>',
    ),
  },
  microsoft: {
    name: "Microsoft",
    colors: ["#F25022", "#7FBA00", "#00A4EF", "#FFB900"],
    logo: svg(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#F25022" d="M1 1h10.5v10.5H1z"/><path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z"/><path fill="#00A4EF" d="M1 12.5h10.5V23H1z"/><path fill="#FFB900" d="M12.5 12.5H23V23H12.5z"/></svg>',
    ),
  },
  discord: {
    name: "Discord",
    colors: ["#5865F2"],
    logo: svg(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="#5865F2" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"></path></svg>',
    ),
  },
  spotify: {
    name: "Spotify",
    colors: ["#1ED760"],
    logo: svg(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="#1ED760" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"></path></svg>',
    ),
  },
  gitlab: {
    name: "GitLab",
    colors: ["#E24329", "#FC6D26", "#FCA326"],
    logo: svg(
      '<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m31.46 12.78-.04-.12-4.35-11.35A1.14 1.14 0 0 0 25.94.6c-.24 0-.47.1-.66.24-.19.15-.33.36-.39.6l-2.94 9h-11.9l-2.94-9A1.14 1.14 0 0 0 6.07.58a1.15 1.15 0 0 0-1.14.72L.58 12.68l-.05.11a8.1 8.1 0 0 0 2.68 9.34l.02.01.04.03 6.63 4.97 3.28 2.48 2 1.52a1.35 1.35 0 0 0 1.62 0l2-1.52 3.28-2.48 6.67-5h.02a8.09 8.09 0 0 0 2.7-9.36Z" fill="#E24329"/><path d="m31.46 12.78-.04-.12a14.75 14.75 0 0 0-5.86 2.64l-9.55 7.24 6.09 4.6 6.67-5h.02a8.09 8.09 0 0 0 2.67-9.36Z" fill="#FC6D26"/><path d="m9.9 27.14 3.28 2.48 2 1.52a1.35 1.35 0 0 0 1.62 0l2-1.52 3.28-2.48-6.1-4.6-6.07 4.6Z" fill="#FCA326"/><path d="M6.44 15.3a14.71 14.71 0 0 0-5.86-2.63l-.05.12a8.1 8.1 0 0 0 2.68 9.34l.02.01.04.03 6.63 4.97 6.1-4.6-9.56-7.24Z" fill="#FC6D26"/></svg>',
    ),
  },
  linkedin: {
    name: "LinkedIn",
    colors: ["#0A66C2"],
    logo: svg(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453" fill="#0A66C2"/></svg>',
    ),
  },
  slack: {
    name: "Slack",
    colors: ["#36C5F0", "#2EB67D", "#ECB22E", "#E01E5A"],
    logo: svg(
      '<svg viewBox="0 0 2447.6 2452.5" xmlns="http://www.w3.org/2000/svg" ><g clip-rule="evenodd" fill-rule="evenodd"><path d="m897.4 0c-135.3.1-244.8 109.9-244.7 245.2-.1 135.3 109.5 245.1 244.8 245.2h244.8v-245.1c.1-135.3-109.5-245.1-244.9-245.3.1 0 .1 0 0 0m0 654h-652.6c-135.3.1-244.9 109.9-244.8 245.2-.2 135.3 109.4 245.1 244.7 245.3h652.7c135.3-.1 244.9-109.9 244.8-245.2.1-135.4-109.5-245.2-244.8-245.3z" fill="#36c5f0" /><path d="m2447.6 899.2c.1-135.3-109.5-245.1-244.8-245.2-135.3.1-244.9 109.9-244.8 245.2v245.3h244.8c135.3-.1 244.9-109.9 244.8-245.3zm-652.7 0v-654c.1-135.2-109.4-245-244.7-245.2-135.3.1-244.9 109.9-244.8 245.2v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.3z" fill="#2eb67d" /><path d="m1550.1 2452.5c135.3-.1 244.9-109.9 244.8-245.2.1-135.3-109.5-245.1-244.8-245.2h-244.8v245.2c-.1 135.2 109.5 245 244.8 245.2zm0-654.1h652.7c135.3-.1 244.9-109.9 244.8-245.2.2-135.3-109.4-245.1-244.7-245.3h-652.7c-135.3.1-244.9 109.9-244.8 245.2-.1 135.4 109.4 245.2 244.7 245.3z" fill="#ecb22e" /><path d="m0 1553.2c-.1 135.3 109.5 245.1 244.8 245.2 135.3-.1 244.9-109.9 244.8-245.2v-245.2h-244.8c-135.3.1-244.9 109.9-244.8 245.2zm652.7 0v654c-.2 135.3 109.4 245.1 244.7 245.3 135.3-.1 244.9-109.9 244.8-245.2v-653.9c.2-135.3-109.4-245.1-244.7-245.3-135.4 0-244.9 109.8-244.8 245.1 0 0 0 .1 0 0" fill="#e01e5a" /></g></svg>',
    ),
  },
  twitch: {
    name: "Twitch",
    colors: ["#9146FF"],
    logo: svg(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 2800"><path fill="#fff" d="m2200 1300-400 400h-400l-350 350v-350H600V200h1600z"/><g fill="#9146ff"><path d="M500 0 0 500v1800h600v500l500-500h400l900-900V0H500zm1700 1300-400 400h-400l-350 350v-350H600V200h1600v1100z"/><path d="M1700 550h200v600h-200zm-550 0h200v600h-200z"/></g></svg>',
    ),
  },
  notion: {
    name: "Notion",
    logo: svg(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 268"><path fill="#FFF" d="M16.092 11.538 164.09.608c18.179-1.56 22.85-.508 34.28 7.801l47.243 33.282C253.406 47.414 256 48.975 256 55.207v182.527c0 11.439-4.155 18.205-18.696 19.24L65.44 267.378c-10.913.517-16.11-1.043-21.825-8.327L8.826 213.814C2.586 205.487 0 199.254 0 191.97V29.726c0-9.352 4.155-17.153 16.092-18.188Z"/><path d="M164.09.608 16.092 11.538C4.155 12.573 0 20.374 0 29.726v162.245c0 7.284 2.585 13.516 8.826 21.843l34.789 45.237c5.715 7.284 10.912 8.844 21.825 8.327l171.864-10.404c14.532-1.035 18.696-7.801 18.696-19.24V55.207c0-5.911-2.336-7.614-9.21-12.66l-1.185-.856L198.37 8.409C186.94.1 182.27-.952 164.09.608ZM69.327 52.22c-14.033.945-17.216 1.159-25.186-5.323L23.876 30.778c-2.06-2.086-1.026-4.69 4.163-5.207l142.274-10.395c11.947-1.043 18.17 3.12 22.842 6.758l24.401 17.68c1.043.525 3.638 3.637.517 3.637L71.146 52.095l-1.819.125Zm-16.36 183.954V81.222c0-6.767 2.077-9.887 8.3-10.413L230.02 60.93c5.724-.517 8.31 3.12 8.31 9.879v153.917c0 6.767-1.044 12.49-10.387 13.008l-161.487 9.361c-9.343.517-13.489-2.594-13.489-10.921ZM212.377 89.53c1.034 4.681 0 9.362-4.681 9.897l-7.783 1.542v114.404c-6.758 3.637-12.981 5.715-18.18 5.715-8.308 0-10.386-2.604-16.609-10.396l-50.898-80.079v77.476l16.1 3.646s0 9.362-12.989 9.362l-35.814 2.077c-1.043-2.086 0-7.284 3.63-8.318l9.351-2.595V109.823l-12.98-1.052c-1.044-4.68 1.55-11.439 8.826-11.965l38.426-2.585 52.958 81.113v-71.76l-13.498-1.552c-1.043-5.733 3.111-9.896 8.3-10.404l35.84-2.087Z"/></svg>',
    ),
  },
  chatgpt: {
    name: "ChatGPT",
    mono: true,
    logo: svg(
      '<svg viewBox="96 96 419 419" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M252.794 108.802C289.191 99.0484 326.265 110.305 351.148 135.135C385.113 126.072 422.85 134.862 449.492 161.505C476.136 188.149 484.925 225.888 475.862 259.85V259.854C500.696 284.735 511.95 321.81 502.198 358.207C492.447 394.602 464.161 421.084 430.215 430.217C421.083 464.162 394.603 492.448 358.206 502.199C321.812 511.951 284.734 500.693 259.852 475.864C225.887 484.927 188.15 476.137 161.507 449.495C134.864 422.851 126.073 385.111 135.136 351.149C110.304 326.266 99.0496 289.192 108.801 252.795C118.552 216.4 146.84 189.918 180.784 180.785C189.917 146.841 216.396 118.553 252.794 108.802ZM374.292 407.145C374.292 411.271 372.092 415.086 368.517 417.148L283.723 466.102C302.487 480.585 327.555 486.459 352.217 479.852C386.997 470.532 410.068 439.312 410.555 405.006V317.717C410.555 315.08 409.125 312.621 406.843 311.303L374.292 292.509V407.145ZM251.868 415.897C248.296 417.959 243.893 417.959 240.317 415.897L155.526 366.942C152.366 390.436 159.811 415.08 177.866 433.136H177.863C203.325 458.594 241.896 462.962 271.85 446.232L347.449 402.586C349.735 401.268 351.148 398.8 351.148 396.163V358.579L251.868 415.897ZM368.602 220.628C366.319 219.309 363.474 219.318 361.191 220.637L328.641 239.431L427.921 296.749C431.496 298.811 433.697 302.627 433.697 306.752V404.661C455.622 395.654 473.244 376.881 479.851 352.218C489.169 317.442 473.668 281.85 444.201 264.274L368.602 220.628ZM177.303 206.34C155.377 215.348 137.756 234.122 131.148 258.783C121.832 293.561 137.331 329.153 166.799 346.727L242.398 390.373C244.68 391.692 247.525 391.684 249.807 390.366L282.357 371.572L183.078 314.253C179.504 312.189 177.303 308.375 177.303 304.251V206.34ZM259.849 279.145V331.858L305.5 358.213L351.15 331.858V279.145L305.5 252.789L259.849 279.145ZM327.276 144.9C308.512 130.418 283.445 124.543 258.782 131.15C224.002 140.471 200.931 171.691 200.445 205.995V293.286C200.445 295.923 201.875 298.381 204.158 299.7L236.707 318.493V203.856C236.707 199.731 238.909 195.916 242.483 193.853L327.276 144.9ZM433.137 177.867C407.675 152.407 369.103 148.038 339.149 164.769L263.55 208.415C261.265 209.734 259.852 212.202 259.852 214.838V252.423L359.132 195.105C362.703 193.041 367.108 193.041 370.682 195.105L455.473 244.06C458.635 220.567 451.189 195.922 433.135 177.867H433.137Z" fill="black"/></svg>',
    ),
  },
  dropbox: {
    name: "Dropbox",
    colors: ["#0061FE"],
    logo: svg(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128"><path fill="#0061FE" d="M0 0h128v128H0z"/><path fill="#F7F5F2" d="M43.7 32 23.404 44.75 43.701 57.5 64 44.75 84.3 57.5l20.298-12.75L84.299 32 64.002 44.75 43.7 32Zm0 51L23.404 70.25 43.701 57.5 64 70.25 43.702 83Zm20.302-12.75L84.299 57.5l20.298 12.75L84.299 83 64.002 70.25Zm0 29.75L43.7 87.25 64 74.5l20.3 12.75L64.002 100Z"/></svg>',
    ),
  },
};

const buttonVariants = cva(
  "clover-auth relative isolate inline-flex min-w-0 max-w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 outline-none select-none disabled:cursor-not-allowed",
  {
    variants: {
      size: {
        sm: "h-9 w-[min(232px,100%)] rounded-[var(--auth-radius)] px-3 text-xs [--auth-mark:14px] [--auth-radius:12px]",
        default:
          "h-11 w-[min(272px,100%)] rounded-[var(--auth-radius)] px-4 text-[13px] [--auth-mark:16px] [--auth-radius:14px]",
        lg: "h-12 w-[min(304px,100%)] rounded-[var(--auth-radius)] px-5 text-sm [--auth-mark:18px] [--auth-radius:16px]",
      },
    },
    defaultVariants: { size: "default" },
  },
);

const styles = `
  .clover-auth {
    --auth-base: #f4f4f6;
    --auth-text: #18181b;
    --auth-border: oklch(.922 0 0);
    --auth-tint: .09;
    --auth-wash-filter: blur(30px) saturate(1.3);
    --auth-glass: linear-gradient(180deg, #ffffffa6, #ffffff59 55%, #ffffff80);
    --auth-mono: none;
    --auth-depth: linear-gradient(180deg, #ffffff80, #0000000a);
    --auth-highlight: #ffffffd9;
    --auth-text-shadow: 0 1px 0 #ffffffb3;
    background: var(--auth-base);
    border: 1.5px solid var(--auth-border);
    color: var(--auth-text);
    transition: opacity 200ms ease, transform 180ms cubic-bezier(.2, .8, .2, 1);
    -webkit-tap-highlight-color: transparent;
  }
  .clover-auth:active:not(:disabled) { transform: translateY(1px); transition-duration: 200ms, 60ms; }
  .clover-auth:focus-visible { outline: 2px solid var(--ring, #8989a5); outline-offset: 4px; }
  .clover-auth:disabled { opacity: .45; }
  .dark .clover-auth {
    --auth-base: #0a0b0d;
    --auth-text: #fff;
    --auth-border: oklch(1 0 0 / .19);
    --auth-tint: .1;
    --auth-wash-filter: blur(30px) saturate(.7) brightness(1.8);
    --auth-glass: linear-gradient(180deg, #ffffff09, #ffffff02 55%, #ffffff05);
    --auth-depth: linear-gradient(180deg, #ffffff0d, #00000033);
    --auth-highlight: #ffffff1f;
    --auth-text-shadow: 0 1px 0 #00000080;
    --auth-mono: brightness(0) invert(1);
  }
  .clover-auth-surface { background: var(--auth-base); }
  .clover-auth-color {
    position: absolute;
    inset: -20%;
    background: var(--auth-wash);
    opacity: var(--auth-tint);
    filter: var(--auth-wash-filter);
  }
  .clover-auth-glass {
    position: absolute;
    inset: 0;
    background: var(--auth-glass);
    backdrop-filter: blur(12px) saturate(1.2);
    -webkit-backdrop-filter: blur(12px) saturate(1.2);
  }
  .clover-auth-depth {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--auth-depth);
    box-shadow: inset 0 1px 0 var(--auth-highlight);
  }
  .clover-auth-lens {
    width: var(--auth-mark);
    height: var(--auth-mark);
  }
  .clover-auth-lens[data-mono] img { filter: var(--auth-mono); }
  @media (prefers-reduced-motion: reduce) {
    .clover-auth, .clover-auth * { transition: none !important; animation: none !important; }
    .clover-auth:active:not(:disabled) { transform: none; }
  }
  @media (forced-colors: active) {
    .clover-auth { border: 1px solid ButtonText; background: ButtonFace; color: ButtonText; box-shadow: none; }
    .clover-auth-surface { display: none; }
    .clover-auth:focus-visible { outline-color: Highlight; }
    .clover-auth-lens { forced-color-adjust: none; }
  }
`;

function AuthButton({
  provider = "google",
  size = "default",
  intent = "signin",
  disabled = false,
  type = "button",
  className,
  children,
  ...props
}: AuthButtonProps) {
  const brand = typeof provider === "string" ? providerBrands[provider] : provider;
  const [failedLogo, setFailedLogo] = React.useState<string | null>(null);
  const logoFailed = failedLogo === brand.logo;
  const prefix = { signin: "Sign in with", signup: "Sign up with" }[intent];
  const label = children ?? `${prefix} ${brand.name}`;
  const wash = brand.colors?.length
    ? `linear-gradient(110deg, ${[...brand.colors, brand.colors[0]].join(", ")})`
    : undefined;

  return (
    <>
      <style href="clover-auth-button" precedence="components">
        {styles}
      </style>
      <button
        {...props}
        type={type}
        disabled={disabled}
        className={cn(buttonVariants({ size }), className)}
      >
        <span
          aria-hidden="true"
          className="clover-auth-surface pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
          style={{ "--auth-wash": wash } as React.CSSProperties}
        >
          {wash && <span className="clover-auth-color" />}
          <span className="clover-auth-glass" />
          <span className="clover-auth-depth" />
        </span>
        <span
          aria-hidden="true"
          data-mono={brand.mono || undefined}
          className="clover-auth-lens relative flex shrink-0 items-center justify-center text-sm font-semibold"
        >
          {logoFailed ? (
            brand.name.slice(0, 1)
          ) : (
            <img
              key={brand.logo}
              src={brand.logo}
              alt=""
              width={24}
              height={24}
              draggable={false}
              onError={() => setFailedLogo(brand.logo)}
              className="size-[var(--auth-mark)] object-contain"
            />
          )}
        </span>
        <span className="relative min-w-0 truncate pt-[0.1rem] leading-none font-medium tracking-[-0.015em] whitespace-nowrap [text-shadow:var(--auth-text-shadow)]">
          {label}
        </span>
      </button>
    </>
  );
}

export { AuthButton };
