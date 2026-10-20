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
  { type: "boolean", prop: "loading", label: "Loading" },
  { type: "boolean", prop: "disabled", label: "Disabled" },
];

const defaultProps = {
  provider: "google",
  intent: "continue",
  size: "default",
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
          provider={values.provider as SignInProvider}
          intent={values.intent as SignInButtonIntent}
          size={values.size as SignInButtonSize}
          loading={values.loading as boolean}
          disabled={values.disabled as boolean}
        />
      )}
    />
  );
}
