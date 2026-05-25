const VERSION = "v31";

const CACHE_SHELL = `giophim-shell-${VERSION}`;
const CACHE_PAGES = `giophim-pages-${VERSION}`;
const CACHE_API = `giophim-api-${VERSION}`;
const CACHE_STATIC = `giophim-static-${VERSION}`;
const CACHE_ICONS = "giophim-icons-stable";
const CACHE_IMAGES = `giophim-images-${VERSION}`;

const KNOWN_CACHES = [CACHE_SHELL, CACHE_PAGES, CACHE_API, CACHE_STATIC, CACHE_ICONS, CACHE_IMAGES];

const OFFLINE_URL = "/offline.html";
const DB_VERSION = 4;

const NETWORK_TIMEOUT_MS = 4500;

const PAGE_MAX_ENTRIES = 60;
const API_MAX_ENTRIES = 150;
const STATIC_MAX_ENTRIES = 1000;
const IMAGE_MAX_ENTRIES = 500;

const CRITICAL_SHELL = ["/offline.html", "/manifest.json"];

const APP_SHELL_ROUTES = [
  "/",
  "/movies",
  "/tv",
  "/discovery",
  "/pricing",
  "/support/faq",
  "/support/contact",
  "/support/status",
  "/downloads",
  "/watch/offline",
];

const OFFLINE_ROUTE = "/watch/offline";
const LEGACY_OFFLINE_ROUTE = "/offline";

const ICON_ASSETS = [
  "/favicon.ico",
  "/icons/logo.webp",
  "/icons/icon-192.webp",
  "/icons/icon-512.webp",
  "/icons/icon-maskable.webp",
  "/apple-touch-icon.png",
  "/apple-touch-icon-precomposed.png",
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

function isHttpUrl(url) {
  return url.protocol === "http:" || url.protocol === "https:";
}

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function stripSearch(urlOrString) {
  const url = new URL(urlOrString, self.location.origin);
  return `${url.origin}${url.pathname}`;
}

function routeKey(pathname) {
  return new URL(pathname, self.location.origin).toString();
}

function isPrivatePage(url) {
  return PRIVATE_PAGE_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

function isOfflinePlayerRoute(url) {
  return (
    url.pathname === OFFLINE_ROUTE ||
    url.pathname.startsWith(`${OFFLINE_ROUTE}/`) ||
    url.pathname === LEGACY_OFFLINE_ROUTE ||
    url.pathname.startsWith(`${LEGACY_OFFLINE_ROUTE}/`)
  );
}

function isIconAsset(url) {
  if (url.pathname.startsWith("/icons/")) return true;
  if (url.pathname === "/favicon.ico") return true;
  if (url.pathname === "/apple-touch-icon.png") return true;
  if (url.pathname === "/apple-touch-icon-precomposed.png") return true;
  if (url.pathname === "/manifest.json") return true;
  return false;
}

function isStaticAsset(url) {
  if (url.pathname.startsWith("/_next/static/")) return true;
  if (url.pathname.startsWith("/fonts/")) return true;

  return /\.(?:js|css|woff2?|ttf|eot|webp|png|jpg|jpeg|svg|ico|avif|gif|json)$/i.test(url.pathname);
}

function isImageAsset(url) {
  return /\.(?:webp|png|jpg|jpeg|svg|avif|gif)$/i.test(url.pathname);
}

function isCacheableApi(url) {
  if (!url.pathname.startsWith("/api/")) return false;

  if (url.pathname.startsWith("/api/v1/movies")) return true;
  if (url.pathname.startsWith("/api/v1/categories")) return true;
  if (url.pathname.startsWith("/api/v1/tags")) return true;
  if (url.pathname.startsWith("/api/v1/subscription-plans")) return true;
  if (url.pathname.startsWith("/api/v1/discovery")) return true;
  if (url.pathname.startsWith("/api/v1/episodes")) return true;

  return false;
}

function shouldBypass(url) {
  if (!isHttpUrl(url)) return true;

  if (!isSameOrigin(url)) return true;

  if (url.pathname === "/sw.js") return true;
  if (url.pathname.startsWith("/cdn-cgi/")) return true;
  if (url.pathname.startsWith("/__offline__/")) return false;

  if (url.pathname.startsWith("/data/")) return true;
  if (url.pathname.startsWith("/_next/webpack-hmr")) return true;

  if (url.pathname.startsWith("/api/access")) return true;
  if (url.pathname.startsWith("/api/v1/auth")) return true;
  if (url.pathname.startsWith("/api/v1/assistant")) return true;
  if (url.pathname.startsWith("/api/v1/chat")) return true;

  if (VIDEO_EXTENSIONS.some((ext) => url.pathname.endsWith(ext))) return true;

  return false;
}

function withoutSpeculationHeaders(response) {
  const headers = new Headers(response.headers);

  headers.delete("Speculation-Rules");
  headers.delete("X-Speculation-Rules");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function isSafeCacheResponse(response) {
  if (!response) return false;
  if (!response.ok) return false;
  if (response.status === 206) return false;
  return true;
}

async function trimCache(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length <= maxEntries) return;

    const toDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(toDelete.map((key) => cache.delete(key)));
  } catch {
    // ignore
  }
}

function fetchWithTimeout(request, timeoutMs = NETWORK_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("network-timeout")), timeoutMs);

    fetch(request)
      .then((response) => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

async function cachePutSafe(cacheName, requestOrUrl, response) {
  if (!isSafeCacheResponse(response)) return false;

  try {
    const cache = await caches.open(cacheName);
    await cache.put(requestOrUrl, response);
    return true;
  } catch {
    return false;
  }
}

async function cacheUrls(cacheName, urls, options = {}) {
  const uniqueUrls = [...new Set(urls.filter(Boolean))];

  await Promise.all(
    uniqueUrls.map(async (rawUrl) => {
      try {
        const url = new URL(rawUrl, self.location.origin);

        if (!isHttpUrl(url)) return;
        if (!isSameOrigin(url)) return;

        const request = new Request(url.toString(), {
          cache: options.reload ? "reload" : "default",
          credentials: "same-origin",
        });

        const response = await fetch(request);

        if (isSafeCacheResponse(response)) {
          await cachePutSafe(cacheName, request, response.clone());
        }
      } catch (error) {
        console.warn("[SW] cacheUrls skip", rawUrl, error);
      }
    })
  );
}

function extractNextAssetsFromText(text) {
  const urls = new Set();

  const patterns = [
    /["'`](\/_next\/static\/[^"'`\s)\\]+)["'`]/g,
    /(?:src|href)=["']([^"']*\/_next\/static\/[^"']+)["']/g,
    /["'`](static\/[^"'`\s)\\]+\.(?:js|css|json))["'`]/g,
  ];

  for (const pattern of patterns) {
    let match;

    while ((match = pattern.exec(text))) {
      let raw = match[1];

      if (!raw) continue;

      raw = raw.replace(/\\u002f/g, "/").replace(/\\\//g, "/");

      if (raw.startsWith("static/")) {
        urls.add(new URL(`/_next/${raw}`, self.location.origin).toString());
      } else {
        urls.add(new URL(raw, self.location.origin).toString());
      }
    }
  }

  return [...urls];
}

function extractBuildIdsFromText(text) {
  const buildIds = new Set();

  const patterns = [
    /\/_next\/static\/([^/]+)\//g,
    /"buildId"\s*:\s*"([^"]+)"/g,
    /buildId["']?\s*[:=]\s*["']([^"']+)["']/g,
  ];

  for (const pattern of patterns) {
    let match;

    while ((match = pattern.exec(text))) {
      const id = match[1];

      if (id && id !== "chunks" && id !== "css" && id !== "media") {
        buildIds.add(id);
      }
    }
  }

  return [...buildIds];
}

async function discoverAssetsFromNextManifests(buildId) {
  const manifestUrls = [
    `/_next/static/${buildId}/_buildManifest.js`,
    `/_next/static/${buildId}/_ssgManifest.js`,
    `/_next/static/${buildId}/app-build-manifest.json`,
  ];

  const assets = new Set();

  await Promise.all(
    manifestUrls.map(async (manifestUrl) => {
      try {
        const request = new Request(manifestUrl, {
          cache: "reload",
          credentials: "same-origin",
        });

        const response = await fetch(request);

        if (!response.ok) return;

        await cachePutSafe(CACHE_STATIC, request, response.clone());

        const text = await response.text();

        for (const asset of extractNextAssetsFromText(text)) {
          assets.add(asset);
        }
      } catch {
        // App Router / Next version có thể không public đủ manifest này.
      }
    })
  );

  return [...assets];
}

async function precachePageWithAssets(pageUrl) {
  try {
    const shellCache = await caches.open(CACHE_SHELL);

    const page = new URL(pageUrl, self.location.origin);
    const pageKey = routeKey(page.pathname);

    const pageRequest = new Request(page.toString(), {
      cache: "reload",
      credentials: "same-origin",
      headers: {
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const pageResponse = await fetch(pageRequest);

    if (!pageResponse || !pageResponse.ok) {
      console.warn("[SW] page precache failed", pageUrl, pageResponse?.status);
      return;
    }

    await shellCache.put(pageKey, withoutSpeculationHeaders(pageResponse.clone()));

    const html = await pageResponse.clone().text();

    const assetUrls = new Set();

    for (const asset of extractNextAssetsFromText(html)) {
      assetUrls.add(asset);
    }

    for (const buildId of extractBuildIdsFromText(html)) {
      const manifestAssets = await discoverAssetsFromNextManifests(buildId);

      for (const asset of manifestAssets) {
        assetUrls.add(asset);
      }
    }

    await cacheUrls(CACHE_STATIC, [...assetUrls], { reload: true });
    await trimCache(CACHE_STATIC, STATIC_MAX_ENTRIES);
  } catch (error) {
    console.warn("[SW] precachePageWithAssets failed", pageUrl, error);
  }
}

async function precacheCriticalApp() {
  await cacheUrls(CACHE_SHELL, CRITICAL_SHELL, { reload: true });
  await cacheUrls(CACHE_ICONS, ICON_ASSETS, { reload: true });

  await Promise.all(APP_SHELL_ROUTES.map((route) => precachePageWithAssets(route)));

  await trimCache(CACHE_SHELL, PAGE_MAX_ENTRIES);
  await trimCache(CACHE_STATIC, STATIC_MAX_ENTRIES);
}

async function matchRouteShell(pathname) {
  const shellCache = await caches.open(CACHE_SHELL);

  const candidates = [];

  if (pathname === LEGACY_OFFLINE_ROUTE || pathname.startsWith(`${LEGACY_OFFLINE_ROUTE}/`)) {
    candidates.push(routeKey(OFFLINE_ROUTE));
  }

  candidates.push(routeKey(pathname));
  candidates.push(routeKey(stripSearch(pathname)));
  candidates.push(routeKey(OFFLINE_ROUTE));
  candidates.push(routeKey("/"));

  for (const key of candidates) {
    const matched = await shellCache.match(key, { ignoreSearch: true });
    if (matched) return matched;
  }

  return null;
}

async function handleNavigate(event, url) {
  if (
    url.pathname === LEGACY_OFFLINE_ROUTE ||
    url.pathname.startsWith(`${LEGACY_OFFLINE_ROUTE}/`)
  ) {
    const redirectUrl = new URL(OFFLINE_ROUTE, self.location.origin);
    redirectUrl.search = url.search;
    return Response.redirect(redirectUrl.toString(), 302);
  }

  try {
    const preload = event.preloadResponse ? await event.preloadResponse : null;

    const fresh =
      preload ||
      (await fetchWithTimeout(
        new Request(event.request, {
          cache: "no-store",
          credentials: "same-origin",
        })
      ));

    if (fresh && fresh.ok && !isPrivatePage(url)) {
      const cleanForCache = withoutSpeculationHeaders(fresh.clone());

      caches
        .open(CACHE_PAGES)
        .then((cache) => cache.put(event.request, cleanForCache))
        .then(() => trimCache(CACHE_PAGES, PAGE_MAX_ENTRIES))
        .catch(() => undefined);

      if (APP_SHELL_ROUTES.includes(url.pathname)) {
        caches
          .open(CACHE_SHELL)
          .then((cache) =>
            cache.put(routeKey(url.pathname), withoutSpeculationHeaders(fresh.clone()))
          )
          .catch(() => undefined);
      }
    }

    if (fresh) return withoutSpeculationHeaders(fresh.clone());

    throw new Error("no-network-response");
  } catch {
    if (isOfflinePlayerRoute(url)) {
      const offlineShell = await matchRouteShell(OFFLINE_ROUTE);
      if (offlineShell) return offlineShell;
    }

    if (!isPrivatePage(url)) {
      let cached = await caches.match(event.request);
      if (cached) return cached;

      cached = await caches.match(event.request, { ignoreSearch: true });
      if (cached) return cached;

      if (url.pathname.startsWith("/watch/")) {
        const shell = await matchRouteShell(OFFLINE_ROUTE);
        if (shell) return shell;
      }

      if (url.pathname.startsWith("/downloads")) {
        const shell = await matchRouteShell("/downloads");
        if (shell) return shell;
      }

      const homeShell = await matchRouteShell("/");
      if (homeShell) return homeShell;
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

  const cached =
    (await iconCache.match(request, { ignoreSearch: true })) ||
    (await caches.match(request, { ignoreSearch: true }));

  if (cached) {
    fetch(request)
      .then((response) => {
        if (response.ok) return iconCache.put(request, response.clone());
        return undefined;
      })
      .catch(() => undefined);

    return cached;
  }

  try {
    const fresh = await fetch(request);

    if (fresh.ok) {
      await iconCache.put(request, fresh.clone());
    }

    return fresh;
  } catch {
    return new Response("", {
      status: 204,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}

async function handleStatic(request) {
  const url = new URL(request.url);

  const cached =
    (await caches.match(request)) ||
    (await caches.match(request, { ignoreSearch: true })) ||
    (await caches.match(stripSearch(url), { ignoreSearch: true }));

  if (cached) {
    return cached;
  }

  try {
    const fresh = await fetch(request);

    if (fresh.ok) {
      const targetCache = url.pathname.startsWith("/_next/static/") ? CACHE_STATIC : CACHE_ICONS;

      caches
        .open(targetCache)
        .then((cache) => cache.put(request, fresh.clone()))
        .then(() => trimCache(targetCache, targetCache === CACHE_STATIC ? STATIC_MAX_ENTRIES : 80))
        .catch(() => undefined);
    }

    return fresh;
  } catch {
    console.warn("[SW] static asset missing offline", request.url);

    return new Response("", {
      status: 504,
      statusText: "Static asset unavailable offline",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
}

async function handleApi(request, url) {
  if (!isCacheableApi(url)) {
    try {
      return await fetch(request);
    } catch {
      return new Response(JSON.stringify({ error: "offline" }), {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
    }
  }

  try {
    const fresh = await fetch(request);

    if (fresh.ok) {
      caches
        .open(CACHE_API)
        .then((cache) => cache.put(request, fresh.clone()))
        .then(() => trimCache(CACHE_API, API_MAX_ENTRIES))
        .catch(() => undefined);
    }

    return fresh;
  } catch {
    const cached =
      (await caches.match(request)) || (await caches.match(request, { ignoreSearch: true }));

    if (cached) return cached;

    return new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      await precacheCriticalApp();
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        try {
          await self.registration.navigationPreload.enable();
        } catch {
          // ignore
        }
      }

      const keys = await caches.keys();

      await Promise.all(
        keys.filter((key) => !KNOWN_CACHES.includes(key)).map((key) => caches.delete(key))
      );

      await self.clients.claim();

      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      clients.forEach((client) => {
        try {
          client.postMessage({
            type: "GI0PHIM_SW_ACTIVATED",
            version: VERSION,
          });
        } catch {
          // ignore
        }
      });
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  if (request.cache === "only-if-cached" && request.mode !== "same-origin") return;

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

  if (request.mode === "navigate") {
    event.respondWith(handleNavigate(event, url));
    return;
  }

  if (url.pathname.startsWith("/_next/image")) {
    event.respondWith(handleImage(request));
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApi(request, url));
    return;
  }

  if (isIconAsset(url)) {
    event.respondWith(handleIcon(request));
    return;
  }

  if (isImageAsset(url)) {
    event.respondWith(handleImage(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(handleStatic(request));
    return;
  }
});

async function handleImage(request) {
  const url = new URL(request.url);

  const cached =
    (await caches.match(request)) || (await caches.match(request, { ignoreSearch: true }));

  if (cached) {
    fetch(request)
      .then((response) => {
        if (response.ok) {
          caches
            .open(CACHE_IMAGES)
            .then((cache) => cache.put(request, response.clone()))
            .then(() => trimCache(CACHE_IMAGES, IMAGE_MAX_ENTRIES))
            .catch(() => undefined);
        }
      })
      .catch(() => undefined);

    return cached;
  }

  try {
    const fresh = await fetch(request);

    if (fresh.ok) {
      caches
        .open(CACHE_IMAGES)
        .then((cache) => cache.put(request, fresh.clone()))
        .then(() => trimCache(CACHE_IMAGES, IMAGE_MAX_ENTRIES))
        .catch(() => undefined);
    }

    return fresh;
  } catch {
    return new Response("", {
      status: 204,
      headers: {
        "Cache-Control": "no-store",
      },
    });
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

    const segmentUrl = movie.segmentUrls[idx];

    if (!segmentUrl) {
      return new Response("Offline segment index not found", { status: 404 });
    }

    const data = await getSegmentFromIDB(segmentUrl);

    if (!data) {
      return new Response("Offline segment data missing", { status: 404 });
    }

    const headers = {
      "Content-Type": "video/mp2t",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Accept-Ranges": "bytes",
    };

    const range = url.searchParams.get("range");
    const requestRange = range || "";
    if (requestRange) {
      const match = requestRange.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const start = Number(match[1]);
        const end = match[2] ? Number(match[2]) : data.byteLength - 1;
        if (Number.isFinite(start) && Number.isFinite(end) && start <= end) {
          const chunk = data.slice(start, Math.min(end + 1, data.byteLength));
          return new Response(chunk, {
            status: 206,
            headers: {
              ...headers,
              "Content-Length": String(chunk.byteLength),
              "Content-Range": `bytes ${start}-${start + chunk.byteLength - 1}/${data.byteLength}`,
            },
          });
        }
      }
    }

    return new Response(data, {
      headers: {
        ...headers,
        "Content-Length": String(data.byteLength),
      },
    });
  } catch (error) {
    return new Response(`Offline segment error: ${error?.message || error}`, {
      status: 500,
    });
  }
}

function normalizeQuality(quality) {
  const q = String(quality || "720p")
    .trim()
    .toUpperCase();

  if (q === "4K" || q === "2160P" || q === "UHD") return "4K";
  if (q === "1080P" || q === "FHD" || q === "FULL_HD") return "1080p";

  return "720p";
}

function keyId(episodeId, quality) {
  return `${episodeId}:${normalizeQuality(quality)}`;
}

function normalizeKeyData(keyData) {
  if (!keyData) return null;
  if (keyData instanceof ArrayBuffer) return keyData;
  if (ArrayBuffer.isView(keyData)) {
    return keyData.buffer.slice(keyData.byteOffset, keyData.byteOffset + keyData.byteLength);
  }
  if (Object.prototype.toString.call(keyData) === "[object ArrayBuffer]") return keyData;
  if (typeof keyData.byteLength === "number") {
    if (keyData.buffer) {
      return keyData.buffer.slice(
        keyData.byteOffset || 0,
        (keyData.byteOffset || 0) + keyData.byteLength
      );
    }
    return keyData;
  }
  return null;
}

async function serveOfflineKey(url) {
  try {
    const parts = url.pathname.split("/");
    const episodeId = Number(parts[3]);
    const quality = decodeURIComponent(parts[4] || "720p");

    if (!Number.isFinite(episodeId)) {
      return new Response("Invalid offline key path", { status: 400 });
    }

    const key = await getKeyFromIDB(episodeId, quality);
    const keyData = normalizeKeyData(key?.keyData);

    if (!keyData) {
      return new Response("Offline key not found", { status: 404 });
    }

    if (keyData.byteLength !== 16) {
      return new Response(`Invalid offline key length: ${keyData.byteLength}`, { status: 422 });
    }

    return new Response(keyData, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": "16",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(`Offline key error: ${error?.message || error}`, {
      status: 500,
    });
  }
}

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("giophim-offline", DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      const oldVersion = event.oldVersion;

      if (!db.objectStoreNames.contains("segments")) {
        db.createObjectStore("segments", { keyPath: "url" });
      }

      if (!db.objectStoreNames.contains("movies")) {
        db.createObjectStore("movies", { keyPath: "episodeId" });
      }

      if (oldVersion < 4) {
        if (db.objectStoreNames.contains("keys")) {
          db.deleteObjectStore("keys");
        }

        db.createObjectStore("keys", { keyPath: "id" });
      } else if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("posters")) {
        db.createObjectStore("posters", { keyPath: "episodeId" });
      }

      if (!db.objectStoreNames.contains("pending-history")) {
        db.createObjectStore("pending-history", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(storeName, key) {
  let db;

  try {
    db = await openIDB();

    return await new Promise((resolve) => {
      const tx = db.transaction(storeName, "readonly");
      const req = tx.objectStore(storeName).get(key);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
      tx.oncomplete = () => {
        try {
          db.close();
        } catch {
          // ignore
        }
      };
    });
  } catch {
    try {
      db?.close();
    } catch {
      // ignore
    }

    return null;
  }
}

async function getSegmentFromIDB(url) {
  const rec = await idbGet("segments", url);
  return rec?.data || null;
}

async function getMovieFromIDB(episodeId) {
  return idbGet("movies", episodeId);
}

async function getKeyFromIDB(episodeId, quality) {
  let db;

  try {
    db = await openIDB();

    return await new Promise((resolve) => {
      const tx = db.transaction("keys", "readonly");
      const store = tx.objectStore("keys");

      const req = store.get(keyId(episodeId, quality));

      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result);
          return;
        }

        const legacyReq = store.get(episodeId);
        legacyReq.onsuccess = () => resolve(legacyReq.result || null);
        legacyReq.onerror = () => resolve(null);
      };

      req.onerror = () => resolve(null);

      tx.oncomplete = () => {
        try {
          db.close();
        } catch {
          // ignore
        }
      };
    });
  } catch {
    try {
      db?.close();
    } catch {
      // ignore
    }

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
        payload = {
          title: "Gió Phim",
          body: event.data.text(),
        };
      } catch {
        payload = {};
      }
    }
  }

  const title = (payload.title && String(payload.title).trim()) || "Gió Phim";
  const body = (payload.body || payload.content || payload.message || "").toString();

  const options = {
    body,
    icon: "/icons/logo.webp",
    badge: "/icons/icon-192.webp",
    data: {
      url: payload.actionUrl || payload.url || "/",
    },
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
    Promise.all([
      self.registration.showNotification(title, options).catch(() => {
        try {
          return self.registration.showNotification(title, {
            body,
            icon: "/icons/logo.webp",
          });
        } catch {
          return undefined;
        }
      }),
      self.clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clients) => {
          clients.forEach((client) => {
            try {
              client.postMessage({
                type: "REFRESH_NOTIFICATIONS",
              });
            } catch {
              // ignore
            }
          });
        })
        .catch(() => undefined),
    ])
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

      const sameOrigin = allClients.find((client) => client.url.startsWith(self.location.origin));

      if (sameOrigin) {
        sameOrigin.postMessage({
          type: "navigate",
          url: targetUrl,
        });

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
  let db;

  try {
    db = await openIDB();

    const pending = await new Promise((resolve) => {
      const tx = db.transaction("pending-history", "readonly");
      const req = tx.objectStore("pending-history").getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    for (const item of pending) {
      try {
        const response = await fetch("/api/v1/watch-histories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(item.data),
        });

        if (!response.ok) continue;

        await new Promise((resolve) => {
          const tx = db.transaction("pending-history", "readwrite");
          tx.objectStore("pending-history").delete(item.id);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        });
      } catch {
        // network unavailable
      }
    }
  } catch {
    // IDB unavailable
  } finally {
    try {
      db?.close();
    } catch {
      // ignore
    }
  }
}

self.addEventListener("message", (event) => {
  const data = event.data || {};

  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (data.type === "PRECACHE_OFFLINE_APP") {
    const port = event.ports && event.ports[0];

    event.waitUntil(
      (async () => {
        try {
          await precacheCriticalApp();

          port?.postMessage({
            type: "PRECACHE_OFFLINE_APP_DONE",
            ok: true,
            version: VERSION,
          });
        } catch (error) {
          port?.postMessage({
            type: "PRECACHE_OFFLINE_APP_DONE",
            ok: false,
            version: VERSION,
            error: error?.message || String(error),
          });
        }
      })()
    );

    return;
  }

  if (data.type === "PRECACHE_ROUTES") {
    const routes = Array.isArray(data.routes) ? data.routes : APP_SHELL_ROUTES;

    event.waitUntil(
      (async () => {
        await Promise.all(routes.map((route) => precachePageWithAssets(route)));
      })()
    );

    return;
  }

  if (data.type === "CACHE_URLS") {
    const urls = Array.isArray(data.urls) ? data.urls : [];

    event.waitUntil(cacheUrls(CACHE_STATIC, urls, { reload: true }));
    return;
  }

  if (data.type === "GET_SW_VERSION") {
    try {
      event.source?.postMessage({
        type: "GI0PHIM_SW_VERSION",
        version: VERSION,
      });
    } catch {
      // ignore
    }
  }
});
