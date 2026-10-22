import { cn } from "@/lib/utils";

type Logo = (props: { className?: string }) => React.ReactNode;

const SpellLogo: Logo = ({ className }) => (
  <svg viewBox="0 0 512 512" fill="currentColor" className={className} aria-hidden>
    <g transform="translate(99, 89) scale(1.2)">
      <path d="M57.6541 65.6418C58.8281 64.8226 60.4465 65.2097 61.2647 66.3823C64.3285 70.7734 68.3982 73.8437 73.2472 75.6378L73.3016 75.6581L92.6744 82.6771C95.575 83.7281 97.8595 86.0054 98.9135 88.896L105.957 108.209L105.978 108.263C107.777 113.094 111.016 117.262 115.261 120.205C119.507 123.148 124.556 124.727 129.729 124.727C134.902 124.727 139.951 123.148 144.197 120.205C148.443 117.262 151.681 113.094 153.48 108.263L153.521 108.155L160.545 88.8977C161.599 86.0081 163.882 83.7316 166.782 82.6805C176.525 79.148 187.434 82.5762 193.381 91.039L223.505 133.91C223.516 133.925 223.524 133.942 223.534 133.957C228.045 140.476 226.441 149.411 219.921 153.96L117.032 225.751C111.613 229.533 110.798 237.692 115.213 243.976C119.63 250.261 127.604 252.292 133.024 248.51L239.241 174.706C245.791 170.156 254.802 171.748 259.381 178.266C263.973 184.801 262.368 193.81 255.801 198.374L149.632 272.144C132.954 283.78 108.421 277.536 94.8322 258.199C93.5324 256.349 92.381 254.445 91.3741 252.506C91.3172 252.396 91.1589 252.398 91.1049 252.509C91.055 252.612 90.9129 252.623 90.8473 252.53L3.77438 128.615C-2.83414 119.21 -0.539816 106.247 8.89813 99.6622L21.4057 90.9343C21.4336 90.9148 21.472 90.9217 21.4914 90.9496C21.513 90.9807 21.5574 90.985 21.5848 90.9588C21.9663 90.5947 22.3802 90.2545 22.8263 89.9432L57.6541 65.6418Z" />
      <path d="M184.781 55.435C184.793 57.0601 184.298 58.6488 183.363 59.9801C182.428 61.3115 181.1 62.3194 179.564 62.8638L160.243 69.8673C152.51 72.6702 146.42 78.741 143.609 86.4472L136.586 105.703C136.021 107.22 135.004 108.528 133.672 109.451C132.34 110.375 130.756 110.87 129.133 110.87C127.51 110.87 125.926 110.375 124.594 109.451C123.262 108.528 122.245 107.22 121.68 105.703L114.657 86.4455C111.846 78.7374 105.754 72.6654 98.0192 69.8629L78.7019 62.8638C77.1805 62.3009 75.8684 61.2874 74.9418 59.9594C74.0152 58.6314 73.5186 57.0526 73.5186 55.435C73.5186 53.8174 74.0152 52.2386 74.9418 50.9106C75.8684 49.5826 77.1805 48.5691 78.7019 48.0062L98.0192 41.0071C105.754 38.2046 111.846 32.1326 114.657 24.4245L121.68 5.16662C122.245 3.65013 123.262 2.34224 124.594 1.41864C125.926 0.49505 127.51 0 129.133 0C130.756 0 132.34 0.49505 133.672 1.41864C135.004 2.34224 136.021 3.65013 136.586 5.16662L143.613 24.4281C146.424 32.1342 152.515 38.2044 160.248 41.0066L179.564 48.0062C181.1 48.5506 182.428 49.5585 183.363 50.8899C184.298 52.2213 184.793 53.8099 184.781 55.435Z" />
    </g>
  </svg>
);

const ShadcnLogo: Logo = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M22.219 11.784 11.784 22.219c-.407.407-.407 1.068 0 1.476.407.407 1.068.407 1.476 0L23.695 13.26c.407-.408.407-1.069 0-1.476-.408-.407-1.069-.407-1.476 0ZM20.132.305.305 20.132c-.407.407-.407 1.068 0 1.476.408.407 1.069.407 1.476 0L21.608 1.781c.407-.407.407-1.068 0-1.476-.408-.407-1.069-.407-1.476 0Z" />
  </svg>
);

const VercelLogo: Logo = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="m12 1.608 12 20.784H0Z" />
  </svg>
);

const MotionLogo: Logo = ({ className }) => (
  <svg viewBox="0 0 25.364 9" fill="currentColor" className={className} aria-hidden>
    <path d="M 9.587 0 L 4.57 9 L 0 9 L 3.917 1.972 C 4.524 0.883 6.039 0 7.301 0 Z M 20.794 2.25 C 20.794 1.007 21.817 0 23.079 0 C 24.341 0 25.364 1.007 25.364 2.25 C 25.364 3.493 24.341 4.5 23.079 4.5 C 21.817 4.5 20.794 3.493 20.794 2.25 Z M 10.443 0 L 15.013 0 L 9.997 9 L 5.427 9 Z M 15.841 0 L 20.411 0 L 16.494 7.028 C 15.887 8.117 14.372 9 13.11 9 L 10.825 9 Z" />
  </svg>
);

const TailwindLogo: Logo = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z" />
  </svg>
);

const BaseUiLogo: Logo = ({ className }) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden>
    <path d="M18.6251 7.00119C18.2806 6.97886 18 7.27506 18 7.63782V28C23.5228 28 28 23.2948 28 17.4905C28 11.9069 23.8568 7.3403 18.6251 7.00119Z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16 11.2V14V28C10.4771 28 6 22.9856 6 16.8V14V0C11.5228 0 16 5.0144 16 11.2Z"
    />
  </svg>
);

const CossLogo: Logo = ({ className }) => (
  <span
    className={cn("block bg-current", className)}
    style={{
      maskImage: "url(/credits/coss.png)",
      WebkitMaskImage: "url(/credits/coss.png)",
      maskSize: "contain",
      WebkitMaskSize: "contain",
      maskRepeat: "no-repeat",
      WebkitMaskRepeat: "no-repeat",
      maskPosition: "center",
      WebkitMaskPosition: "center",
    }}
    aria-hidden
  />
);

const LOGOS = {
  spell: { Logo: SpellLogo, className: "size-[1.35em] -mx-[0.15em]" },
  shadcn: { Logo: ShadcnLogo, className: "size-[0.95em]" },
  vercel: { Logo: VercelLogo, className: "size-[0.9em]" },
  motion: { Logo: MotionLogo, className: "h-[0.5em] w-[1.4em]" },
  tailwind: { Logo: TailwindLogo, className: "size-[1.05em]" },
  baseui: { Logo: BaseUiLogo, className: "size-[1em]" },
  coss: { Logo: CossLogo, className: "h-[0.6em] w-[4.3em]" },
} as const;

export function CreditLink({
  logo,
  href,
  children,
}: {
  logo: keyof typeof LOGOS;
  href: string;
  children: React.ReactNode;
}) {
  const { Logo, className } = LOGOS[logo];

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-foreground inline-flex items-baseline gap-[0.35em] font-semibold whitespace-nowrap underline-offset-4 hover:underline"
    >
      <Logo className={cn("shrink-0 self-center", className)} />
      {children}
    </a>
  );
}

export function CreditList({ children }: { children: React.ReactNode }) {
  return <div className="[&_li]:my-2.5 [&_li]:ps-0 [&_ul]:list-none [&_ul]:ps-0">{children}</div>;
}
