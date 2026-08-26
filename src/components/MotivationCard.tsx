import { getQuoteOfTheDay } from "@/lib/quoteOfTheDay";

export function MotivationCard() {
  const quote = getQuoteOfTheDay();

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-accent/15 to-accent/5 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-accent">
        Мотивация дня
      </p>
      <p className="mt-2 text-lg font-medium leading-snug text-text">
        {quote}
      </p>
    </div>
  );
}
