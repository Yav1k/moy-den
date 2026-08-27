"use client";

import { useState } from "react";
import { useGoalsData } from "@/hooks/useGoalsData";
import { GoalCard } from "./GoalCard";
import { BottomNav } from "./BottomNav";

export function GoalsPage({ userId }: { userId: string }) {
  const { loading, goals, addGoal, setGoalValue, incrementGoal, deleteGoal } =
    useGoalsData(userId);

  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(target);
    if (!title.trim() || !Number.isFinite(num) || num <= 0) return;
    addGoal(title, num, unit);
    setTitle("");
    setTarget("");
    setUnit("");
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-28 pt-6 sm:px-6">
      <header>
        <h1 className="text-xl font-bold text-text">Долгосрочные цели</h1>
        <p className="text-sm text-muted">Отдельно от ежедневного чек-листа</p>
      </header>

      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="py-10 text-center text-sm text-muted">Загрузка...</p>
        ) : (
          <>
            {goals.length === 0 && (
              <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">
                Пока нет целей. Добавьте, например, «Прочитать книги» с целью 12 и единицей
                «книг».
              </p>
            )}
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onIncrement={incrementGoal}
                onSetValue={setGoalValue}
                onDelete={deleteGoal}
              />
            ))}

            <section className="rounded-2xl border border-dashed border-border bg-surface p-4">
              <h3 className="text-sm font-semibold text-text">Новая цель</h3>
              <form onSubmit={submit} className="mt-2 space-y-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Название, например «Прочитать книги»..."
                  className="w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text outline-none focus:border-accent"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="Цель"
                    className="w-20 shrink-0 rounded-xl border border-border bg-surface2 px-2 py-2 text-sm text-text outline-none focus:border-accent"
                  />
                  <input
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="ед. (книг, км...)"
                    className="min-w-0 flex-1 rounded-xl border border-border bg-surface2 px-2 py-2 text-sm text-text outline-none focus:border-accent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!title.trim() || !target.trim()}
                  className="w-full rounded-xl bg-accent px-3 py-2 text-sm font-medium text-accent-fg disabled:opacity-50"
                >
                  Добавить
                </button>
              </form>
            </section>
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
