export function StatsPanel({
  stats,
}: {
  stats: { todayTotal: number; todayDone: number; weekTotal: number; weekDone: number; streak: number };
}) {
  const items = [
    {
      label: "Сегодня",
      value: `${stats.todayDone}/${stats.todayTotal}`,
    },
    {
      label: "За неделю",
      value: `${stats.weekDone}/${stats.weekTotal}`,
    },
    {
      label: "Серия дней",
      value: `${stats.streak} 🔥`,
    },
  ];

  return (
    <section className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-border bg-surface p-3 text-center"
        >
          <p className="text-lg font-semibold text-text">{item.value}</p>
          <p className="mt-0.5 text-xs text-muted">{item.label}</p>
        </div>
      ))}
    </section>
  );
}
