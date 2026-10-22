"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  BrainKnob,
  EffortSlider,
  effortTone,
  type EffortSliderTheme,
} from "@/registry/clover-ui/effort-slider";

export type ModelSwitcherOption = {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
};

export type ModelSwitcherSide = "top" | "bottom";

type Section = "model" | "effort";

type Place = "right" | "left" | "inset";

export interface ModelSwitcherProps extends Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange"
> {
  models?: ModelSwitcherOption[];
  model?: string;
  defaultModel?: string;
  onModelChange?: (model: string, option: ModelSwitcherOption) => void;
  effort?: number;
  defaultEffort?: number;
  onEffortChange?: (effort: number, level: string) => void;
  effortLevels?: string[];
  effortTheme?: EffortSliderTheme;
  side?: ModelSwitcherSide;
  disabled?: boolean;
}

const LOGOS = {
  openai: [
    "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z",
  ],
  claude: [
    "m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z",
  ],
  grok: [
    "M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815",
  ],
  kimi: [
    "M21.846 0a1.923 1.923 0 110 3.846H20.15a.226.226 0 01-.227-.226V1.923C19.923.861 20.784 0 21.846 0z",
    "M11.065 11.199l7.257-7.2c.137-.136.06-.41-.116-.41H14.3a.164.164 0 00-.117.051l-7.82 7.756c-.122.12-.302.013-.302-.179V3.82c0-.127-.083-.23-.185-.23H3.186c-.103 0-.186.103-.186.23V19.77c0 .128.083.23.186.23h2.69c.103 0 .186-.102.186-.23v-3.25c0-.069.025-.135.069-.178l2.424-2.406a.158.158 0 01.205-.023l6.484 4.772a7.677 7.677 0 003.453 1.283c.108.012.2-.095.2-.23v-3.06c0-.117-.07-.212-.164-.227a5.028 5.028 0 01-2.027-.807l-5.613-4.064c-.117-.078-.132-.279-.028-.381z",
  ],
  deepseek: [
    "M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z",
  ],
} satisfies Record<string, string[]>;

export type ModelLogoName = keyof typeof LOGOS;

function ModelLogo({
  name,
  className,
  ...props
}: React.ComponentProps<"svg"> & { name: ModelLogoName }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="currentColor"
      fillRule="evenodd"
      className={cn("size-4 shrink-0", className)}
      {...props}
    >
      {LOGOS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export const defaultModels: ModelSwitcherOption[] = [
  { value: "gpt-6", label: "GPT-6", description: "OpenAI", icon: <ModelLogo name="openai" /> },
  {
    value: "claude-opus-5.5",
    label: "Claude Opus 5.5",
    description: "Anthropic",
    icon: <ModelLogo name="claude" />,
  },
  { value: "grok-4.7", label: "Grok 4.7", description: "xAI", icon: <ModelLogo name="grok" /> },
  {
    value: "deepseek-v4.1",
    label: "DeepSeek V4.1",
    description: "DeepSeek",
    icon: <ModelLogo name="deepseek" />,
  },
  {
    value: "kimi-k3",
    label: "Kimi K3",
    description: "Moonshot AI",
    icon: <ModelLogo name="kimi" />,
  },
];

const SECTIONS: Section[] = ["model", "effort"];
const TITLES: Record<Section, string> = { model: "Model", effort: "Effort" };
const PANEL_WIDTH = 232;

const surface = cn(
  "border border-transparent [background:linear-gradient(var(--switcher-fill),var(--switcher-fill))_padding-box,linear-gradient(180deg,var(--switcher-edge-top),var(--switcher-edge-mid)_50%,var(--switcher-edge-bottom))_border-box]",
  "[--switcher-edge-top:color-mix(in_oklab,var(--foreground)_22%,transparent)] [--switcher-edge-mid:color-mix(in_oklab,var(--foreground)_8%,transparent)] [--switcher-edge-bottom:color-mix(in_oklab,var(--foreground)_14%,transparent)]",
  "dark:[--switcher-edge-top:color-mix(in_oklab,var(--foreground)_34%,transparent)] dark:[--switcher-edge-mid:color-mix(in_oklab,var(--foreground)_9%,transparent)] dark:[--switcher-edge-bottom:color-mix(in_oklab,var(--foreground)_16%,transparent)]",
);

const panel = cn(
  surface,
  "text-popover-foreground rounded-2xl p-1 [--switcher-fill:var(--popover)]",
  "origin-top transition-[opacity,scale] duration-150 ease-out starting:scale-[0.97] starting:opacity-0 motion-reduce:transition-none",
);

const row =
  "relative flex h-8 w-full cursor-pointer items-center gap-2 rounded-xl px-2 text-left text-sm whitespace-nowrap outline-none transition-colors duration-150";

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value ?? inner;
  const set = (next: T) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  return [current, set] as const;
}

function roomAround(element: HTMLElement) {
  let left = 0;
  let right = window.innerWidth;
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (/(hidden|auto|scroll|clip)/.test(getComputedStyle(node).overflowX)) {
      const box = node.getBoundingClientRect();
      left = Math.max(left, box.left);
      right = Math.min(right, box.right);
    }
  }
  return { left, right };
}

function ModelSwitcher({
  models = defaultModels,
  model,
  defaultModel,
  onModelChange,
  effort,
  defaultEffort = 1,
  onEffortChange,
  effortLevels = ["Low", "Medium", "High", "Max"],
  effortTheme = "aurora",
  side = "bottom",
  disabled = false,
  className,
  ...props
}: ModelSwitcherProps) {
  const [modelValue, setModel] = useControllable(
    model,
    defaultModel ?? models[0]?.value ?? "",
    (next) => {
      const option = models.find((item) => item.value === next);
      if (option) onModelChange?.(next, option);
    },
  );
  const levelCount = Math.max(1, effortLevels.length);
  const [rawEffort, setEffort] = useControllable(effort, defaultEffort, (next) =>
    onEffortChange?.(next, effortLevels[next] ?? ""),
  );
  const effortIndex = Math.min(Math.max(0, Math.round(rawEffort)), levelCount - 1);

  const [open, setOpen] = React.useState(false);
  const [section, setSectionState] = React.useState<Section | null>(null);
  const [draftEffort, setDraftEffort] = React.useState<number | null>(null);
  const [hover, setHover] = React.useState(-1);
  const [subHover, setSubHover] = React.useState(-1);
  const [place, setPlace] = React.useState<Place>("right");
  const hoverOpens = React.useRef(true);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const modelRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const effortRef = React.useRef<HTMLDivElement>(null);
  const menuId = React.useId();

  const currentModel = models.find((item) => item.value === modelValue) ?? models[0];
  const activeModel = Math.max(
    0,
    models.findIndex((item) => item.value === currentModel?.value),
  );
  const level = effortLevels[effortIndex] ?? "";
  const tone = effortTone(effortIndex, levelCount, effortTheme);
  const toneStyle = {
    "--effort-brain": tone.brain,
    "--effort-line": tone.line,
  } as React.CSSProperties;

  const commitEffort = () => {
    if (draftEffort !== null && draftEffort !== effortIndex) setEffort(draftEffort);
    setDraftEffort(null);
  };

  const setSection = (next: Section | null) => {
    if (section === "effort" && next !== "effort") commitEffort();
    setSectionState(next);
  };

  const close = (refocus: boolean) => {
    setOpen(false);
    setSection(null);
    setHover(-1);
    setSubHover(-1);
    hoverOpens.current = true;
    if (refocus) triggerRef.current?.focus();
  };

  const closeRef = React.useRef(close);
  React.useEffect(() => {
    closeRef.current = close;
  });

  React.useEffect(() => {
    if (!open) return;
    const away = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) closeRef.current(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  React.useLayoutEffect(() => {
    if (!section || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const room = roomAround(menuRef.current);
    const needed = PANEL_WIDTH + 6;
    if (rect.right + needed <= room.right) setPlace("right");
    else if (rect.left - needed >= room.left) setPlace("left");
    else {
      setPlace("inset");
      hoverOpens.current = false;
    }
  }, [section]);

  const [seenSection, setSeenSection] = React.useState(section);
  if (seenSection !== section) {
    setSeenSection(section);
    if (section === "model") setSubHover(activeModel);
  }

  React.useEffect(() => {
    if (section === "model") {
      modelRefs.current[activeModel]?.focus();
    } else if (section === "effort") {
      effortRef.current?.querySelector<HTMLElement>('[role="slider"]')?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const openMenu = () => {
    setOpen(true);
    setHover(0);
    requestAnimationFrame(() => itemRefs.current[0]?.focus());
  };

  const enter = (index: number) => {
    setHover(index);
    setSection(SECTIONS[index] ?? null);
  };

  const back = () => {
    const index = section ? SECTIONS.indexOf(section) : 0;
    setSection(null);
    setSubHover(-1);
    itemRefs.current[index]?.focus();
  };

  const onMenuKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (section) back();
      else close(true);
      return;
    }
    if (event.key === "Tab") {
      close(false);
      return;
    }
    if (section) return;
    const index = itemRefs.current.findIndex((el) => el === document.activeElement);
    const last = SECTIONS.length - 1;
    const next = {
      ArrowDown: index >= last ? 0 : index + 1,
      ArrowUp: index <= 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next !== undefined) {
      event.preventDefault();
      setHover(next);
      itemRefs.current[next]?.focus();
    } else if ((event.key === "ArrowRight" || event.key === "Enter") && index >= 0) {
      event.preventDefault();
      enter(index);
    }
  };

  const onModelKeyDown = (event: React.KeyboardEvent) => {
    const index = modelRefs.current.findIndex((el) => el === document.activeElement);
    const last = models.length - 1;
    const next = {
      ArrowDown: index >= last ? 0 : index + 1,
      ArrowUp: index <= 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next !== undefined) {
      event.preventDefault();
      event.stopPropagation();
      setSubHover(next);
      modelRefs.current[next]?.focus();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      event.stopPropagation();
      back();
    }
  };

  return (
    <div
      ref={rootRef}
      data-slot="model-switcher"
      className={cn("relative inline-flex", className)}
      {...props}
    >
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Model: ${currentModel?.label ?? ""}, effort: ${level}`}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
            event.preventDefault();
            openMenu();
          }
        }}
        className={cn(
          surface,
          "text-card-foreground focus-visible:ring-ring inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full pr-2 pl-3 text-sm whitespace-nowrap outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
          "transition-[scale] duration-150 [--switcher-fill:var(--card)] hover:[--switcher-fill:var(--muted)] active:scale-[0.97]",
          open && "[--switcher-fill:var(--muted)]",
        )}
        style={toneStyle}
      >
        <span className="font-medium">{currentModel?.label}</span>
        <span className="size-4 shrink-0">
          <BrainKnob />
        </span>
        <span className="text-muted-foreground">{level}</span>
        <ChevronDown aria-hidden className="text-muted-foreground size-4 shrink-0" />
      </button>

      {open && (
        <div
          ref={menuRef}
          onKeyDown={onMenuKeyDown}
          className={cn(
            "absolute inset-x-0 z-30",
            side === "bottom" ? "top-[calc(100%+0.375rem)]" : "bottom-[calc(100%+0.375rem)]",
          )}
        >
          <div
            id={menuId}
            role="menu"
            aria-label="Model settings"
            onPointerLeave={() => !section && setHover(-1)}
            className={cn(panel, place === "inset" && section && "invisible")}
          >
            {SECTIONS.map((item, index) => {
              const active = section === item;
              return (
                <button
                  key={item}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  type="button"
                  role="menuitem"
                  aria-haspopup="menu"
                  aria-expanded={active}
                  tabIndex={-1}
                  onPointerEnter={() => (hoverOpens.current ? enter(index) : setHover(index))}
                  onFocus={() => setHover(index)}
                  onClick={() => enter(index)}
                  className={cn(row, (hover === index || active) && "bg-muted")}
                >
                  {item === "model" ? (
                    <span className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4">
                      {currentModel?.icon}
                    </span>
                  ) : (
                    <span className="size-4 shrink-0" style={toneStyle}>
                      <BrainKnob />
                    </span>
                  )}
                  <span className="flex-1">{TITLES[item]}</span>
                  <ChevronRight
                    aria-hidden
                    className={cn(
                      "text-muted-foreground size-4 shrink-0 transition-colors duration-150",
                      active && "text-foreground",
                    )}
                  />
                </button>
              );
            })}
          </div>

          {section && (
            <div
              className={cn(
                "absolute",
                side === "bottom" ? "top-0" : "bottom-0",
                place === "right" && "left-[calc(100%+0.375rem)]",
                place === "left" && "right-[calc(100%+0.375rem)]",
                place === "inset" && "left-0",
              )}
              style={{ width: PANEL_WIDTH }}
            >
              {place === "inset" && (
                <button
                  type="button"
                  onClick={back}
                  className={cn(
                    surface,
                    "text-muted-foreground hover:text-foreground focus-visible:ring-ring mb-1.5 flex h-7 cursor-pointer items-center gap-1 rounded-full pr-2.5 pl-1.5 text-xs outline-none [--switcher-fill:var(--popover)] focus-visible:ring-2",
                  )}
                >
                  <ChevronLeft aria-hidden className="size-3.5" />
                  Back
                </button>
              )}
              {section === "model" ? (
                <div
                  role="menu"
                  aria-label="Model"
                  onKeyDown={onModelKeyDown}
                  onPointerLeave={() => setSubHover(-1)}
                  className={panel}
                >
                  {models.map((option, index) => {
                    const active = index === activeModel;
                    return (
                      <button
                        key={option.value}
                        ref={(el) => {
                          modelRefs.current[index] = el;
                        }}
                        type="button"
                        role="menuitemradio"
                        aria-checked={active}
                        tabIndex={-1}
                        onPointerEnter={() => setSubHover(index)}
                        onFocus={() => setSubHover(index)}
                        onClick={() => {
                          setModel(option.value);
                          close(true);
                        }}
                        className={cn(row, "h-auto py-1.5", subHover === index && "bg-muted")}
                      >
                        <span
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center transition-colors duration-150 [&_svg]:size-4",
                            active ? "text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {option.icon}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col leading-tight">
                          <span className={cn("truncate", active && "font-medium")}>
                            {option.label}
                          </span>
                          {option.description && (
                            <span className="text-muted-foreground truncate text-xs">
                              {option.description}
                            </span>
                          )}
                        </span>
                        {active && <Check aria-hidden className="size-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div
                  ref={effortRef}
                  className={cn(panel, "p-0")}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      event.stopPropagation();
                      back();
                    }
                  }}
                >
                  <EffortSlider
                    levels={effortLevels}
                    theme={effortTheme}
                    value={draftEffort ?? effortIndex}
                    onValueChange={(index) => setDraftEffort(index)}
                    className="text-popover-foreground max-w-none rounded-2xl border-0 p-3 [background:none]"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { ModelSwitcher, ModelLogo };
