import { NextResponse } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const TIMEZONE = process.env.APP_TIMEZONE || "Asia/Yekaterinburg";

const NUDGES = [
  "Маленький шаг — и дело сделано.",
  "Просто начни, дальше будет легче.",
  "Ты обещал себе — самое время сдержать слово.",
  "Пять минут — и с плеч долой.",
  "Сделай сейчас, порадуйся вечером.",
  "Твоё будущее «я» скажет спасибо.",
  "Не идеально, а сделано — уже победа.",
  "Ещё один шаг к серии дней подряд.",
  "Тело помнит: чем раньше, тем легче.",
  "Секунда на решение — и вперёд.",
];

function pickNudge() {
  return NUDGES[Math.floor(Math.random() * NUDGES.length)];
}

function localNow() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
  const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
  const dateKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(now);
  return { hhmm: `${hh}:${mm}`, dateKey };
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || "mailto:no-reply@example.com";
  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json({ error: "vapid keys not configured" }, { status: 500 });
  }
  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  const supabase = createAdminClient();
  const { hhmm, dateKey } = localNow();
  const timeValue = `${hhmm}:00`;

  let sentCount = 0;

  async function sendToUser(userId: string, title: string, body: string) {
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userId);

    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title, body })
        );
        sentCount += 1;
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }
  }

  // Задачи с конкретным временем
  const { data: dueTasks } = await supabase
    .from("tasks")
    .select("id,user_id,title")
    .eq("task_date", dateKey)
    .eq("task_time", timeValue)
    .eq("done", false)
    .is("reminded_at", null);

  for (const task of dueTasks ?? []) {
    await sendToUser(task.user_id, `⏰ ${task.title}`, pickNudge());
    await supabase
      .from("tasks")
      .update({ reminded_at: new Date().toISOString() })
      .eq("id", task.id);
  }

  // Привычки с персональным временем напоминания
  const { data: dueHabits } = await supabase
    .from("habits")
    .select("id,user_id,title")
    .eq("archived", false)
    .eq("reminder_time", timeValue);

  for (const habit of dueHabits ?? []) {
    const { data: log } = await supabase
      .from("habit_logs")
      .select("id")
      .eq("habit_id", habit.id)
      .eq("log_date", dateKey)
      .maybeSingle();
    if (log) continue; // уже отмечена сегодня
    await sendToUser(habit.user_id, `🔥 ${habit.title}`, pickNudge());
  }

  // Общее ежедневное напоминание про невыполненные привычки
  const { data: dueSettings } = await supabase
    .from("user_settings")
    .select("user_id")
    .eq("daily_reminder_enabled", true)
    .eq("daily_reminder_time", timeValue);

  for (const setting of dueSettings ?? []) {
    const { data: activeHabits } = await supabase
      .from("habits")
      .select("id")
      .eq("user_id", setting.user_id)
      .eq("archived", false);

    if (!activeHabits || activeHabits.length === 0) continue;

    const { data: doneLogs } = await supabase
      .from("habit_logs")
      .select("habit_id")
      .eq("log_date", dateKey)
      .in(
        "habit_id",
        activeHabits.map((h) => h.id)
      );

    const doneCount = doneLogs?.length ?? 0;
    if (doneCount >= activeHabits.length) continue; // всё уже сделано

    await sendToUser(
      setting.user_id,
      "Мой день",
      `Осталось ${activeHabits.length - doneCount} из ${activeHabits.length} привычек. ${pickNudge()}`
    );
  }

  return NextResponse.json({ ok: true, hhmm, dateKey, sentCount });
}
