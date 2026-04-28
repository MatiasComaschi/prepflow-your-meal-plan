import { Flame } from "lucide-react";
import { Link } from "@tanstack/react-router";

type Props = { streak: number; daysPlanned: number };

export function StreakCard({ streak, daysPlanned }: Props) {
  const isHot = streak >= 2;
  return (
    <div className="snap-item relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-background to-background" />
      <div className="absolute right-[-4rem] top-1/4 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="relative flex h-full w-full flex-col justify-center gap-6 px-6 pb-32 pt-32">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-orange-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-300">
          <Flame className="h-3 w-3" /> Prep Streak
        </span>
        <div className="flex items-baseline gap-3">
          <span className="font-display text-[8rem] font-bold leading-none tabular-nums text-foreground">
            {streak}
          </span>
          <span className="text-sm text-muted-foreground">
            {streak === 1 ? "week" : "weeks"} in a row
          </span>
        </div>
        <p className="text-base text-foreground/90">
          {isHot
            ? `You've planned ${daysPlanned} day${daysPlanned === 1 ? "" : "s"} this week. Keep the fire going.`
            : `Plan one more day this week to start your streak.`}
        </p>
        <Link
          to="/planner"
          className="rounded-2xl bg-primary px-5 py-3.5 text-center text-sm font-bold text-primary-foreground shadow-lg"
        >
          Plan another day
        </Link>
      </div>
    </div>
  );
}
