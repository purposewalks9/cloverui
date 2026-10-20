"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type SignInProvider =
  "google" | "apple" | "github" | "microsoft" | "discord" | "x" | "facebook" | "spotify";

export interface SignInBrand {
  name: string;
  logo: string;
}

export type SignInButtonSize = "sm" | "default" | "lg";
export type SignInButtonIntent = "continue" | "signin" | "signup";

export interface SignInButtonProps extends React.ComponentProps<"button"> {
  provider?: SignInProvider | SignInBrand;
  size?: SignInButtonSize;
  intent?: SignInButtonIntent;
  loading?: boolean;
  loadingLabel?: string;
}

const svg = (source: string) => `data:image/svg+xml,${encodeURIComponent(source)}`;

const providerBrands: Record<SignInProvider, SignInBrand> = {
  google: {
    name: "Google",
    logo: svg(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.87 23.87 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>',
    ),
  },
  apple: {
    name: "Apple",
    logo: svg(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="#000000" viewBox="0 0 24 24"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"></path></svg>',
    ),
  },
  github: {
    name: "GitHub",
    logo: svg(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="#181717" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>',
    ),
  },
  microsoft: {
    name: "Microsoft",
    logo: svg(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#F25022" d="M1 1h10.5v10.5H1z"/><path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z"/><path fill="#00A4EF" d="M1 12.5h10.5V23H1z"/><path fill="#FFB900" d="M12.5 12.5H23V23H12.5z"/></svg>',
    ),
  },
  discord: {
    name: "Discord",
    logo: svg(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="#5865F2" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"></path></svg>',
    ),
  },
  x: {
    name: "X",
    logo: svg(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="#000000" viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"></path></svg>',
    ),
  },
  facebook: {
    name: "Facebook",
    logo: svg(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="#0866FF" viewBox="0 0 24 24"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"></path></svg>',
    ),
  },
  spotify: {
    name: "Spotify",
    logo: svg(
      '<svg xmlns="http://www.w3.org/2000/svg" fill="#1ED760" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"></path></svg>',
    ),
  },
};

const buttonVariants = cva(
  "clover-sign-in relative isolate inline-flex min-w-0 max-w-full shrink-0 cursor-pointer items-center border-0 text-white outline-none select-none disabled:cursor-not-allowed",
  {
    variants: {
      size: {
        sm: "min-h-11 w-[min(232px,100%)] rounded-[15px] px-2 py-2 text-[13px] [--signin-icon:28px] [--signin-mark:17px]",
        default:
          "min-h-14 w-[min(272px,100%)] rounded-[19px] px-2.5 py-2.5 text-sm [--signin-icon:34px] [--signin-mark:20px]",
        lg: "min-h-16 w-[min(304px,100%)] rounded-[22px] px-3 py-3 text-[15px] [--signin-icon:38px] [--signin-mark:22px]",
      },
    },
    defaultVariants: { size: "default" },
  },
);

const styles = `
  .clover-sign-in {
    background: #31343c;
    box-shadow: 0 2px 3px #00000014, 0 8px 20px -10px #00000045;
    transition: transform 240ms cubic-bezier(.2,.8,.2,1), box-shadow 240ms ease, opacity 200ms ease;
    -webkit-tap-highlight-color: transparent;
  }
  .clover-sign-in:not(:disabled):is(:hover, :focus-visible) {
    transform: translateY(-1px);
    box-shadow: 0 3px 5px #00000018, 0 14px 28px -13px #00000070;
  }
  .clover-sign-in:not(:disabled):active { transform: translateY(1px) scale(.985); }
  .clover-sign-in:focus-visible { outline: 2px solid var(--ring, #8989a5); outline-offset: 4px; }
  .clover-sign-in:disabled:not([data-loading]) { opacity: .45; }
  .clover-sign-in-surface { background: linear-gradient(135deg, #9da2af 0%, #444751 42%, #181a20 100%); }
  .clover-sign-in-color {
    position: absolute;
    inset: -45% -10%;
    background-position: center;
    background-size: 100% 130%;
    background-repeat: no-repeat;
    filter: blur(18px) saturate(1.5);
    transform: translate3d(-4%, 0, 0) rotate(-12deg) scale(1.12);
    transition: transform 1200ms cubic-bezier(.16,1,.3,1);
  }
  .clover-sign-in-echo {
    inset: -80% -35%;
    opacity: .2;
    transform: translate3d(18%, 12%, 0) rotate(155deg) scale(1.3);
    filter: blur(24px) saturate(1.65);
  }
  .clover-sign-in:not(:disabled):is(:hover, :focus-visible) .clover-sign-in-color {
    transform: translate3d(7%, -6%, 0) rotate(5deg) scale(1.25);
  }
  .clover-sign-in:not(:disabled):is(:hover, :focus-visible) .clover-sign-in-echo {
    transform: translate3d(-5%, 8%, 0) rotate(180deg) scale(1.15);
  }
  .clover-sign-in-shade { background: linear-gradient(100deg, #080a123d, #080a1299 20%, #080a1299 80%, #080a1270); }
  .clover-sign-in-edge {
    box-shadow: inset 0 1px 0 #ffffff50, inset 0 -1px 0 #00000038, inset 0 0 0 1px #ffffff1c;
    background: linear-gradient(170deg, #ffffff18, transparent 45%);
  }
  .clover-sign-in-lens {
    width: var(--signin-icon);
    height: var(--signin-icon);
    border-radius: calc(var(--signin-icon) * .31);
    background: linear-gradient(155deg, #ffffff, #e9eaef);
    box-shadow: 0 1px 2px #00000020, 0 3px 9px #00000014, inset 0 1px 1px #ffffff;
  }
  .clover-sign-in-arrow { opacity: .55; transition: opacity 240ms ease, transform 400ms cubic-bezier(.2,.8,.2,1); }
  .clover-sign-in:not(:disabled):is(:hover, :focus-visible) .clover-sign-in-arrow { opacity: 1; transform: translateX(2px); }
  .clover-sign-in-spinner { animation: clover-sign-in-spin .8s linear infinite; }
  @keyframes clover-sign-in-spin { to { transform: rotate(360deg); } }
  .clover-sign-in[data-reduced-motion],
  .clover-sign-in[data-reduced-motion] * { transition: none !important; animation: none !important; }
  .clover-sign-in[data-reduced-motion]:is(:hover, :focus-visible, :active),
  .clover-sign-in[data-reduced-motion] .clover-sign-in-color,
  .clover-sign-in[data-reduced-motion] .clover-sign-in-arrow { transform: none !important; }
  @media (prefers-reduced-motion: reduce) {
    .clover-sign-in, .clover-sign-in * { transition: none !important; animation: none !important; }
    .clover-sign-in:is(:hover, :focus-visible, :active), .clover-sign-in .clover-sign-in-color, .clover-sign-in .clover-sign-in-arrow { transform: none !important; }
  }
  @media (forced-colors: active) {
    .clover-sign-in { border: 1px solid ButtonText; background: ButtonFace; color: ButtonText; }
    .clover-sign-in-surface, .clover-sign-in-edge { display: none; }
    .clover-sign-in:focus-visible { outline-color: Highlight; }
    .clover-sign-in-lens { forced-color-adjust: none; }
  }
`;

function SignInButton({
  provider = "google",
  size = "default",
  intent = "continue",
  loading = false,
  loadingLabel,
  disabled = false,
  type = "button",
  className,
  children,
  ...props
}: SignInButtonProps) {
  const reducedMotion = useReducedMotion();
  const brand = typeof provider === "string" ? providerBrands[provider] : provider;
  const [failedLogo, setFailedLogo] = React.useState<string | null>(null);
  const logoFailed = failedLogo === brand.logo;
  const prefix = { continue: "Continue with", signin: "Sign in with", signup: "Sign up with" }[
    intent
  ];
  const label = loading
    ? (loadingLabel ?? `Connecting to ${brand.name}…`)
    : (children ?? `${prefix} ${brand.name}`);
  const backgroundImage = logoFailed ? "none" : `url(${JSON.stringify(brand.logo)})`;

  return (
    <>
      <style href="clover-sign-in-button" precedence="components">
        {styles}
      </style>
      <button
        {...props}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        data-loading={loading || undefined}
        data-reduced-motion={reducedMotion || undefined}
        className={cn(buttonVariants({ size }), className)}
      >
        <span
          aria-hidden="true"
          className="clover-sign-in-surface pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
        >
          <span className="clover-sign-in-color" style={{ backgroundImage }} />
          <span className="clover-sign-in-color clover-sign-in-echo" style={{ backgroundImage }} />
          <span className="clover-sign-in-shade absolute inset-0" />
        </span>
        <span
          aria-hidden="true"
          className="clover-sign-in-edge pointer-events-none absolute inset-0 rounded-[inherit]"
        />
        <span
          aria-hidden="true"
          className="clover-sign-in-lens relative flex shrink-0 items-center justify-center text-sm font-semibold text-neutral-800"
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
              className="size-[var(--signin-mark)] object-contain"
            />
          )}
        </span>
        <span className="relative min-w-0 flex-1 truncate px-3 text-center leading-snug font-medium tracking-[-0.015em] whitespace-nowrap">
          {label}
        </span>
        <span aria-hidden="true" className="relative flex w-5 shrink-0 items-center justify-center">
          {loading ? (
            <span className="clover-sign-in-spinner size-3.5 rounded-full border-[1.5px] border-white/25 border-t-white" />
          ) : (
            <svg
              className="clover-sign-in-arrow"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14m-5-5 5 5-5 5" />
            </svg>
          )}
        </span>
      </button>
    </>
  );
}

export { SignInButton };
