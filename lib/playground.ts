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
