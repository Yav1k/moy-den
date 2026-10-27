// Меню на 7 дней (Пн–Вс), циклически повторяется каждую неделю.
// Правь смело: замени recipeId на другой рецепт из nutritionBase.ts,
// или добавь свой рецепт туда и сошлись на него здесь.

import type { MealSlot } from "./nutritionBase";

export const DAILY_TARGETS = {
  kcal: 2300,
  protein: 170,
  fat: 70,
  carbs: 230,
};

export type DayMenu = Record<MealSlot, string>;

// Индекс 0 = понедельник ... 6 = воскресенье.
export const WEEK_MENU: DayMenu[] = [
  // Понедельник
  {
    breakfast: "b_oats_banana_3eggs",
    lunch: "l_chicken_buckwheat_mon",
    snack: "s_cottage_apple",
    dinner: "d_turkey_rice_mon",
    sweet: "sweet_chocolate_25",
  },
  // Вторник
  {
    breakfast: "b_oats_apple_3eggs",
    lunch: "l_turkey_rice_tue",
    snack: "s_cottage_banana",
    dinner: "d_hake_bulgur_tue",
    sweet: "sweet_marshmallow_2",
  },
  // Среда
  {
    breakfast: "b_oats_banana_2eggs",
    lunch: "l_pollock_bulgur_wed",
    snack: "s_cottage_apple",
    dinner: "d_chicken_buckwheat_wed",
    sweet: "sweet_candy",
  },
  // Четверг
  {
    breakfast: "b_oats_banana_3eggs",
    lunch: "l_chicken_rice_thu",
    snack: "s_cottage_banana",
    dinner: "d_turkey_bulgur_thu",
    sweet: "sweet_chocolate_25",
  },
  // Пятница
  {
    breakfast: "b_oats_apple_3eggs",
    lunch: "l_turkey_buckwheat_fri",
    snack: "s_cottage_apple",
    dinner: "d_hake_rice_potato_fri",
    sweet: "sweet_candy",
  },
  // Суббота
  {
    breakfast: "b_oats_banana_2eggs",
    lunch: "l_hake_potato_sat",
    snack: "s_cottage_banana",
    dinner: "d_chicken_bulgur_sat",
    sweet: "sweet_chocolate_20",
  },
  // Воскресенье
  {
    breakfast: "b_oats_apple_3eggs_v2",
    lunch: "l_chicken_pasta_sun",
    snack: "s_cottage_apple",
    dinner: "d_turkey_rice_sun",
    sweet: "sweet_marshmallow_1",
  },
];

/** 0 = понедельник ... 6 = воскресенье, для dateKey вида YYYY-MM-DD. */
export function weekdayIndex(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  const jsDay = new Date(y, m - 1, d).getDay(); // 0=вс..6=сб
  return (jsDay + 6) % 7;
}

export function menuForDate(dateKey: string): DayMenu {
  return WEEK_MENU[weekdayIndex(dateKey)];
}
