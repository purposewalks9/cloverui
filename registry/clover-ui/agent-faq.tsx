"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export interface AgentFaqItem {
  id?: string;
  question: string;
  answer: string;
}

export interface AgentFaqAskContext {
  signal: AbortSignal;
  previous: AgentFaqItem;
}

export type AgentFaqAsk = (
  question: string,
  context: AgentFaqAskContext,
) => Promise<string> | AsyncIterable<string>;

export type AgentFaqStatus = "idle" | "thinking" | "writing" | "error";

export interface AgentFaqProps extends Omit<React.ComponentProps<"div">, "children"> {
  defaultItems: AgentFaqItem[];
  onAsk?: AgentFaqAsk;
  onItemsChange?: (items: AgentFaqItem[]) => void;
  editable?: boolean;
}

type Row = AgentFaqItem & { key: string; status: AgentFaqStatus };

const EASE = [0.22, 1, 0.36, 1] as const;

function isAsyncIterable(value: unknown): value is AsyncIterable<string> {
  return typeof value === "object" && value !== null && Symbol.asyncIterator in value;
}

function toRows(items: AgentFaqItem[]): Row[] {
  return items.map((item, index) => ({
    ...item,
    key: item.id ?? `faq-${index}`,
    status: "idle",
  }));
}

function toItems(rows: Row[]): AgentFaqItem[] {
  return rows.map(({ id, question, answer }) =>
    id ? { id, question, answer } : { question, answer },
  );
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

function Loader() {
  return (
    <span className="relative block size-full">
      <span
        className="absolute inset-0 animate-spin rounded-full [animation-duration:900ms]"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, currentColor 300deg, transparent 360deg)",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1.5px))",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1.5px))",
        }}
      />
      <svg
        viewBox="0 0 24 24"
        className="absolute inset-[22%] animate-pulse fill-current"
        aria-hidden
      >
        <path d="M12 2.5c.5 4.6 2.9 7 9.5 9.5-6.6 2.5-9 4.9-9.5 9.5-.5-4.6-2.9-7-9.5-9.5 6.6-2.5 9-4.9 9.5-9.5Z" />
      </svg>
    </span>
  );
}

function Plus({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
      className={cn(
        "size-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        open && "rotate-45",
      )}
    >
      <path d="M12 6v12M6 12h12" />
    </svg>
  );
}

function Pencil() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-3.5"
    >
      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </svg>
  );
}

function AgentFaq({
  defaultItems,
  onAsk,
  onItemsChange,
  editable = true,
  className,
  ...props
}: AgentFaqProps) {
  const reduceMotion = useReducedMotion();
  const baseId = React.useId();
  const [rows, setRows] = React.useState<Row[]>(() => toRows(defaultItems));
  const [openKey, setOpenKey] = React.useState<string | null>(null);
  const [editingKey, setEditingKey] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const editingRef = React.useRef<string | null>(null);
  const rowsRef = React.useRef(rows);
  const controllers = React.useRef(new Map<string, AbortController>());

  React.useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  React.useEffect(() => {
    const running = controllers.current;
    return () => running.forEach((controller) => controller.abort());
  }, []);

  const update = (key: string, change: Partial<Row>) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...change } : row)));
  };

  const commit = (next: Row[]) => {
    rowsRef.current = next;
    setRows(next);
    onItemsChange?.(toItems(next));
  };

  const ask = async (key: string, question: string) => {
    const previous = rowsRef.current.find((row) => row.key === key);
    if (!previous || !onAsk) return;

    controllers.current.get(key)?.abort();
    const controller = new AbortController();
    controllers.current.set(key, controller);
    const { signal } = controller;

    update(key, { question, answer: "", status: "thinking" });
    setOpenKey(key);

    try {
      const result = onAsk(question, {
        signal,
        previous: { id: previous.id, question: previous.question, answer: previous.answer },
      });
      let text = "";

      if (isAsyncIterable(result)) {
        for await (const chunk of result) {
          if (signal.aborted) return;
          text += chunk;
          update(key, { answer: text, status: "writing" });
        }
      } else {
        const full = await result;
        if (signal.aborted) return;
        if (reduceMotion) {
          text = full;
          update(key, { answer: text, status: "writing" });
        } else {
          const words = full.split(/(\s+)/);
          for (const word of words) {
            text += word;
            update(key, { answer: text, status: "writing" });
            if (word.trim()) await wait(28, signal);
          }
        }
      }

      if (signal.aborted) return;
      controllers.current.delete(key);
      commit(
        rowsRef.current.map((row) =>
          row.key === key ? { ...row, question, answer: text, status: "idle" } : row,
        ),
      );
    } catch {
      if (signal.aborted) return;
      controllers.current.delete(key);
      update(key, { status: "error" });
    }
  };

  const startEdit = (row: Row) => {
    editingRef.current = row.key;
    setEditingKey(row.key);
    setDraft(row.question);
  };

  const finishEdit = (row: Row, save: boolean) => {
    if (editingRef.current !== row.key) return;
    editingRef.current = null;
    setEditingKey(null);
    const question = draft.trim();
    if (!save || !question || question === row.question.trim()) return;
    if (onAsk) {
      void ask(row.key, question);
    } else {
      commit(rowsRef.current.map((item) => (item.key === row.key ? { ...item, question } : item)));
    }
  };

  return (
    <div
      className={cn(
        "bg-card text-card-foreground divide-border w-full divide-y overflow-hidden rounded-2xl border",
        className,
      )}
      {...props}
    >
      {rows.map((row, index) => {
        const open = openKey === row.key;
        const busy = row.status === "thinking" || row.status === "writing";
        const editing = editingKey === row.key;
        const triggerId = `${baseId}-trigger-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div key={row.key} className="group/item">
            <div className="relative flex items-center">
              {editing ? (
                <form
                  className="flex flex-1 items-center py-2.5 pr-14 pl-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    finishEdit(row, true);
                  }}
                >
                  <input
                    autoFocus
                    value={draft}
                    aria-label="Edit question"
                    onChange={(event) => setDraft(event.target.value)}
                    onBlur={() => finishEdit(row, true)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") finishEdit(row, false);
                    }}
                    className="bg-muted/60 ring-ring/40 w-full rounded-lg px-2 py-1.5 text-[15px] font-medium outline-none focus:ring-2"
                  />
                </form>
              ) : (
                <button
                  type="button"
                  id={triggerId}
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenKey(open ? null : row.key)}
                  className={cn(
                    "hover:bg-muted/40 focus-visible:bg-muted/40 flex flex-1 cursor-pointer items-center py-4 pl-5 text-left text-[15px] font-medium transition-colors outline-none",
                    editable ? "pr-24" : "pr-14",
                  )}
                >
                  {row.question}
                </button>
              )}

              {editable && !editing && (
                <button
                  type="button"
                  aria-label={`Edit question: ${row.question}`}
                  disabled={busy}
                  onClick={() => startEdit(row)}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring absolute right-12 flex size-8 cursor-pointer items-center justify-center rounded-full opacity-100 transition-[opacity,color,background-color] outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-0 sm:opacity-0 sm:group-hover/item:opacity-100 sm:focus-visible:opacity-100"
                >
                  <Pencil />
                </button>
              )}

              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute right-4 size-5",
                  busy ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {busy ? <Loader /> : <Plus open={open} />}
              </span>
            </div>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  key="panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  aria-busy={busy}
                  initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0.15 : 0.32, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div
                    aria-live="polite"
                    className="text-muted-foreground px-5 pb-5 text-sm leading-relaxed whitespace-pre-wrap"
                  >
                    {row.status === "thinking" && (
                      <span
                        className="animate-[agent-faq-shimmer_1.6s_linear_infinite] bg-clip-text font-medium text-transparent motion-reduce:animate-none"
                        style={{
                          backgroundImage:
                            "linear-gradient(90deg, var(--muted-foreground) 35%, var(--foreground) 50%, var(--muted-foreground) 65%)",
                          backgroundSize: "200% 100%",
                        }}
                      >
                        Thinking…
                      </span>
                    )}

                    {row.status === "error" && (
                      <span>
                        Couldn&apos;t get an answer.{" "}
                        <button
                          type="button"
                          onClick={() => void ask(row.key, row.question)}
                          className="text-foreground cursor-pointer font-medium underline underline-offset-4"
                        >
                          Try again
                        </button>
                      </span>
                    )}

                    {(row.status === "idle" || row.status === "writing") && row.answer}

                    {row.status === "writing" && (
                      <span
                        aria-hidden
                        className="bg-foreground ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.2em] animate-pulse"
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      <style>{`@keyframes agent-faq-shimmer{from{background-position:100% 0}to{background-position:-100% 0}}`}</style>
    </div>
  );
}

export { AgentFaq };
