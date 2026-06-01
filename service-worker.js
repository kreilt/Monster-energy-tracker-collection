/* =====================================================================
   Service Worker — офлайн-кэш для Monster Tracker (PWA).

   Стратегии:
   - APP SHELL (html/js/css/иконки/данные): "stale-while-revalidate" —
     отдаём из кэша мгновенно, в фоне обновляем.
   - ФОТО банок (images/*.jpg): "cache-first" — один раз скачали, дальше
     всегда из кэша (работает офлайн). Это и есть офлайн-картинки.
   - Firebase/Google и прочие чужие домены: НЕ трогаем (пропускаем в сеть),
     чтобы не ломать авторизацию и синхронизацию.

   Версию кэша поднимать при изменении файлов оболочки, чтобы обновилось.
   ===================================================================== */

const VERSION = "monster-v2";
const SHELL_CACHE = "shell-" + VERSION;
const IMG_CACHE = "img-" + VERSION;

// файлы оболочки, которые предкэшируем при установке
const SHELL_ASSETS = [
  "./app.html",
  "./app.js",
  "./flavors-data.js",
  "./firebase-config.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(SHELL_CACHE).then((c) =>
      // addAll падает целиком, если хоть один файл не найден — добавляем по одному
      Promise.allSettled(SHELL_ASSETS.map((u) => c.add(u)))
    )
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== SHELL_CACHE && k !== IMG_CACHE).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // чужие домены (Firebase, Google, gstatic и т.п.) — не вмешиваемся
  if (url.origin !== self.location.origin) return;

  // ФОТО банок — cache-first
  if (url.pathname.includes("/images/") && /\.(jpg|jpeg|png|webp)$/i.test(url.pathname)) {
    e.respondWith(
      caches.open(IMG_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        try {
          const res = await fetch(req);
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        } catch (_) {
          return hit || Response.error();
        }
      })
    );
    return;
  }

  // ОБОЛОЧКА (html/js/css) — network-first: всегда берём свежее из сети,
  // кэш используем только как офлайн-резерв. Так правки видны сразу после деплоя.
  e.respondWith(
    caches.open(SHELL_CACHE).then(async (cache) => {
      try {
        const res = await fetch(req);
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      } catch (_) {
        const hit = await cache.match(req);
        return hit || caches.match("./app.html");
      }
    })
  );
});
