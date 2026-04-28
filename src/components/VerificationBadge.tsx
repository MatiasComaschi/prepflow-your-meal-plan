import { ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import type { Verification } from "@/data/recipes";

const cfg = {
  verified: {
    icon: ShieldCheck,
    label: "Verified",
    cls: "bg-primary/15 text-primary border-primary/40",
  },
  ai: {
    icon: Sparkles,
    label: "AI Estimate",
    cls: "bg-[oklch(0.78_0.15_280/0.15)] text-[oklch(0.85_0.15_280)] border-[oklch(0.78_0.15_280/0.4)]",
  },
  unverified: {
    icon: AlertCircle,
    label: "Not Verified",
    cls: "bg-muted/50 text-muted-foreground border-border",
  },
} as const;

export function VerificationBadge({ kind }: { kind: Verification }) {
  const c = cfg[kind];
  const Icon = c.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur ${c.cls}`}
    >
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}
