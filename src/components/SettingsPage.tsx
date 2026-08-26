"use client";

import Link from "next/link";
import { NotificationSettings } from "./NotificationSettings";

export function SettingsPage({ userId, email }: { userId: string; email: string }) {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-16 pt-6 sm:px-6">
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
          <h1 className="text-xl font-bold text-text">Настройки</h1>
          <p className="text-sm text-muted">{email}</p>
        </div>
      </header>

      <div className="mt-5 space-y-4">
        <NotificationSettings userId={userId} />
      </div>
    </main>
  );
}
