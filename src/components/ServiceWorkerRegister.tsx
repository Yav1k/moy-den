"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Тихо игнорируем — PWA-функции не критичны для работы приложения.
      });
    }
  }, []);

  return null;
}
