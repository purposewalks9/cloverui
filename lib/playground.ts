export type ControlDef =
  | { type: "text"; prop: string; label: string }
  | {
      type: "text-list";
      prop: string;
      label: string;
      items: { prop: string; label: string }[];
    }
  | { type: "boolean"; prop: string; label: string }
  | {
      type: "select";
      prop: string;
      label: string;
      options: { label: string; value: string; swatch?: string }[];
    }
  | { type: "color"; prop: string; label: string }
  | {
      type: "number";
      prop: string;
      label: string;
      min?: number;
      max?: number;
      step?: number;
    };

function serializeAttr(prop: string, value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "boolean") return value ? prop : `${prop}={false}`;
  if (typeof value === "number") return `${prop}={${value}}`;
  if (typeof value === "string") return `${prop}="${value}"`;
  return null;
}

export function generateCode(
  componentName: string,
  controls: ControlDef[],
  values: Record<string, unknown>,
) {
  const childrenControl = controls.find((c) => c.prop === "children");

  const attrs = controls
    .filter((c) => c.prop !== "children")
    .map((c) => {
      if (c.type === "text-list") {
        const items = c.items
          .map((item) => values[item.prop])
          .filter((value): value is string => typeof value === "string" && value.trim().length > 0);
        return items.length
          ? `${c.prop}={[${items.map((item) => JSON.stringify(item)).join(", ")}]}`
          : null;
      }

      return serializeAttr(c.prop, values[c.prop]);
    })
    .filter((v): v is string => Boolean(v));

  const children = childrenControl ? values[childrenControl.prop] : undefined;
  const attrBlock = attrs.length ? `\n  ${attrs.join("\n  ")}\n` : "";

  if (children === undefined || children === "") {
    return attrs.length ? `<${componentName}${attrBlock}/>` : `<${componentName} />`;
  }

  return `<${componentName}${attrBlock}>\n  ${children}\n</${componentName}>`;
}
