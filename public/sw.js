const VERSION = "v10";
const CACHE_SHELL = `giophim-shell-${VERSION}`;
const CACHE_STATIC = `giophim-static-${VERSION}`;
const CACHE_PAGES = `giophim-pages-${VERSION}`;
const CACHE_API = `giophim-api-${VERSION}`;
const KNOWN_CACHES = [CACHE_SHELL, CACHE_STATIC, CACHE_PAGES, CACHE_API];

const OFFLINE_URL = "/offline.html";
const DB_VERSION = 3;

const SHELL_ASSETS = [
  "/",
  "/downloads",
  "/watch/offline",
  "/offline.html",
  "/manifest.json",
  "/icons/logo.webp",
  "/icons/icon-192.webp",
  "/icons/icon-512.webp",
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

function shouldBypass(url) {
  if (url.protocol !== "https:" && url.protocol !== "http:") return true;
  if (url.pathname.startsWith("/data/")) return true;
  if (url.pathname.startsWith("/_next/webpack-hmr")) return true;
  if (url.pathname.startsWith("/_next/image")) return true;
  if (url.pathname.startsWith("/api/access")) return true;
  if (url.pathname.startsWith("/api/v1/auth")) return true;
  if (url.pathname.startsWith("/api/v1/chat")) return true;
  if (VIDEO_EXTENSIONS.some((ext) => url.pathname.endsWith(ext))) return true;
  return false;
}

function isPrivatePage(url) {
  return PRIVATE_PAGE_PREFIXES.some((p) => url.pathname.startsWith(p));
}

function isStaticAsset(url) {
  if (url.pathname.startsWith("/_next/static/")) return true;
  if (url.pathname.startsWith("/icons/")) return true;
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
    caches.open(CACHE_SHELL).then((cache) => cache.addAll(SHELL_ASSETS).catch(() => undefined))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
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

  if (url.pathname.endsWith(".ts") || url.pathname.includes("/stream/")) {
    event.respondWith(serveHlsSegment(request));
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApi(request, url));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigate(request, url));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(handleStatic(request));
    return;
  }
});

async function handleNavigate(request, url) {
  try {
    const fresh = await fetch(request);
    if (fresh.ok && !isPrivatePage(url)) {
      const clone = fresh.clone();
      caches
        .open(CACHE_PAGES)
        .then((cache) => cache.put(request, clone))
        .then(() => trimCache(CACHE_PAGES, PAGE_MAX_ENTRIES));
    }
    return fresh;
  } catch {
    if (!isPrivatePage(url)) {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (url.pathname.startsWith("/watch/") && url.searchParams.get("offline") === "1") {
        const shell = (await caches.match("/watch/offline")) || (await caches.match("/"));
        if (shell) return shell;
      }
    }
    const fallback = await caches.match(OFFLINE_URL);
    return fallback || new Response("Offline", { status: 504 });
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
    return new Response("", { status: 504 });
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

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Gió Phim", body: event.data.text() };
  }

  const options = {
    body: payload.body || payload.content || "",
    icon: "/icons/logo.webp",
    badge: "/icons/logo.webp",
    tag: payload.tag || "giophim-notification",
    data: { url: payload.actionUrl || payload.url || "/" },
    vibrate: [100, 50, 100],
    actions: payload.actionUrl ? [{ action: "open", title: "Xem ngay" }] : [],
  };

  event.waitUntil(
    (async () => {
      try {
        const permission = self.Notification?.permission;
        if (permission !== "granted") return;
        await self.registration.showNotification(payload.title || "Gió Phim", options);
      } catch (_e) {}
    })()
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
        // network unavailable, retry next sync
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
