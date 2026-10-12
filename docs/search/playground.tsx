"use client";

import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";
import { SearchDemo } from "./demo";

const controls: ControlDef[] = [
  { type: "text", prop: "placeholder", label: "Placeholder" },
  { type: "boolean", prop: "showCategories", label: "Category filters" },
  { type: "boolean", prop: "compact", label: "Compact trigger" },
  { type: "boolean", prop: "disabled", label: "Disabled" },
];

export function SearchPlayground() {
  return (
    <PlaygroundShell
      componentName="Search"
      controls={controls}
      defaultProps={{
        placeholder: "Search anything...",
        showCategories: true,
        compact: false,
        disabled: false,
      }}
      fixedProps={{
        groups: [
          {
            id: "pages",
            label: "Pages",
            items: [
              { id: "home", label: "Home", category: "Pages" },
              { id: "settings", label: "Settings", category: "Actions" },
            ],
          },
        ],
      }}
      codeNote="Import Search from @/components/search. Add onSelect to handle your navigation or actions."
      render={(values) => (
        <SearchDemo
          placeholder={values.placeholder as string}
          showCategories={values.showCategories as boolean}
          compact={values.compact as boolean}
          disabled={values.disabled as boolean}
        />
      )}
    />
  );
}
