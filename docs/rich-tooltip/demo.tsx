import { RichTooltip } from "@/registry/clover-ui/rich-tooltip";

export function Demo() {
  return (
    <div className="flex min-h-[280px] w-full items-center justify-center gap-4 px-6 text-sm font-medium">
      <RichTooltip label="Copy link" open>
        <button type="button" className="bg-muted cursor-pointer rounded-md px-3 py-1.5">
          Copy
        </button>
      </RichTooltip>
      <RichTooltip label="Share with your team" variant="surface">
        <button type="button" className="bg-muted cursor-pointer rounded-md px-3 py-1.5">
          Share
        </button>
      </RichTooltip>
      <RichTooltip label="Delete forever" side="bottom">
        <button type="button" className="bg-muted cursor-pointer rounded-md px-3 py-1.5">
          Delete
        </button>
      </RichTooltip>
    </div>
  );
}
