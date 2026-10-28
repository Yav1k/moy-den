export function ProgressBar({ label, value, target, unit }: { label: string; value: number; target: number; unit: string }) {
  const ratio = target > 0 ? Math.min(1, value / target) : 0;
  const over = value > target;
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className={over ? "text-danger" : "text-text"}>
          {Math.round(value)} / {target} {unit}
        </span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-surface2">
        <div
          className={`h-2 rounded-full transition-all ${over ? "bg-danger" : "bg-primary"}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
