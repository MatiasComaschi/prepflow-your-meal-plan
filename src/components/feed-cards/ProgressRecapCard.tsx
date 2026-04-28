import { CalendarCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Progress } from "@/components/ui/progress";

type Props = {
  planned: number;
  goalDays: number;
  topMacro: "protein" | "carbs" | "fat";
  coverage: number;
};

export function ProgressRecapCard({ planned, goalDays, topMacro, coverage }: Props) {
  const pct = Math.round(coverage * 100);
  return (
    <div className="snap-item relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/25 via-background to-background" />
      <div className="relative flex h-full w-full flex-col justify-center gap-6 px-6 pb-32 pt-32">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
          <CalendarCheck className="h-3 w-3" /> Weekly Recap
        </span>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            {planned}/{goalDays} days planned
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Biggest macro to focus on: <span className="capitalize text-foreground">{topMacro}</span>
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Week coverage</span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <Progress value={pct} />
        </div>
        <Link
          to="/planner"
          className="rounded-2xl bg-primary px-5 py-3.5 text-center text-sm font-bold text-primary-foreground shadow-lg"
        >
          Open weekly planner
        </Link>
      </div>
    </div>
  );
}
