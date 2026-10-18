import { ResponseBlock } from "@/registry/clover-ui/response-block";

export function Demo() {
  return (
    <ResponseBlock
      status="done"
      elapsed={66_000}
      steps={[
        { id: "1", type: "search", query: "realtime ai chat streaming", status: "done" },
        {
          id: "2",
          type: "read",
          status: "done",
          source: { url: "https://docs.convex.dev/realtime", title: "Convex Realtime" },
        },
      ]}
      answer={[
        {
          type: "paragraph",
          text: "Convex keeps every open chat in sync on its own. See the [realtime docs](https://docs.convex.dev/realtime).",
        },
      ]}
      className="max-w-sm"
    />
  );
}
