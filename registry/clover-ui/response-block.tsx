"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUpFromLine,
  BookmarkPlus,
  Bot,
  Bug,
  CalendarPlus,
  ChevronDown,
  ChevronRight,
  Copy,
  Database,
  FilePen,
  FilePlus2,
  FileSearch,
  FileText,
  FlaskConical,
  GitBranch,
  GitCommitHorizontal,
  GitMerge,
  GitPullRequestArrow,
  Globe,
  Hammer,
  Image as ImageIcon,
  ListTodo,
  Mail,
  MessageSquareCode,
  MousePointerClick,
  Package,
  Plug,
  Rocket,
  RotateCcw,
  Send,
  SquareTerminal,
  ThumbsUp,
  Trash2,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import {
  ThinkingState,
  thinkingStateColors,
  type ThinkingStateKind,
  type ThinkingStateStatus,
} from "@/registry/clover-ui/thinking-state";
import { cn } from "@/lib/utils";
import {
  CHIP_SURFACE,
  Code,
  ResponseComponentsContext,
  type ResponseComponents,
  ContentBlock,
  responseToText,
  parseMarkdown,
  safeUrl,
  type ResponseContent,
} from "./response-block-markdown";

export { responseToText, parseMarkdown, type ResponseComponents, type ResponseContent };

export type ResponseStatus = "searching" | "summarizing" | "done" | "failed";

export type ResponseStepStatus = "running" | "done" | "failed";

export interface ResponseSource {
  url: string;
  title?: string;
  icon?: React.ReactNode;
}

export type ResponseStep =
  | {
      id: string;
      type: "search";
      query: string;
      status?: ResponseStepStatus;
      results?: ResponseSource[];
    }
  | { id: string; type: "read"; source: ResponseSource; status?: ResponseStepStatus }
  | { id: string; type: "note"; text: string }
  | {
      id: string;
      type: "tool";
      kind?: ResponseToolKind;
      title: string;
      meta?: string;
      status?: ResponseStepStatus;
      output?: { code: string; language?: string };
    };

export type ResponseToolKind =
  | "command"
  | "edit"
  | "create"
  | "delete"
  | "view"
  | "code-search"
  | "test"
  | "build"
  | "install"
  | "debug"
  | "branch"
  | "commit"
  | "push"
  | "pull-request"
  | "review"
  | "merge"
  | "deploy"
  | "api"
  | "database"
  | "browser"
  | "email"
  | "message"
  | "calendar"
  | "image"
  | "memory"
  | "agent"
  | "task"
  | "tool";

interface ToolKindInfo {
  icon: LucideIcon;
  verb: string;
  one: string;
  many: string;
  orb: ThinkingStateKind;
}

const TOOL_KINDS: Record<ResponseToolKind, ToolKindInfo> = {
  command: { icon: SquareTerminal, verb: "ran", one: "command", many: "commands", orb: "building" },
  edit: { icon: FilePen, verb: "edited", one: "file", many: "files", orb: "building" },
  create: { icon: FilePlus2, verb: "created", one: "file", many: "files", orb: "building" },
  delete: { icon: Trash2, verb: "deleted", one: "file", many: "files", orb: "building" },
  view: { icon: FileText, verb: "read", one: "file", many: "files", orb: "analyzing" },
  "code-search": {
    icon: FileSearch,
    verb: "ran",
    one: "code search",
    many: "code searches",
    orb: "searching",
  },
  test: { icon: FlaskConical, verb: "ran", one: "test run", many: "test runs", orb: "building" },
  build: { icon: Hammer, verb: "ran", one: "build", many: "builds", orb: "building" },
  install: { icon: Package, verb: "installed", one: "package", many: "packages", orb: "building" },
  debug: { icon: Bug, verb: "fixed", one: "bug", many: "bugs", orb: "debugging" },
  branch: { icon: GitBranch, verb: "created", one: "branch", many: "branches", orb: "building" },
  commit: {
    icon: GitCommitHorizontal,
    verb: "made",
    one: "commit",
    many: "commits",
    orb: "building",
  },
  push: { icon: ArrowUpFromLine, verb: "pushed", one: "branch", many: "branches", orb: "building" },
  "pull-request": {
    icon: GitPullRequestArrow,
    verb: "opened",
    one: "pull request",
    many: "pull requests",
    orb: "building",
  },
  review: {
    icon: MessageSquareCode,
    verb: "reviewed",
    one: "pull request",
    many: "pull requests",
    orb: "analyzing",
  },
  merge: {
    icon: GitMerge,
    verb: "merged",
    one: "pull request",
    many: "pull requests",
    orb: "building",
  },
  deploy: { icon: Rocket, verb: "shipped", one: "deploy", many: "deploys", orb: "building" },
  api: { icon: Plug, verb: "called", one: "API", many: "APIs", orb: "building" },
  database: { icon: Database, verb: "ran", one: "query", many: "queries", orb: "analyzing" },
  browser: {
    icon: MousePointerClick,
    verb: "took",
    one: "browser action",
    many: "browser actions",
    orb: "building",
  },
  email: { icon: Mail, verb: "sent", one: "email", many: "emails", orb: "building" },
  message: { icon: Send, verb: "sent", one: "message", many: "messages", orb: "building" },
  calendar: {
    icon: CalendarPlus,
    verb: "scheduled",
    one: "event",
    many: "events",
    orb: "building",
  },
  image: { icon: ImageIcon, verb: "generated", one: "image", many: "images", orb: "building" },
  memory: { icon: BookmarkPlus, verb: "saved", one: "memory", many: "memories", orb: "thinking" },
  agent: { icon: Bot, verb: "started", one: "agent", many: "agents", orb: "thinking" },
  task: { icon: ListTodo, verb: "updated", one: "task", many: "tasks", orb: "thinking" },
  tool: { icon: Wrench, verb: "used", one: "tool", many: "tools", orb: "building" },
};

export interface ResponseBlockProps extends Omit<React.ComponentProps<"div">, "children"> {
  status: ResponseStatus;
  steps?: ResponseStep[];
  answer?: ResponseContent[] | string;
  startedAt?: number;
  endedAt?: number;
  elapsed?: number;
  label?: React.ReactNode;
  collapseWhenDone?: boolean;
  actions?: boolean;
  onRetry?: () => void;
  components?: ResponseComponents;
  classNames?: ResponseBlockClassNames;
}

export interface ResponseBlockClassNames {
  header?: string;
  steps?: string;
  answer?: string;
  actions?: string;
}

export function mergeById<T extends { id: string }>(
  current: readonly T[],
  updates: readonly (Partial<T> & { id: string })[],
) {
  const next = [...current];
  const index = new Map(next.map((item, i) => [item.id, i]));
  for (const update of updates) {
    const at = index.get(update.id);
    if (at === undefined) {
      index.set(update.id, next.length);
      next.push(update as T);
    } else {
      next[at] = { ...next[at], ...update } as T;
    }
  }
  return next;
}

export function formatElapsed(ms: number | undefined) {
  if (ms === undefined || !Number.isFinite(ms) || ms < 0) return "";
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function hostOf(url: string) {
  return safeUrl(url)?.hostname.replace(/^www\./, "") ?? url;
}

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

const toolKind = (kind: ResponseToolKind | undefined): ResponseToolKind =>
  kind && kind in TOOL_KINDS ? kind : "tool";

export function responseLabel(status: ResponseStatus, steps: ResponseStep[]) {
  if (status === "failed") return "Couldn't finish";
  if (status === "done") {
    const count = (match: (step: ResponseStep) => boolean) => steps.filter(match).length;
    const searches = count((s) => s.type === "search");
    const reads = count((s) => s.type === "read");
    const toolLabels = (Object.keys(TOOL_KINDS) as ResponseToolKind[]).flatMap((kind) => {
      const used = count((s) => s.type === "tool" && toolKind(s.kind) === kind);
      const { verb, one, many } = TOOL_KINDS[kind];
      return used ? [`${verb} ${plural(used, one, many)}`] : [];
    });
    const parts = [
      searches ? "searched the web" : "",
      reads ? `read ${plural(reads, "page", "pages")}` : "",
      ...toolLabels,
    ].filter(Boolean);
    const toolCount = count((s) => s.type === "tool");
    const toolParts = toolLabels.length;
    if (parts.length > 2 && toolParts > 1) {
      parts.splice(
        parts.length - toolParts,
        Infinity,
        `used ${plural(toolCount, "tool", "tools")}`,
      );
    }
    if (parts.length > 2) parts.splice(1, parts.length - 2);
    if (!parts.length) return "Answered";
    const text = parts.join(", ");
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  if (status === "summarizing") return "Summarizing";
  const current = [...steps].reverse().find((s) => s.type !== "note" && s.status === "running");
  if (current?.type === "search") return "Searching the web";
  if (current?.type === "read")
    return `Reading ${current.source.title ?? hostOf(current.source.url)}`;
  if (current?.type === "tool") return current.title;
  return "Thinking";
}

function unresolvedFailure(steps: ResponseStep[]) {
  let failed = -1;
  steps.forEach((s, i) => {
    if (s.type === "tool" && s.status === "failed") failed = i;
  });
  if (failed < 0) return false;
  const kind = toolKind((steps[failed] as Extract<ResponseStep, { type: "tool" }>).kind);
  return !steps
    .slice(failed + 1)
    .some((s) => s.type === "tool" && toolKind(s.kind) === kind && s.status === "done");
}

function orbState(status: ResponseStatus, steps: ResponseStep[]): ThinkingStateKind {
  if (status === "summarizing") return "pondering";
  const current = [...steps].reverse().find((s) => s.type !== "note" && s.status === "running");
  if (current?.type === "search") return "searching";
  if (current?.type === "read") return "analyzing";
  if (current?.type === "tool") {
    if (unresolvedFailure(steps)) return "debugging";
    return TOOL_KINDS[toolKind(current.kind)].orb;
  }
  return "thinking";
}

function useNow(active: boolean) {
  const [now, setNow] = React.useState<number | null>(null);
  React.useEffect(() => {
    setNow(Date.now());
    if (!active) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [active]);
  return now;
}

const STYLE_CSS =
  "@keyframes response-block-shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}";

function Styles() {
  return (
    <style href="response-block" precedence="default">
      {STYLE_CSS}
    </style>
  );
}

function Shimmer({ active, children }: { active: boolean; children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <span
      className={cn(
        active &&
          !reduceMotion &&
          "[animation:response-block-shimmer_3s_ease-in-out_infinite] bg-[linear-gradient(90deg,var(--muted-foreground)_0%,var(--muted-foreground)_30%,var(--foreground)_50%,var(--muted-foreground)_70%,var(--muted-foreground)_100%)] bg-[length:300%_100%] bg-clip-text text-transparent",
      )}
    >
      {children}
    </span>
  );
}

function SourceIcon({ source }: { source: ResponseSource }) {
  return (
    <span
      aria-hidden
      className="text-foreground inline-flex size-[0.9em] shrink-0 items-center justify-center [&_svg]:size-full"
    >
      {source.icon ?? <Globe strokeWidth={1.75} className="text-muted-foreground" />}
    </span>
  );
}

function SourceLine({ source }: { source: ResponseSource }) {
  const url = safeUrl(source.url);
  const host = hostOf(source.url);
  const body = (
    <>
      <SourceIcon source={source} />
      <span className="text-foreground min-w-0 flex-1 truncate text-[0.95em]">
        {source.title ?? host}
      </span>
      <span className={CHIP}>{host}</span>
    </>
  );
  const className =
    "flex h-[1.9em] w-full min-w-0 items-center gap-[0.35em] rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50";
  return url ? (
    <a href={url.href} target="_blank" rel="noopener noreferrer" className={className}>
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
}

const EASE = [0.22, 1, 0.36, 1] as const;

const NO_ANSWER: ResponseContent[] = [];

const NO_COMPONENTS: ResponseComponents = {};

function ActionButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "focus-visible:ring-ring/50 inline-flex size-[2.2em] shrink-0 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 [&_svg]:size-[1.05em]",
        "text-muted-foreground hover:text-foreground transition-colors duration-100",
        pressed && "text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function SwapIcon({
  swapped,
  from,
  to,
}: {
  swapped: boolean;
  from: React.ReactNode;
  to: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      key={swapped ? "to" : "from"}
      initial={reduceMotion ? false : { scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.12 }}
      className="inline-flex"
    >
      {swapped ? to : from}
    </motion.span>
  );
}

function useFlag() {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    if (!on) return;
    const timer = window.setTimeout(() => setOn(false), 1600);
    return () => window.clearTimeout(timer);
  }, [on]);
  return [on, setOn] as const;
}

function ActionBar({
  className,
  answer,
  onRetry,
}: {
  answer: ResponseContent[];
  onRetry?: () => void;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useFlag();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.12, ease: EASE }}
      className={cn("mt-[0.6em] -ml-[0.55em] flex items-center gap-[0.15em]", className)}
    >
      {answer.length > 0 && (
        <ActionButton
          label={copied ? "Copied" : "Copy"}
          onClick={() => {
            setCopied(true);
            navigator.clipboard?.writeText(responseToText(answer)).catch(() => setCopied(false));
          }}
        >
          <SwapIcon swapped={copied} from={<Copy />} to={<ThumbsUp />} />
        </ActionButton>
      )}
      {onRetry && (
        <ActionButton label="Resend" onClick={onRetry}>
          <RotateCcw />
        </ActionButton>
      )}
    </motion.div>
  );
}

function Reveal({ show, children, id }: { show: boolean; children: React.ReactNode; id?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          id={id}
          initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
          animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.12, ease: EASE }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const CHIP = cn(
  CHIP_SURFACE,
  "text-foreground/70 shrink-0 rounded-full px-[0.6em] py-[0.1em] text-[0.8em] leading-normal",
);

const NARROW = "(max-width: 639px)";

function subscribeNarrow(onChange: () => void) {
  const query = window.matchMedia(NARROW);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useNarrow() {
  return React.useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia(NARROW).matches,
    () => false,
  );
}

function ToolRow({ step }: { step: Extract<ResponseStep, { type: "tool" }> }) {
  const [open, setOpen] = React.useState(false);
  const panelId = React.useId();
  const Icon = TOOL_KINDS[toolKind(step.kind)].icon;
  const running = step.status === "running";
  const output = useNarrow() ? undefined : step.output;
  const content = (
    <>
      <Icon
        aria-hidden
        strokeWidth={1.75}
        className={cn(
          "size-[1em] shrink-0",
          step.status === "failed" ? "text-destructive" : "text-muted-foreground",
        )}
      />
      <span className="text-foreground min-w-0 truncate">
        <Shimmer active={running}>{step.title}</Shimmer>
      </span>
      {output && (
        <ChevronRight
          aria-hidden
          className={cn(
            "text-muted-foreground size-[1em] shrink-0 transition-transform duration-100",
            open && "rotate-90",
          )}
        />
      )}
      {step.meta && <span className={cn(CHIP, "ml-auto")}>{step.meta}</span>}
    </>
  );
  const rowClass = "flex h-[1.9em] w-full min-w-0 items-center gap-[0.4em] rounded-sm text-left";

  if (!output) return <div className={rowClass}>{content}</div>;

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          rowClass,
          "focus-visible:ring-ring/50 cursor-pointer outline-none focus-visible:ring-2",
        )}
      >
        {content}
      </button>
      <Reveal show={open} id={panelId}>
        <div className="pt-[0.2em] pb-[0.5em] pl-[1.4em]">
          <Code code={output.code} language={output.language} />
        </div>
      </Reveal>
    </div>
  );
}

function StepRow({ step }: { step: ResponseStep }) {
  const [open, setOpen] = React.useState(false);
  const panelId = React.useId();

  if (step.type === "note") {
    return <p className="text-foreground/75 py-[0.3em] leading-relaxed">{step.text}</p>;
  }

  const running = step.status === "running";

  if (step.type === "tool") return <ToolRow step={step} />;

  if (step.type === "read") {
    return (
      <div className="flex h-[1.9em] min-w-0 items-center gap-[0.55em]">
        <span
          className={cn(
            "shrink-0",
            step.status === "failed" ? "text-destructive" : "text-muted-foreground",
          )}
        >
          <Shimmer active={running}>
            {running ? "Reading" : step.status === "failed" ? "Couldn't open" : "Read"}
          </Shimmer>
        </span>
        <span className="flex min-w-0 flex-1">
          <SourceLine source={step.source} />
        </span>
      </div>
    );
  }

  const results = step.results ?? [];
  const label = (
    <>
      <span className="text-muted-foreground shrink-0">
        <Shimmer active={running}>{running ? "Searching the web" : "Searched the web"}</Shimmer>
      </span>
      <span className="text-foreground min-w-0 truncate font-medium">{step.query}</span>
    </>
  );

  if (!results.length) {
    return <div className="flex h-[1.9em] min-w-0 items-center gap-[0.55em]">{label}</div>;
  }

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="focus-visible:ring-ring/50 flex h-[1.9em] w-full min-w-0 cursor-pointer items-center gap-[0.55em] rounded-sm text-left outline-none focus-visible:ring-2"
      >
        {label}
        <ChevronRight
          aria-hidden
          className={cn(
            "text-muted-foreground size-[1em] shrink-0 transition-transform duration-100",
            open && "rotate-90",
          )}
        />
      </button>
      <Reveal show={open} id={panelId}>
        <ul className="pb-[0.3em]">
          {results.map((source, i) => (
            <li key={source.url + i}>
              <SourceLine source={source} />
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}

function ResponseBlock({
  status,
  steps = [],
  answer: answerProp = NO_ANSWER,
  startedAt,
  endedAt,
  elapsed,
  label,
  collapseWhenDone = true,
  actions = true,
  onRetry,
  components,
  classNames,
  className,
  ...props
}: ResponseBlockProps) {
  const reduceMotion = useReducedMotion();
  const panelId = React.useId();
  const answer = React.useMemo(
    () => (typeof answerProp === "string" ? parseMarkdown(answerProp) : answerProp),
    [answerProp],
  );
  const finished = status === "done" || status === "failed";
  const [override, setOverride] = React.useState<boolean | null>(null);
  const canToggle = finished && steps.length > 0;
  const open = finished ? (override ?? !collapseWhenDone) : true;

  React.useEffect(() => {
    if (!finished) setOverride(null);
  }, [finished]);
  const now = useNow(!finished && elapsed === undefined && startedAt !== undefined);

  const ms =
    elapsed ??
    (startedAt === undefined
      ? undefined
      : finished && endedAt !== undefined
        ? endedAt - startedAt
        : now === null
          ? undefined
          : now - startedAt);
  const time = formatElapsed(ms);
  const orb = orbState(status, steps);
  const orbStatus: ThinkingStateStatus =
    status === "done" ? "complete" : status === "failed" ? "error" : "active";
  const tone = status === "done" ? null : thinkingStateColors(orb, orbStatus);

  const icons = React.useMemo(() => {
    const map = new Map<string, React.ReactNode>();
    for (const step of steps) {
      const sources =
        step.type === "search" ? (step.results ?? []) : step.type === "read" ? [step.source] : [];
      for (const source of sources) {
        if (source.icon && !map.has(hostOf(source.url))) map.set(hostOf(source.url), source.icon);
      }
    }
    return map;
  }, [steps]);

  return (
    <ResponseComponentsContext.Provider value={components ?? NO_COMPONENTS}>
      <div className={cn("flex w-full min-w-0 flex-col text-[13px]", className)} {...props}>
        <Styles />
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          disabled={!canToggle}
          onClick={() => setOverride(!open)}
          className={cn(
            "focus-visible:ring-ring/50 group/header flex h-[2em] w-full min-w-0 cursor-pointer items-center gap-[0.4em] rounded-sm text-left outline-none focus-visible:ring-2 disabled:cursor-default",
            classNames?.header,
          )}
        >
          <ThinkingState
            state={orb}
            status={orbStatus}
            className="min-w-0 gap-[0.35em] overflow-hidden text-[1em] font-medium"
          >
            {label ?? responseLabel(status, steps)}
          </ThinkingState>
          {canToggle && (
            <ChevronDown
              aria-hidden
              className={cn(
                "text-muted-foreground size-[1em] shrink-0 transition-transform duration-100",
                !open && "-rotate-90",
              )}
            />
          )}
          {time && (
            <span
              style={
                tone
                  ? ({
                      "--time-light": tone.light,
                      "--time-dark": tone.dark,
                    } as React.CSSProperties)
                  : undefined
              }
              className={cn(
                "ml-auto shrink-0 pl-3 text-[0.85em] font-medium tabular-nums transition-colors duration-500 motion-reduce:transition-none",
                tone ? "text-(--time-light) dark:text-(--time-dark)" : "text-muted-foreground",
              )}
            >
              {time}
            </span>
          )}
        </button>

        <Reveal show={open && steps.length > 0} id={panelId}>
          <ol
            className={cn(
              "border-border mt-[0.15em] ml-[0.45em] flex flex-col border-l pl-[1em]",
              classNames?.steps,
            )}
          >
            <AnimatePresence initial={false}>
              {steps.map((step) => (
                <motion.li
                  key={step.id}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                  transition={{ duration: reduceMotion ? 0 : 0.15, ease: EASE }}
                  className="min-w-0 list-none overflow-hidden"
                >
                  <StepRow step={step} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        </Reveal>

        {answer.length > 0 && (
          <div
            className={cn(
              "text-foreground/85 mt-[0.9em] flex flex-col gap-[0.8em] leading-relaxed",
              classNames?.answer,
            )}
          >
            <AnimatePresence initial={false}>
              {answer.map((block, i) => (
                <motion.div
                  key={block.id ?? i}
                  initial={
                    reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, filter: "blur(3px)" }
                  }
                  animate={
                    reduceMotion
                      ? { opacity: 1 }
                      : { opacity: 1, height: "auto", filter: "blur(0px)" }
                  }
                  transition={{ duration: reduceMotion ? 0 : 0.18, ease: EASE }}
                  className="overflow-hidden"
                >
                  <ContentBlock block={block} icons={icons} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {actions && finished && (
          <ActionBar answer={answer} onRetry={onRetry} className={classNames?.actions} />
        )}
      </div>
    </ResponseComponentsContext.Provider>
  );
}

ResponseBlock.displayName = "ResponseBlock";

export { ResponseBlock };
