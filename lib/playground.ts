export type ControlDef =
  | { type: "text"; prop: string; label: string }
  | {
      type: "text-list";
      prop: string;
      label: string;
      items: { prop: string; label: string }[];
    }
  | {
      type: "color-list";
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

export class Expr {
  code: string;
  constructor(code: string) {
    this.code = code;
  }
}

export const expr = (code: string) => new Expr(code);

function attr(name: string, value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  if (value instanceof Expr) return `${name}={${value.code}}`;
  if (value === true) return name;
  if (typeof value === "string" && !value.includes('"') && !value.includes("\n")) {
    return `${name}="${value}"`;
  }
  return `${name}={${JSON.stringify(value)}}`;
}

export function jsx(name: string, props: Record<string, unknown>, children?: string) {
  const attrs = Object.entries(props)
    .map(([key, value]) => attr(key, value))
    .filter((a): a is string => a !== null);
  const inline = attrs.length ? ` ${attrs.join(" ")}` : "";
  const open =
    `<${name}${inline}`.length <= 72 ? `<${name}${inline}` : `<${name}\n  ${attrs.join("\n  ")}\n`;
  if (!children) return `${open}${open.endsWith("\n") ? "" : " "}/>`;
  const body = children
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
  return `${open}>\n${body}\n</${name}>`;
}
