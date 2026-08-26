// Простой service worker: кэширует статическую "оболочку" приложения,
// чтобы иконка/оффлайн-заглушка открывались мгновенно. Данные всегда
// идут напрямую в Supabase (network), кэш их не подменяет.

const CACHE_NAME = "moy-den-shell-v1";
const SHELL_URLS = ["/manifest.webmanifest", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Никогда не кэшируем запросы к Supabase и навигацию (HTML) — только
  // статику оболочки, чтобы данные всегда были свежими.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!SHELL_URLS.includes(url.pathname)) return;

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
