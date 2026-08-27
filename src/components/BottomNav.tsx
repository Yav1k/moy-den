"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreSheet } from "./MoreSheet";

const TABS = [
  {
    href: "/",
    label: "Главная",
    icon: (
      <path d="M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10" />
    ),
  },
  {
    href: "/calendar",
    label: "Календарь",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),
  },
  {
    href: "/workout",
    label: "Тренировка",
    icon: (
      <path d="M6.5 6.5 17.5 17.5M4 8l4-4 2 2-4 4-2-2ZM14 18l4-4 2 2-4 4-2-2ZM2 6l2-2M22 18l-2 2" />
    ),
  },
  {
    href: "/goals",
    label: "Цели",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </>
    ),
  },
];

const MORE_PATHS = ["/journal", "/stats", "/settings"];

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  if (pathname?.startsWith("/login") || pathname?.startsWith("/auth")) return null;

  const moreActive = MORE_PATHS.some((p) => pathname?.startsWith(p));

  return (
    <>
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
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
              moreActive ? "text-accent" : "text-muted"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            Ещё
          </button>
        </div>
      </nav>

      {moreOpen && <MoreSheet onClose={() => setMoreOpen(false)} />}
    </>
  );
}
