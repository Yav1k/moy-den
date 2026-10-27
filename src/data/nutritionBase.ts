// База продуктов и рецептов для раздела «Рацион».
// КБЖУ считается автоматически из граммовки ингредиентов (значения на 100 г
// сырого/сухого продукта, стандартные справочные данные) — если меняешь
// граммовку рецепта, калории и БЖУ в приложении пересчитаются сами.
// Правь смело: добавляй ингредиенты, меняй граммы, добавляй новые рецепты.

export type MealSlot = "breakfast" | "lunch" | "snack" | "dinner" | "sweet";

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  snack: "Перекус",
  dinner: "Ужин",
  sweet: "Сладкое",
};

// Целевая калорийность и порядок приёмов пищи за день (сушка, 2300 ккал).
export const MEAL_SLOT_ORDER: MealSlot[] = ["breakfast", "lunch", "snack", "dinner", "sweet"];

export type Ingredient = {
  id: string;
  name: string;
  kcal100: number;
  protein100: number;
  fat100: number;
  carbs100: number;
};

export const INGREDIENTS: Record<string, Ingredient> = {
  oats: { id: "oats", name: "Овсянка (сухая)", kcal100: 389, protein100: 16.9, fat100: 6.9, carbs100: 66.3 },
  egg: { id: "egg", name: "Яйцо куриное", kcal100: 155, protein100: 12.6, fat100: 10.6, carbs100: 1.1 },
  banana: { id: "banana", name: "Банан", kcal100: 89, protein100: 1.1, fat100: 0.3, carbs100: 22.8 },
  apple: { id: "apple", name: "Яблоко", kcal100: 52, protein100: 0.3, fat100: 0.2, carbs100: 13.8 },
  chicken_breast: { id: "chicken_breast", name: "Куриная грудка (сырая)", kcal100: 165, protein100: 31, fat100: 3.6, carbs100: 0 },
  turkey_breast: { id: "turkey_breast", name: "Филе индейки (сырое)", kcal100: 84, protein100: 19.2, fat100: 0.7, carbs100: 0 },
  pollock: { id: "pollock", name: "Минтай (сырой)", kcal100: 72, protein100: 15.9, fat100: 0.9, carbs100: 0 },
  hake: { id: "hake", name: "Хек (сырой)", kcal100: 86, protein100: 16.6, fat100: 2.2, carbs100: 0 },
  buckwheat: { id: "buckwheat", name: "Гречка (сухая)", kcal100: 313, protein100: 12.6, fat100: 3.3, carbs100: 62.1 },
  rice: { id: "rice", name: "Рис белый (сухой)", kcal100: 344, protein100: 6.7, fat100: 0.7, carbs100: 78.9 },
  bulgur: { id: "bulgur", name: "Булгур (сухой)", kcal100: 342, protein100: 12.3, fat100: 1.3, carbs100: 75.9 },
  potato: { id: "potato", name: "Картофель (сырой)", kcal100: 77, protein100: 2, fat100: 0.1, carbs100: 16.3 },
  pasta: { id: "pasta", name: "Макароны тв. сортов (сухие)", kcal100: 344, protein100: 10.4, fat100: 1.1, carbs100: 71.5 },
  cottage_cheese_5: { id: "cottage_cheese_5", name: "Творог 5%", kcal100: 121, protein100: 17.2, fat100: 5, carbs100: 1.8 },
  veg_oil: { id: "veg_oil", name: "Растительное масло", kcal100: 899, protein100: 0, fat100: 99.9, carbs100: 0 },
  vegetables_mixed: { id: "vegetables_mixed", name: "Овощи (огурцы/помидоры/капуста/перец)", kcal100: 27, protein100: 1.3, fat100: 0.2, carbs100: 5 },
  chocolate_dark: { id: "chocolate_dark", name: "Тёмный шоколад 70%", kcal100: 546, protein100: 7.8, fat100: 38, carbs100: 46 },
  marshmallow: { id: "marshmallow", name: "Зефир", kcal100: 326, protein100: 0.8, fat100: 0.2, carbs100: 78.3 },
  candy: { id: "candy", name: "Конфеты (карамель/шоколадные, усреднённо)", kcal100: 380, protein100: 2, fat100: 8, carbs100: 76 },
};

export type RecipeIngredient = { ingredientId: string; grams: number; note?: string };

export type Macros = { kcal: number; protein: number; fat: number; carbs: number };

export function computeMacros(ingredients: RecipeIngredient[]): Macros {
  return ingredients.reduce(
    (acc, { ingredientId, grams }) => {
      const ing = INGREDIENTS[ingredientId];
      if (!ing) return acc;
      const factor = grams / 100;
      return {
        kcal: acc.kcal + ing.kcal100 * factor,
        protein: acc.protein + ing.protein100 * factor,
        fat: acc.fat + ing.fat100 * factor,
        carbs: acc.carbs + ing.carbs100 * factor,
      };
    },
    { kcal: 0, protein: 0, fat: 0, carbs: 0 }
  );
}

export function roundMacros(m: Macros): Macros {
  return {
    kcal: Math.round(m.kcal),
    protein: Math.round(m.protein * 10) / 10,
    fat: Math.round(m.fat * 10) / 10,
    carbs: Math.round(m.carbs * 10) / 10,
  };
}

export type Recipe = {
  id: string;
  title: string;
  mealSlot: MealSlot;
  cookTimeMin: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  prepAheadNote?: string;
};

export const RECIPES: Record<string, Recipe> = {
  // --- Завтраки: овсянка + фрукт + яйца, вариации по базовому меню ---
  b_oats_banana_3eggs: {
    id: "b_oats_banana_3eggs",
    title: "Овсянка с бананом и омлет из 3 яиц",
    mealSlot: "breakfast",
    cookTimeMin: 15,
    ingredients: [
      { ingredientId: "oats", grams: 60 },
      { ingredientId: "banana", grams: 120 },
      { ingredientId: "egg", grams: 165, note: "3 шт" },
    ],
    steps: [
      "Овсянку залить кипятком или сварить на воде 3–5 мин.",
      "Яйца взбить вилкой, вылить на сухую/антипригарную сковороду, жарить под крышкой 3–4 мин.",
      "Банан — к овсянке, омлет — отдельно.",
    ],
  },
  b_oats_apple_3eggs: {
    id: "b_oats_apple_3eggs",
    title: "Овсянка с яблоком и омлет из 3 яиц",
    mealSlot: "breakfast",
    cookTimeMin: 15,
    ingredients: [
      { ingredientId: "oats", grams: 60 },
      { ingredientId: "apple", grams: 150 },
      { ingredientId: "egg", grams: 165, note: "3 шт" },
    ],
    steps: [
      "Овсянку залить кипятком или сварить на воде 3–5 мин.",
      "Яблоко порезать кубиком, добавить в кашу.",
      "Яйца взбить, пожарить омлет на сухой сковороде 3–4 мин под крышкой.",
    ],
  },
  b_oats_banana_2eggs: {
    id: "b_oats_banana_2eggs",
    title: "Овсянка с бананом и 2 яйцами",
    mealSlot: "breakfast",
    cookTimeMin: 15,
    ingredients: [
      { ingredientId: "oats", grams: 70 },
      { ingredientId: "banana", grams: 100 },
      { ingredientId: "egg", grams: 110, note: "2 шт" },
    ],
    steps: [
      "Овсянку залить кипятком или сварить на воде 3–5 мин.",
      "Яйца сварить вкрутую (8 мин) или пожарить омлет.",
      "Банан порезать в кашу или съесть отдельно.",
    ],
  },
  b_oats_apple_3eggs_v2: {
    id: "b_oats_apple_3eggs_v2",
    title: "Овсянка с яблоком (порция меньше) и омлет из 3 яиц",
    mealSlot: "breakfast",
    cookTimeMin: 15,
    ingredients: [
      { ingredientId: "oats", grams: 50 },
      { ingredientId: "apple", grams: 200 },
      { ingredientId: "egg", grams: 165, note: "3 шт" },
    ],
    steps: [
      "Овсянку залить кипятком или сварить на воде 3–5 мин.",
      "Яблоко — отдельно или в кашу, можно запечь 5 мин в микроволновке с корицей.",
      "Яйца взбить и пожарить омлет 3–4 мин под крышкой.",
    ],
  },

  // --- Перекусы: творог + фрукт ---
  s_cottage_apple: {
    id: "s_cottage_apple",
    title: "Творог с яблоком",
    mealSlot: "snack",
    cookTimeMin: 2,
    ingredients: [
      { ingredientId: "cottage_cheese_5", grams: 200 },
      { ingredientId: "apple", grams: 150 },
    ],
    steps: ["Яблоко порезать, смешать с творогом или съесть рядом."],
  },
  s_cottage_banana: {
    id: "s_cottage_banana",
    title: "Творог с бананом",
    mealSlot: "snack",
    cookTimeMin: 2,
    ingredients: [
      { ingredientId: "cottage_cheese_5", grams: 200 },
      { ingredientId: "banana", grams: 120 },
    ],
    steps: ["Банан порезать, смешать с творогом или съесть рядом."],
  },

  // --- Обеды ---
  l_chicken_buckwheat_mon: {
    id: "l_chicken_buckwheat_mon",
    title: "Куриная грудка с гречкой",
    mealSlot: "lunch",
    cookTimeMin: 25,
    ingredients: [
      { ingredientId: "chicken_breast", grams: 200 },
      { ingredientId: "buckwheat", grams: 60 },
      { ingredientId: "vegetables_mixed", grams: 200 },
      { ingredientId: "veg_oil", grams: 10, note: "1 ст. л." },
    ],
    steps: [
      "Гречку залить кипятком 1:2 и варить 15 мин под крышкой.",
      "Грудку нарезать, обжарить на масле 10–12 мин до готовности, посолить/поперчить.",
      "Овощи нарезать свежими или быстро обжарить 3–4 мин.",
    ],
    prepAheadNote: "Гречку и курицу можно приготовить сразу на 2–3 дня и разогревать.",
  },
  l_turkey_rice_tue: {
    id: "l_turkey_rice_tue",
    title: "Индейка с рисом",
    mealSlot: "lunch",
    cookTimeMin: 25,
    ingredients: [
      { ingredientId: "turkey_breast", grams: 200 },
      { ingredientId: "rice", grams: 90 },
      { ingredientId: "vegetables_mixed", grams: 200 },
      { ingredientId: "veg_oil", grams: 10, note: "1 ст. л." },
    ],
    steps: [
      "Рис промыть, варить 12–15 мин в подсоленной воде.",
      "Индейку нарезать кубиком, обжарить на масле 10 мин.",
      "Подавать с нарезанными овощами.",
    ],
    prepAheadNote: "Рис хорошо хранится 2–3 дня в холодильнике.",
  },
  l_pollock_bulgur_wed: {
    id: "l_pollock_bulgur_wed",
    title: "Минтай с булгуром",
    mealSlot: "lunch",
    cookTimeMin: 25,
    ingredients: [
      { ingredientId: "pollock", grams: 250 },
      { ingredientId: "bulgur", grams: 70 },
      { ingredientId: "vegetables_mixed", grams: 200 },
      { ingredientId: "veg_oil", grams: 10, note: "1 ст. л." },
    ],
    steps: [
      "Булгур залить кипятком 1:2, настоять под крышкой 15 мин (или варить 10 мин).",
      "Минтай посолить, обжарить на масле по 4–5 мин с каждой стороны или запечь 15 мин.",
      "Подавать с овощами.",
    ],
  },
  l_chicken_rice_thu: {
    id: "l_chicken_rice_thu",
    title: "Куриная грудка с рисом",
    mealSlot: "lunch",
    cookTimeMin: 25,
    ingredients: [
      { ingredientId: "chicken_breast", grams: 200 },
      { ingredientId: "rice", grams: 70 },
      { ingredientId: "vegetables_mixed", grams: 200 },
      { ingredientId: "veg_oil", grams: 10, note: "1 ст. л." },
    ],
    steps: [
      "Рис промыть, варить 12–15 мин.",
      "Грудку нарезать, обжарить на масле 10–12 мин.",
      "Подавать с овощами.",
    ],
  },
  l_turkey_buckwheat_fri: {
    id: "l_turkey_buckwheat_fri",
    title: "Индейка с гречкой",
    mealSlot: "lunch",
    cookTimeMin: 25,
    ingredients: [
      { ingredientId: "turkey_breast", grams: 220 },
      { ingredientId: "buckwheat", grams: 70 },
      { ingredientId: "vegetables_mixed", grams: 200 },
      { ingredientId: "veg_oil", grams: 10, note: "1 ст. л." },
    ],
    steps: [
      "Гречку залить кипятком 1:2, варить 15 мин под крышкой.",
      "Индейку нарезать, обжарить на масле 10 мин.",
      "Подавать с овощами.",
    ],
  },
  l_hake_potato_sat: {
    id: "l_hake_potato_sat",
    title: "Хек с картофелем",
    mealSlot: "lunch",
    cookTimeMin: 30,
    ingredients: [
      { ingredientId: "hake", grams: 250 },
      { ingredientId: "potato", grams: 250 },
      { ingredientId: "vegetables_mixed", grams: 150 },
      { ingredientId: "veg_oil", grams: 10, note: "1 ст. л." },
    ],
    steps: [
      "Картофель отварить 20 мин или запечь дольками 25 мин.",
      "Хек посолить, обжарить на масле 4–5 мин с каждой стороны.",
      "Подавать с овощами.",
    ],
  },
  l_chicken_pasta_sun: {
    id: "l_chicken_pasta_sun",
    title: "Куриная грудка с макаронами",
    mealSlot: "lunch",
    cookTimeMin: 25,
    ingredients: [
      { ingredientId: "chicken_breast", grams: 200 },
      { ingredientId: "pasta", grams: 70 },
      { ingredientId: "vegetables_mixed", grams: 200 },
      { ingredientId: "veg_oil", grams: 10, note: "1 ст. л." },
    ],
    steps: [
      "Макароны варить 8–10 мин по инструкции на упаковке.",
      "Грудку нарезать, обжарить на масле 10–12 мин.",
      "Смешать с овощами.",
    ],
  },

  // --- Ужины ---
  d_turkey_rice_mon: {
    id: "d_turkey_rice_mon",
    title: "Индейка с рисом",
    mealSlot: "dinner",
    cookTimeMin: 25,
    ingredients: [
      { ingredientId: "turkey_breast", grams: 200 },
      { ingredientId: "rice", grams: 90 },
      { ingredientId: "vegetables_mixed", grams: 200 },
      { ingredientId: "veg_oil", grams: 10, note: "1 ст. л." },
    ],
    steps: ["Рис отварить 12–15 мин.", "Индейку обжарить на масле 10 мин.", "Подавать с овощами."],
  },
  d_hake_bulgur_tue: {
    id: "d_hake_bulgur_tue",
    title: "Хек с булгуром",
    mealSlot: "dinner",
    cookTimeMin: 25,
    ingredients: [
      { ingredientId: "hake", grams: 250 },
      { ingredientId: "bulgur", grams: 70 },
      { ingredientId: "vegetables_mixed", grams: 200 },
      { ingredientId: "veg_oil", grams: 10, note: "1 ст. л." },
    ],
    steps: ["Булгур залить кипятком, настоять 15 мин.", "Хек обжарить 4–5 мин с каждой стороны.", "Подавать с овощами."],
  },
  d_chicken_buckwheat_wed: {
    id: "d_chicken_buckwheat_wed",
    title: "Куриная грудка с гречкой",
    mealSlot: "dinner",
    cookTimeMin: 25,
    ingredients: [
      { ingredientId: "chicken_breast", grams: 200 },
      { ingredientId: "buckwheat", grams: 90 },
      { ingredientId: "vegetables_mixed", grams: 200 },
      { ingredientId: "veg_oil", grams: 10, note: "1 ст. л." },
    ],
    steps: ["Гречку варить 15 мин под крышкой.", "Грудку обжарить на масле 10–12 мин.", "Подавать с овощами."],
  },
  d_turkey_bulgur_thu: {
    id: "d_turkey_bulgur_thu",
    title: "Индейка с булгуром",
    mealSlot: "dinner",
    cookTimeMin: 25,
    ingredients: [
      { ingredientId: "turkey_breast", grams: 200 },
      { ingredientId: "bulgur", grams: 70 },
      { ingredientId: "vegetables_mixed", grams: 200 },
    ],
    steps: ["Булгур залить кипятком, настоять 15 мин.", "Индейку обжарить на сухой/антипригарной сковороде 10 мин.", "Подавать с овощами."],
  },
  d_hake_rice_potato_fri: {
    id: "d_hake_rice_potato_fri",
    title: "Хек с рисом и картофелем",
    mealSlot: "dinner",
    cookTimeMin: 30,
    ingredients: [
      { ingredientId: "hake", grams: 250 },
      { ingredientId: "rice", grams: 70 },
      { ingredientId: "potato", grams: 100 },
      { ingredientId: "vegetables_mixed", grams: 200 },
      { ingredientId: "veg_oil", grams: 10, note: "1 ст. л." },
    ],
    steps: ["Рис и картофель отварить отдельно, 15–20 мин.", "Хек обжарить на масле 4–5 мин с каждой стороны.", "Подавать с овощами."],
  },
  d_chicken_bulgur_sat: {
    id: "d_chicken_bulgur_sat",
    title: "Куриная грудка с булгуром",
    mealSlot: "dinner",
    cookTimeMin: 25,
    ingredients: [
      { ingredientId: "chicken_breast", grams: 200 },
      { ingredientId: "bulgur", grams: 80 },
      { ingredientId: "vegetables_mixed", grams: 200 },
      { ingredientId: "veg_oil", grams: 10, note: "1 ст. л." },
    ],
    steps: ["Булгур залить кипятком, настоять 15 мин.", "Грудку обжарить на масле 10–12 мин.", "Подавать с овощами."],
  },
  d_turkey_rice_sun: {
    id: "d_turkey_rice_sun",
    title: "Индейка с рисом (воскресная)",
    mealSlot: "dinner",
    cookTimeMin: 25,
    ingredients: [
      { ingredientId: "turkey_breast", grams: 200 },
      { ingredientId: "rice", grams: 90 },
      { ingredientId: "vegetables_mixed", grams: 200 },
      { ingredientId: "veg_oil", grams: 10, note: "1 ст. л." },
    ],
    steps: ["Рис отварить 12–15 мин.", "Индейку обжарить на масле 10 мин.", "Подавать с овощами."],
  },

  // --- Сладкое (необязательно, в пределах лимита ~150 ккал) ---
  sweet_chocolate_25: {
    id: "sweet_chocolate_25",
    title: "Тёмный шоколад, 25 г",
    mealSlot: "sweet",
    cookTimeMin: 0,
    ingredients: [{ ingredientId: "chocolate_dark", grams: 25 }],
    steps: [],
  },
  sweet_chocolate_20: {
    id: "sweet_chocolate_20",
    title: "Тёмный шоколад, 20 г",
    mealSlot: "sweet",
    cookTimeMin: 0,
    ingredients: [{ ingredientId: "chocolate_dark", grams: 20 }],
    steps: [],
  },
  sweet_marshmallow_2: {
    id: "sweet_marshmallow_2",
    title: "Зефир, 40 г (~1–2 шт)",
    mealSlot: "sweet",
    cookTimeMin: 0,
    ingredients: [{ ingredientId: "marshmallow", grams: 40 }],
    steps: [],
  },
  sweet_marshmallow_1: {
    id: "sweet_marshmallow_1",
    title: "Зефир, 30 г (~1 шт)",
    mealSlot: "sweet",
    cookTimeMin: 0,
    ingredients: [{ ingredientId: "marshmallow", grams: 30 }],
    steps: [],
  },
  sweet_candy: {
    id: "sweet_candy",
    title: "Пара конфет, 35 г",
    mealSlot: "sweet",
    cookTimeMin: 0,
    ingredients: [{ ingredientId: "candy", grams: 35 }],
    steps: [],
  },
};

export function getRecipe(id: string): Recipe | undefined {
  return RECIPES[id];
}

export function recipeMacros(recipe: Recipe): Macros {
  return roundMacros(computeMacros(recipe.ingredients));
}
