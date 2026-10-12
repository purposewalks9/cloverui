"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { LiquidButton } from "@/registry/clover-ui/liquid-button";

export type CookieCategory = {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  defaultEnabled?: boolean;
};

export type CookiePreferences = Record<string, boolean>;
export type CookieConsentChoice = "all" | "necessary" | "custom";
export type CookieConsentRecord = {
  choice: CookieConsentChoice;
  preferences: CookiePreferences;
  date: string;
};

export const defaultCookieCategories: CookieCategory[] = [
  {
    id: "necessary",
    label: "Strictly necessary",
    description: "Keep the site secure and remember this choice. These can't be turned off.",
    required: true,
  },
  {
    id: "functional",
    label: "Functional",
    description: "Remember settings like language, theme and region.",
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Count visits and see which pages people use, so we can improve them.",
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Measure campaigns and show ads that match your interests.",
  },
];

export function getCookieConsent(storageKey = "cookie-consent"): CookieConsentRecord | null {
  try {
    const value = window.localStorage.getItem(storageKey);
    return value ? (JSON.parse(value) as CookieConsentRecord) : null;
  } catch {
    return null;
  }
}

const cookieConsentVariants = cva("z-50 w-full max-w-[400px]", {
  variants: {
    position: {
      inline: "relative",
      "bottom-left": "fixed bottom-4 left-4 w-[calc(100%-2rem)]",
      "bottom-right": "fixed right-4 bottom-4 w-[calc(100%-2rem)]",
      bottom: "fixed inset-x-0 bottom-4 mx-auto w-[calc(100%-2rem)]",
    },
  },
  defaultVariants: { position: "bottom-right" },
});

export type CookieConsentPosition = NonNullable<
  VariantProps<typeof cookieConsentVariants>["position"]
>;

export interface CookieConsentProps
  extends
    Omit<React.ComponentProps<"section">, "title" | "children">,
    VariantProps<typeof cookieConsentVariants> {
  title?: string;
  description?: React.ReactNode;
  policyHref?: string;
  policyLabel?: string;
  categories?: CookieCategory[];
  acceptLabel?: string;
  rejectLabel?: string;
  manageLabel?: string;
  saveLabel?: string;
  storageKey?: string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConsent?: (preferences: CookiePreferences, choice: CookieConsentChoice) => void;
  delay?: number;
}

function initialPreferences(categories: CookieCategory[]): CookiePreferences {
  return Object.fromEntries(
    categories.map((category) => [
      category.id,
      Boolean(category.required || category.defaultEnabled),
    ]),
  );
}

function ConsentSwitch({
  checked,
  disabled,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 outline-none",
        "focus-visible:ring-ring focus-visible:ring-offset-card focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        checked ? "bg-foreground" : "bg-input",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "bg-background size-5 rounded-full transition-[translate] duration-200 ease-out",
          checked ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}

const quietButton =
  "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3.5 text-sm font-medium whitespace-nowrap transition-[color,background-color,scale] duration-150 outline-none select-none active:scale-[0.96] focus-visible:ring-ring focus-visible:ring-offset-card focus-visible:ring-2 focus-visible:ring-offset-2";

function CookieConsent({
  title = "We use cookies",
  description = (
    <>
      We use cookies to <strong>keep the site working</strong>, remember your settings and
      understand how it&apos;s used. <strong>You choose</strong> which ones we can set.
    </>
  ),
  policyHref = "/cookies",
  policyLabel = "Cookie Policy",
  categories = defaultCookieCategories,
  acceptLabel = "Accept all",
  rejectLabel = "Reject all",
  manageLabel = "Manage",
  saveLabel = "Save choices",
  storageKey = "cookie-consent",
  open: openProp,
  onOpenChange,
  onConsent,
  delay = 0.4,
  position,
  className,
  ...props
}: CookieConsentProps) {
  const reduced = Boolean(useReducedMotion());
  const id = React.useId();
  const [stored, setStored] = React.useState<boolean | null>(null);
  const [managing, setManaging] = React.useState(false);
  const [preferences, setPreferences] = React.useState(() => initialPreferences(categories));
  const open = openProp ?? stored === false;

  React.useEffect(() => {
    const record = storageKey ? getCookieConsent(storageKey) : null;
    if (record) setPreferences((previous) => ({ ...previous, ...record.preferences }));
    setStored(record !== null);
  }, [storageKey]);

  React.useEffect(() => {
    if (!open) setManaging(false);
  }, [open]);

  const finish = (choice: CookieConsentChoice, next: CookiePreferences) => {
    setPreferences(next);
    if (storageKey) {
      try {
        const record: CookieConsentRecord = {
          choice,
          preferences: next,
          date: new Date().toISOString(),
        };
        window.localStorage.setItem(storageKey, JSON.stringify(record));
      } catch {}
    }
    setStored(true);
    onConsent?.(next, choice);
    onOpenChange?.(false);
  };

  const acceptAll = () =>
    finish("all", Object.fromEntries(categories.map((category) => [category.id, true])));
  const rejectAll = () =>
    finish(
      "necessary",
      Object.fromEntries(categories.map((category) => [category.id, Boolean(category.required)])),
    );
  const save = () => finish("custom", preferences);

  const hidden = reduced ? { opacity: 0 } : { opacity: 0, y: 32, filter: "blur(6px)" };
  const shown = reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" };

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          key="cookie-consent"
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-description`}
          initial={hidden}
          animate={shown}
          exit={{ ...hidden, transition: { duration: 0.2, ease: "easeIn" } }}
          transition={
            reduced
              ? { duration: 0.2, delay }
              : { type: "spring", stiffness: 260, damping: 26, mass: 0.9, delay }
          }
          className={cn(
            cookieConsentVariants({ position }),
            "bg-card text-muted-foreground border-border rounded-2xl border p-4",
            className,
          )}
          {...(props as React.ComponentProps<typeof motion.section>)}
        >
          <h2
            id={`${id}-title`}
            className="inline-block bg-linear-to-b from-zinc-900 to-zinc-600 bg-clip-text text-[17px] leading-tight font-semibold tracking-tight text-transparent dark:from-zinc-100 dark:to-zinc-400"
          >
            {title}
          </h2>
          <p
            id={`${id}-description`}
            className="[&_a]:text-foreground [&_a]:decoration-muted-foreground/40 [&_a:hover]:decoration-foreground [&_strong]:text-foreground mt-1.5 text-sm leading-relaxed text-pretty [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors [&_strong]:font-medium"
          >
            {description}
            {policyHref && (
              <>
                {" "}
                Read our <a href={policyHref}>{policyLabel}</a>.
              </>
            )}
          </p>

          <div className="mt-3">
            <button
              type="button"
              aria-expanded={managing}
              aria-controls={`${id}-preferences`}
              onClick={() => setManaging((value) => !value)}
              className={cn(
                quietButton,
                "text-muted-foreground hover:text-foreground -ml-2 h-8 px-2",
              )}
            >
              {manageLabel}
              <ChevronDown
                aria-hidden
                strokeWidth={2}
                className={cn("size-4 transition-transform duration-300", managing && "rotate-180")}
              />
            </button>
          </div>

          <AnimatePresence initial={false}>
            {managing && (
              <motion.div
                key="preferences"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={
                  reduced ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
                }
                className="overflow-hidden"
              >
                <ul
                  id={`${id}-preferences`}
                  className="divide-border border-border bg-muted/40 mt-2 divide-y rounded-xl border"
                >
                  {categories.map((category) => (
                    <li key={category.id} className="flex items-center gap-4 px-3.5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground flex items-center gap-2 text-sm font-medium">
                          {category.label}
                          {category.required && (
                            <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-px text-[11px] font-medium whitespace-nowrap">
                              Always on
                            </span>
                          )}
                        </p>
                        {category.description && (
                          <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <ConsentSwitch
                        label={category.label}
                        checked={category.required ? true : Boolean(preferences[category.id])}
                        disabled={category.required}
                        onCheckedChange={(checked) =>
                          setPreferences((previous) => ({ ...previous, [category.id]: checked }))
                        }
                      />
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={managing ? save : rejectAll}
              className={cn(quietButton, "bg-muted text-foreground hover:bg-muted/70 w-full")}
            >
              {managing ? saveLabel : rejectLabel}
            </button>
            <LiquidButton
              element="obsidian"
              onClick={acceptAll}
              className="focus-visible:ring-offset-card w-full"
            >
              {acceptLabel}
            </LiquidButton>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

export { CookieConsent, cookieConsentVariants };
