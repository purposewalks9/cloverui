"use client";

import * as React from "react";
import { Copy, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type ResponseContent =
  | { id?: string; type: "paragraph"; text: string }
  | { id?: string; type: "heading"; text: string }
  | { id?: string; type: "list"; items: string[]; ordered?: boolean }
  | { id?: string; type: "quote"; text: string }
  | { id?: string; type: "code"; code: string; language?: string }
  | { id?: string; type: "table"; header: string[]; rows: string[][] }
  | { id?: string; type: "images"; images: ResponseImage[] };

export interface ResponseImage {
  src: string;
  alt?: string;
  caption?: string;
}

export function safeUrl(url: string | undefined) {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function asJson(source: string) {
  const text = source.trim();
  if (!/^[[{]/.test(text)) return null;
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return /^[[{]\s*\n\s*["[{]/.test(text) ? text : null;
  }
}

const LANGUAGE_HINTS: [string, (text: string) => boolean][] = [
  ["json", (text) => asJson(text) !== null],
  ["bash", (text) => /^(\$ |(npm|pnpm|npx|yarn|bun|git|curl|cd|brew|pip)\s)/m.test(text)],
  ["html", (text) => /^\s*<[a-zA-Z!]/.test(text)],
  ["ts", (text) => /\b(import|export|const|let|function|=>)\b/.test(text)],
];

export function guessLanguage(code: string) {
  const text = code.trim();
  return LANGUAGE_HINTS.find(([, matches]) => matches(text))?.[0] ?? "";
}

const LANGUAGE_NAMES: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  jsx: "JSX",
  typescript: "TypeScript",
  javascript: "JavaScript",
  json: "JSON",
  bash: "Shell",
  sh: "Shell",
  shell: "Shell",
  zsh: "Shell",
  py: "Python",
  python: "Python",
  html: "HTML",
  css: "CSS",
  sql: "SQL",
  yaml: "YAML",
  yml: "YAML",
  md: "Markdown",
  go: "Go",
  rust: "Rust",
  rs: "Rust",
};

export function languageName(language: string | undefined) {
  if (!language) return "Code";
  const key = language.toLowerCase();
  return LANGUAGE_NAMES[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

const HASH_COMMENTS = new Set(["bash", "sh", "shell", "zsh", "python", "py", "yaml", "yml"]);

const STRINGS = `"(?:\\\\.|[^"\\\\\\n])*"|'(?:\\\\.|[^'\\\\\\n])*'|\`(?:\\\\.|[^\`\\\\])*\``;
const LITERALS = "\\b(?:\\d+(?:\\.\\d+)?|true|false|null|undefined)\\b";
const KEYWORDS =
  "\\b(?:const|let|var|function|return|import|from|export|default|async|await|if|else|for|while|new|class|extends|type|interface|def|print)\\b";

function tokenPattern(language: string) {
  const comment =
    language === "json"
      ? "(?!)"
      : HASH_COMMENTS.has(language)
        ? "(?:^|(?<=\\s))#[^\\n]*"
        : "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/";
  const keywords = language === "json" ? "(?!)" : KEYWORDS;
  return new RegExp(`(${comment})|(${STRINGS})|(${LITERALS})|(${keywords})`, "g");
}

const TOKEN_CLASS = {
  comment: "text-[#6e7781] dark:text-[#8b949e]",
  key: "text-[#0550ae] dark:text-[#79c0ff]",
  string: "text-[#0a3069] dark:text-[#a5d6ff]",
  literal: "text-[#0550ae] dark:text-[#79c0ff]",
  keyword: "text-[#cf222e] dark:text-[#ff7b72]",
};

function Highlight({ code, language }: { code: string; language: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of code.matchAll(tokenPattern(language))) {
    const at = match.index ?? 0;
    const [whole, comment, string, literal] = match;
    if (!whole) continue;
    if (at > last) parts.push(code.slice(last, at));
    const isKey = string !== undefined && /^\s*:/.test(code.slice(at + whole.length));
    const kind =
      comment !== undefined
        ? "comment"
        : string !== undefined
          ? isKey
            ? "key"
            : "string"
          : literal !== undefined
            ? "literal"
            : "keyword";
    parts.push(
      <span key={at} className={TOKEN_CLASS[kind]}>
        {whole}
      </span>,
    );
    last = at + whole.length;
  }
  if (last < code.length) parts.push(code.slice(last));
  return <>{parts}</>;
}

export const CHIP_SURFACE = "bg-foreground/[0.06] dark:bg-foreground/[0.1]";

export function CodeCard({
  code,
  language,
  className,
}: {
  code: string;
  language?: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const lang = (language || guessLanguage(code)).toLowerCase();

  React.useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <div
      data-language={lang || undefined}
      className={cn(
        "border-foreground/[0.08] bg-foreground/[0.025] dark:border-foreground/[0.1] dark:bg-foreground/[0.04] relative isolate overflow-hidden rounded-[0.4em] border",
        className,
      )}
    >
      <div className="flex items-center gap-[0.45em] pt-[0.35em] pr-[0.35em] pl-[0.85em]">
        <span className="text-muted-foreground text-[0.78em] font-medium">
          {languageName(lang)}
        </span>
        <div className="ml-auto flex items-center">
          <button
            type="button"
            aria-label={copied ? "Copied" : "Copy code"}
            onClick={() => {
              setCopied(true);
              navigator.clipboard?.writeText(code).catch(() => setCopied(false));
            }}
            className="text-muted-foreground hover:bg-foreground/[0.07] hover:text-foreground dark:hover:bg-foreground/[0.1] focus-visible:ring-ring/50 relative z-20 inline-flex size-[1.7em] cursor-pointer items-center justify-center rounded-[0.4em] transition-colors outline-none focus-visible:ring-2 [&_svg]:size-[0.95em]"
          >
            {copied ? <ThumbsUp /> : <Copy />}
          </button>
        </div>
      </div>
      <pre className="text-foreground m-0! max-h-80 overflow-auto rounded-none! border-0! bg-transparent! px-[0.85em] pt-[0.2em] pb-[0.75em] font-mono text-[0.88em] leading-[1.65]">
        <code>
          <Highlight code={code} language={lang} />
        </code>
      </pre>
    </div>
  );
}

const IMAGE = /!\[([^\]]*)\]\(((?:[^()\s]|\([^()\s]*\))+?)(?:\s+"([^"]*)")?\)/g;
const IMAGE_LINE = /^(?:!\[[^\]]*\]\((?:[^()\s]|\([^()\s]*\))+?(?:\s+"[^"]*")?\)\s*)+$/;

function imageOf(src: string, alt: string | undefined, title: string | undefined): ResponseImage {
  const image: ResponseImage = { src };
  if (alt) image.alt = alt;
  if (title || alt) image.caption = title || alt;
  return image;
}

function safeSrc(src: string | undefined) {
  if (!src) return undefined;
  if (/^\/(?!\/)/.test(src)) return src;
  return safeUrl(src)?.href;
}

const BULLET = /^[-*+•]\s+(.*)$/;
const NUMBERED = /^\d+[.)]\s+(.*)$/;
const FENCE = /^(```|~~~)\s*([\w+#.-]*)\s*$/;
const RULE = /^(?:-{3,}|\*{3,}|_{3,})$/;

const cells = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

export function parseMarkdown(markdown: string): ResponseContent[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ResponseContent[] = [];
  let paragraph: string[] = [];
  let i = 0;

  const flush = () => {
    if (paragraph.length) {
      const json = asJson(paragraph.join("\n"));
      blocks.push(
        json !== null
          ? { type: "code", code: json, language: "json" }
          : { type: "paragraph", text: paragraph.map((part) => part.trim()).join(" ") },
      );
    }
    paragraph = [];
  };

  const pushList = (items: string[], ordered: boolean) => {
    const last = blocks[blocks.length - 1];
    if (last?.type === "list" && Boolean(last.ordered) === ordered) last.items.push(...items);
    else blocks.push(ordered ? { type: "list", items, ordered } : { type: "list", items });
  };

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    const fence = line.match(FENCE);
    if (fence) {
      flush();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence[1])) code.push(lines[i++]);
      i++;
      blocks.push(
        fence[2]
          ? { type: "code", code: code.join("\n"), language: fence[2] }
          : { type: "code", code: code.join("\n") },
      );
      continue;
    }

    if (!line || RULE.test(line)) {
      flush();
      i++;
      continue;
    }

    const heading = line.match(/^#{1,6}\s+(.*?)\s*#*$/);
    if (heading) {
      flush();
      blocks.push({ type: "heading", text: heading[1] });
      i++;
      continue;
    }

    if (line.startsWith(">")) {
      flush();
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quote.push(lines[i++].trim().replace(/^>\s?/, ""));
      }
      blocks.push({ type: "quote", text: quote.join(" ").trim() });
      continue;
    }

    if (
      line.includes("|") &&
      /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/.test(lines[i + 1]?.trim() ?? "")
    ) {
      flush();
      const header = cells(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].includes("|") && lines[i].trim())
        rows.push(cells(lines[i++]));
      blocks.push({ type: "table", header, rows });
      continue;
    }

    if (BULLET.test(line) || NUMBERED.test(line)) {
      flush();
      const ordered = !BULLET.test(line);
      const items: string[] = [];
      while (i < lines.length) {
        const next = lines[i].trim();
        const item = BULLET.exec(next) ?? NUMBERED.exec(next);
        if (item) {
          items.push(item[1]);
          i++;
        } else if (next && items.length && /^\s+/.test(lines[i]) && !FENCE.test(next)) {
          items[items.length - 1] += ` ${next}`;
          i++;
        } else break;
      }
      pushList(items, ordered);
      continue;
    }

    if (IMAGE_LINE.test(line)) {
      flush();
      const images: ResponseImage[] = [];
      while (i < lines.length && IMAGE_LINE.test(lines[i].trim())) {
        for (const match of lines[i].trim().matchAll(IMAGE)) {
          const src = safeSrc(match[2]);
          if (src) images.push(imageOf(src, match[1], match[3]));
        }
        i++;
      }
      if (images.length) blocks.push({ type: "images", images });
      continue;
    }

    paragraph.push(raw);
    i++;
  }
  flush();
  return blocks;
}

const INLINE =
  /\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)|\*\*(.+?)\*\*|__(.+?)__|`([^`]+)`|(?<![\w*])\*(?![\s*])(.+?)(?<!\s)\*(?![\w*])|(?<![\w_])_(?![\s_])(.+?)(?<!\s)_(?![\w_])|!\[([^\]]*)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g;

export function inlineToText(text: string): string {
  return text.replace(INLINE, (_, label, url, bold, bold2, code, em, em2, alt, src) => {
    if (src !== undefined) return `${alt || "Image"} (${src})`;
    if (label !== undefined) return `${inlineToText(label)} (${url})`;
    return inlineToText(bold ?? bold2 ?? em ?? em2 ?? "") || (code ?? "");
  });
}

export function responseToText(answer: ResponseContent[] | string) {
  const blocks = typeof answer === "string" ? parseMarkdown(answer) : answer;
  return blocks
    .map((block) => {
      switch (block.type) {
        case "list":
          return block.items
            .map((item, i) => `${block.ordered ? `${i + 1}.` : "-"} ${inlineToText(item)}`)
            .join("\n");
        case "code":
          return block.code;
        case "images":
          return block.images.map((image) => `${image.alt || "Image"} (${image.src})`).join("\n");
        case "table":
          return [block.header, ...block.rows]
            .map((row) => row.map(inlineToText).join(" | "))
            .join("\n");
        default:
          return inlineToText(block.text);
      }
    })
    .join("\n\n");
}

type Icons = Map<string, React.ReactNode>;

export interface ResponseComponents {
  Code?: React.ComponentType<{ code: string; language: string }>;
  Link?: React.ComponentType<{ href: string; host: string; children: React.ReactNode }>;
  Image?: React.ComponentType<ResponseImage & { variant: "single" | "grid" | "inline" }>;
}

export const ResponseComponentsContext = React.createContext<ResponseComponents>({});

export function Code({ code, language }: { code: string; language?: string }) {
  const { Code: Custom } = React.useContext(ResponseComponentsContext);
  const lang = (language || guessLanguage(code)).toLowerCase();
  return Custom ? <Custom code={code} language={lang} /> : <CodeCard code={code} language={lang} />;
}

function useLoaded() {
  const ref = React.useRef<HTMLImageElement>(null);
  const [state, setState] = React.useState<"loading" | "loaded" | "failed">("loading");
  React.useEffect(() => {
    const image = ref.current;
    if (image?.complete) setState(image.naturalWidth > 0 ? "loaded" : "failed");
  }, []);
  return {
    ref,
    state,
    onLoad: () => setState("loaded"),
    onError: () => setState("failed"),
  };
}

function InlineImage({ src, alt }: { src: string; alt?: string }) {
  const { Image: Custom } = React.useContext(ResponseComponentsContext);
  const { ref, state, onLoad, onError } = useLoaded();
  if (Custom) return <Custom src={src} alt={alt} variant="inline" />;
  if (state === "failed") return <>{alt}</>;
  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-visible:ring-ring/50 mx-[0.15em] inline-block translate-y-[-0.1em] overflow-hidden rounded-full align-middle outline-none focus-visible:ring-2"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={src}
        alt={alt ?? ""}
        loading="eager"
        fetchPriority="high"
        referrerPolicy="no-referrer"
        onLoad={onLoad}
        onError={onError}
        className={cn(
          "block size-[1.2em] rounded-full object-contain transition-opacity duration-150 motion-reduce:transition-none",
          state === "loaded" ? "opacity-100" : "opacity-0",
        )}
      />
    </a>
  );
}

function ImageView({ image, grid }: { image: ResponseImage; grid: boolean }) {
  const { Image: Custom } = React.useContext(ResponseComponentsContext);
  const { ref, state, onLoad, onError } = useLoaded();
  if (Custom) return <Custom {...image} variant={grid ? "grid" : "single"} />;
  if (state === "failed") return null;
  return (
    <figure className="flex min-w-0 flex-col gap-[0.45em]">
      <a
        href={image.src}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "group/image focus-visible:ring-ring/50 relative block overflow-hidden rounded-[0.8em] outline-none focus-visible:ring-2",
          grid ? "aspect-[4/3]" : state === "loaded" ? "" : "aspect-[16/9]",
          state === "loading" && "bg-foreground/[0.05] motion-safe:animate-pulse",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={ref}
          src={image.src}
          alt={image.alt ?? ""}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={onLoad}
          onError={onError}
          className={cn(
            "block w-full object-cover transition-[opacity,filter,transform] duration-300 ease-out group-hover/image:scale-[1.015] motion-reduce:transition-none",
            grid ? "h-full" : "max-h-[26em]",
            state === "loaded" ? "blur-0 scale-100 opacity-100" : "scale-[1.03] opacity-0 blur-md",
          )}
        />
      </a>
      {image.caption && (
        <figcaption className="text-muted-foreground truncate text-[0.85em]">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

export function ImageGroup({ images }: { images: ResponseImage[] }) {
  if (images.length === 1) return <ImageView image={images[0]} grid={false} />;
  return (
    <div
      className={cn(
        "grid gap-[0.6em]",
        images.length % 3 === 0 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2",
      )}
    >
      {images.map((image, i) => (
        <ImageView key={image.src + i} image={image} grid />
      ))}
    </div>
  );
}

function Citation({ label, url, icons }: { label: React.ReactNode; url: URL; icons: Icons }) {
  const host = url.hostname.replace(/^www\./, "");
  const icon = icons.get(host);
  const { Link } = React.useContext(ResponseComponentsContext);
  if (Link) {
    return (
      <Link href={url.href} host={host}>
        {label}
      </Link>
    );
  }
  return (
    <a
      href={url.href}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-visible:ring-ring/50 rounded-sm outline-none focus-visible:ring-2"
    >
      <span className="text-foreground font-medium">{label}</span>
      <span
        className={cn(
          CHIP_SURFACE,
          "text-foreground/75 ml-[0.35em] inline-flex translate-y-[-0.08em] items-center gap-[0.3em] rounded-full px-[0.5em] py-[0.05em] align-middle text-[0.88em] leading-normal font-normal whitespace-nowrap",
        )}
      >
        {icon && (
          <span aria-hidden className="text-foreground inline-flex size-[0.9em] [&_svg]:size-full">
            {icon}
          </span>
        )}
        {host}
      </span>
    </a>
  );
}

function chipShowsIcon(
  text: string,
  image: RegExpMatchArray,
  next: RegExpMatchArray | undefined,
  icons: Icons,
) {
  if (!next || next[1] === undefined) return false;
  const end = (image.index ?? 0) + image[0].length;
  if (text.slice(end, next.index).trim()) return false;
  const url = safeUrl(next[2]);
  return Boolean(url && icons.get(url.hostname.replace(/^www\./, "")));
}

export function Inline({ text, icons }: { text: string; icons: Icons }): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const matches = [...text.matchAll(INLINE)];
  let last = 0;
  for (const [index, match] of matches.entries()) {
    const at = match.index ?? 0;
    const [whole, label, href, bold, bold2, code, em, em2, alt, src] = match;
    if (at > last) parts.push(text.slice(last, at));
    if (src !== undefined && chipShowsIcon(text, match, matches[index + 1], icons)) {
      last = at + whole.length;
      while (text[last] === " ") last++;
      continue;
    }
    if (src !== undefined) {
      const safe = safeSrc(src);
      parts.push(
        safe ? (
          <InlineImage key={at} src={safe} alt={alt} />
        ) : (
          <React.Fragment key={at}>{alt}</React.Fragment>
        ),
      );
    } else if (label !== undefined) {
      const url = safeUrl(href);
      parts.push(
        url ? (
          <Citation
            key={at}
            label={<Inline text={label} icons={icons} />}
            url={url}
            icons={icons}
          />
        ) : (
          <React.Fragment key={at}>{label}</React.Fragment>
        ),
      );
    } else if (bold !== undefined || bold2 !== undefined) {
      parts.push(
        <strong key={at} className="text-foreground font-semibold">
          <Inline text={bold ?? bold2} icons={icons} />
        </strong>,
      );
    } else if (code !== undefined) {
      parts.push(
        <code
          key={at}
          className="bg-foreground/[0.07] text-foreground dark:bg-foreground/[0.1] mx-[0.1em] rounded-[0.3em] box-decoration-clone px-[0.4em] py-[0.12em] font-mono text-[0.86em]"
        >
          {code}
        </code>,
      );
    } else if (em !== undefined || em2 !== undefined) {
      parts.push(
        <em key={at} className="italic">
          <Inline text={em ?? em2} icons={icons} />
        </em>,
      );
    } else {
      parts.push(whole);
    }
    last = at + whole.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function ContentBlock({ block, icons }: { block: ResponseContent; icons: Icons }) {
  switch (block.type) {
    case "heading":
      return (
        <h3 className="text-foreground pt-[0.2em] text-[1.05em] font-semibold">
          <Inline text={block.text} icons={icons} />
        </h3>
      );
    case "list":
      return block.ordered ? (
        <ol className="flex flex-col gap-[0.45em]">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-[0.6em]">
              <span className="text-muted-foreground min-w-[1.1em] shrink-0 tabular-nums">
                {i + 1}.
              </span>
              <span className="min-w-0">
                <Inline text={item} icons={icons} />
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="flex flex-col gap-[0.45em]">
          {block.items.map((item, i) => (
            <li key={i}>
              <Inline text={item} icons={icons} />
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="border-border text-muted-foreground border-l-2 pl-[0.9em]">
          <Inline text={block.text} icons={icons} />
        </blockquote>
      );
    case "code":
      return <Code code={block.code} language={block.language} />;
    case "images":
      return <ImageGroup images={block.images} />;
    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[0.95em]">
            <thead>
              <tr>
                {block.header.map((cell, i) => (
                  <th
                    key={i}
                    className="border-border text-foreground border-b py-[0.45em] pr-[1em] font-medium"
                  >
                    <Inline text={cell} icons={icons} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      className="border-border/60 border-b py-[0.45em] pr-[1em] align-top"
                    >
                      <Inline text={cell} icons={icons} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return (
        <p>
          <Inline text={block.text} icons={icons} />
        </p>
      );
  }
}
