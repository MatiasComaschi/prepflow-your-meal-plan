import { TrendingUp } from "lucide-react";
import type { MacroGap } from "@/data/feed";

type Props = {
  gap: MacroGap;
  onCTA?: () => void;
};

const LABEL: Record<MacroGap["largest"], string> = {
  protein: "Protein",
  carbs: "Carbs",
  fat: "Fat",
};

const ACCENT: Record<MacroGap["largest"], string> = {
  protein: "from-rose-500/30 to-rose-700/10",
  carbs: "from-amber-500/30 to-amber-700/10",
  fat: "from-violet-500/30 to-violet-700/10",
};

export function MacroCheckCard({ gap, onCTA }: Props) {
  const macro = gap.largest;
  return (
    <div className="snap-item relative h-full w-full overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${ACCENT[macro]}`} />
      <div className="absolute inset-0 bg-background/60 backdrop-blur-2xl" />
      <div className="relative flex h-full w-full flex-col justify-center gap-6 px-6 pb-32 pt-32">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          <TrendingUp className="h-3 w-3" /> Weekly Macro Check
        </span>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            You're short on {LABEL[macro].toLowerCase()} this week
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            About {Math.round(gap[macro])}g {LABEL[macro].toLowerCase()} away from your weekly target.
            Let's plug the gap.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["protein", "carbs", "fat"] as const).map((m) => (
            <div
              key={m}
              className={`rounded-2xl border p-3 ${
                m === macro ? "border-primary/60 bg-primary/10" : "border-border/40 bg-surface/40"
              }`}
            >
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{m}</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{Math.round(gap[m])}g</p>
              <p className="text-[10px] text-muted-foreground">to go</p>
            </div>
          ))}
        </div>
        <button
          onClick={onCTA}
          className="rounded-2xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-lg"
        >
          Find a {LABEL[macro].toLowerCase()}-rich meal
        </button>
      </div>
    </div>
  );
}
