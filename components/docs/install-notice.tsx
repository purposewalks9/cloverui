import * as React from "react";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

function InstallNotice({ className, ...props }: React.ComponentProps<"p">) {
  if (siteConfig.installs) return null;

  return (
    <p
      className={cn(
        "not-prose border-border text-muted-foreground border p-4 text-sm leading-relaxed",
        className,
      )}
      {...props}
    >
      Installs are paused for now. You can still preview and customize every component on its page.
    </p>
  );
}

export { InstallNotice };
