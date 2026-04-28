import { ArrowRightLeft } from "lucide-react";
import type { SwapInfo } from "@/data/feed";

type Props = { swap: SwapInfo; onCTA?: () => void };

export function SwapSuggestionCard({ swap, onCTA }: Props) {
  return (
    <div className="snap-item relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-background to-background" />
      <div className="relative flex h-full w-full flex-col justify-center gap-6 px-6 pb-32 pt-32">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-cyan-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">
          <ArrowRightLeft className="h-3 w-3" /> Smart Swap
        </span>
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/40 bg-surface/50 p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Currently in feed</p>
            <p className="mt-1 text-lg font-bold">{swap.from}</p>
          </div>
          <div className="flex justify-center">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
          </div>
          <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4">
            <p className="text-[10px] uppercase tracking-wider text-primary">Suggested swap</p>
            <p className="mt-1 text-lg font-bold capitalize">{swap.to}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Why: {swap.reason}.</p>
        <button
          onClick={onCTA}
          className="rounded-2xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-lg"
        >
          Show me alternatives
        </button>
      </div>
    </div>
  );
}
