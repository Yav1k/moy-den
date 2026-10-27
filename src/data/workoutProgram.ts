// Программа домашних тренировок (разборные гантели до 25–30 кг, турник, резинки).
// Правь смело: меняй упражнения, подходы, повторы — экран тренировки читает отсюда.

export type DayType = "upper" | "lower" | "rest";

export const DAY_TYPE_LABELS: Record<DayType, string> = {
  upper: "Верх",
  lower: "Низ + пресс",
  rest: "Отдых",
};

// Индекс 0 = понедельник ... 6 = воскресенье.
export const WEEKLY_SCHEDULE: DayType[] = ["upper", "lower", "rest", "upper", "lower", "rest", "rest"];

export function weekdayIndex(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  const jsDay = new Date(y, m - 1, d).getDay(); // 0=вс..6=сб
  return (jsDay + 6) % 7;
}

export function dayTypeFor(dateKey: string): DayType {
  return WEEKLY_SCHEDULE[weekdayIndex(dateKey)];
}

export type TrackingType = "reps" | "seconds";

export type WorkoutExercise = {
  id: string;
  title: string;
  sets: number;
  repsLabel: string; // как показываем в UI: "8-15", "макс", "до отказа"
  trackingType: TrackingType; // что вводим в поле подхода: повторы или секунды
  perSide: boolean; // счёт идёт на каждую сторону отдельно
  restSeconds: 90 | 60;
  substitution?: string;
  progression?: string;
  techniqueTip: string[];
  mainMistake: string;
};

export const PROGRAM: Record<"upper" | "lower", WorkoutExercise[]> = {
  upper: [
    {
      id: "pushups",
      title: "Отжимания",
      sets: 4,
      repsLabel: "8-15",
      trackingType: "reps",
      perSide: false,
      restSeconds: 90,
      progression: "Усложнение: ноги на возвышении",
      techniqueTip: [
        "Тело — прямая линия от плеч до пяток, не провисай в пояснице.",
        "Локти под углом ~45° к корпусу, опускайся до касания грудью пола.",
      ],
      mainMistake: "Не задирай таз вверх и не роняй голову вниз — смотри перед собой.",
    },
    {
      id: "pullups",
      title: "Подтягивания",
      sets: 4,
      repsLabel: "макс",
      trackingType: "reps",
      perSide: false,
      restSeconds: 90,
      substitution: "Пока не получаются: австралийские подтягивания или с резинкой",
      techniqueTip: [
        "Начинай из полного виса, тяни локтями вниз и назад, подбородок — к перекладине.",
        "Опускайся подконтрольно, не бросай тело вниз.",
      ],
      mainMistake: "Не раскачивайся и не делай рывок бёдрами — работай только спиной и руками.",
    },
    {
      id: "db_row",
      title: "Тяга гантели в наклоне",
      sets: 4,
      repsLabel: "8-12",
      trackingType: "reps",
      perSide: true,
      restSeconds: 90,
      techniqueTip: [
        "Спина прямая, корпус наклонён ~45°, опора свободной рукой на скамью/стул.",
        "Тяни гантель к поясу, локоть идёт вдоль корпуса.",
      ],
      mainMistake: "Не крути корпус в момент тяги — работает только рука и спина.",
    },
    {
      id: "db_shoulder_press",
      title: "Жим гантелей над головой",
      sets: 3,
      repsLabel: "8-12",
      trackingType: "reps",
      perSide: false,
      restSeconds: 90,
      techniqueTip: [
        "Стартовая позиция — гантели на уровне плеч, локти чуть впереди корпуса.",
        "Жми строго вверх, не разводя локти в стороны слишком рано.",
      ],
      mainMistake: "Не прогибайся в пояснице, чтобы «дожать» вес — лучше уменьши нагрузку.",
    },
    {
      id: "db_lateral_raise",
      title: "Махи гантелями в стороны",
      sets: 3,
      repsLabel: "12-20",
      trackingType: "reps",
      perSide: false,
      restSeconds: 60,
      techniqueTip: [
        "Лёгкий вес, руки чуть согнуты в локтях, поднимай до уровня плеч.",
        "Движение — от плеча, корпус не раскачивай.",
      ],
      mainMistake: "Не используй инерцию и рывки — чем медленнее, тем лучше работают дельты.",
    },
    {
      id: "db_curl",
      title: "Подъём гантелей на бицепс",
      sets: 3,
      repsLabel: "10-12",
      trackingType: "reps",
      perSide: false,
      restSeconds: 60,
      techniqueTip: ["Локти прижаты к корпусу и неподвижны.", "Поднимай гантели подконтрольно, без рывка."],
      mainMistake: "Не раскачивай корпус и не помогай плечами — работают только предплечья.",
    },
    {
      id: "close_pushups",
      title: "Отжимания узким хватом",
      sets: 3,
      repsLabel: "10-12",
      trackingType: "reps",
      perSide: false,
      restSeconds: 60,
      techniqueTip: ["Ладони почти вместе под грудью.", "Локти идут вдоль корпуса, не в стороны."],
      mainMistake: "Не разводи локти широко — иначе нагрузка уходит с трицепса на плечи.",
    },
  ],
  lower: [
    {
      id: "bulgarian_split_squat",
      title: "Болгарские сплит-приседы с гантелями",
      sets: 4,
      repsLabel: "8-12",
      trackingType: "reps",
      perSide: true,
      restSeconds: 90,
      techniqueTip: [
        "Задняя нога на возвышении (стул/диван), гантели в руках вдоль корпуса.",
        "Колено передней ноги движется к носку, не внутрь.",
      ],
      mainMistake: "Не заваливай корпус вперёд — держи его вертикально.",
    },
    {
      id: "rdl",
      title: "Румынская тяга с гантелями",
      sets: 4,
      repsLabel: "8-12",
      trackingType: "reps",
      perSide: false,
      restSeconds: 90,
      techniqueTip: [
        "Колени чуть согнуты и неподвижны, таз уходит назад, спина прямая.",
        "Гантели скользят вдоль ног, почувствуй растяжение задней поверхности бедра.",
      ],
      mainMistake: "Не округляй поясницу — если чувствуешь, что спина «уходит», сократи амплитуду.",
    },
    {
      id: "goblet_squat",
      title: "Гоблет-присед",
      sets: 3,
      repsLabel: "10-15",
      trackingType: "reps",
      perSide: false,
      restSeconds: 90,
      techniqueTip: [
        "Гантель держи у груди двумя руками.",
        "Приседай между колен, колени — по направлению носков.",
      ],
      mainMistake: "Не отрывай пятки от пола в нижней точке.",
    },
    {
      id: "glute_bridge",
      title: "Ягодичный мост",
      sets: 3,
      repsLabel: "12-15",
      trackingType: "reps",
      perSide: false,
      restSeconds: 60,
      techniqueTip: ["Гантель лежит на тазе, стопы близко к ягодицам.", "В верхней точке сожми ягодицы на 1 секунду."],
      mainMistake: "Не прогибайся в пояснице — подкручивай таз, работают именно ягодицы.",
    },
    {
      id: "single_leg_calf_raise",
      title: "Подъёмы на носки на одной ноге",
      sets: 4,
      repsLabel: "12-20",
      trackingType: "reps",
      perSide: true,
      restSeconds: 60,
      techniqueTip: ["Опора рукой о стену для баланса.", "Поднимайся максимально высоко, задержись на секунду."],
      mainMistake: "Не сгибай колено опорной ноги, чтобы «помочь» — работает только голень.",
    },
    {
      id: "hanging_leg_raise",
      title: "Подъёмы ног в висе на турнике",
      sets: 3,
      repsLabel: "макс",
      trackingType: "reps",
      perSide: false,
      restSeconds: 60,
      techniqueTip: ["Вис на прямых руках, поднимай прямые или слегка согнутые ноги.", "Поясница не раскачивается."],
      mainMistake: "Не поднимай ноги рывком — контролируй и опускание тоже.",
    },
    {
      id: "plank",
      title: "Планка",
      sets: 3,
      repsLabel: "до отказа",
      trackingType: "seconds",
      perSide: false,
      restSeconds: 60,
      techniqueTip: ["Тело — прямая линия, локти под плечами.", "Живот и ягодицы напряжены всё время."],
      mainMistake: "Не провисай в пояснице и не задирай таз вверх.",
    },
  ],
};
