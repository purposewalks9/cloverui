"use client";

import { AgentFaq } from "@/registry/clover-ui/agent-faq";
import { demoAsk, demoItems } from "./demo-data";

export function Demo() {
  return (
    <div className="w-full max-w-xl px-4">
      <AgentFaq defaultItems={demoItems} onAsk={demoAsk} />
    </div>
  );
}
