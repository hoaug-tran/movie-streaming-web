# Báo cáo triển khai PWA - Gió Phim

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Kiến trúc tổng thể](#2-kiến-trúc-tổng-thể)
3. [PWA Foundation](#3-pwa-foundation)
4. [Service Worker](#4-service-worker)
5. [Push Notifications](#5-push-notifications)
6. [Offline Download](#6-offline-download)
7. [Offline Playback](#7-offline-playback)
8. [Luồng hoạt động chi tiết](#8-luồng-hoạt-động-chi-tiết)
9. [Cấu trúc file](#9-cấu-trúc-file)
10. [Cấu hình môi trường](#10-cấu-hình-môi-trường)
11. [Hạn chế và lưu ý](#11-hạn-chế-và-lưu-ý)

---

## 1. Tổng quan

Gió Phim được triển khai đầy đủ tính năng PWA (Progressive Web App) bao gồm:

- **Installability**: Người dùng có thể cài đặt app lên màn hình chính (Android/iOS/Desktop)
- **Offline fallback**: Trang thông báo khi mất kết nối
- **Push Notifications**: Nhận thông báo từ server ngay cả khi không mở app
- **Offline Download**: Tải phim về thiết bị để xem khi không có mạng
- **Offline Playback**: Xem phim đã tải mà không cần kết nối internet
- **Background Sync**: Đồng bộ lịch sử xem khi có lại kết nối

Tính năng download và xem offline **chỉ khả dụng khi đã cài app** (PWA standalone mode). Trên trình duyệt desktop thông thường, nút download không hiển thị.

---

## 2. Kiến trúc tổng thể

```
+------------------+        +-------------------+        +------------------+
|   Browser / PWA  |        |   Service Worker  |        |   Spring Boot    |
|                  |        |   (sw.js)         |        |   Backend        |
|  - React App     |<------>|  - Cache Shell    |<------>|  - HLS Stream    |
|  - IndexedDB     |        |  - Push Handler   |        |  - Offline API   |
|  - Install Prompt|        |  - Offline Fetch  |        |  - Push Sub API  |
+------------------+        +-------------------+        +------------------+
         |                           |
         |                           |
         v                           v
+------------------+        +-------------------+
|   manifest.json  |        |   IndexedDB       |
|   icons/         |        |   - movies        |
|   offline.html   |        |   - segments      |
+------------------+        |   - keys          |
                             +-------------------+
```

---

## 3. PWA Foundation

### 3.1 Web App Manifest

File `public/manifest.json` khai báo metadata để trình duyệt nhận diện app:

```json
{
  "name": "Gió Phim - Gió đưa, phim tới",
  "short_name": "Gió Phim",
  "display": "standalone",
  "background_color": "#0C0C0C",
  "theme_color": "#C8102E",
  "start_url": "/",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192" },
    { "src": "/icons/icon-512.png", "sizes": "512x512" },
    { "src": "/icons/icon-maskable.png", "purpose": "maskable" }
  ],
  "shortcuts": [
    { "name": "Trang chủ", "url": "/" },
    { "name": "Phim đã tải", "url": "/downloads" }
  ]
}
```

Thuộc tính `display: standalone` là điều kiện để app chạy như native app, không có thanh địa chỉ trình duyệt.

### 3.2 Meta tags trong layout.tsx

```tsx
// src/app/layout.tsx
export const viewport: Viewport = {
  themeColor: "#C8102E",
  width: "device-width",
  initialScale: 1,
};

// Trong <head>:
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
<link rel="manifest" href="/manifest.json" />
```

### 3.3 Đăng ký Service Worker

SW được đăng ký bằng inline script trong `layout.tsx` để đảm bảo chạy sớm nhất có thể:

```html
<script>
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js", { scope: "/" });
    });
  }
</script>
```

### 3.4 Install Banner

Component `InstallBanner` lắng nghe sự kiện `beforeinstallprompt` của trình duyệt:

```
Trình duyệt phát sự kiện beforeinstallprompt
              |
              v
    Hook usePwa() lưu deferredPrompt
              |
              v
    InstallBanner hiển thị (slide up từ dưới)
              |
         +----+----+
         |         |
    Nhấn "Cài"  Nhấn "X"
         |         |
    prompt.prompt()  localStorage.setItem('dismissed')
         |
    App được cài
```

Banner chỉ hiển thị một lần. Sau khi dismiss, lưu vào `localStorage` và không hiện lại.

---

## 4. Service Worker

File `public/sw.js` xử lý 5 nhiệm vụ chính.

### 4.1 Caching Strategy

```
Request đến SW
      |
      +-- API (/api/v1/*) ---------> Network only (không cache)
      |
      +-- Navigation (HTML) -------> Network first
      |                                    |
      |                              Thất bại (offline)
      |                                    |
      |                              Trả về /offline.html
      |
      +-- HLS Segment (.ts) -------> Network first
      |                                    |
      |                              Thất bại (offline)
      |                                    |
      |                              Tìm trong IndexedDB
      |
      +-- Static assets -----------> Cache first
            |
            Cache miss
            |
            Network -> lưu vào cache
```

### 4.2 App Shell Cache

Khi SW được install lần đầu, cache các file cốt lõi:

```javascript
const SHELL_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];
```

### 4.3 Push Notification Handler

```javascript
self.addEventListener("push", (event) => {
  const payload = event.data.json();
  self.registration.showNotification(payload.title, {
    body: payload.body,
    icon: "/icons/icon-192.png",
    data: { url: payload.actionUrl },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  // Mở tab đang có hoặc mở tab mới
  clients.openWindow(event.notification.data.url);
});
```

### 4.4 Background Sync

Khi mất mạng, watch history được lưu vào IndexedDB store `pending-history`. Khi có lại mạng, SW tự động sync:

```javascript
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-watch-history") {
    event.waitUntil(syncWatchHistory());
  }
});
```

---

## 5. Push Notifications

### 5.1 Kiến trúc Web Push

Web Push sử dụng giao thức VAPID (Voluntary Application Server Identification):

```
Frontend                  Backend                  Browser Push Service
    |                        |                            |
    |-- POST /push/subscribe->|                            |
    |   { endpoint, p256dh,  |                            |
    |     auth }             |                            |
    |                        |-- Lưu vào DB              |
    |                        |                            |
    |                        |                            |
    |   (Khi có notification)|                            |
    |                        |-- Push message ----------->|
    |                        |   (VAPID signed)           |
    |                                                     |
    |<-- Push event ----------------------------------------
    |
    SW nhận push event
    |
    showNotification()
```

### 5.2 Database Schema

```sql
CREATE TABLE push_subscriptions (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT NOT NULL,
  endpoint   TEXT NOT NULL,           -- URL của browser push service
  p256dh     VARCHAR(255),            -- Public key của browser
  auth       VARCHAR(255),            -- Auth secret
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY (user_id, endpoint(255))
);
```

### 5.3 Backend Endpoints

| Method | Path                       | Mô tả                             |
| ------ | -------------------------- | --------------------------------- |
| POST   | `/api/v1/push/subscribe`   | Lưu push subscription của browser |
| DELETE | `/api/v1/push/unsubscribe` | Xóa push subscription             |

### 5.4 Frontend Hook

```typescript
const { isSupported, permission, isSubscribed, subscribe, unsubscribe } = usePushNotification();

// Đăng ký nhận push
await subscribe(); // Yêu cầu permission -> subscribe -> POST backend
```

### 5.5 VAPID Keys

VAPID là cặp khóa bất đối xứng dùng để xác thực server khi gửi push:

```bash
# Tạo cặp khóa mới
npx web-push generate-vapid-keys

# Output:
# Public Key: BEl62iUYgUivxIkv69yViEuiBIa-...
# Private Key: 4oBZnZPazSrHjHNsB8Fq...
```

Cấu hình:

- Frontend: `NEXT_PUBLIC_VAPID_PUBLIC_KEY` trong `.env.local`
- Backend: `VAPID_PUBLIC_KEY` và `VAPID_PRIVATE_KEY` trong env

---

## 6. Offline Download

### 6.1 Vấn đề với HLS + AES-128

Hệ thống streaming dùng HLS với mã hóa AES-128. Mỗi khi play, player phải fetch AES key từ server với Bearer token. Điều này có nghĩa:

- Không thể xem offline đơn giản bằng cách cache HLS segments
- Khi offline, không fetch được key -> không giải mã được -> không xem được

### 6.2 Giải pháp: Offline Token

Thay vì yêu cầu auth mỗi lần play, backend cấp một **offline token JWT** có thời hạn 48 giờ tại thời điểm download. Client dùng token này để fetch key một lần duy nhất và lưu vào IndexedDB.

```
Luồng download:

  Client                    Backend
    |                          |
    |-- GET /stream/offline/   |
    |   episodes/{id}/{q}/     |
    |   package                |
    |                          |-- Kiểm tra auth
    |                          |-- Kiểm tra sub
    |                          |-- Đọc playlist
    |                          |-- Tạo JWT 48h
    |<-- { offlineToken,       |
    |      segments[],         |
    |      metadata }          |
    |                          |
    |-- GET /stream/offline/   |
    |   key/{id}/{q}?token=... |
    |                          |-- Verify JWT
    |<-- AES key bytes         |
    |                          |
    | Lưu key vào IndexedDB    |
    |                          |
    | Download segments        |
    | (batch 5, với Bearer)    |
    |                          |
    | Lưu segments vào         |
    | IndexedDB                |
    |                          |
    | Lưu metadata vào         |
    | IndexedDB                |
```

### 6.3 Offline Token JWT

```java
// OfflineTokenService.java
String token = Jwts.builder()
    .subject(userId)
    .claim("episodeId", episodeId)
    .claim("quality", quality)
    .claim("type", "offline")
    .expiration(new Date(now + 48h))
    .signWith(signingKey)
    .compact();
```

Token được ký bằng cùng JWT secret với access token, nhưng có thêm claim `type: offline` để phân biệt.

### 6.4 IndexedDB Schema

```
Database: giophim-offline (version 1)

Object Store: movies
  keyPath: episodeId
  Fields: episodeId, movieId, movieTitle, episodeTitle,
          episodeNumber, posterUrl, quality, durationSeconds,
          segmentUrls[], downloadedAt, expiresAt, sizeBytes

Object Store: segments
  keyPath: url
  Fields: url, data (ArrayBuffer)

Object Store: keys
  keyPath: episodeId
  Fields: episodeId, quality, keyData (ArrayBuffer)
```

### 6.5 Backend Endpoints

| Method | Path                                                     | Auth         | Mô tả                  |
| ------ | -------------------------------------------------------- | ------------ | ---------------------- |
| GET    | `/api/v1/stream/offline/episodes/{id}/{quality}/package` | Bearer token | Trả về offline package |
| GET    | `/api/v1/stream/offline/key/{id}/{quality}?token=...`    | Offline JWT  | Trả về AES key bytes   |

### 6.6 Download Progress Flow

```
useOfflineDownload(episodeId)
        |
        | startDownload(quality)
        v
downloadEpisode() [lib/offline-downloader.ts]
        |
        +-- fetchOfflinePackage() -> GET /package
        |         |
        |         v
        |   { offlineToken, segments[], metadata }
        |
        +-- Fetch AES key với offline token
        |         |
        |         v
        |   offlineStorage.saveKey(episodeId, keyData)
        |
        +-- Download segments (batch 5)
        |         |
        |         | Mỗi segment:
        |         +-- fetch(url, { Authorization: Bearer })
        |         +-- offlineStorage.saveSegment(url, data)
        |         +-- onProgress({ percent, bytesDownloaded })
        |
        +-- offlineStorage.saveMovie(metadata)
        |
        v
   status: "downloaded"
```

### 6.7 OfflineDownloadButton

Nút download chỉ render khi `isPWA === true`:

```typescript
// hooks/use-pwa.ts
const isPWA =
  window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

// components/PWA/OfflineDownloadButton.tsx
if (!canDownload) return null; // canDownload = isPWA
```

Các trạng thái của nút:

```
idle ---------> downloading ---------> downloaded
  |                  |                     |
  | startDownload()  | cancelDownload()    | deleteDownload()
  |                  |                     |
  v                  v                     v
Hiện icon       Hiện progress         Hiện checkmark
Download        ring + % + X          xanh lá
                (nhấn để hủy)         (nhấn để xóa)
```

### 6.8 Trang Downloads (/downloads)

Trang liệt kê tất cả phim đã tải từ IndexedDB:

- Hiển thị poster, tên phim, tên tập, chất lượng, dung lượng
- Hiển thị thời gian hết hạn (offline token 48h)
- Nút play -> chuyển đến trang xem với `?offline=1`
- Nút xóa -> xóa khỏi IndexedDB (cả segments + key + metadata)
- Badge "Hết hạn" khi token đã quá 48h

---

## 7. Offline Playback

### 7.1 Luồng phát hiện offline episode

```
WatchPlayer mount / episode thay đổi
              |
              v
  offlineStorage.isDownloaded(episodeId)
              |
        +-----+-----+
        |           |
      false        true
        |           |
        |           v
        |   offlineStorage.getMovie(episodeId)
        |           |
        |           v
        |   Đọc từng segment từ IndexedDB
        |           |
        |           v
        |   URL.createObjectURL(new Blob([data]))
        |           |
        |           v
        |   setOfflineSrc(blobUrl)
        |
        v
  offlineSrc = undefined
  (dùng HLS stream bình thường)
```

### 7.2 HlsPlayer với offlineSrc

```typescript
// HlsPlayer.tsx
useEffect(() => {
  if (offlineSrc) {
    // Offline mode: dùng native video, bỏ qua HLS.js
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
  // Online mode: dùng HLS.js như bình thường
  const hls = new Hls({ xhrSetup: attachAuth });
  hls.loadSource(src);
  hls.attachMedia(video);
}, [src, offlineSrc]);
```

### 7.3 OfflineBadge

Khi đang xem từ local storage, hiển thị badge nhỏ góc trên phải màn hình:

```
+------------------------------------------+
|  [Offline]                               |  <- OfflineBadge
|                                          |
|           [Video Player]                 |
|                                          |
+------------------------------------------+
```

---

## 8. Luồng hoạt động chi tiết

### 8.1 Luồng cài đặt PWA

```
Người dùng truy cập giophim.com lần đầu
              |
              v
Trình duyệt kiểm tra:
  - manifest.json hợp lệ?
  - SW đã đăng ký?
  - HTTPS?
              |
         Đủ điều kiện
              |
              v
Trình duyệt phát sự kiện beforeinstallprompt
              |
              v
usePwa() hook lưu deferredPrompt
              |
              v
InstallBanner hiển thị (slide up)
              |
         Người dùng nhấn "Cài đặt"
              |
              v
deferredPrompt.prompt()
              |
         Người dùng xác nhận
              |
              v
App được cài lên màn hình chính
              |
              v
Sự kiện appinstalled -> isPWA = true
              |
              v
Download button xuất hiện trong player
```

### 8.2 Luồng nhận Push Notification

```
Người dùng đăng nhập
              |
              v
usePushNotification() kiểm tra permission
              |
         Chưa có permission
              |
              v
Notification.requestPermission()
              |
         Người dùng cho phép
              |
              v
registration.pushManager.subscribe({ VAPID key })
              |
              v
POST /api/v1/push/subscribe
{ endpoint, p256dh, auth }
              |
              v
Backend lưu vào push_subscriptions
              |
              |
              | (Sau này khi có sự kiện)
              |
              v
Backend gửi push message đến browser push service
              |
              v
Browser push service chuyển đến SW
              |
              v
SW nhận push event -> showNotification()
              |
              v
Người dùng thấy notification
              |
         Nhấn vào notification
              |
              v
SW notificationclick -> mở URL trong app
```

### 8.3 Luồng download và xem offline

```
Người dùng mở phim (PWA installed)
              |
              v
PlayerControls hiển thị nút Download
              |
         Nhấn Download
              |
              v
useOfflineDownload.startDownload("720p")
              |
              v
GET /api/v1/stream/offline/episodes/{id}/720p/package
(Bearer token)
              |
              v
Backend trả về:
  - offlineToken (JWT 48h)
  - segments[] (danh sách URL .ts)
  - metadata (title, poster, duration...)
              |
              v
GET /api/v1/stream/offline/key/{id}/720p?token={offlineToken}
              |
              v
Backend verify JWT -> trả về AES key bytes
              |
              v
Lưu key vào IndexedDB (store: keys)
              |
              v
Download segments theo batch 5
(fetch với Bearer token)
              |
              v
Lưu từng segment vào IndexedDB (store: segments)
              |
              v
Lưu metadata vào IndexedDB (store: movies)
              |
              v
status = "downloaded" -> nút chuyển sang checkmark xanh
              |
              |
              | (Sau này khi xem offline)
              |
              v
WatchPlayer phát hiện episode đã download
              |
              v
Đọc segments từ IndexedDB -> tạo Blob URL
              |
              v
HlsPlayer dùng Blob URL (không cần HLS.js)
              |
              v
Video phát từ local storage
OfflineBadge hiển thị góc trên phải
```

---

## 9. Cấu trúc file

### 9.1 Frontend

```
src/
  app/
    layout.tsx                    -- SW registration, manifest meta tags
    downloads/
      page.tsx                    -- Trang phim đã tải
  components/
    PWA/
      InstallBanner.tsx           -- Banner cài đặt app
      OfflineDownloadButton.tsx   -- Nút download (chỉ hiện khi PWA)
      OfflineBadge.tsx            -- Badge "Offline" khi xem local
    Watch/
      HlsPlayer.tsx               -- Thêm offlineSrc prop
      WatchPlayer.tsx             -- Thêm offline detection
      PlayerControls.tsx          -- Thêm OfflineDownloadButton
  hooks/
    use-pwa.ts                    -- isPWA, canInstall, isOnline, promptInstall
    use-offline-download.ts       -- State machine download per episode
    use-push-notification.ts      -- Push subscription state
  lib/
    offline-storage.ts            -- IndexedDB wrapper
    offline-downloader.ts         -- Download orchestrator
    push-notification.ts          -- VAPID subscribe/unsubscribe

public/
  manifest.json                   -- Web App Manifest
  sw.js                           -- Service Worker
  offline.html                    -- Trang fallback offline
  icons/
    icon-192.png
    icon-512.png
    icon-maskable.png
```

### 9.2 Backend

```
modules/
  streaming/
    application/
      service/
        OfflineTokenService.java      -- JWT 48h cho offline key
      usecase/
        GetOfflinePackageUseCase.java -- Build offline package
        GetOfflineHlsKeyUseCase.java  -- Serve AES key với offline token
    presentation/
      controller/
        OfflinePackageController.java -- GET /stream/offline/.../package
        OfflineKeyController.java     -- GET /stream/offline/key/...
  notification/
    infrastructure/
      persistence/
        entity/
          PushSubscriptionEntity.java
        repository/
          JpaPushSubscriptionRepository.java
    presentation/
      controller/
        PushSubscriptionController.java -- POST/DELETE /push/subscribe

config/
  SecurityConfig.java               -- Thêm rules cho offline + push endpoints

resources/
  db/migration/
    V13__add_push_subscriptions.sql  -- Tạo bảng push_subscriptions
  application.properties            -- Thêm vapid.* config
```

---

## 10. Cấu hình môi trường

### 10.1 Frontend (.env.local)

```env
# VAPID Public Key cho Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-...
```

### 10.2 Backend (application.properties)

```properties
# VAPID Keys cho Web Push
vapid.public-key=${VAPID_PUBLIC_KEY:...}
vapid.private-key=${VAPID_PRIVATE_KEY:}
vapid.subject=${VAPID_SUBJECT:mailto:admin@giophim.com}
```

### 10.3 Tạo VAPID keys mới

```bash
npx web-push generate-vapid-keys
```

Output:

```
Public Key:  BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFg...
Private Key: 4oBZnZPazSrHjHNsB8FqXXXXXXXXXXXXXXXXXXXXXXX
```

Thay thế giá trị mặc định trong cả frontend và backend.

---

## 11. Hạn chế và lưu ý

### 11.1 Offline token 48 giờ

Offline token có thời hạn 48 giờ. Sau khi hết hạn:

- Phim đã tải vẫn còn trong IndexedDB
- Nhưng không thể xem được vì key đã hết hạn
- Trang `/downloads` hiển thị badge "Hết hạn"
- Người dùng cần download lại

Đây là thiết kế có chủ đích để bảo vệ nội dung có bản quyền.

### 11.2 Dung lượng lưu trữ

IndexedDB không có giới hạn cứng nhưng trình duyệt có thể xóa dữ liệu khi thiếu bộ nhớ. Một tập phim 720p thường chiếm 200-500 MB.

### 11.3 iOS Safari

iOS Safari hỗ trợ PWA nhưng có một số hạn chế:

- Push Notifications chỉ hoạt động từ iOS 16.4+
- Cần thêm `apple-mobile-web-app-capable` meta tag (đã có)
- Background sync không được hỗ trợ đầy đủ

### 11.4 Chỉ hỗ trợ 720p offline

Hiện tại offline download chỉ hỗ trợ 720p. Để hỗ trợ 1080p/4K cần:

- Kiểm tra subscription tier trong `GetOfflinePackageUseCase`
- Truyền quality từ UI (hiện tại hardcode `"720p"` trong `PlayerControls`)

### 11.5 Web Push chưa gửi tự động

Backend đã có endpoint lưu push subscription, nhưng chưa tích hợp gửi push tự động khi tạo notification. Để hoàn thiện cần:

- Thêm thư viện `java-webpush` vào pom.xml
- Tạo `WebPushService` gọi browser push service với VAPID
- Hook vào `CreateNotificationUseCase` để gửi push sau khi tạo notification trong DB

### 11.6 Không phải DRM thật

Cơ chế offline token không phải DRM (Widevine/FairPlay). Về mặt kỹ thuật, người dùng có thể trích xuất AES key từ IndexedDB. Đây là đánh đổi giữa bảo mật và độ phức tạp triển khai. Để có DRM thật cần tích hợp Widevine/FairPlay, chi phí và độ phức tạp cao hơn nhiều.
