import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ResponseBlock,
  responseLabel,
  parseMarkdown,
  responseToText,
  formatElapsed,
  mergeById,
} from "@/registry/clover-ui/response-block";
import { ThinkingState } from "@/registry/clover-ui/thinking-state";
import { guessLanguage, languageName } from "@/registry/clover-ui/response-block-markdown";

const text = (html) =>
  html
    .replace(/<style[^>]*>.*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
const render = (props) => renderToStaticMarkup(h(ResponseBlock, props));

const search = (status, results) => ({
  id: "s",
  type: "search",
  query: "react refs",
  status,
  results,
});
const read = (status) => ({
  id: "r",
  type: "read",
  status,
  source: { url: "https://react.dev/blog", title: "React blog" },
});

test("formatElapsed", () => {
  assert.equal(formatElapsed(undefined), "");
  assert.equal(formatElapsed(400), "0s");
  assert.equal(formatElapsed(10_500), "10s");
  assert.equal(formatElapsed(66_000), "1m 6s");
  assert.equal(formatElapsed(3_720_000), "1h 2m");
});

test("mergeById updates in place and appends new ids", () => {
  const start = [search("running"), read("running")];
  const next = mergeById(start, [
    { id: "s", status: "done" },
    { id: "n", type: "note", text: "Hi" },
  ]);
  assert.deepEqual(
    next.map((s) => s.id),
    ["s", "r", "n"],
  );
  assert.equal(next[0].status, "done");
  assert.equal(next[0].query, "react refs");
  assert.equal(start[0].status, "running");
});

test("header label follows the work", () => {
  assert.equal(responseLabel("searching", []), "Thinking");
  assert.equal(responseLabel("searching", [search("running")]), "Searching the web");
  assert.equal(responseLabel("searching", [search("done"), read("running")]), "Reading React blog");
  assert.equal(responseLabel("summarizing", [search("done")]), "Summarizing");
  assert.equal(
    responseLabel("done", [search("done"), read("done")]),
    "Searched the web, read 1 page",
  );
  assert.equal(
    responseLabel("done", [read("done"), { ...read("done"), id: "r2" }]),
    "Read 2 pages",
  );
  assert.equal(responseLabel("done", []), "Answered");
  assert.equal(responseLabel("failed", [search("done")]), "Couldn't finish");
});

test("steps show in order while working and fold away when done", () => {
  const steps = [
    { id: "n", type: "note", text: "Let me look this up." },
    search("done"),
    read("running"),
  ];
  const working = text(render({ status: "searching", steps }));
  assert.ok(
    working.indexOf("Let me look this up.") < working.indexOf("Searched the web react refs"),
  );
  assert.ok(working.indexOf("react refs") < working.lastIndexOf("Reading"));
  assert.match(working, /React blog react\.dev/);

  const done = render({ status: "done", steps: steps.map((s) => ({ ...s, status: "done" })) });
  assert.match(done, /aria-expanded="false"/);
  assert.ok(!text(done).includes("Let me look this up."));

  const kept = text(render({ status: "done", steps, collapseWhenDone: false }));
  assert.match(kept, /Let me look this up\./);
});

test("search results stay folded and show a count", () => {
  const results = [
    { url: "https://react.dev/a", title: "A" },
    { url: "javascript:alert(1)", title: "Bad" },
  ];
  const html = render({ status: "searching", steps: [search("done", results)] });
  assert.ok(!/results?\b/.test(text(html)));
  assert.match(html, /aria-expanded="false"/);
  assert.ok(!html.includes("javascript:"));
});

test("answer blocks render text, lists and safe cited links", () => {
  const html = render({
    status: "done",
    steps: [],
    answer: [
      { type: "heading", text: "Refs" },
      {
        type: "paragraph",
        text: "Read the [docs](https://www.react.dev/x) and [this](javascript:alert(1)) <b>now</b>.",
      },
      { type: "list", items: ["One", "Two"] },
      { type: "paragraph", text: "See [Ref](https://en.wikipedia.org/wiki/Ref_(software))." },
    ],
  });
  const plain = text(html);
  assert.match(plain, /Refs/);
  assert.match(plain, /docs react\.dev/);
  assert.match(html, /href="https:\/\/www\.react\.dev\/x"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.ok(!html.includes("javascript:"));
  assert.match(plain, /and this <b>now<\/b>\./);
  assert.ok(!html.includes("<b>"));
  assert.ok(/<li[^>]*>.*?One<\/li>/.test(html));
  assert.ok(!/list-disc/.test(html));
  assert.match(html, /href="https:\/\/en\.wikipedia\.org\/wiki\/Ref_\(software\)"/);
});

test("time shows from elapsed and the orb settles when done", () => {
  const working = render({ status: "searching", steps: [search("running")], elapsed: 24_000 });
  assert.match(text(working), /24s/);
  assert.match(working, /--time-light:#7c3aed/);
  const done = render({ status: "done", steps: [search("done")], elapsed: 66_000 });
  assert.match(text(done), /1m 6s/);
  assert.match(done, /--thinking-light:#16a34a/);
  const failed = render({ status: "failed", steps: [search("done")] });
  assert.match(failed, /--thinking-light:#dc2626/);
});

test("responseToText writes plain text with links spelled out", () => {
  assert.equal(
    responseToText([
      { type: "paragraph", text: "See [docs](https://react.dev/x)." },
      { type: "list", items: ["One", "Two"] },
    ]),
    "See docs (https://react.dev/x).\n\n- One\n- Two",
  );
});

test("action bar has resend, copy and like, with no background", () => {
  const answer = "Hi";
  const working = render({ status: "summarizing", answer });
  assert.ok(!working.includes('aria-label="Copy"'));
  const full = render({ status: "done", answer, onRetry() {} });
  const order = ["Copy", "Resend"].map((label) => full.indexOf(`aria-label="${label}"`));
  assert.ok(order.every((at) => at > 0));
  assert.deepEqual(
    [...order].sort((a, b) => a - b),
    order,
  );
  for (const gone of ["Share", "Good answer", "Bad answer"]) {
    assert.ok(!full.includes(`aria-label="${gone}"`));
  }
  assert.ok(!render({ status: "done", answer }).includes('aria-label="Resend"'));
  assert.ok(!render({ status: "done", answer, actions: false }).includes('aria-label="Copy"'));
});

test("parseMarkdown picks the right block for each part", () => {
  const blocks = parseMarkdown(
    [
      "# Title",
      "Intro with **bold** and a [link](https://example.com).",
      "",
      "- one",
      "- two",
      "  continued",
      "",
      "- three",
      "",
      "1. first",
      "2) second",
      "",
      "> quoted",
      "",
      "```ts",
      "const a = 1;",
      "```",
      "",
      "| A | B |",
      "| --- | --- |",
      "| 1 | 2 |",
      "",
      "---",
      "Last line",
    ].join("\n"),
  );
  assert.deepEqual(
    blocks.map((b) => b.type),
    ["heading", "paragraph", "list", "list", "quote", "code", "table", "paragraph"],
  );
  assert.deepEqual(blocks[2].items, ["one", "two continued", "three"]);
  assert.equal(blocks[2].ordered, undefined);
  assert.deepEqual(blocks[3].items, ["first", "second"]);
  assert.equal(blocks[3].ordered, true);
  assert.equal(blocks[5].language, "ts");
  assert.equal(blocks[5].code, "const a = 1;");
  assert.deepEqual(blocks[6].header, ["A", "B"]);
  assert.deepEqual(blocks[6].rows, [["1", "2"]]);
});

test("an unfinished code fence keeps streaming text as code", () => {
  const blocks = parseMarkdown("Look:\n\n```js\nlet x = 1;");
  assert.deepEqual(
    blocks.map((b) => b.type),
    ["paragraph", "code"],
  );
  assert.equal(blocks[1].code, "let x = 1;");
});

test("markdown answers render bold, code and citations safely", () => {
  const html = render({
    status: "done",
    answer:
      "Use **Convex** with `useQuery`, see [docs](https://docs.convex.dev/x) and [bad](javascript:alert(1)). snake_case_name stays.",
  });
  assert.match(html, /<strong[^>]*>Convex<\/strong>/);
  assert.match(html, /<code[^>]*>useQuery<\/code>/);
  assert.match(html, /href="https:\/\/docs\.convex\.dev\/x"/);
  assert.ok(!html.includes("javascript:"));
  assert.match(text(html), /snake_case_name stays/);
  assert.equal(
    responseToText("**Bold** and [docs](https://a.dev) with `code`\n\n1. one\n2. two"),
    "Bold and docs (https://a.dev) with code\n\n1. one\n2. two",
  );
});

test("the collapse arrow only shows once it's done", () => {
  const steps = [search("running")];
  const working = render({ status: "searching", steps });
  assert.match(working, /disabled=""/);
  assert.ok(!working.includes("lucide-chevron-down"));
  assert.match(text(working), /react refs/);
  const done = render({ status: "done", steps: [search("done")] });
  assert.ok(!done.includes('disabled=""'));
  assert.match(done, /lucide-chevron-down/);
});

test("empty header has nothing to open", () => {
  const html = render({ status: "searching" });
  assert.match(html, /disabled/);
  assert.match(text(html), /Thinking/);
});

test("ThinkingState keeps its default and drops the shimmer when finished", () => {
  const active = renderToStaticMarkup(h(ThinkingState, {}));
  assert.match(active, /role="status"/);
  assert.match(active, /thinking-state-shimmer/);
  const complete = renderToStaticMarkup(h(ThinkingState, { status: "complete" }, "Done"));
  assert.ok(!complete.includes("thinking-state-shimmer_3s"));
  assert.match(complete, /--thinking-light:#16a34a/);
});

test("raw JSON in the answer becomes a JSON code card", () => {
  const blocks = parseMarkdown('Result:\n\n{\n  "taskId": "11",\n  "status": "completed"\n}');
  assert.deepEqual(
    blocks.map((b) => b.type),
    ["paragraph", "code"],
  );
  assert.equal(blocks[1].language, "json");
  assert.equal(blocks[1].code, '{\n  "taskId": "11",\n  "status": "completed"\n}');
  assert.equal(parseMarkdown("{not json at all}")[0].type, "paragraph");
});

test("code languages are guessed and named", () => {
  assert.equal(guessLanguage('{"a": 1}'), "json");
  assert.equal(guessLanguage("pnpm add ai"), "bash");
  assert.equal(guessLanguage("const a = 1;"), "ts");
  assert.equal(guessLanguage("hello"), "");
  assert.equal(languageName("json"), "JSON");
  assert.equal(languageName("ts"), "TypeScript");
  assert.equal(languageName("elixir"), "Elixir");
  assert.equal(languageName(undefined), "Code");
});

test("code blocks look like the docs: copy button and GitHub colors", () => {
  const html = render({ status: "done", answer: '```\n{"status": "completed"}\n```' });
  assert.match(html, /data-language="json"/);
  assert.match(html, /aria-label="Copy code"/);
  assert.match(html, /#0550ae[^"]*">&quot;status&quot;<\/span>/);
  assert.match(html, /#0a3069[^"]*">&quot;completed&quot;<\/span>/);
  const bash = render({
    status: "done",
    answer: "```bash\ncurl https://example.com # fetch\n```",
  });
  assert.match(bash, /data-language="bash"/);
  assert.match(bash, /#6e7781[^"]*"># fetch<\/span>/);
  assert.ok(!/">\/\/example\.com/.test(bash));
  const ts = render({ status: "done", answer: "```ts\nconst a = 1; // one\n```" });
  assert.match(ts, /#cf222e[^"]*">const<\/span>/);
  assert.match(ts, /#6e7781[^"]*">\/\/ one<\/span>/);
});

test("tool steps show only when reported, with meta and output", () => {
  const steps = [
    {
      id: "c",
      type: "tool",
      kind: "command",
      title: "Ran pnpm test",
      meta: "script",
      status: "done",
    },
    {
      id: "e",
      type: "tool",
      kind: "edit",
      title: "Edited company.md",
      meta: "file",
      status: "done",
      output: { code: '{"taskId": "11"}', language: "json" },
    },
  ];
  const working = render({
    status: "searching",
    steps: [{ ...steps[0], status: "running", title: "Running command" }],
  });
  assert.match(text(working), /Running command/);
  const html = render({ status: "done", steps, collapseWhenDone: false });
  const plain = text(html);
  assert.match(plain, /Ran pnpm test script/);
  assert.match(plain, /Edited company\.md file/);
  assert.match(html, /aria-expanded="false" aria-controls/);
  assert.equal(responseLabel("done", steps), "Ran 1 command, edited 1 file");
  assert.equal(
    responseLabel("done", [{ id: "s", type: "search", query: "q" }, ...steps]),
    "Searched the web, used 2 tools",
  );
  assert.equal(responseLabel("searching", [{ ...steps[0], status: "running" }]), "Ran pnpm test");
});

test("bullet lists have no markers, numbered lists keep numbers", () => {
  const html = render({ status: "done", answer: "- apple\n- pear\n\n1. one\n2. two" });
  assert.match(
    html,
    /<ul class="flex flex-col gap-\[0\.45em\]"><li>apple<\/li><li>pear<\/li><\/ul>/,
  );
  assert.match(text(html), /1\. one 2\. two/);
  assert.ok(!/list-disc|bg-muted-foreground\/60/.test(html));
});

test("anything plugged in can swap the code block and links, and restyle parts", () => {
  const Code = ({ code, language }) => h("pre", { "data-custom": language }, code);
  const Link = ({ href, host, children }) => h("a", { href, "data-host": host }, children);
  const html = render({
    status: "done",
    steps: [
      {
        id: "t",
        type: "tool",
        kind: "command",
        title: "Ran it",
        output: { code: "ok", language: "bash" },
      },
    ],
    answer: 'See [docs](https://www.example.com/a).\n\n```json\n{"a": 1}\n```',
    components: { Code, Link },
    classNames: {
      header: "my-header",
      steps: "my-steps",
      answer: "my-answer",
      actions: "my-actions",
    },
    collapseWhenDone: false,
  });
  assert.match(html, /<pre data-custom="json">\{&quot;a&quot;: 1\}<\/pre>/);
  assert.match(html, /<a href="https:\/\/www\.example\.com\/a" data-host="example\.com">docs<\/a>/);
  assert.ok(!html.includes('aria-label="Copy code"'));
  for (const name of ["my-header", "my-steps", "my-answer", "my-actions"])
    assert.ok(html.includes(name), name);
});

test("image lines become image blocks, several become one group", () => {
  const blocks = parseMarkdown(
    [
      "Look:",
      "",
      '![A clover](https://example.com/a.png "Four leaves")',
      "",
      "![One](https://example.com/1.png) ![Two](https://example.com/2.png)",
      "![Three](https://example.com/3.png)",
      "",
      "![bad](javascript:alert(1))",
    ].join("\n"),
  );
  assert.deepEqual(
    blocks.map((b) => b.type),
    ["paragraph", "images", "images"],
  );
  assert.deepEqual(blocks[1].images, [
    { src: "https://example.com/a.png", alt: "A clover", caption: "Four leaves" },
  ]);
  assert.equal(blocks[2].images.length, 3);
  assert.equal(responseToText(blocks.slice(1, 2)), "A clover (https://example.com/a.png)");
});

test("images render smoothly, inline images sit in the text", () => {
  const single = render({ status: "done", answer: "![Cat](https://example.com/cat.jpg)" });
  assert.match(single, /<figure/);
  assert.match(single, /src="https:\/\/example\.com\/cat\.jpg"/);
  assert.match(single, /referrerPolicy="no-referrer"|referrerpolicy="no-referrer"/);
  assert.match(single, /loading="lazy"/);
  assert.match(single, /<figcaption[^>]*>Cat<\/figcaption>/);
  const grid = render({
    status: "done",
    answer: "![A](https://example.com/a.png) ![B](https://example.com/b.png)",
  });
  assert.match(grid, /grid-cols-2/);
  const inline = render({
    status: "done",
    answer: "A cat ![cat](https://example.com/cat.jpg) sitting.",
  });
  assert.match(inline, /<p>A cat <a[^>]*><img[^>]*src="https:\/\/example\.com\/cat\.jpg"/);
  assert.ok(
    !render({ status: "done", answer: "![x](javascript:alert(1))" }).includes("javascript:"),
  );
});

test("anything plugged in can swap the image component", () => {
  const Image = ({ src, variant }) => h("img", { src, "data-variant": variant });
  const html = render({
    status: "done",
    answer: "![A](https://example.com/a.png)\n\nInline ![B](https://example.com/b.png) here.",
    components: { Image },
  });
  assert.match(html, /<img src="https:\/\/example\.com\/a\.png" data-variant="single"\/>/);
  assert.match(html, /<img src="https:\/\/example\.com\/b\.png" data-variant="inline"\/>/);
});

test("long summaries combine tool steps so the header stays short", () => {
  const steps = [
    { id: "s", type: "search", query: "q" },
    { id: "r", type: "read", source: { url: "https://a.dev" } },
    { id: "c", type: "tool", kind: "command", title: "Ran" },
    { id: "e", type: "tool", kind: "edit", title: "Edited" },
    { id: "t", type: "tool", kind: "task", title: "Task" },
  ];
  assert.equal(responseLabel("done", steps), "Searched the web, used 3 tools");
});

test("a failed tool turns the orb to debugging until it's fixed", () => {
  const failed = {
    id: "b1",
    type: "tool",
    kind: "command",
    title: "Build failed",
    status: "failed",
  };
  const fixing = { id: "e1", type: "tool", kind: "edit", title: "Editing", status: "running" };
  const debugging = render({ status: "searching", steps: [failed, fixing] });
  assert.match(debugging, /--thinking-light:#2563eb/);
  assert.match(debugging, /text-destructive/);
  const fixed = render({
    status: "searching",
    steps: [
      failed,
      { ...fixing, status: "done" },
      { id: "b2", type: "tool", kind: "command", title: "Build passed", status: "done" },
      { id: "c", type: "tool", kind: "command", title: "Running", status: "running" },
    ],
  });
  assert.match(fixed, /--thinking-light:#ea580c/);
});

test("a failed read says it couldn't open the page", () => {
  const html = render({
    status: "searching",
    steps: [
      { id: "r", type: "read", status: "failed", source: { url: "https://a.dev", title: "A" } },
    ],
  });
  assert.match(text(html), /Couldn't open A/);
  assert.match(html, /text-destructive/);
});

test("the time takes the color of the current orb state", () => {
  const searching = render({
    status: "searching",
    elapsed: 5000,
    steps: [{ id: "s", type: "search", query: "q", status: "running" }],
  });
  assert.match(searching, /--time-light:#7c3aed/);
  const writing = render({ status: "summarizing", elapsed: 5000, answer: "Hi" });
  assert.match(writing, /--time-light:#db2777/);
  const done = render({ status: "done", elapsed: 5000, answer: "Hi" });
  assert.ok(!done.includes("--time-light"));
  assert.match(done, /text-muted-foreground[^"]*">5s</);
  const failed = render({ status: "failed", elapsed: 5000 });
  assert.match(failed, /--time-light:#dc2626/);
});

test("a logo right before a link chip that already shows it is skipped", () => {
  const steps = [
    {
      id: "r",
      type: "read",
      status: "done",
      source: { url: "https://docs.convex.dev/x", title: "X", icon: "logo" },
    },
  ];
  const answer =
    "Following ![Convex](https://example.com/convex.png) [the docs](https://docs.convex.dev/x) and ![Other](https://example.com/o.png) [other](https://other.dev/y).";
  const html = render({ status: "done", steps, answer });
  assert.ok(!html.includes("example.com/convex.png"));
  assert.ok(html.includes("example.com/o.png"));
  assert.match(text(html), /Following the docs/);
});
