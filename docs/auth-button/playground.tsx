"use client";

import {
  AuthButton,
  type AuthButtonIntent,
  type AuthButtonSize,
  type AuthProvider,
} from "@/registry/clover-ui/auth-button";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "provider",
    label: "Provider",
    options: [
      { label: "Google", value: "google" },
      { label: "GitHub", value: "github" },
      { label: "Microsoft", value: "microsoft" },
      { label: "Discord", value: "discord" },
    ],
  },
  {
    type: "select",
    prop: "intent",
    label: "Label",
    options: [
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
  { type: "boolean", prop: "disabled", label: "Disabled" },
];

const defaultProps = {
  provider: "google",
  intent: "signin",
  size: "default",
  disabled: false,
};

export function AuthButtonPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <AuthButton
          provider={values.provider as AuthProvider}
          intent={values.intent as AuthButtonIntent}
          size={values.size as AuthButtonSize}
          disabled={values.disabled as boolean}
        />
      )}
    />
  );
}
