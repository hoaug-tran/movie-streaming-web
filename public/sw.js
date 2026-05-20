const VERSION = "v19";
const CACHE_SHELL = `giophim-shell-${VERSION}`;
const CACHE_PAGES = `giophim-pages-${VERSION}`;
const CACHE_API = `giophim-api-${VERSION}`;
const CACHE_STATIC = `giophim-static-${VERSION}`;
const CACHE_ICONS = "giophim-icons-stable";
const KNOWN_CACHES = [CACHE_SHELL, CACHE_PAGES, CACHE_API, CACHE_STATIC, CACHE_ICONS];

const OFFLINE_URL = "/offline.html";
const DB_VERSION = 3;

const CRITICAL_SHELL = ["/offline.html", "/manifest.json"];

const SHELL_ASSETS = ["/", "/downloads", "/watch/offline"];

const ICON_ASSETS = [
  "/icons/logo.webp",
  "/icons/icon-192.webp",
  "/icons/icon-512.webp",
  "/icons/icon-maskable.webp",
  "/apple-touch-icon.png",
  "/icons/apple-touch-icon-180.png",
  "/icons/apple-touch-icon-167.png",
  "/icons/apple-touch-icon-152.png",
  "/icons/apple-touch-icon-120.png",
];

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mkv", ".avi", ".mov", ".m3u8", ".ts"];

const PRIVATE_PAGE_PREFIXES = [
  "/profile",
  "/admin",
  "/auth",
  "/access",
  "/watchlist",
  "/favorites",
  "/history",
  "/account",
];

const PAGE_MAX_ENTRIES = 30;
const API_MAX_ENTRIES = 50;
const STATIC_MAX_ENTRIES = 80;

const FALLBACK_OFFLINE_HTML = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Không có kết nối - Gió Phim</title>
<style>
:root{color-scheme:dark}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#0c0c0c;color:#f0f0f0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center}
h1{font-size:1.5rem;font-weight:700;margin-bottom:12px;letter-spacing:-0.02em}
p{font-size:.95rem;color:#8a8a8a;line-height:1.6;max-width:320px;margin-bottom:32px}
.btn{display:inline-block;padding:12px 28px;background:#c8102e;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:.9rem;margin:6px}
.btn-outline{background:transparent;border:1px solid rgba(255,255,255,.15);color:#f0f0f0}
</style></head><body>
<h1>Không có kết nối mạng</h1>
<p>Bạn đang offline. Hãy kiểm tra kết nối internet hoặc xem các phim đã tải về.</p>
<div>
<a href="/downloads" class="btn">Phim đã tải</a>
<a href="/" class="btn btn-outline" onclick="window.location.reload()">Thử lại</a>
</div></body></html>`;

function buildOfflineFallbackResponse() {
  return new Response(FALLBACK_OFFLINE_HTML, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function shouldBypass(url) {
  if (url.protocol !== "https:" && url.protocol !== "http:") return true;
  if (url.pathname.startsWith("/__offline__/")) return false;
  if (url.pathname.startsWith("/data/")) return true;
  if (url.pathname.startsWith("/_next/webpack-hmr")) return true;
  if (url.pathname.startsWith("/_next/image")) return true;
  if (url.pathname.startsWith("/api/access")) return true;
  if (url.pathname.startsWith("/api/v1/auth")) return true;
  if (url.pathname.startsWith("/api/v1/assistant")) return true;
  if (url.pathname.startsWith("/api/v1/chat")) return true;
  if (VIDEO_EXTENSIONS.some((ext) => url.pathname.endsWith(ext))) return true;
  return false;
}

function isPrivatePage(url) {
  return PRIVATE_PAGE_PREFIXES.some((p) => url.pathname.startsWith(p));
}

function isIconAsset(url) {
  if (url.pathname.startsWith("/icons/")) return true;
  if (url.pathname === "/apple-touch-icon.png") return true;
  if (url.pathname === "/apple-touch-icon-precomposed.png") return true;
  if (url.pathname === "/manifest.json") return true;
  return false;
}

function isStaticAsset(url) {
  if (url.pathname.startsWith("/_next/static/")) return true;
  if (url.pathname.startsWith("/fonts/")) return true;
  return /\.(?:js|css|woff2?|ttf|eot|webp|png|jpg|jpeg|svg|ico)$/i.test(url.pathname);
}

function isCacheableApi(url) {
  if (!url.pathname.startsWith("/api/")) return false;
  if (url.pathname.startsWith("/api/v1/movies")) return true;
  if (url.pathname.startsWith("/api/v1/categories")) return true;
  if (url.pathname.startsWith("/api/v1/tags")) return true;
  if (url.pathname.startsWith("/api/v1/subscription-plans")) return true;
  return false;
}

async function trimCache(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length <= maxEntries) return;
    const toDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(toDelete.map((k) => cache.delete(k)));
  } catch {}
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const shellCache = await caches.open(CACHE_SHELL);
      // Best-effort precache. Inline FALLBACK_OFFLINE_HTML guarantees offline coverage.
      await Promise.all(
        CRITICAL_SHELL.map((url) =>
          shellCache
            .add(new Request(url, { cache: "reload" }))
            .catch((e) => console.warn("[SW] critical precache skip", url, e))
        )
      );
      await Promise.all(
        SHELL_ASSETS.map((url) =>
          shellCache
            .add(new Request(url, { cache: "reload" }))
            .catch((e) => console.warn("[SW] shell skip", url, e))
        )
      );
      const iconCache = await caches.open(CACHE_ICONS);
      await Promise.all(
        ICON_ASSETS.map(async (url) => {
          try {
            const existing = await iconCache.match(url);
            if (existing) return;
            const res = await fetch(url, { cache: "reload" });
            if (res.ok) await iconCache.put(url, res.clone());
          } catch (e) {
            console.warn("[SW] icon precache skip", url, e);
          }
        })
      );
    })()
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        try {
          await self.registration.navigationPreload.enable();
        } catch {}
      }
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !KNOWN_CACHES.includes(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (shouldBypass(url)) return;

  if (url.pathname.startsWith("/__offline__/seg/")) {
    event.respondWith(serveOfflineSegment(url));
    return;
  }
  if (url.pathname.startsWith("/__offline__/key/")) {
    event.respondWith(serveOfflineKey(url));
    return;
  }

  if (url.pathname.endsWith(".ts") || url.pathname.includes("/stream/")) {
    event.respondWith(serveHlsSegment(request));
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApi(request, url));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigate(event, url));
    return;
  }

  if (isIconAsset(url)) {
    event.respondWith(handleIcon(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(handleStatic(request));
    return;
  }
});

async function handleNavigate(event, url) {
  try {
    // Android Chrome: navigationPreload trả response sớm hơn fetch trực tiếp
    const preload = event.preloadResponse ? await event.preloadResponse : null;
    const fresh = preload || (await fetch(event.request));
    if (fresh && fresh.ok && !isPrivatePage(url)) {
      const clone = fresh.clone();
      caches
        .open(CACHE_PAGES)
        .then((cache) => cache.put(event.request, clone))
        .then(() => trimCache(CACHE_PAGES, PAGE_MAX_ENTRIES))
        .catch(() => undefined);
    }
    if (fresh) return fresh;
    throw new Error("no-network-response");
  } catch {
    if (url.pathname === "/watch/offline" || url.pathname.startsWith("/watch/offline/")) {
      const offlineShell = await caches.match("/watch/offline", { ignoreSearch: true });
      if (offlineShell) return offlineShell;
    }
    if (!isPrivatePage(url)) {
      let cached = await caches.match(event.request);
      if (cached) return cached;
      cached = await caches.match(event.request, { ignoreSearch: true });
      if (cached) return cached;
      if (url.pathname.startsWith("/watch/")) {
        const shell =
          (await caches.match("/watch/offline", { ignoreSearch: true })) ||
          (await caches.match("/", { ignoreSearch: true }));
        if (shell) return shell;
      }
      if (url.pathname.startsWith("/downloads")) {
        const shell = await caches.match("/downloads", { ignoreSearch: true });
        if (shell) return shell;
      }
    }
    const offlineCached =
      (await caches.match(OFFLINE_URL)) ||
      (await caches.match(OFFLINE_URL, { ignoreSearch: true }));
    if (offlineCached) return offlineCached;
    return buildOfflineFallbackResponse();
  }
}

async function handleIcon(request) {
  const iconCache = await caches.open(CACHE_ICONS);
  const cached = await iconCache.match(request, { ignoreSearch: true });
  if (cached) {
    fetch(request)
      .then((res) => {
        if (res.ok) iconCache.put(request, res.clone());
      })
      .catch(() => undefined);
    return cached;
  }
  try {
    const fresh = await fetch(request);
    if (fresh.ok) iconCache.put(request, fresh.clone());
    return fresh;
  } catch {
    const fallback = await caches.match(request, { ignoreSearch: true });
    if (fallback) return fallback;
    return Response.error();
  }
}

async function handleStatic(request) {
  const cached = await caches.match(request);
  if (cached) {
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_STATIC).then((c) => c.put(request, clone));
        }
      })
      .catch(() => undefined);
    return cached;
  }
  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      const clone = fresh.clone();
      caches
        .open(CACHE_STATIC)
        .then((c) => c.put(request, clone))
        .then(() => trimCache(CACHE_STATIC, STATIC_MAX_ENTRIES));
    }
    return fresh;
  } catch {
    return Response.error();
  }
}

async function handleApi(request, url) {
  if (!isCacheableApi(url)) {
    try {
      return await fetch(request);
    } catch {
      return new Response(JSON.stringify({ error: "offline" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      const clone = fresh.clone();
      caches
        .open(CACHE_API)
        .then((c) => c.put(request, clone))
        .then(() => trimCache(CACHE_API, API_MAX_ENTRIES));
    }
    return fresh;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function serveHlsSegment(request) {
  try {
    return await fetch(request);
  } catch {
    const segment = await getSegmentFromIDB(request.url);
    if (segment) {
      return new Response(segment, {
        headers: { "Content-Type": "video/mp2t" },
      });
    }
    return new Response("Segment not available offline", { status: 503 });
  }
}

async function serveOfflineSegment(url) {
  try {
    const parts = url.pathname.split("/");
    const episodeId = Number(parts[3]);
    const idx = Number(String(parts[4]).replace(/\.ts$/i, ""));
    if (!Number.isFinite(episodeId) || !Number.isFinite(idx)) {
      return new Response("Invalid offline segment path", { status: 400 });
    }
    const movie = await getMovieFromIDB(episodeId);
    if (!movie || !Array.isArray(movie.segmentUrls)) {
      return new Response("Offline movie not found", { status: 404 });
    }
    const segUrl = movie.segmentUrls[idx];
    if (!segUrl) {
      return new Response("Offline segment index not found", { status: 404 });
    }
    const data = await getSegmentFromIDB(segUrl);
    if (!data) {
      return new Response("Offline segment data missing", { status: 404 });
    }
    return new Response(data, {
      headers: {
        "Content-Type": "video/mp2t",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response("Offline segment error: " + (err?.message || err), { status: 500 });
  }
}

async function serveOfflineKey(url) {
  try {
    const parts = url.pathname.split("/");
    const episodeId = Number(parts[3]);
    if (!Number.isFinite(episodeId)) {
      return new Response("Invalid offline key path", { status: 400 });
    }
    const key = await getKeyFromIDB(episodeId);
    if (!key?.keyData) {
      return new Response("Offline key not found", { status: 404 });
    }
    return new Response(key.keyData, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response("Offline key error: " + (err?.message || err), { status: 500 });
  }
}

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("giophim-offline", DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("segments")) {
        db.createObjectStore("segments", { keyPath: "url" });
      }
      if (!db.objectStoreNames.contains("movies")) {
        db.createObjectStore("movies", { keyPath: "episodeId" });
      }
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys", { keyPath: "episodeId" });
      }
      if (!db.objectStoreNames.contains("posters")) {
        db.createObjectStore("posters", { keyPath: "episodeId" });
      }
      if (!db.objectStoreNames.contains("pending-history")) {
        db.createObjectStore("pending-history", { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getSegmentFromIDB(url) {
  try {
    const db = await openIDB();
    return new Promise((resolve) => {
      const tx = db.transaction("segments", "readonly");
      const req = tx.objectStore("segments").get(url);
      req.onsuccess = () => resolve(req.result?.data || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function getMovieFromIDB(episodeId) {
  try {
    const db = await openIDB();
    return new Promise((resolve) => {
      const tx = db.transaction("movies", "readonly");
      const req = tx.objectStore("movies").get(episodeId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function getKeyFromIDB(episodeId) {
  try {
    const db = await openIDB();
    return new Promise((resolve) => {
      const tx = db.transaction("keys", "readonly");
      const req = tx.objectStore("keys").get(episodeId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

self.addEventListener("push", (event) => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      try {
        payload = { title: "Gió Phim", body: event.data.text() };
      } catch {
        payload = {};
      }
    }
  }

  const title = (payload.title && String(payload.title).trim()) || "Gió Phim";
  const body = (payload.body || payload.content || payload.message || "").toString();
  const options = {
    body: body,
    icon: "/icons/logo.webp",
    data: { url: payload.actionUrl || payload.url || "/" },
  };

  if (payload.tag) {
    options.tag = String(payload.tag);
  }
  if (payload.image) {
    options.image = payload.image;
  }
  if (payload.requireInteraction === true) {
    options.requireInteraction = true;
  }

  event.waitUntil(
    self.registration.showNotification(title, options).catch(() => {
      try {
        return self.registration.showNotification(title, {
          body: body,
          icon: "/icons/logo.webp",
        });
      } catch {
        return undefined;
      }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const sameOrigin = allClients.find((c) => c.url.startsWith(self.location.origin));
      if (sameOrigin) {
        sameOrigin.postMessage({ type: "navigate", url: targetUrl });
        return sameOrigin.focus();
      }
      return self.clients.openWindow(targetUrl);
    })()
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-watch-history") {
    event.waitUntil(syncWatchHistory());
  }
});

async function syncWatchHistory() {
  try {
    const db = await openIDB();
    const pending = await new Promise((resolve) => {
      const tx = db.transaction("pending-history", "readonly");
      const req = tx.objectStore("pending-history").getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    for (const item of pending) {
      try {
        await fetch("/api/v1/watch-histories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(item.data),
        });
        const tx = db.transaction("pending-history", "readwrite");
        tx.objectStore("pending-history").delete(item.id);
      } catch {
        // network unavailable
      }
    }
  } catch {
    // IDB unavailable
  }
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
