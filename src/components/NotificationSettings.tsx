"use client";

import { useState } from "react";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";

export function NotificationSettings({ userId }: { userId: string }) {
  const {
    loading,
    supported,
    subscribed,
    toggleSubscription,
    dailyReminderTime,
    dailyReminderEnabled,
    saveDailyReminder,
    weeklyReviewTime,
    weeklyReviewEnabled,
    saveWeeklyReview,
  } = useNotificationSettings(userId);

  const [pending, setPending] = useState(false);
  const [denied, setDenied] = useState(false);

  if (!supported || loading) return null;

  async function handleToggle() {
    setPending(true);
    setDenied(false);
    const result = await toggleSubscription();
    if (result === false) setDenied(true);
    setPending(false);
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-text">Уведомления</h2>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {subscribed ? "Push-уведомления включены" : "Push-уведомления выключены"}
        </p>
        <button
          onClick={handleToggle}
          disabled={pending}
          className={`shrink-0 rounded-xl px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
            subscribed
              ? "border border-border bg-surface2 text-text hover:bg-border"
              : "bg-accent text-accent-fg"
          }`}
        >
          {subscribed ? "Выключить" : "Включить"}
        </button>
      </div>

      {denied && (
        <p className="mt-2 text-xs text-red-500">
          Разрешение на уведомления не выдано. Проверьте настройки браузера/устройства для
          этого сайта.
        </p>
      )}

      {subscribed && (
        <>
          <div className="mt-3 border-t border-border pt-3">
            <label className="flex items-center justify-between gap-3 text-sm text-text">
              <span>Ежедневное напоминание про привычки</span>
              <input
                type="checkbox"
                className="task-checkbox"
                checked={dailyReminderEnabled}
                onChange={(e) => saveDailyReminder(dailyReminderTime, e.target.checked)}
              />
            </label>
            {dailyReminderEnabled && (
              <input
                type="time"
                value={dailyReminderTime ?? ""}
                onChange={(e) => saveDailyReminder(e.target.value || null, true)}
                className="mt-2 w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text outline-none focus:border-accent"
              />
            )}
          </div>

          <div className="mt-3 border-t border-border pt-3">
            <label className="flex items-center justify-between gap-3 text-sm text-text">
              <span>Итоги недели по воскресеньям</span>
              <input
                type="checkbox"
                className="task-checkbox"
                checked={weeklyReviewEnabled}
                onChange={(e) => saveWeeklyReview(weeklyReviewTime, e.target.checked)}
              />
            </label>
            {weeklyReviewEnabled && (
              <input
                type="time"
                value={weeklyReviewTime ?? ""}
                onChange={(e) => saveWeeklyReview(e.target.value || null, true)}
                className="mt-2 w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text outline-none focus:border-accent"
              />
            )}
          </div>

          <p className="mt-3 text-xs text-muted">
            Напоминания по задачам со временем и отдельным привычкам настраиваются там же, где
            вы их создаёте.
          </p>
        </>
      )}
    </section>
  );
}
