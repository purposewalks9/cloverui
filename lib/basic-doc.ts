import { DocSchema } from "@/lib/types";

export const guides = [
  {
    id: "introduction",
    title: "Introduction",
    description: "What Clover UI is, and the work it builds on.",
  },
  {
    id: "installation",
    title: "Installation",
    description: "Add the Clover UI registry and install one component or all of them.",
  },
  {
    id: "mcp",
    title: "MCP",
    description: "Let your AI editor browse and install Clover UI components for you.",
  },
];

export const guideIds = guides.map((guide) => guide.id);

export const basicDoc: DocSchema = [
  {
    title: "Getting Started",
    items: guides.map((guide) => ({ ...guide, href: `/docs/${guide.id}` })),
  },
];
