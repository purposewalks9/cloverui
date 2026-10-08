import type { AgentFaqAsk, AgentFaqItem } from "@/registry/clover-ui/agent-faq";

export const demoItems: AgentFaqItem[] = [
  {
    id: "what",
    question: "What is Clover UI?",
    answer:
      "A free collection of animated React components. Copy them into your project with the shadcn CLI and change anything you like.",
  },
  {
    id: "free",
    question: "Is it free to use?",
    answer: "Yes. Every component is open source and free for personal and commercial projects.",
  },
  {
    id: "install",
    question: "How do I install a component?",
    answer:
      "Run the shadcn add command shown on each component page. The file lands in your components folder, ready to edit.",
  },
  {
    id: "dark",
    question: "Does it work in dark mode?",
    answer:
      "Yes. Components use your theme colors, so they follow light and dark mode on their own.",
  },
];

export const demoAsk: AgentFaqAsk = async (question, { signal }) => {
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 1400);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
  return `This is a demo answer for "${question}". Connect your own AI in onAsk and the real answer will be written here, word by word, as soon as it comes back.`;
};
