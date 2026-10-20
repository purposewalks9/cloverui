"use client";

import * as React from "react";
import {
  SignInButton,
  type SignInBrand,
  type SignInProvider,
} from "@/registry/clover-ui/sign-in-button";

export function Demo() {
  return <SignInButton provider="google" />;
}

const providers: SignInProvider[] = [
  "google",
  "apple",
  "github",
  "microsoft",
  "discord",
  "x",
  "facebook",
  "spotify",
];

export function SignInProviderGallery() {
  const [loading, setLoading] = React.useState<SignInProvider | null>(null);
  const [status, setStatus] = React.useState("");
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function preview(provider: SignInProvider) {
    if (timer.current) clearTimeout(timer.current);
    setLoading(provider);
    setStatus("");
    timer.current = setTimeout(() => {
      setLoading(null);
      setStatus("Preview complete. Try another provider.");
    }, 1200);
  }

  return (
    <div className="not-prose border-border my-6 border px-4 pt-10 pb-5 sm:px-8">
      <div className="mx-auto grid max-w-[600px] grid-cols-1 justify-items-center gap-x-8 gap-y-5 sm:grid-cols-2">
        {providers.map((provider) => (
          <SignInButton
            key={provider}
            provider={provider}
            className="w-full max-w-[280px]"
            loading={loading === provider}
            onClick={() => preview(provider)}
          />
        ))}
      </div>
      <p aria-live="polite" className="text-muted-foreground mt-6 min-h-5 text-center text-xs">
        {status}
      </p>
    </div>
  );
}

const clover: SignInBrand = {
  name: "Clover",
  logo: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#3aad65" d="M16 15C1-2-7 19 14 17 1 32 25 39 18 19 36 30 39 4 19 14 30-6 7-5 16 15Z"/><circle cx="16" cy="16" r="4" fill="#e5d36a"/></svg>')}`,
};

export function SignInCustomDemo() {
  return (
    <div className="not-prose border-border my-6 flex min-h-44 items-center justify-center border p-6">
      <SignInButton provider={clover}>Continue with Clover</SignInButton>
    </div>
  );
}
