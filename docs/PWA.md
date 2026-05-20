# Báo cáo triển khai PWA — Gió Phim

> Tài liệu mô tả chi tiết kiến trúc, lợi ích và toàn bộ tính năng PWA (Progressive Web App) đã được triển khai trong hệ thống Gió Phim. Phạm vi bao gồm cả frontend (Next.js + Service Worker + IndexedDB) lẫn backend (Spring Boot + Web Push).

---

## Mục lục

1. Tóm tắt
2. Mục tiêu và lợi ích
3. Kiến trúc tổng thể
4. Web App Manifest
5. Service Worker
6. Vòng đời và cập nhật Service Worker
7. Luồng cài đặt PWA
8. Push Notifications
9. Offline Download
10. Offline Playback
11. Background Sync
12. IndexedDB schema
13. Cross-platform: iOS, Android, Desktop
14. Cấu trúc thư mục
15. Cấu hình môi trường
16. Hạn chế và lưu ý vận hành

---

## 1. Tóm tắt

Gió Phim được triển khai như một Progressive Web App đầy đủ tính năng, đáp ứng đủ ba trụ cột chính của PWA:

| Trụ cột               | Trạng thái triển khai                                                            |
| --------------------- | -------------------------------------------------------------------------------- |
| Capable (có khả năng) | Manifest hợp lệ, đáp ứng PWA installability checklist của Chromium, Edge, Safari |
| Reliable (tin cậy)    | Service Worker với caching đa lớp, fallback inline HTML, navigation preload      |
| Installable (cài đặt) | Hỗ trợ `beforeinstallprompt` cho Chromium, hướng dẫn manual cho iOS Safari       |

Toàn bộ logic Service Worker tập trung trong `public/sw.js` (phiên bản `v19`) và được đăng ký từ `src/app/layout.tsx`. Người dùng có thể:

- Cài Gió Phim lên màn hình chính của Android, iOS, Windows, macOS, ChromeOS.
- Mở app khi không có mạng và vẫn nhận được giao diện hợp lệ thay vì lỗi `ERR_FAILED`.
- Tải trọn vẹn từng tập phim (segments + AES key + metadata) về thiết bị và xem offline.
- Nhận thông báo đẩy (Web Push) ngay cả khi đã đóng app.
- Đồng bộ ngầm tiến độ xem khi có lại kết nối mạng.

---

## 2. Mục tiêu và lợi ích

### 2.1 Mục tiêu

| STT | Mục tiêu                      | Mô tả                                                                                                |
| --- | ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | Trải nghiệm "app-like"        | Toàn màn hình, không thanh địa chỉ, có icon trên home screen, splash screen riêng                    |
| 2   | Sử dụng không gián đoạn       | Dù mất mạng đột ngột, người dùng không bao giờ thấy màn hình lỗi trắng của trình duyệt               |
| 3   | Xem phim offline              | Cho phép tải tập phim về thiết bị để xem khi không có internet (máy bay, vùng phủ sóng kém)          |
| 4   | Engagement qua push           | Thông báo phim mới, nhắc xem tiếp, sự kiện hệ thống được đẩy về client kể cả khi app đã đóng         |
| 5   | Hiệu năng                     | Cache shell và static assets để rút ngắn thời gian tải lại, đặc biệt trên 3G/4G yếu                  |
| 6   | Bảo mật nội dung có bản quyền | Cơ chế offline token có hạn 48 giờ, không lộ access token chính, không cache nhầm token vào response |

### 2.2 Lợi ích đem lại

Đối với người dùng cuối:

- Truy cập app từ home screen một chạm, giống native app.
- Vẫn xem được phim đã tải khi đi máy bay, đi vùng sóng yếu.
- Nhận thông báo phim mới mà không cần mở app.
- Lịch sử xem được lưu lại ngay cả khi xem offline, tự đồng bộ khi có mạng.

Đối với hệ thống:

- Giảm tải máy chủ nhờ cache cấp client cho danh sách phim, danh mục, tags, gói cước.
- Giữ chân người dùng cao hơn web thuần, giảm friction khi mở lại.
- Có một kênh push trực tiếp đến thiết bị, không phụ thuộc Firebase Cloud Messaging.

Đối với chi phí phát triển:

- Một codebase duy nhất chạy trên Android, iOS, Desktop, không cần xây dựng app native riêng.
- Không cần xuất bản qua Google Play hay App Store.

---

## 3. Kiến trúc tổng thể

```
+--------------------------------+        +--------------------------------+
|  Client Layer                  |        |  Backend Layer (Spring Boot)   |
|                                |        |                                |
|  Browser / PWA standalone      |        |  - HLS Streaming API           |
|                                |        |  - AES Key Endpoint            |
|   +--------------------+       |        |  - Offline Package API         |
|   |  Next.js App       |       |        |  - Offline Token Service       |
|   +--------------------+       |        |  - Push Subscription API       |
|             |                  |        |  - Notification Producer       |
|             v                  |        +--------------------------------+
|   +--------------------+       |                  ^
|   |  Service Worker    |<--------- VAPID Push --->| Browser Push Service
|   |  (public/sw.js)    |       |                  |
|   +--------------------+       |        +--------------------------------+
|        ^         ^             |        |  Web Push (FCM / APNs / etc)   |
|        |         |             |        +--------------------------------+
|        v         v             |
|   +--------+  +-----------+    |
|   | Caches |  | IndexedDB |    |
|   | API    |  | (offline) |    |
|   +--------+  +-----------+    |
+--------------------------------+
```

Ba lớp hạ tầng client phối hợp:

- Cache Storage API (`caches`): lưu app shell, static assets, page snapshots, API responses không nhạy cảm.
- IndexedDB (`indexedDB`): lưu binary segments HLS, AES key đã giải mã, metadata phim đã tải, posters, hàng đợi watch history pending.
- Service Worker: bộ điều phối duy nhất giữa network, caches, IndexedDB, hooks push và background sync.

---

## 4. Web App Manifest

File `public/manifest.json` khai báo metadata để trình duyệt nhận diện và cài app.

```json
{
  "name": "Gió Phim - Gió đưa, phim tới",
  "short_name": "Gió Phim",
  "description": "Khám phá hàng nghìn bộ phim và series hấp dẫn. Xem phim HD miễn phí tại Gió Phim.",
  "start_url": "/",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#0C0C0C",
  "theme_color": "#C8102E",
  "lang": "vi",
  "scope": "/",
  "categories": ["entertainment"],
  "icons": [
    { "src": "/icons/icon-192.webp", "sizes": "192x192", "type": "image/webp", "purpose": "any" },
    { "src": "/icons/icon-512.webp", "sizes": "512x512", "type": "image/webp", "purpose": "any" },
    {
      "src": "/icons/icon-maskable.webp",
      "sizes": "512x512",
      "type": "image/webp",
      "purpose": "maskable"
    }
  ],
  "shortcuts": [
    { "name": "Trang chủ", "url": "/" },
    { "name": "Phim đã tải", "url": "/downloads" }
  ],
  "prefer_related_applications": false
}
```

### 4.1 Thuộc tính quan trọng

| Thuộc tính            | Giá trị                | Vai trò                                                           |
| --------------------- | ---------------------- | ----------------------------------------------------------------- |
| `display`             | `standalone`           | Bỏ thanh địa chỉ và toolbar trình duyệt, app chạy như native      |
| `start_url`           | `/`                    | Trang mở khi user nhấn icon home screen                           |
| `theme_color`         | `#C8102E`              | Màu thanh trạng thái Android, splash screen, fallback monogram    |
| `background_color`    | `#0C0C0C`              | Màu nền splash screen lúc app đang load                           |
| `icons[].purpose=any` | 192px, 512px           | Icon hiển thị trên home screen Android, app drawer, task switcher |
| `icons[].maskable`    | 512px                  | Icon đầy đủ vùng safe area cho Android adaptive icon (Android 8+) |
| `shortcuts`           | Trang chủ, Phim đã tải | Long-press icon hiện shortcut menu                                |
| `scope`               | `/`                    | Mọi URL trong scope đều thuộc PWA, click link giữ trong app       |

### 4.2 Meta tags bổ sung

Trong `src/app/layout.tsx`, ngoài link manifest, hệ thống thêm các meta cho iOS Safari:

```tsx
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Gió Phim" />
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180.png" />
<link rel="apple-touch-icon" sizes="167x167" href="/icons/apple-touch-icon-167.png" />
<link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152.png" />
<link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-touch-icon-120.png" />
```

Cùng với `viewport` config:

```tsx
export const viewport: Viewport = {
  themeColor: "#C8102E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};
```

`viewportFit: "cover"` đảm bảo nội dung phủ hết khu vực notch trên iPhone và Android display cutout.

---

## 5. Service Worker

File `public/sw.js` (`VERSION = "v19"`) là trung tâm của mọi tính năng offline. Cấu trúc tổng quan:

```
sw.js
├── Hằng số: VERSION, cache names, asset lists
├── Hàm phụ trợ: shouldBypass, isPrivatePage, isStaticAsset, trimCache, ...
├── install     → precache shell + icons
├── activate    → cleanup cache cũ + bật navigation preload + claim clients
├── fetch       → router phân nhánh request
├── push        → hiển thị notification
├── notificationclick → mở client tab tương ứng
├── sync        → đẩy watch history pending lên server
└── message     → hỗ trợ SKIP_WAITING từ trang web
```

### 5.1 Cấu trúc cache nhiều lớp

Hệ thống chia cache thành 5 namespace, mỗi namespace có chiến lược riêng:

| Cache name             | Chiến lược              | Bust theo VERSION | Trim       | Nội dung                                                       |
| ---------------------- | ----------------------- | ----------------- | ---------- | -------------------------------------------------------------- |
| `giophim-shell-v19`    | Network-first, fallback | Có                | Không      | `/`, `/downloads`, `/watch/offline`, `/offline.html`, manifest |
| `giophim-pages-v19`    | Network-first, fallback | Có                | 30 entries | Snapshot HTML các trang public đã visit                        |
| `giophim-api-v19`      | Network-first, fallback | Có                | 50 entries | API danh sách phim, categories, tags, subscription-plans       |
| `giophim-static-v19`   | Cache-first, SWR        | Có                | 80 entries | `_next/static/*`, fonts, JS/CSS hash                           |
| `giophim-icons-stable` | Cache-first             | Không             | Không      | Toàn bộ icon, apple-touch-icon, manifest.json                  |

Điểm mấu chốt: `giophim-icons-stable` tách riêng và không bust theo VERSION. Lý do là khi bump `VERSION` (ví dụ `v18 → v19`), các cache khác sẽ bị xoá trong `activate`. Nếu icons nằm chung shell, khoảng thời gian từ install đến activate có thể khiến icons tạm 404 và iOS sẽ rơi về fallback "monogram" (chữ G nền đỏ). Tách icons sang cache stable giải quyết triệt để vấn đề này.

### 5.2 Định tuyến trong fetch handler

```
Request đến SW
   |
   |── shouldBypass()?  ── true ──► để network xử lý (không intercept)
   |
   |── /__offline__/seg/<id>/<idx>.ts?  ── ► đọc segment binary từ IndexedDB
   |── /__offline__/key/<id>?           ── ► đọc AES key từ IndexedDB
   |
   |── path kết thúc .ts hoặc chứa /stream/?
   |       network → fail thì fallback IndexedDB segment
   |
   |── path bắt đầu /api/?
   |       isCacheableApi() → SWR (cache + refresh)
   |       còn lại         → network only, offline trả 503 JSON
   |
   |── request.mode = "navigate"?
   |       network-first
   |       offline → cache match → fallback /watch/offline → fallback /offline.html
   |       fallback inline FALLBACK_OFFLINE_HTML (luôn có sẵn)
   |
   |── isIconAsset()? → cache-first từ giophim-icons-stable
   |
   |── isStaticAsset()? → cache-first + SWR
```

### 5.3 Chiến lược Network-first cho navigation

```javascript
async function handleNavigate(event, url) {
  try {
    const preload = event.preloadResponse ? await event.preloadResponse : null;
    const fresh = preload || (await fetch(event.request));
    if (fresh && fresh.ok && !isPrivatePage(url)) {
      const clone = fresh.clone();
      caches.open(CACHE_PAGES).then((cache) => cache.put(event.request, clone));
    }
    if (fresh) return fresh;
    throw new Error("no-network-response");
  } catch {
    // 1) Đặc biệt: /watch/offline luôn ưu tiên shell pre-cache
    // 2) Cache match (giữ nguyên query)
    // 3) Cache match (ignoreSearch)
    // 4) Watch shell hoặc downloads shell
    // 5) /offline.html từ cache
    // 6) FALLBACK_OFFLINE_HTML inline
    return buildOfflineFallbackResponse();
  }
}
```

`navigationPreload` được bật trong `activate` để Android Chrome có thể fetch song song trong khi SW boot. Điều này giảm rõ rệt thời gian cold-start trên Android.

### 5.4 Inline fallback HTML

Đây là điểm khác biệt quan trọng giữa triển khai này và một số PWA cơ bản: trong code SW có sẵn một block HTML tự thân `FALLBACK_OFFLINE_HTML`. Nếu mọi nguồn cache khác fail, SW vẫn trả về một response 200 hợp lệ. Trên Android Chrome standalone mode, response 504 hoặc lỗi sẽ render thành `ERR_FAILED`, còn response 200 dù tối thiểu vẫn render bình thường.

### 5.5 Bypass logic

Một số request không bao giờ được SW xử lý, phải đi thẳng ra network:

```javascript
function shouldBypass(url) {
  if (url.protocol !== "https:" && url.protocol !== "http:") return true;
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
```

Mục đích:

- Tránh cache nhầm response chứa Bearer token trong `/api/v1/auth/*`.
- Không can thiệp vào streaming chat của assistant (server-sent events).
- Không cache video binary lớn (mp4, webm) qua Cache API vì sẽ huỷ hoại budget storage.

---

## 6. Vòng đời và cập nhật Service Worker

### 6.1 Đăng ký từ root layout

`src/app/layout.tsx` chèn inline script đăng ký SW:

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
            .then(function(reg) {
              if (reg.waiting && navigator.serviceWorker.controller) {
                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
              }
              reg.addEventListener('updatefound', function() {
                var nw = reg.installing;
                if (!nw) return;
                nw.addEventListener('statechange', function() {
                  if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                    nw.postMessage({ type: 'SKIP_WAITING' });
                  }
                });
              });
              setInterval(function(){ reg.update().catch(function(){}); }, 60 * 60 * 1000);
            });

          var refreshing = false;
          navigator.serviceWorker.addEventListener('controllerchange', function() {
            if (refreshing) return;
            refreshing = true;
            window.location.reload();
          });
        });
      }
    `,
  }}
/>
```

### 6.2 Đặc điểm thiết kế

- `updateViaCache: 'none'`: trình duyệt không cache file `sw.js` ở HTTP cache layer, đảm bảo mỗi `register()` đều check fresh từ server.
- `setInterval(reg.update, 60 phút)`: chủ động kiểm tra phiên bản mới định kỳ trong khi tab vẫn mở.
- `updatefound + skipWaiting`: khi SW mới installed nhưng có SW cũ đang controller, gửi message để SW mới thay thế ngay.
- `controllerchange + refreshing flag`: khi controller thay đổi (SW mới active), reload đúng một lần để tab dùng SW mới. Flag chống vòng lặp reload vô tận khi nhiều tab cùng mở.

### 6.3 Các state của Service Worker

```
parsed → installing → installed (waiting) → activating → activated
                              │
                              └──► (nếu skipWaiting) → activating
```

Trong `activate`:

```javascript
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !KNOWN_CACHES.includes(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});
```

`clients.claim()` cho phép SW mới điều khiển ngay tab đang mở mà không cần đóng và mở lại.

---

## 7. Luồng cài đặt PWA

### 7.1 Hook `usePwa()`

`src/hooks/use-pwa.ts` chịu trách nhiệm theo dõi trạng thái cài đặt:

```typescript
export function usePwa(): UsePwaReturn {
  const [isPWA, setIsPWA] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // ... lắng nghe matchMedia "(display-mode: standalone)"
  // ... lắng nghe online/offline
  // ... lắng nghe pwa-installable custom event

  return {
    isPWA,
    canInstall,
    isOnline,
    mounted,
    isIOS,
    isSafari,
    needsManualInstall,
    isInstalled,
    promptInstall,
  };
}
```

### 7.2 Lưu deferredPrompt ở module scope

`beforeinstallprompt` được lắng nghe ngay khi module load để không bỏ sót event:

```typescript
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
let globalCanInstall = false;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    globalCanInstall = true;
    window.dispatchEvent(new Event("pwa-installable"));
  });
  window.addEventListener("appinstalled", () => {
    globalDeferredPrompt = null;
    globalCanInstall = false;
    localStorage.setItem("pwa-installed", "1");
  });
}
```

Lưu ý: `beforeinstallprompt` chỉ phát một lần duy nhất, do đó phải bắt sớm và lưu lại để dùng trong UI.

### 7.3 Luồng install trên Chromium (Android, Windows, macOS)

```
Người dùng truy cập giophim.com
        |
        v
Trình duyệt kiểm tra:
   manifest hợp lệ + SW đã register + HTTPS + chưa từng cài
        |
        v
Phát beforeinstallprompt
        |
        v
usePwa() lưu deferredPrompt → canInstall = true
        |
        v
InstallBanner hiển thị (slide up)
        |
   Người dùng nhấn "Cài"
        |
        v
deferredPrompt.prompt()
        |
   Người dùng xác nhận
        |
        v
Phát appinstalled
        |
        v
isInstalled = true → app trên home screen
```

### 7.4 Luồng install trên iOS Safari

iOS Safari không phát `beforeinstallprompt`. Hệ thống phát hiện qua `isIOSDevice()` và hiển thị hướng dẫn manual:

```
Mở Safari → giophim.com
        |
        v
needsManualInstall = isIOS && !isPWA && !canInstall
        |
        v
Hiển thị dialog: "Nhấn nút Chia sẻ → Thêm vào màn hình chính"
```

---

## 8. Push Notifications

### 8.1 Giao thức Web Push + VAPID

VAPID (Voluntary Application Server Identification, RFC 8292) cho phép server tự xác thực với push service mà không cần đăng ký Firebase. Cặp khóa được sinh bằng:

```bash
npx web-push generate-vapid-keys
```

Frontend chỉ cần `NEXT_PUBLIC_VAPID_PUBLIC_KEY`. Backend giữ cả public và private key.

### 8.2 Luồng đăng ký push

```
User bật notification
        |
        v
Notification.requestPermission() → "granted"
        |
        v
navigator.serviceWorker.ready
        |
        v
registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: VAPID_PUBLIC_KEY
})
        |
        v
Trả về { endpoint, keys: { p256dh, auth } }
        |
        v
POST /api/v1/push/subscribe → backend lưu vào push_subscriptions
```

### 8.3 Bảng lưu subscription

```sql
CREATE TABLE push_subscriptions (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT NOT NULL,
  endpoint   TEXT NOT NULL,
  p256dh     VARCHAR(255),
  auth       VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY (user_id, endpoint(255))
);
```

### 8.4 Endpoint backend

| Method | Path                       | Body                         | Mô tả                      |
| ------ | -------------------------- | ---------------------------- | -------------------------- |
| POST   | `/api/v1/push/subscribe`   | `{ endpoint, p256dh, auth }` | Lưu hoặc cập nhật sub      |
| DELETE | `/api/v1/push/unsubscribe` | `{ endpoint }`               | Xoá sub khỏi user hiện tại |

### 8.5 Handler trong Service Worker

```javascript
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    /* fallback */
  }

  const title = payload.title?.trim() || "Gió Phim";
  const body = (payload.body || payload.content || payload.message || "").toString();
  const options = {
    body,
    icon: "/icons/logo.webp",
    data: { url: payload.actionUrl || payload.url || "/" },
  };
  if (payload.tag) options.tag = String(payload.tag);
  if (payload.image) options.image = payload.image;
  if (payload.requireInteraction === true) options.requireInteraction = true;

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const sameOrigin = allClients.find((c) => c.url.startsWith(self.location.origin));
      if (sameOrigin) {
        sameOrigin.postMessage({ type: "navigate", url: targetUrl });
        return sameOrigin.focus();
      }
      return self.clients.openWindow(targetUrl);
    })()
  );
});
```

Đặc điểm:

- Nếu user đã mở một tab Gió Phim, focus tab đó và gửi message điều hướng nội bộ thay vì mở tab mới.
- Nếu chưa mở, tạo window mới đến `actionUrl`.
- Hỗ trợ payload có `image`, `tag`, `requireInteraction` để mở rộng linh hoạt.

---

## 9. Offline Download

### 9.1 Bài toán: HLS + AES-128

Hệ thống streaming dùng HLS với mã hoá AES-128. Mỗi lần play, player phải gọi tới `/stream/key/{episodeId}/{quality}` kèm Bearer token để lấy khoá giải mã. Hệ quả:

- Không thể đơn giản cache HLS playlist + segments rồi bật offline. Khi offline, không lấy được key, không giải mã được.
- Nếu lưu cả Bearer token vào client để dùng sau đó thì có rủi ro lộ token.

### 9.2 Giải pháp: Offline JWT 48 giờ

Backend cấp một JWT có claim `type: offline`, expiration 48 giờ, ký bằng cùng secret JWT chính. Client dùng token này để fetch AES key một lần duy nhất tại thời điểm download. Sau đó key được lưu vào IndexedDB và không cần token nữa.

```java
// OfflineTokenService.java
String token = Jwts.builder()
    .subject(userId)
    .claim("episodeId", episodeId)
    .claim("quality", quality)
    .claim("type", "offline")
    .expiration(new Date(now + 48L * 60 * 60 * 1000))
    .signWith(signingKey)
    .compact();
```

### 9.3 API

| Method | Path                                                     | Auth        | Mô tả                            |
| ------ | -------------------------------------------------------- | ----------- | -------------------------------- |
| GET    | `/api/v1/stream/offline/episodes/{id}/{quality}/package` | Bearer      | Trả về offlineToken + segments[] |
| GET    | `/api/v1/stream/offline/key/{id}/{quality}?token=...`    | Offline JWT | Trả về AES key bytes             |

Response của package endpoint:

```typescript
interface OfflinePackage {
  offlineToken: string;
  expiresAt: string;
  segments: Array<{ url: string; keyUrl?: string }>;
  metadata: {
    movieId: number;
    movieSlug: string;
    movieTitle: string;
    episodeId: number;
    episodeTitle?: string;
    episodeNumber?: number;
    posterUrl?: string;
    durationSeconds: number;
    quality: string;
  };
}
```

### 9.4 Quy trình download phía client

`src/lib/offline-downloader.ts` orchestrates toàn bộ flow:

```
useOfflineDownload(episodeId).startDownload(quality)
        |
        v
fetchOfflinePackage(episodeId, quality)
        |
        v
{ offlineToken, segments[], metadata, expiresAt }
        |
        v
cachePoster(episodeId, posterUrl)        ← best-effort
        |
        v
Fetch AES key:
  GET /stream/offline/key/{id}/{quality}?token={offlineToken}
        |
        v
offlineStorage.saveKey(episodeId, quality, keyData)
        |
        v
Loop với BATCH = 5 song song:
  for seg in segments:
    fetch(seg.url, { Authorization: Bearer accessToken })
    offlineStorage.saveSegment(seg.url, ArrayBuffer)
    onProgress({ percent, bytesDownloaded })
        |
        v
offlineStorage.saveMovie({ episodeId, segmentUrls[], expiresAt, sizeBytes, ... })
        |
        v
status = "downloaded"
```

Điểm quan trọng:

- Tải song song 5 segment một lần để tăng throughput nhưng không nghẽn băng thông.
- Có hỗ trợ `AbortController` cho phép user huỷ giữa chừng.
- Mỗi segment vẫn gắn `Authorization: Bearer` để backend log đúng user.

### 9.5 UI: `OfflineDownloadButton`

Component đặt trong `src/components/PWA/OfflineDownloadButton.tsx` với 4 trạng thái:

| Trạng thái    | Hiển thị                       | Tooltip                       |
| ------------- | ------------------------------ | ----------------------------- |
| `idle`        | Icon download                  | "Tải phim (chọn chất lượng)"  |
| `downloading` | Vòng tròn progress + nút X huỷ | "Đang tải X% — Nhấn để huỷ"   |
| `downloaded`  | Check xanh                     | "Đã tải (X MB) — Nhấn để xoá" |
| `error`       | Icon download đỏ               | "Lỗi tải — Thử lại"           |

Điều kiện hiển thị nút:

```typescript
const canDownloadOffline =
  isAuthenticated && hasActiveSubscription && currentPlan?.code === "PREMIUM_PLUS";
```

Nếu user chưa đủ điều kiện, nút vẫn hiển thị nhưng dialog hướng dẫn cài app hoặc nâng cấp gói.

### 9.6 Quality picker

Khi nhấn nút lần đầu, hiện dialog chọn chất lượng (720p / 1080p / 4K) kèm:

- Ước tính dung lượng theo bitrate trung bình (`QUALITY_BITRATE_KBPS`).
- Disable quality vượt quá gói cước hiện tại (`maxRank` từ `useSubscription`).
- Disable quality không có sẵn trên tập (truyền qua prop `availableQualities`).
- Hiển thị badge FHD (1080p) và UHD (4K) phân biệt rõ.

### 9.7 Trang Downloads

`src/app/downloads/page.tsx` đọc `offlineStorage.listMovies()` và liệt kê:

- Poster (đọc từ IndexedDB store `posters` để không cần network).
- Tên phim, tên tập, chất lượng.
- Dung lượng đã chiếm.
- Thời điểm tải, thời gian hết hạn.
- Nút play (dẫn đến `/watch/offline?episode=xxx&slug=yyy`).
- Nút xoá khỏi thiết bị (xoá mọi store liên quan).
- Badge "Hết hạn" nếu `expiresAt < now`.

---

## 10. Offline Playback

### 10.1 Hai luồng phát: stream và offline

`HlsPlayer` nhận thêm prop `offlineSrc?: string`. Khi có giá trị, player bỏ qua HLS.js và dùng native `<video>` với blob URL.

```typescript
useEffect(() => {
  if (offlineSrc) {
    video.src = offlineSrc;
    video.addEventListener(
      "loadedmetadata",
      () => {
        if (shouldPlay) video.play();
      },
      { once: true }
    );
    return;
  }
  // Online: HLS.js bình thường
  const hls = new Hls({ xhrSetup: attachAuth });
  hls.loadSource(src);
  hls.attachMedia(video);
}, [src, offlineSrc]);
```

### 10.2 Tạo Blob URL từ IndexedDB

```typescript
async function buildOfflineSrc(episodeId: number): Promise<string | null> {
  const movie = await offlineStorage.getMovie(episodeId);
  if (!movie) return null;

  const buffers: ArrayBuffer[] = [];
  for (const url of movie.segmentUrls) {
    const data = await offlineStorage.getSegment(url);
    if (!data) return null;
    buffers.push(data);
  }

  const blob = new Blob(buffers, { type: "video/mp2t" });
  return URL.createObjectURL(blob);
}
```

Vì segments đã được giải mã (AES key đã apply trước khi lưu), không cần xử lý gì thêm.

### 10.3 Route ảo `/__offline__/seg/...` (phương án thay thế)

Service Worker cũng hỗ trợ route ảo cho phép player gọi như HLS thường:

```javascript
// /__offline__/seg/{episodeId}/{idx}.ts
async function serveOfflineSegment(url) {
  const parts = url.pathname.split("/");
  const episodeId = Number(parts[3]);
  const idx = Number(String(parts[4]).replace(/\.ts$/i, ""));
  const movie = await getMovieFromIDB(episodeId);
  const segUrl = movie.segmentUrls[idx];
  const data = await getSegmentFromIDB(segUrl);
  return new Response(data, {
    headers: { "Content-Type": "video/mp2t", "Cache-Control": "no-store" },
  });
}
```

Điều này hữu ích khi cần dùng HLS.js ngay cả khi offline, ví dụ để giữ adaptive logic hoặc subtitles.

---

## 11. Background Sync

### 11.1 Mục tiêu

Khi user xem phim offline, tiến độ xem (timestamp, episodeId) cần được lưu lại. Khi có mạng lại, đẩy lên server. Thay vì poll liên tục, ta dùng Background Sync API.

### 11.2 Hàng đợi pending

IndexedDB store `pending-history`:

```javascript
db.createObjectStore("pending-history", { keyPath: "id", autoIncrement: true });
```

Khi mất mạng, watch history được push vào store này.

### 11.3 Đăng ký sync

```javascript
const reg = await navigator.serviceWorker.ready;
await reg.sync.register("sync-watch-history");
```

### 11.4 Handler trong SW

```javascript
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-watch-history") {
    event.waitUntil(syncWatchHistory());
  }
});

async function syncWatchHistory() {
  const db = await openIDB();
  const pending = await getAllPending(db);
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
      // network unavailable, sẽ retry tự động
    }
  }
}
```

Hệ điều hành (Android Chrome, Edge) sẽ giữ lại event tag và retry với backoff khi mạng có lại.

> Chú ý: iOS Safari hiện tại không hỗ trợ Background Sync. Trên iOS, fallback dùng `online` event để flush thủ công.

---

## 12. IndexedDB schema

Database: `giophim-offline` (version 3).

### 12.1 Object stores

| Store name        | keyPath              | Cấu trúc record                                                                                                                                                         |
| ----------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `movies`          | `episodeId`          | `{ episodeId, movieId, movieSlug, movieTitle, episodeTitle?, episodeNumber?, posterUrl?, quality, durationSeconds, segmentUrls[], downloadedAt, expiresAt, sizeBytes }` |
| `segments`        | `url`                | `{ url, data: ArrayBuffer }`                                                                                                                                            |
| `keys`            | `episodeId`          | `{ episodeId, quality, keyData: ArrayBuffer }`                                                                                                                          |
| `posters`         | `episodeId`          | `{ episodeId, contentType, data: ArrayBuffer }`                                                                                                                         |
| `pending-history` | `id` (autoIncrement) | `{ id, data: { episodeId, currentTimeSeconds, ... } }`                                                                                                                  |

### 12.2 Wrapper API

`src/lib/offline-storage.ts` cung cấp các method:

```typescript
offlineStorage.saveMovie(record): Promise<void>
offlineStorage.getMovie(episodeId): Promise<OfflineMovieRecord | undefined>
offlineStorage.listMovies(): Promise<OfflineMovieRecord[]>
offlineStorage.deleteMovie(episodeId): Promise<void>
offlineStorage.saveSegment(url, data): Promise<void>
offlineStorage.getSegment(url): Promise<ArrayBuffer | undefined>
offlineStorage.saveKey(episodeId, quality, data): Promise<void>
offlineStorage.getKey(episodeId): Promise<OfflineKeyRecord | undefined>
offlineStorage.savePoster(episodeId, contentType, data): Promise<void>
offlineStorage.getPoster(episodeId): Promise<OfflinePosterRecord | undefined>
offlineStorage.isDownloaded(episodeId): Promise<boolean>
offlineStorage.getTotalSize(): Promise<number>
```

`isDownloaded` đặc biệt: khi gọi, nó kiểm tra `expiresAt` và tự xoá record đã hết hạn. Đây là cơ chế cleanup ngầm.

---

## 13. Cross-platform: iOS, Android, Desktop

### 13.1 Bảng so sánh hỗ trợ

| Tính năng                     | Chrome Android | Edge Android | iOS Safari 17+ | Chrome Desktop | Edge Desktop |
| ----------------------------- | -------------- | ------------ | -------------- | -------------- | ------------ |
| Manifest + standalone display | Có             | Có           | Có             | Có             | Có           |
| `beforeinstallprompt`         | Có             | Có           | Không          | Có             | Có           |
| Hướng dẫn cài thủ công        | Không cần      | Không cần    | Có (dialog)    | Không cần      | Không cần    |
| Service Worker fetch + cache  | Có             | Có           | Có             | Có             | Có           |
| Navigation preload            | Có             | Có           | Hạn chế        | Có             | Có           |
| Push notifications (VAPID)    | Có             | Có           | Có (16.4+)     | Có             | Có           |
| Background Sync               | Có             | Có           | Không          | Có             | Có           |
| IndexedDB                     | Có             | Có           | Có             | Có             | Có           |
| Persistent storage budget     | Có             | Có           | Hạn chế (50MB) | Có             | Có           |
| Maskable icons                | Có             | Có           | Không          | Có             | Có           |

### 13.2 Các vấn đề iOS đã được xử lý

| Vấn đề                                                 | Cách khắc phục                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| Mỗi lần update SW làm mất logo, hiện monogram đỏ chữ G | Tách icons sang `giophim-icons-stable` không bust theo VERSION      |
| Safari 17 không phát beforeinstallprompt               | Dùng `isIOSDevice()` để show hướng dẫn manual                       |
| Background sync không hoạt động                        | Fallback `window.online` event để flush pending history             |
| Notch / Dynamic Island                                 | Set `viewportFit: "cover"` và padding dùng `env(safe-area-inset-*)` |

### 13.3 Các vấn đề Android đã được xử lý

| Vấn đề                                                 | Cách khắc phục                                                 |
| ------------------------------------------------------ | -------------------------------------------------------------- |
| Mất mạng → SW trả 504 → Chrome PWA report `ERR_FAILED` | Inline `FALLBACK_OFFLINE_HTML` luôn return 200 với HTML hợp lệ |
| Cold start chậm vì SW boot                             | Bật `navigationPreload` cho phép fetch song song               |
| Cache shell rỗng do precache silent fail               | Best-effort `addAll` với `cache: "reload"`, log warning        |
| Stale SW không được update                             | `updateViaCache: 'none'` + interval check 60 phút              |

---

## 14. Cấu trúc thư mục

### 14.1 Frontend

```
movie-frontend/movie-streaming-web/
├── public/
│   ├── manifest.json                     # Web App Manifest
│   ├── sw.js                             # Service Worker (v19)
│   ├── offline.html                      # Trang fallback offline
│   ├── apple-touch-icon.png              # iOS fallback
│   └── icons/
│       ├── icon-192.webp                 # Android
│       ├── icon-512.webp                 # Android, splash
│       ├── icon-maskable.webp            # Android adaptive
│       ├── logo.webp                     # Logo dùng trong notification
│       ├── apple-touch-icon-180.png
│       ├── apple-touch-icon-167.png
│       ├── apple-touch-icon-152.png
│       └── apple-touch-icon-120.png
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Đăng ký SW, meta tags, viewport
│   │   ├── downloads/
│   │   │   └── page.tsx                  # Trang phim đã tải
│   │   └── watch/
│   │       └── offline/
│   │           └── page.tsx              # Trang xem phim offline
│   │
│   ├── components/
│   │   ├── PWA/
│   │   │   ├── OfflineDownloadButton.tsx # Nút tải, dialog chọn quality
│   │   │   ├── OfflineBadge.tsx          # Badge "Offline" trên player
│   │   │   ├── SeriesDownloadModal.tsx   # Modal tải nhiều tập
│   │   │   └── InstallBanner.tsx         # Banner mời cài app
│   │   └── Watch/
│   │       └── HlsPlayer.tsx             # Hỗ trợ offlineSrc prop
│   │
│   ├── hooks/
│   │   ├── use-pwa.ts                    # isPWA, canInstall, isOnline, ...
│   │   ├── use-offline-download.ts       # State machine download per episode
│   │   ├── use-offline-poster.ts         # Đọc poster từ IndexedDB
│   │   └── use-push-notification.ts      # Push subscription state
│   │
│   └── lib/
│       ├── offline-storage.ts            # Wrapper IndexedDB
│       ├── offline-downloader.ts         # Orchestrator download
│       └── push-notification.ts          # Subscribe / unsubscribe / VAPID
│
└── docs/
    └── PWA.md                            # Tài liệu này
```

### 14.2 Backend

```
movie-backend/movie-streaming-api/src/main/java/com/hoaug/movieapi/
├── modules/
│   ├── streaming/
│   │   ├── application/
│   │   │   ├── service/
│   │   │   │   ├── OfflineTokenService.java       # Cấp / verify offline JWT
│   │   │   │   └── Mp4StorageService.java
│   │   │   └── usecase/
│   │   │       ├── GetOfflinePackageUseCase.java  # Build package + token
│   │   │       └── GetOfflineHlsKeyUseCase.java   # Serve AES key với offline JWT
│   │   └── presentation/
│   │       └── controller/
│   │           ├── OfflinePackageController.java
│   │           └── OfflineKeyController.java
│   │
│   └── notification/
│       ├── infrastructure/persistence/
│       │   ├── entity/PushSubscriptionEntity.java
│       │   └── repository/JpaPushSubscriptionRepository.java
│       └── presentation/controller/
│           └── PushSubscriptionController.java
│
├── config/
│   └── SecurityConfig.java                          # Whitelist push + offline endpoints
│
└── resources/
    ├── db/migration/
    │   └── V13__add_push_subscriptions.sql
    └── application.properties                       # vapid.* config
```

---

## 15. Cấu hình môi trường

### 15.1 Frontend (`.env.local`)

```env
# VAPID Public Key (bắt buộc cho push notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-...

# API Gateway URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

### 15.2 Backend (`application.properties`)

```properties
# VAPID Keys
vapid.public-key=${VAPID_PUBLIC_KEY:}
vapid.private-key=${VAPID_PRIVATE_KEY:}
vapid.subject=${VAPID_SUBJECT:mailto:admin@giophim.com}

# Offline token
streaming.offline.token-expiration-hours=48
```

### 15.3 Tạo VAPID keys mới

```bash
npx web-push generate-vapid-keys
```

Output mẫu:

```
Public Key:  BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFg...
Private Key: 4oBZnZPazSrHjHNsB8FqXXXXXXXXXXXXXXXXXXXXXXX
```

Cập nhật:

- Frontend: `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (chỉ public key).
- Backend: `VAPID_PUBLIC_KEY` và `VAPID_PRIVATE_KEY` (cả hai).

> Lưu ý quan trọng: thay đổi VAPID keys làm vô hiệu mọi subscription cũ. Nên rotate keys chỉ khi thực sự cần thiết.

---

## 16. Hạn chế và lưu ý vận hành

### 16.1 Offline token 48 giờ

Sau khi token hết hạn:

- Phim đã tải vẫn còn trong IndexedDB nhưng không phát được vì AES key bị refuse.
- Trang `/downloads` hiển thị badge "Hết hạn".
- Người dùng cần nhấn lại nút download để fetch token mới.
- Lần download tiếp theo có thể tận dụng segments đã có (nếu ta mở rộng logic đối chiếu URL), hiện tại đang download lại từ đầu.

Đây là đánh đổi giữa bảo mật (không cho phép giữ key vĩnh viễn) và UX.

### 16.2 Dung lượng IndexedDB

Storage budget khác nhau theo trình duyệt:

| Trình duyệt    | Budget mặc định                |
| -------------- | ------------------------------ |
| Chrome Android | 60% disk free                  |
| Chrome Desktop | 60% disk free                  |
| Safari iOS     | ~50 MB, prompt user để mở rộng |
| Firefox        | 50% disk free, có thể prompt   |

Một tập 720p ~30 phút thường chiếm 200-500 MB. Hệ thống nên hiển thị `navigator.storage.estimate()` để cảnh báo user khi gần hết quota.

### 16.3 Push notification trên iOS

iOS Safari chỉ hỗ trợ Web Push từ phiên bản 16.4 (tháng 3/2023) và bắt buộc app phải được cài lên home screen. User chỉ mở trong Safari thường sẽ không nhận được push.

### 16.4 Chỉ Premium Plus mới được tải

Logic phía client:

```typescript
const canDownloadOffline =
  isAuthenticated && hasActiveSubscription && currentPlan?.code === "PREMIUM_PLUS";
```

Logic phía server cũng kiểm tra subscription tier khi cấp `OfflinePackage`. Nếu user gói thấp hơn nhấn nút, dialog sẽ hướng dẫn nâng cấp.

### 16.5 Web Push gửi tự động

Hiện tại backend mới có endpoint lưu subscription. Để tự động đẩy push khi có notification mới, cần:

- Thêm dependency `nl.martijndwars:web-push` hoặc tương đương.
- Implement `WebPushService` ký payload bằng VAPID private key.
- Hook vào `CreateNotificationUseCase` để duyệt subscriptions của user và gửi.
- Xử lý response 410 Gone để tự xoá subscription chết.

### 16.6 Không phải DRM thật

Cơ chế offline token không phải DRM (Widevine, FairPlay, PlayReady). Người dùng kỹ thuật có thể:

- Mở DevTools → Application → IndexedDB → đọc `keys` store.
- Trích xuất AES key và segments.
- Decrypt thủ công bằng `openssl aes-128-cbc -d`.

Đây là đánh đổi giữa độ bảo mật và độ phức tạp triển khai. Để có DRM thật cần:

- Tích hợp Widevine (Android, ChromeOS, Chrome Desktop).
- Tích hợp FairPlay (iOS, macOS Safari).
- Mua license server hoặc dùng dịch vụ như Axinom, EZDRM, BuyDRM.

Chi phí khi triển khai DRM thật cao hơn nhiều so với hiện trạng.

### 16.7 Service Worker debug

Khi gặp vấn đề SW trên thiết bị thật:

| Trình duyệt    | Cách inspect                                                         |
| -------------- | -------------------------------------------------------------------- |
| Chrome Desktop | DevTools → Application → Service Workers / Cache Storage / IndexedDB |
| Chrome Android | `chrome://inspect/#devices` từ desktop, kết nối USB debug            |
| Safari iOS     | Mở Safari trên Mac → Develop → tên thiết bị → tab giophim.com        |
| Edge           | Tương tự Chrome                                                      |

Khi cần force update sau khi bump VERSION:

```javascript
// Trong console
navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
location.reload();
```

Hoặc trên thiết bị: gỡ PWA, xoá site data, cài lại.

---

## Tham chiếu

- Service Worker spec: <https://www.w3.org/TR/service-workers/>
- Web App Manifest: <https://www.w3.org/TR/appmanifest/>
- Web Push (RFC 8030, 8291, 8292): <https://datatracker.ietf.org/doc/html/rfc8030>
- HLS encryption (RFC 8216 §4.4.4.4): <https://datatracker.ietf.org/doc/html/rfc8216>
- IndexedDB API: <https://www.w3.org/TR/IndexedDB-3/>
- Background Sync: <https://wicg.github.io/background-sync/spec/>
- iOS Web Push (16.4+): <https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/>
