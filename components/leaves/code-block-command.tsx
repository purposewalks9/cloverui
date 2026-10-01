"use client";

import * as React from "react";
import { Copy, ThumbsUp } from "lucide-react";
import { SiBun, SiNpm, SiPnpm, SiYarn } from "@icons-pack/react-simple-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useConfig } from "@/hooks/use-config";
import { trackEvent } from "@/lib/events";
import { cn } from "@/lib/utils";

const PACKAGE_MANAGERS = [
  { value: "pnpm", Icon: SiPnpm, className: "text-[#F69220]" },
  { value: "npm", Icon: SiNpm, className: "text-[#CB3837]" },
  { value: "yarn", Icon: SiYarn, className: "text-[#2C8EBB]" },
  { value: "bun", Icon: SiBun, className: "text-[#14151A] dark:text-[#FBF0DF]" },
] as const;

interface CodeBlockCommandProps {
  item: string;
  className?: string;
  mcp?: boolean;
}

export function CodeBlockCommand({ item, className, mcp = false }: CodeBlockCommandProps) {
  const [config, setConfig] = useConfig();
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const commands = React.useMemo(() => {
    if (mcp) {
      return {
        pnpm: `pnpm dlx shadcn@latest mcp init`,
        npm: `npx shadcn@latest mcp init`,
        yarn: `yarn dlx shadcn@latest mcp init`,
        bun: `bunx --bun shadcn@latest mcp init`,
      };
    }
    return {
      pnpm: `pnpm dlx shadcn@latest add @clover-ui/${item}`,
      npm: `npx shadcn@latest add @clover-ui/${item}`,
      yarn: `yarn dlx shadcn@latest add @clover-ui/${item}`,
      bun: `bunx --bun shadcn@latest add @clover-ui/${item}`,
    };
  }, [item, mcp]);

  const copyCommand = React.useCallback(() => {
    const command = commands[config.packageManager];
    if (command) {
      copyToClipboard(command);
      trackEvent("copy_install_command", { command, pm: config.packageManager });
    }
  }, [config.packageManager, commands, copyToClipboard]);

  return (
    <div className={cn("relative overflow-hidden rounded-md border", className)}>
      <Tabs
        value={config.packageManager}
        onValueChange={(value) => {
          setConfig({
            ...config,
            packageManager: value as "pnpm" | "npm" | "yarn" | "bun",
          });
          trackEvent("select_package_manager", { pm: value });
        }}
        className="gap-0"
      >
        <div className="relative flex items-center gap-2 px-4 py-2.5">
          <TabsList className="h-auto gap-1 p-0" translate="no">
            {PACKAGE_MANAGERS.map(({ value, Icon, className }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="data-[state=active]:bg-background data-[state=active]:border-border h-auto gap-1.5 rounded-sm px-2 py-1 font-mono text-xs data-[state=active]:border"
              >
                <Icon size={13} className={className} aria-hidden="true" />
                {value}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            size="icon"
            variant="ghost"
            className="hover:bg-accent absolute right-2 size-7 cursor-pointer"
            onClick={copyCommand}
          >
            <span className="sr-only">Copy</span>
            {isCopied ? (
              <ThumbsUp className="size-3.5" strokeWidth={2} />
            ) : (
              <Copy className="size-3.5" strokeWidth={2} />
            )}
          </Button>
        </div>
        <div className="">
          {Object.entries(commands).map(([key, command]) => (
            <TabsContent key={key} value={key} className="m-0">
              <pre className="bg-card not-prose overflow-x-auto px-4 py-3">
                <code className="font-mono text-sm text-[#032F62] dark:text-[#9ECBFF]">
                  {command}
                </code>
              </pre>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
