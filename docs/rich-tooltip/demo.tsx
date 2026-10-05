import { RichTooltip } from "@/registry/clover-ui/rich-tooltip";

export function Demo() {
  return (
    <div className="flex min-h-[280px] w-full items-center justify-center px-6">
      <div className="flex items-center gap-3 text-sm font-medium">
        <RichTooltip label="Turkish Airlines" badge="3h 45m" open>
          <span className="bg-muted rounded-full px-3 py-1.5">IST</span>
        </RichTooltip>
        <span className="bg-border h-px w-10" />
        <RichTooltip
          label="Change of airport"
          route={["IST", "SAW"]}
          badge="1d 2h"
          variant="surface"
        >
          <button
            type="button"
            className="bg-muted text-muted-foreground cursor-pointer rounded-full px-3 py-1.5"
          >
            Hover me
          </button>
        </RichTooltip>
        <span className="bg-border h-px w-10" />
        <RichTooltip label="Stopover in KIV" badge="1h 30m" side="bottom">
          <button type="button" className="bg-muted cursor-pointer rounded-full px-3 py-1.5">
            KIV
          </button>
        </RichTooltip>
      </div>
    </div>
  );
}
