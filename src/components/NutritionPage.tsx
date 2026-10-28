"use client";

import { useState } from "react";
import Link from "next/link";
import { useMealData } from "@/hooks/useMealData";
import { ProgressBar } from "./ProgressBar";
import { BottomNav } from "./BottomNav";
import { formatHuman } from "@/lib/date";
import { todayKey } from "@/lib/date";
import {
  MEAL_SLOT_ORDER,
  MEAL_SLOT_LABELS,
  RECIPES,
  getRecipe,
  recipeMacros,
  INGREDIENTS,
  type MealSlot,
} from "@/data/nutritionBase";
import { DAILY_TARGETS } from "@/data/menu";
import type { MealStatus } from "@/lib/supabase/types";

const STATUS_LABELS: Record<MealStatus, string> = {
  pending: "Не ел",
  eaten: "Съел",
  half: "Наполовину",
  skipped: "Пропустил",
};

function recipesForSlot(slot: MealSlot) {
  return Object.values(RECIPES).filter((r) => r.mealSlot === slot);
}

export function NutritionPage({ userId }: { userId: string }) {
  const today = todayKey();
  const { loading, menu, recipeIdForSlot, statusForSlot, setStatus, replaceMeal, resetToDefault, totals } = useMealData(userId, today);
  const [swapOpen, setSwapOpen] = useState<MealSlot | null>(null);
  const [openRecipe, setOpenRecipe] = useState<MealSlot | null>(null);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-28 pt-6 sm:px-6">
      <header className="flex items-center gap-2">
        <Link
          href="/"
          aria-label="Назад"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text transition hover:bg-surface2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text">Рацион</h1>
          <p className="text-sm text-muted">{formatHuman(today)}</p>
        </div>
      </header>

      {loading ? (
        <p className="py-10 text-center text-sm text-muted">Загрузка...</p>
      ) : (
        <div className="mt-5 space-y-4">
          {MEAL_SLOT_ORDER.map((slot) => {
            const recipeId = recipeIdForSlot(slot);
            const recipe = getRecipe(recipeId);
            if (!recipe) return null;
            const macros = recipeMacros(recipe);
            const status = statusForSlot(slot);
            const isDefault = recipeId === menu[slot];
            const alternatives = recipesForSlot(slot)
              .filter((r) => r.id !== recipeId)
              .sort((a, b) => Math.abs(recipeMacros(a).kcal - macros.kcal) - Math.abs(recipeMacros(b).kcal - macros.kcal));

            return (
              <section key={slot} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">{MEAL_SLOT_LABELS[slot]}</p>
                    <h2 className="mt-0.5 text-base font-semibold text-text">{recipe.title}</h2>
                    <p className="mt-0.5 text-xs text-muted">
                      {macros.kcal} ккал · Б{macros.protein} · Ж{macros.fat} · У{macros.carbs} · {recipe.cookTimeMin} мин
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(["pending", "half", "eaten"] as MealStatus[]).map((s) => {
                    const active = status === s;
                    const activeClasses = s === "pending" ? "border-primary bg-primary/10 text-primary" : "border-success bg-success/10 text-success";
                    return (
                      <button
                        key={s}
                        onClick={() => setStatus(slot, s)}
                        className={`rounded-full border px-3 py-1 text-xs transition ${
                          active ? activeClasses : "border-border text-muted hover:bg-surface2"
                        }`}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  <button onClick={() => setOpenRecipe(openRecipe === slot ? null : slot)} className="font-medium text-primary hover:underline">
                    Рецепт {openRecipe === slot ? "▲" : "▼"}
                  </button>
                  <button onClick={() => setSwapOpen(swapOpen === slot ? null : slot)} className="font-medium text-muted hover:text-primary">
                    Заменить
                  </button>
                  {!isDefault && (
                    <button onClick={() => resetToDefault(slot)} className="text-muted hover:text-primary">
                      Вернуть по умолчанию
                    </button>
                  )}
                </div>

                {openRecipe === slot && (
                  <div className="mt-3 border-t border-border pt-3 text-sm text-text">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">Ингредиенты</p>
                    <ul className="mt-1 space-y-0.5">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i} className="text-sm text-text">
                          {INGREDIENTS[ing.ingredientId]?.name ?? ing.ingredientId} — {ing.grams} г
                          {ing.note ? ` (${ing.note})` : ""}
                        </li>
                      ))}
                    </ul>
                    {recipe.steps.length > 0 && (
                      <>
                        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted">Приготовление</p>
                        <ol className="mt-1 list-decimal space-y-0.5 pl-4">
                          {recipe.steps.map((step, i) => (
                            <li key={i} className="text-sm text-text">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </>
                    )}
                    {recipe.prepAheadNote && <p className="mt-2 text-xs text-muted">{recipe.prepAheadNote}</p>}
                  </div>
                )}

                {swapOpen === slot && (
                  <div className="mt-3 space-y-1 border-t border-border pt-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">Заменить на</p>
                    {alternatives.map((alt) => {
                      const altMacros = recipeMacros(alt);
                      return (
                        <button
                          key={alt.id}
                          onClick={() => {
                            replaceMeal(slot, alt.id);
                            setSwapOpen(null);
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left text-sm transition hover:bg-surface2"
                        >
                          <span className="text-text">{alt.title}</span>
                          <span className="text-xs text-muted">{altMacros.kcal} ккал</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}

          <section className="rounded-2xl border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold text-text">Итог за день</h2>
            <div className="mt-3 space-y-2">
              <ProgressBar label="Калории" value={totals.kcal} target={DAILY_TARGETS.kcal} unit="ккал" />
              <ProgressBar label="Белок" value={totals.protein} target={DAILY_TARGETS.protein} unit="г" />
              <ProgressBar label="Жиры" value={totals.fat} target={DAILY_TARGETS.fat} unit="г" />
              <ProgressBar label="Углеводы" value={totals.carbs} target={DAILY_TARGETS.carbs} unit="г" />
            </div>
          </section>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
