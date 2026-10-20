"use client";

import {
  SignInButton,
  type SignInButtonIntent,
  type SignInButtonSize,
  type SignInProvider,
} from "@/registry/clover-ui/sign-in-button";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "provider",
    label: "Provider",
    options: [
      { label: "Google", value: "google" },
      { label: "Apple", value: "apple" },
      { label: "GitHub", value: "github" },
      { label: "Microsoft", value: "microsoft" },
      { label: "Discord", value: "discord" },
      { label: "X", value: "x" },
      { label: "Facebook", value: "facebook" },
      { label: "Spotify", value: "spotify" },
      { label: "Custom", value: "custom" },
    ],
  },
  {
    type: "select",
    prop: "intent",
    label: "Label",
    options: [
      { label: "Continue with", value: "continue" },
      { label: "Sign in with", value: "signin" },
      { label: "Sign up with", value: "signup" },
    ],
  },
  {
    type: "select",
    prop: "size",
    label: "Size",
    options: [
      { label: "Small", value: "sm" },
      { label: "Default", value: "default" },
      { label: "Large", value: "lg" },
    ],
  },
  { type: "text", prop: "brandName", label: "Custom name" },
  { type: "text", prop: "brandLogo", label: "Custom logo URL" },
  { type: "boolean", prop: "loading", label: "Loading" },
  { type: "boolean", prop: "disabled", label: "Disabled" },
];

const defaultProps = {
  provider: "google",
  intent: "continue",
  size: "default",
  brandName: "Clover",
  brandLogo: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#3aad65" d="M16 15C1-2-7 19 14 17 1 32 25 39 18 19 36 30 39 4 19 14 30-6 7-5 16 15Z"/><circle cx="16" cy="16" r="4" fill="#e5d36a"/></svg>')}`,
  loading: false,
  disabled: false,
};

export function SignInButtonPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <SignInButton
          provider={
            values.provider === "custom"
              ? {
                  name: (values.brandName as string) || "Your company",
                  logo: values.brandLogo as string,
                }
              : (values.provider as SignInProvider)
          }
          intent={values.intent as SignInButtonIntent}
          size={values.size as SignInButtonSize}
          loading={values.loading as boolean}
          disabled={values.disabled as boolean}
        />
      )}
    />
  );
}
