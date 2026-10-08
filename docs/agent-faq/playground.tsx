"use client";

import { AgentFaq } from "@/registry/clover-ui/agent-faq";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";
import { demoAsk, demoItems } from "./demo-data";

const controls: ControlDef[] = [{ type: "boolean", prop: "editable", label: "Editable" }];

const defaultProps = {
  editable: true,
};

export function AgentFaqPlayground() {
  return (
    <PlaygroundShell
      componentName="AgentFaq"
      controls={controls}
      defaultProps={defaultProps}
      codeNote="pass defaultItems and your own onAsk, see Usage below"
      render={(values) => (
        <div className="flex min-h-[360px] w-full items-center justify-center px-4">
          <AgentFaq
            defaultItems={demoItems}
            onAsk={demoAsk}
            editable={values.editable as boolean}
            className="max-w-xl"
          />
        </div>
      )}
    />
  );
}
