type Props = {
  protein: number;
  carbs: number;
  fat: number;
  compact?: boolean;
};

// Caloric weights: protein 4, carbs 4, fat 9
export function MacroBar({ protein, carbs, fat, compact }: Props) {
  const pCal = protein * 4;
  const cCal = carbs * 4;
  const fCal = fat * 9;
  const total = pCal + cCal + fCal || 1;
  const pPct = (pCal / total) * 100;
  const cPct = (cCal / total) * 100;
  const fPct = (fCal / total) * 100;

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <div className={`flex w-full overflow-hidden rounded-full ${compact ? "h-1.5" : "h-2.5"}`}>
        <div style={{ width: `${pPct}%`, backgroundColor: "var(--color-protein)" }} />
        <div style={{ width: `${cPct}%`, backgroundColor: "var(--color-carbs)" }} />
        <div style={{ width: `${fPct}%`, backgroundColor: "var(--color-fat)" }} />
      </div>
      {!compact && (
        <div className="flex justify-between text-xs font-medium tabular-nums">
          <span style={{ color: "var(--color-protein)" }}>P {protein}g</span>
          <span style={{ color: "var(--color-carbs)" }}>C {carbs}g</span>
          <span style={{ color: "var(--color-fat)" }}>F {fat}g</span>
        </div>
      )}
    </div>
  );
}
