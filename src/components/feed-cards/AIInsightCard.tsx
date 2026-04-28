import { Sparkles } from "lucide-react";

export function AIInsightCard({ insight }: { insight: string }) {
  return (
    <div className="snap-item relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-background to-background" />
      <div className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
      <div className="relative flex h-full w-full flex-col justify-center gap-6 px-6 pb-32 pt-32">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          <Sparkles className="h-3 w-3" /> AI Nutritionist
        </span>
        <p className="font-display text-3xl font-bold leading-snug text-balance">
          "{insight}"
        </p>
        <p className="text-xs text-muted-foreground">
          Your feed is being tuned in the background.
        </p>
      </div>
    </div>
  );
}
