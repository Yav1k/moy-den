"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(searchParams.get("error"));

  const allowedEmail = process.env.NEXT_PUBLIC_ALLOWED_EMAIL;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (allowedEmail && email.trim().toLowerCase() !== allowedEmail.toLowerCase()) {
      setError("Этот email не привязан к приложению.");
      return;
    }

    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setError(error.message);
      return;
    }

    setStatus("sent");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-text">Мой день</h1>
        <p className="mt-1 text-sm text-muted">
          Войдите по ссылке, которая придёт на почту.
        </p>

        {status === "sent" ? (
          <div className="mt-6 rounded-xl bg-surface2 p-4 text-sm text-text">
            Ссылка для входа отправлена на <b>{email}</b>. Откройте почту на
            этом устройстве и перейдите по ссылке.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-border bg-surface2 px-4 py-2.5 text-text outline-none ring-accent/40 focus:ring-2"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-xl bg-accent px-4 py-2.5 font-medium text-accent-fg transition disabled:opacity-60"
            >
              {status === "sending" ? "Отправляем..." : "Получить ссылку для входа"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
