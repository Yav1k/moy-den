"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/",
    label: "Сегодня",
    icon: <path d="M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10" />,
  },
  {
    href: "/workouts",
    label: "Тренировки",
    icon: <path d="M6.5 6.5 17.5 17.5M4 8l4-4 2 2-4 4-2-2ZM14 18l4-4 2 2-4 4-2-2ZM2 6l2-2M22 18l-2 2" />,
  },
  {
    href: "/nutrition",
    label: "Рацион",
    icon: (
      <>
        <path d="M18 8a4 4 0 0 0-8 0v2a4 4 0 0 0 8 0" />
        <path d="M14 2v6M6 2v20M3 2v7a3 3 0 0 0 3 3" />
      </>
    ),
  },
  {
    href: "/sugar",
    label: "Трекер",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </>
    ),
  },
  {
    href: "/journal",
    label: "Ежедневник",
    icon: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z" />,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname?.startsWith("/login") || pathname?.startsWith("/auth")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-2xl items-stretch justify-around">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
                active ? "text-accent" : "text-muted"
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {tab.icon}
              </svg>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
