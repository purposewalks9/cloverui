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
      { label: "Apple", value: "apple" },
      { label: "Microsoft", value: "microsoft" },
      { label: "Discord", value: "discord" },
      { label: "ChatGPT", value: "chatgpt" },
      { label: "Spotify", value: "spotify" },
      { label: "GitLab", value: "gitlab" },
      { label: "Bitbucket", value: "bitbucket" },
      { label: "LinkedIn", value: "linkedin" },
      { label: "Slack", value: "slack" },
      { label: "Twitch", value: "twitch" },
      { label: "Notion", value: "notion" },
      { label: "Vercel", value: "vercel" },
      { label: "Reddit", value: "reddit" },
      { label: "Dropbox", value: "dropbox" },
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
  size: "lg",
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
