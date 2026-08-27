"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  disablePush,
  enablePush,
  getExistingSubscription,
  isPushSupported,
} from "@/lib/push";

export function useNotificationSettings(userId: string) {
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [dailyReminderTime, setDailyReminderTime] = useState<string | null>(null);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(true);
  const [weeklyReviewTime, setWeeklyReviewTime] = useState<string | null>(null);
  const [weeklyReviewEnabled, setWeeklyReviewEnabled] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [settingsRes, subscription] = await Promise.all([
        supabase.from("user_settings").select("*").eq("user_id", userId).maybeSingle(),
        isPushSupported() ? getExistingSubscription() : Promise.resolve(null),
      ]);
      if (cancelled) return;
      if (settingsRes.data) {
        setDailyReminderTime(settingsRes.data.daily_reminder_time);
        setDailyReminderEnabled(settingsRes.data.daily_reminder_enabled);
        setWeeklyReviewTime(settingsRes.data.weekly_review_time);
        setWeeklyReviewEnabled(settingsRes.data.weekly_review_enabled);
      }
      setSubscribed(Boolean(subscription));
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase, userId]);

  const toggleSubscription = useCallback(async () => {
    if (subscribed) {
      await disablePush();
      setSubscribed(false);
    } else {
      const ok = await enablePush(userId);
      setSubscribed(ok);
      return ok;
    }
  }, [subscribed, userId]);

  const saveDailyReminder = useCallback(
    async (time: string | null, enabled: boolean) => {
      setDailyReminderTime(time);
      setDailyReminderEnabled(enabled);
      await supabase.from("user_settings").upsert(
        {
          user_id: userId,
          daily_reminder_time: time,
          daily_reminder_enabled: enabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    },
    [supabase, userId]
  );

  const saveWeeklyReview = useCallback(
    async (time: string | null, enabled: boolean) => {
      setWeeklyReviewTime(time);
      setWeeklyReviewEnabled(enabled);
      await supabase.from("user_settings").upsert(
        {
          user_id: userId,
          weekly_review_time: time,
          weekly_review_enabled: enabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    },
    [supabase, userId]
  );

  return {
    loading,
    supported: isPushSupported(),
    subscribed,
    toggleSubscription,
    dailyReminderTime,
    dailyReminderEnabled,
    saveDailyReminder,
    weeklyReviewTime,
    weeklyReviewEnabled,
    saveWeeklyReview,
  };
}
