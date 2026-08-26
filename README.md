# Мой день

Персональный трекер ежедневных задач и привычек с мотивацией дня.
Next.js (App Router) + TypeScript + Tailwind CSS + Supabase, PWA.

Полная инструкция по установке и деплою — в чате с Claude Code, здесь
только краткая шпаргалка команд.

## Локальный запуск

```bash
npm install
copy .env.local.example .env.local   # затем впишите свои ключи Supabase
npm run dev
```

Откройте http://localhost:3000

## База данных

SQL-схема (таблицы + RLS) — в [`supabase/schema.sql`](supabase/schema.sql).
Выполните её в Supabase Studio → SQL Editor.

## Деплой

Проект готов к деплою на Vercel (`vercel.com`) — Framework Preset: Next.js.
Не забудьте добавить те же переменные окружения из `.env.local` в
настройках проекта на Vercel.
