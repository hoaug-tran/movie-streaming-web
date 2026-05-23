# Gió Phim - SEO, PWA & AI Chat Implementation Guide

Hướng dẫn chi tiết về các tính năng SEO, Progressive Web App (PWA), và AI Chat được triển khai trong nền tảng Gió Phim (Gió đưa, phim tới).

---

## Mục Lục

1. [SEO Implementation](#seo-implementation)
2. [PWA Implementation](#pwa-implementation)
3. [AI Chat Integration](#ai-chat-integration)
4. [Architecture & Data Flow](#architecture--data-flow)
5. [Câu Hỏi Phỏng Vấn Tiềm Năng](#câu-hỏi-phỏng-vấn-tiềm-năng)

---

## SEO Implementation

### Tổng Quan

SEO (Search Engine Optimization) được triển khai toàn diện để tăng khả năng tìm kiếm của nền tảng Gió Phim trên Google, Bing, và các search engine khác. Mục tiêu là đạt thứ hạng cao cho các keyword liên quan đến xem phim trực tuyến.

### 1. Root Layout Configuration

**File:** `src/app/layout.tsx`

**Mục đích:** Định nghĩa metadata cơ bản cho toàn bộ ứng dụng, bao gồm các thẻ Open Graph và Twitter Card.

**Chi tiết triển khai:**

```typescript
// Base URL động từ biến môi trường
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://giophim.libsys.me";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.libsys.me/api/v1";

// Metadata cơ bản
export const metadata: Metadata = {
  title: "Gió Phim - Gió đưa, phim tới",
  description: "Xem phim HD trực tuyến với hệ thống phát trực tuyến...",

  // Open Graph - tối ưu cho chia sẻ mạng xã hội
  openGraph: {
    title: "Gió Phim - Gió đưa, phim tới",
    description: "...",
    url: APP_URL,
    type: "website",
    images: [
      {
        url: `${APP_URL}/icons/logo.webp`,
        width: 512,
        height: 512,
        alt: "Gió Phim Logo",
        type: "image/webp"
      }
    ]
  },

  // Twitter Card - tối ưu cho Twitter/X
  twitter: {
    card: "summary_large_image",
    title: "Gió Phim",
    description: "...",
    images: [`${APP_URL}/icons/logo.webp`]
  },

  // Canonical URL - tránh duplicate content
  alternates: {
    canonical: APP_URL
  }
};

// Color scheme hỗ trợ dark mode
<meta name="color-scheme" content="dark" />
```

**Lợi ích:**

- Khi người dùng chia sẻ trang Gió Phim lên Facebook/Twitter, hiển thị tiêu đề, mô tả, và logo đẹp
- Canonical link ngăn Google penalize website vì duplicate content
- Color scheme tối ưu hiển thị trên mobile dark mode

### 2. Dynamic Movie Detail Metadata

**File:** `src/app/movies/[slug]/page.tsx`

**Mục đích:** Tự động tạo metadata độc lập cho từng trang chi tiết phim, giúp Google index từng phim với thông tin cụ thể.

**Chi tiết triển khai:**

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;

    // Gọi API backend lấy chi tiết phim
    const result = await movieService.getMovieDetailBySlug(slug);
    const movie = result.movie;

    // Tạo metadata động từ dữ liệu API
    const title = `${movie.title} | Gió Phim`;
    const description =
      movie.description ||
      `Xem phim ${movie.title} HD trực tuyến tại Gió Phim. ` +
        `Đánh giá: ${movie.averageRating?.toFixed(1) || "N/A"}/10`;

    const posterUrl = movie.posterUrl
      ? `${APP_URL}${movie.posterUrl}`
      : `${APP_URL}/icons/logo.webp`;

    const movieUrl = `${APP_URL}/movies/${slug}`;

    return {
      title,
      description,
      openGraph: {
        type: "video.movie",
        url: movieUrl,
        title,
        description,
        images: [
          {
            url: posterUrl,
            width: 500,
            height: 750,
            alt: movie.title,
            type: "image/jpeg",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [posterUrl],
      },
      alternates: {
        canonical: movieUrl,
      },
    };
  } catch (error) {
    // Fallback metadata nếu API lỗi
    return {
      title: "Chi tiết phim | Gió Phim",
      description: "Khám phá thông tin phim, tập phim, đánh giá...",
    };
  }
}
```

**Lợi ích:**

- Mỗi trang phim có tiêu đề, mô tả, và hình ảnh độc lập
- Google sẽ index toàn bộ phim trong database (cải thiện organic traffic đáng kể)
- Rich snippet trên kết quả tìm kiếm giúp tăng CTR (Click-Through Rate)

**Ví dụ kết quả Google Search:**

```
Phim Lộp Nhóc | Gió Phim
https://giophim.libsys.me/movies/phim-lop-nhoc

Xem phim Phim Lộp Nhóc HD trực tuyến tại Gió Phim. Đánh giá: 8.5/10
```

### 3. robots.txt Endpoint

**File:** `src/app/robots.ts`

**Mục đích:** Hướng dẫn web crawler (Googlebot, Bingbot) nên crawl/index pages nào, không crawl pages nào.

**Chi tiết triển khai:**

```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Hướng dẫn cho tất cả crawlers
        userAgent: "*",
        // Cho phép crawl những pages này
        allow: ["/", "/movies", "/tv", "/discovery", "/pricing"],
        // Không crawl những pages này
        disallow: [
          "/admin", // Admin panel
          "/access", // Access control
          "/auth", // Authentication pages
          "/api", // API endpoints
          "/profile", // User profile (private)
          "/_next", // Next.js internals
          "/watch/offline", // Offline mode
        ],
      },
      {
        // Chặn các AI bots sao chép content
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
    ],
    // Link đến sitemap XML
    sitemap: "https://giophim.libsys.me/sitemap.xml",
  };
}
```

**Khi truy cập:** `https://giophim.libsys.me/robots.txt`

```
User-agent: *
Allow: /
Allow: /movies
Allow: /tv
Allow: /discovery
Allow: /pricing
Disallow: /admin
Disallow: /access
Disallow: /auth
Disallow: /api
Disallow: /profile
Disallow: /_next
Disallow: /watch/offline

User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

Sitemap: https://giophim.libsys.me/sitemap.xml
```

**Lợi ích:**

- Crawlers biết nên crawl pages nào → tiết kiệm bandwidth
- Chặn AI bots sao chép content → bảo vệ intellectual property
- Hướng dẫn crawlers đến sitemap → tăng khả năng index

### 4. Dynamic Sitemap XML

**File:** `src/app/sitemap.xml/route.ts`

**Mục đích:** Tự động tạo XML sitemap liệt kê tất cả trang trong website, giúp Google nhanh chóng discover và index content.

**Chi tiết triển khai:**

```typescript
import { MetadataRoute } from "next";
import movieService from "@/modules/movie/api/movie-service";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://giophim.libsys.me";

export async function GET(): Promise<Response> {
  try {
    // 1. Static routes - pages cố định
    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: `${APP_URL}/`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0, // Trang chủ - ưu tiên cao nhất
      },
      {
        url: `${APP_URL}/movies`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${APP_URL}/tv`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${APP_URL}/discovery`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${APP_URL}/pricing`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
    ];

    // 2. Dynamic routes - tất cả phim từ database
    let dynamicRoutes: MetadataRoute.Sitemap = [];
    try {
      const moviesData = await movieService.getMovies({ page: 0, limit: 1000 });
      if (moviesData.content) {
        dynamicRoutes = moviesData.content.map((movie) => ({
          url: `${APP_URL}/movies/${movie.slug}`,
          lastModified: movie.updatedAt ? new Date(movie.updatedAt) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));
      }
    } catch (error) {
      console.warn("Could not fetch movies for sitemap");
    }

    // 3. Gộp tất cả routes
    const allRoutes = [...staticRoutes, ...dynamicRoutes];

    // 4. Tạo XML sitemap
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map((route) => {
    const lastmod = route.lastModified
      ? typeof route.lastModified === "string"
        ? route.lastModified
        : route.lastModified.toISOString()
      : new Date().toISOString();
    return `  <url>
    <loc>${route.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

    return new Response(xmlContent, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400", // Cache 24 giờ
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}

export const dynamic = "force-dynamic";
```

**Ví dụ output sitemap.xml:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://giophim.libsys.me/</loc>
    <lastmod>2026-05-21T17:00:00Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://giophim.libsys.me/movies/phim-lop-nhoc</loc>
    <lastmod>2026-05-20T12:30:00Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ...
</urlset>
```

**Lợi ích:**

- Tự động cập nhật khi có phim mới được thêm vào database
- Google sử dụng để discover tất cả phim → tăng indexed pages
- Priority giúp Google biết pages nào quan trọng hơn

### 5. Heading Hierarchy Optimization

**File:** `src/app/movies/page.tsx`

**Vấn đề:** Trang danh sách phim dùng H2 làm tiêu đề chính (sai)

**Sửa lỗi:**

```typescript
// TRƯỚC - SAI
<Typography variant="h2" fontSize="2.5rem">
  Phim Lẻ
</Typography>

// SAU - ĐÚNG
<Typography variant="h1" fontSize="2.5rem">
  Phim Lẻ
</Typography>
```

**Quy tắc Heading Hierarchy chuẩn:**

```
<h1> - Tiêu đề chính trang (chỉ 1 cái)
  <h2> - Tiêu đề phụ
    <h3> - Tiêu đề cấp 3
      <h4> - Tiêu đề cấp 4
```

**Lợi ích:**

- Giúp Google hiểu cấu trúc nội dung trang
- Cải thiện accessibility cho người dùng dùng screen reader
- Tăng SEO score

### 6. Image Security & Optimization

**File:** `next.config.js`

**Vấn đề:** Cấu hình remote image pattern dùng wildcard `https://**` (rủi ro bảo mật)

**Sửa lỗi:**

```javascript
// TRƯỚC - RỦI RO
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "**"  // Cho phép TẤT CẢ domain - không an toàn
    }
  ]
}

// SAU - AN TOÀN
images: {
  remotePatterns: [
    {
      protocol: "http",
      hostname: "localhost"
    },
    {
      protocol: "https",
      hostname: "giophim.libsys.me"
    },
    {
      protocol: "https",
      hostname: "api.libsys.me"
    },
    {
      protocol: "https",
      hostname: "*.libsys.me"  // Subdomain wildcard an toàn hơn
    }
  ],
  formats: ["image/avif", "image/webp"]  // Format hiệu suất cao
}
```

**Lợi ích:**

- Tránh rủi ro security (attacker không thể inject image từ domain độc hại)
- Tăng performance (serve WebP/AVIF format nhẹ hơn JPEG)
- Tối ưu Core Web Vitals

### 7. Recap - SEO Checklist

| Mục                        | File                             | Trạng thái |
| -------------------------- | -------------------------------- | ---------- |
| Open Graph + Twitter Cards | `src/app/layout.tsx`             | HOÀN THÀNH |
| Canonical URLs             | `src/app/layout.tsx`             | HOÀN THÀNH |
| Dynamic Movie Metadata     | `src/app/movies/[slug]/page.tsx` | HOÀN THÀNH |
| robots.txt                 | `src/app/robots.ts`              | HOÀN THÀNH |
| sitemap.xml                | `src/app/sitemap.xml/route.ts`   | HOÀN THÀNH |
| H1/H2/H3 Hierarchy         | `src/app/movies/page.tsx`        | HOÀN THÀNH |
| Image Optimization         | `next.config.js`                 | HOÀN THÀNH |
| Mobile Responsive          | `src/styles/*`                   | HOÀN THÀNH |

---

## PWA Implementation

### Tổng Quan

PWA (Progressive Web App) cho phép người dùng cài đặt Gió Phim như ứng dụng native trên điện thoại, cung cấp trải nghiệm offline, và push notifications.

### 1. Service Worker

**File:** `public/sw.js`

**Mục đích:** Tệp JavaScript chạy trong background, bên ngoài main thread, để:

- Intercept network requests
- Cache content cho offline access
- Handle push notifications

**Chi tiết triển khai (phần core):**

```javascript
// Khi Service Worker được cài đặt
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v1").then((cache) => {
      // Pre-cache các tệp quan trọng
      return cache.addAll(["/", "/offline.html", "/css/style.css", "/js/app.js"]);
    })
  );
});

// Cache-first strategy: kiểm tra cache trước, nếu miss thì gọi network
self.addEventListener("fetch", (event) => {
  if (event.request.method === "GET") {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Trả về từ cache nếu có
        if (response) {
          return response;
        }

        // Nếu không, gọi network
        return fetch(event.request)
          .then((response) => {
            // Cache response để lần tới
            const cache = caches.open("v1");
            cache.then((c) => c.put(event.request, response.clone()));
            return response;
          })
          .catch(() => {
            // Nếu network fail, trả về offline page
            return caches.match("/offline.html");
          });
      })
    );
  }
});

// Handle push notifications
self.addEventListener("push", (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.message,
    icon: "/icons/logo.webp",
  });
});
```

**Lợi ích:**

- Ứng dụng vẫn hoạt động khi không có internet
- Load lại trang nhanh hơn (lấy từ cache)
- Tiết kiệm data mobile (không tải lại nếu đã cache)

### 2. Web App Manifest

**File:** `public/manifest.json`

**Mục đích:** Định nghĩa metadata cho PWA, cấu hình cài đặt ứng dụng.

**Chi tiết triển khai:**

```json
{
  "name": "Gió Phim - Gió đưa, phim tới",
  "short_name": "Gió Phim",
  "description": "Nền tảng xem phim HD trực tuyến với hệ thống streaming...",

  "start_url": "/",
  "scope": "/",

  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#1a1a1a",
  "background_color": "#ffffff",

  "screenshots": [
    {
      "src": "/icons/logo-192.webp",
      "sizes": "192x192",
      "type": "image/webp",
      "form_factor": "narrow"
    },
    {
      "src": "/icons/logo-512.webp",
      "sizes": "512x512",
      "type": "image/webp",
      "form_factor": "wide"
    }
  ],

  "icons": [
    {
      "src": "/icons/logo.webp",
      "sizes": "192x192",
      "type": "image/webp",
      "purpose": "any"
    },
    {
      "src": "/icons/logo.webp",
      "sizes": "512x512",
      "type": "image/webp",
      "purpose": "any maskable"
    }
  ],

  "shortcuts": [
    {
      "name": "Xem Phim",
      "short_name": "Phim",
      "description": "Vào xem phim ngay",
      "url": "/movies",
      "icons": [
        {
          "src": "/icons/logo.webp",
          "sizes": "192x192",
          "type": "image/webp"
        }
      ]
    }
  ],

  "categories": ["entertainment", "video"],
  "screenshots": []
}
```

**Cách cài đặt:**

**Android Chrome:**

1. Mở https://giophim.libsys.me
2. Menu (3 dấu chấm) → "Cài đặt ứng dụng"
3. Ứng dụng cài đặt như native app

**iOS Safari:**

1. Mở https://giophim.libsys.me
2. Nhấn Share → "Thêm vào Màn hình chính"
3. Tạo bookmark với icon

**Lợi ích:**

- Người dùng có thể cài đặt từ browser (không cần app store)
- Chiếm ít dung lượng hơn native app
- Cập nhật nhanh (không cần submit app store)

### 3. Offline Download Feature

**File:** `src/components/PWA/OfflineDownloadButton.tsx`

**Mục đích:** Cho phép người dùng tải episode xuống IndexedDB để xem offline.

**Chi tiết triển khai:**

```typescript
import { useState, useCallback } from 'react';
import { Box, Button, CircularProgress, TextField } from '@mui/material';

interface OfflineDownloadButtonProps {
  movieSlug: string;
  episodeId: number;
  videoUrl: string;
  title: string;
  thumbnailUrl?: string;
}

export function OfflineDownloadButton({
  movieSlug,
  episodeId,
  videoUrl,
  title,
  thumbnailUrl
}: OfflineDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState('720p');

  const downloadEpisode = useCallback(async () => {
    try {
      setIsDownloading(true);
      setProgress(0);

      // Mở IndexedDB connection
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('GioPhimDB', 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('episodes')) {
            db.createObjectStore('episodes', { keyPath: 'id' });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      // Fetch video từ URL với progress tracking
      const response = await fetch(videoUrl);
      const blob = await response.blob();

      // Lưu vào IndexedDB
      const transaction = db.transaction(['episodes'], 'readwrite');
      const store = transaction.objectStore('episodes');

      const episodeData = {
        id: `${movieSlug}_${episodeId}`,
        movieSlug,
        episodeId,
        title,
        videoBlob: blob,
        thumbnail: thumbnailUrl,
        quality: selectedQuality,
        downloadedAt: new Date().toISOString(),
        size: blob.size
      };

      store.put(episodeData);

      await new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = reject;
      });

      setProgress(100);
      alert(`Tải xuống ${title} thành công! Xem offline tại Watch Page.`);
    } catch (error) {
      console.error('Download error:', error);
      alert('Lỗi tải xuống. Thử lại.');
    } finally {
      setIsDownloading(false);
    }
  }, [videoUrl, movieSlug, episodeId, title, thumbnailUrl, selectedQuality]);

  return (
    <Box>
      <TextField
        select
        value={selectedQuality}
        onChange={(e) => setSelectedQuality(e.target.value)}
        size="small"
        disabled={isDownloading}
      >
        <MenuItem value="480p">480p - 200MB</MenuItem>
        <MenuItem value="720p">720p - 500MB</MenuItem>
        <MenuItem value="1080p">1080p - 1GB</MenuItem>
      </TextField>

      <Button
        onClick={downloadEpisode}
        disabled={isDownloading}
        startIcon={isDownloading && <CircularProgress size={20} />}
      >
        {isDownloading ? `Đang tải ${progress}%` : 'Tải để xem offline'}
      </Button>
    </Box>
  );
}
```

**Workflow:**

```
User Click "Download" Button
    ↓
Select Quality (480p/720p/1080p)
    ↓
Fetch video blob from server
    ↓
Store in IndexedDB (browser local storage)
    ↓
Show success message
    ↓
User can watch offline at /watch/offline
```

**Lợi ích:**

- Người dùng có dung lượng Internet hạn chế có thể tải trước
- Tiết kiệm dữ liệu di động
- Xem phim trên máy bay, tàu, nơi không có wifi

### 4. Push Notifications

**File:** `src/hooks/use-chat-stream.ts`

**Mục đích:** Đăng ký push notifications để nhận thông báo về phim mới, chat mới, v.v.

**Chi tiết triển khai:**

```typescript
import { useEffect, useCallback } from "react";

export function usePushNotifications() {
  // Đăng ký nhận push notifications
  const subscribeToPushNotifications = useCallback(async () => {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Worker không được hỗ trợ");
      return;
    }

    try {
      // Lấy service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Yêu cầu quyền từ người dùng
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Người dùng từ chối notifications");
        return;
      }

      // Đăng ký subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // Gửi subscription đến backend
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (response.ok) {
        console.log("Đăng ký push notifications thành công");
      }
    } catch (error) {
      console.error("Lỗi đăng ký notifications:", error);
    }
  }, []);

  useEffect(() => {
    subscribeToPushNotifications();
  }, [subscribeToPushNotifications]);

  return { subscribeToPushNotifications };
}
```

**Push Notification Flow:**

```
Backend (Scheduler/Event)
    ↓ "New movie: Phim Lộp Nhóc"
    ↓ Send push to all subscribed users
Frontend Service Worker
    ↓ Receive push event
    ↓ Show notification popup
User
    ↓ Click notification
    ↓ Navigate to /movies/phim-lop-nhoc
```

**Loại Notifications:**

| Loại         | Trigger                 | Ví dụ                                |
| ------------ | ----------------------- | ------------------------------------ |
| New Movie    | Admin thêm phim mới     | "Phim Lộp Nhóc mới đã ra! Xem ngay." |
| New Episode  | Series có tập mới       | "Tập 5 Nhật Ký Cô Nàng đã lên sóng!" |
| Chat Message | Được trả lời trong chat | "Bạn có 3 tin nhắn mới từ support"   |
| Subscription | Gói đã sắp hết hạn      | "Gói Premium hết hạn trong 7 ngày"   |

### 5. Recap - PWA Checklist

| Mục                | File                                           | Trạng thái |
| ------------------ | ---------------------------------------------- | ---------- |
| Service Worker     | `public/sw.js`                                 | HOÀN THÀNH |
| Manifest           | `public/manifest.json`                         | HOÀN THÀNH |
| Offline Download   | `src/components/PWA/OfflineDownloadButton.tsx` | HOÀN THÀNH |
| Push Notifications | API backend + `usePushNotifications`           | HOÀN THÀNH |
| Install Prompt     | Browser native                                 | HOÀN THÀNH |

---

## AI Chat Integration

### Tổng Quan

Chat AI là tính năng cho phép người dùng trò chuyện với AI assistant (chạy Ollama LLM) để nhận giới thiệu phim, trả lời câu hỏi về nội dung phim, v.v.

### 1. Frontend Architecture

#### Chat UI Component

**File:** `src/app/page.tsx` (Home page) hoặc dedicated `/chat` page

**Chi tiết:**

```typescript
'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { useChatStream } from '@/hooks/use-chat-stream';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hook xử lý streaming
  const { streamChat } = useChatStream();

  // Auto scroll to bottom khi có message mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return;

    // Thêm user message
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Gọi streaming API
      let assistantContent = '';

      await streamChat(input, (chunk) => {
        // Callback khi nhận được chunk từ server
        assistantContent += chunk;

        // Cập nhật hoặc tạo assistant message
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.role === 'assistant') {
            // Cập nhật message cuối cùng
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: assistantContent }
            ];
          } else {
            // Tạo message mới
            return [
              ...prev,
              {
                role: 'assistant',
                content: assistantContent,
                timestamp: new Date()
              }
            ];
          }
        });
      });
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, streamChat]);

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      {/* Chat messages */}
      <Box flex={1} overflow="auto" padding={2} bgcolor="#f5f5f5">
        {messages.map((msg, idx) => (
          <Paper
            key={idx}
            sx={{
              padding: 2,
              marginBottom: 1,
              bgcolor: msg.role === 'user' ? '#e3f2fd' : '#f5f5f5',
              textAlign: msg.role === 'user' ? 'right' : 'left'
            }}
          >
            <Typography variant="body1">{msg.content}</Typography>
            <Typography variant="caption" color="textSecondary">
              {msg.timestamp.toLocaleTimeString()}
            </Typography>
          </Paper>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input area */}
      <Box display="flex" padding={2} gap={1}>
        <TextField
          fullWidth
          placeholder="Hỏi về phim, đôi điều về streaming..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoading}
          multiline
          maxRows={4}
        />
        <Button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          variant="contained"
        >
          {isLoading ? 'Đang xử lý...' : 'Gửi'}
        </Button>
      </Box>
    </Box>
  );
}
```

#### Chat Streaming Hook

**File:** `src/hooks/use-chat-stream.ts`

**Mục đích:** Xử lý Server-Sent Events (SSE) để nhận dữ liệu streaming từ backend.

**Chi tiết triển khai:**

```typescript
import { useCallback } from "react";

interface UseChatStreamOptions {
  onError?: (error: Error) => void;
}

export function useChatStream(options?: UseChatStreamOptions) {
  const streamChat = useCallback(
    async (message: string, onChunk: (chunk: string) => void): Promise<void> => {
      try {
        // Gọi backend `/api/chat/stream` endpoint
        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ message }),
          // Không thể dùng 'stream' mode với fetch thông thường
          // Thay vào đó dùng ReadableStream hoặc EventSource
        });

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        // Dùng ReadableStream để stream dữ liệu
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode chunk
          const chunk = decoder.decode(value, { stream: true });
          onChunk(chunk);
        }

        // Decoder flush
        onChunk(decoder.decode());
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        options?.onError?.(err);
        throw err;
      }
    },
    [options]
  );

  return { streamChat };
}
```

### 2. Backend Architecture

#### Spring Boot Chat Service

**File:** `src/main/java/com/hoaug/movieapi/modules/chat/application/service/ChatService.java`

**Chi tiết triển khai:**

```java
package com.hoaug.movieapi.modules.chat.application.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class ChatService {
  private final RestTemplate restTemplate;
  private final OllamaProperties ollamaProperties; // Config Ollama URL

  /**
   * Stream chat response từ Ollama LLM
   */
  public void streamChatResponse(
    String userMessage,
    Consumer<String> onChunk
  ) throws Exception {
    // 1. Xây dựng prompt context về phim
    String systemPrompt = """
      Bạn là trợ lý AI cho nền tảng xem phim Gió Phim.
      Giúp người dùng:
      - Giới thiệu phim phù hợp
      - Trả lời câu hỏi về nội dung phim
      - Gợi ý tập tiếp theo để xem
      - Hỗ trợ kỹ thuật về streaming

      Luôn trả lời tiếng Việt.
    """;

    // 2. Tạo request tới Ollama
    OllamaRequest request = OllamaRequest.builder()
      .model("mistral:latest") // LLM model
      .prompt(systemPrompt + "\n\nUser: " + userMessage)
      .stream(true)
      .temperature(0.7)
      .topP(0.9)
      .build();

    // 3. Stream response
    HttpClient httpClient = HttpClient.newBuilder().build();
    HttpRequest httpRequest = HttpRequest.newBuilder()
      .uri(URI.create(ollamaProperties.getUrl() + "/api/generate"))
      .header("Content-Type", "application/json")
      .POST(HttpRequest.BodyPublishers.ofString(
        objectMapper.writeValueAsString(request)
      ))
      .build();

    httpClient.sendAsync(httpRequest,
      HttpResponse.BodyHandlers.ofLines()
    ).thenAccept(response -> {
      response.body().forEach(line -> {
        try {
          OllamaResponse ollamaResp = objectMapper.readValue(
            line, OllamaResponse.class
          );
          onChunk.accept(ollamaResp.getResponse());
        } catch (Exception e) {
          log.error("Error parsing Ollama response", e);
        }
      });
    }).join();
  }
}
```

#### Chat Controller

**File:** `src/main/java/com/hoaug/movieapi/modules/chat/presentation/controller/ChatController.java`

**Chi tiết triển khai:**

```java
package com.hoaug.movieapi.modules.chat.presentation.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import com.hoaug.movieapi.modules.chat.application.service.ChatService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
  private final ChatService chatService;
  private final SubscriptionAccessService accessService;

  /**
   * Stream endpoint - Server-Sent Events (SSE)
   */
  @PostMapping(
    value = "/stream",
    produces = MediaType.TEXT_PLAIN_VALUE,
    consumes = MediaType.APPLICATION_JSON_VALUE
  )
  public StreamingResponseBody stream(
    @RequestBody ChatRequest request,
    Authentication auth
  ) {
    // 1. Xác thực người dùng
    if (auth == null || !auth.isAuthenticated()) {
      throw new UnauthorizedException("Cần đăng nhập");
    }

    // 2. Kiểm tra subscription (AI chat là premium feature)
    Long userId = ((CustomUserDetails) auth.getPrincipal()).getId();
    if (!accessService.hasAccessToAIChat(userId)) {
      throw new AccessDeniedException("Bạn không có quyền dùng AI chat");
    }

    // 3. Stream response
    return outputStream -> {
      try {
        chatService.streamChatResponse(
          request.getMessage(),
          chunk -> {
            try {
              outputStream.write(chunk.getBytes(StandardCharsets.UTF_8));
              outputStream.flush();
            } catch (IOException e) {
              log.error("Error writing to stream", e);
            }
          }
        );
      } catch (Exception e) {
        log.error("Chat streaming error", e);
        outputStream.write(("Error: " + e.getMessage()).getBytes());
      }
    };
  }
}
```

### 3. Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                   │
│  ┌────────────────────────────────────────────────┐  │
│  │ Chat Component                                 │  │
│  │ - Display messages                             │  │
│  │ - Input field                                  │  │
│  │ - Auto-scroll                                  │  │
│  └────────┬─────────────────────────────────────┬┘  │
│           │                                     │   │
│     1. POST /api/chat/stream                   │   │
│     message: "Phim hành động hay nhất?"        │   │
│           │                                     │   │
└───────────┼─────────────────────────────────────┘   │
            │                                         │
            │ HTTP Request                            │
            ↓                                         │
┌─────────────────────────────────────────────────────┐
│              BACKEND (Spring Boot)                   │
│  ┌────────────────────────────────────────────────┐  │
│  │ ChatController                                 │  │
│  │ 1. Verify auth token                           │  │
│  │ 2. Check subscription (AI chat is premium)    │  │
│  └────┬─────────────────────────────────────────┘  │
│       │                                            │
│       ↓                                            │
│  ┌────────────────────────────────────────────────┐  │
│  │ ChatService                                    │  │
│  │ 1. Build system prompt                         │  │
│  │ 2. Call Ollama LLM API                         │  │
│  │ 3. Stream response chunks                      │  │
│  └────┬─────────────────────────────────────────┘  │
│       │                                            │
│       ↓                                            │
│  ┌────────────────────────────────────────────────┐  │
│  │ Ollama LLM (Local/Remote)                      │  │
│  │ Model: mistral:latest                          │  │
│  │ Inference time: ~1-2 seconds                   │  │
│  └────┬─────────────────────────────────────────┘  │
│       │                                            │
│       │ "Phim hành động hay nhất là Avengers"     │
│       │ streaming chunks...                        │
│       │                                            │
└───────┼──────────────────────────────────────────┘
        │
        │ HTTP 200 OK
        │ Content-Type: text/plain
        │ Transfer-Encoding: chunked
        │
        ↓ 2. ReadableStream processing
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                   │
│  ┌────────────────────────────────────────────────┐  │
│  │ useChatStream hook                             │  │
│  │ - Read chunk: "Phim"                           │  │
│  │ - Read chunk: " hành động"                     │  │
│  │ - Read chunk: " hay nhất..."                   │  │
│  │                                                │  │
│  │ onChunk callback → Update state                │  │
│  └────┬─────────────────────────────────────────┘  │
│       │                                            │
│       ↓ 3. Real-time UI Update                    │
│  ┌────────────────────────────────────────────────┐  │
│  │ Chat Bubble (Assistant)                        │  │
│  │ "Phim hành động hay nhất là Avengers..."      │  │
│  │ (Appearing character by character)             │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 4. Performance Optimization

**Streaming Strategy:**

| Aspek             | Optimization                                        |
| ----------------- | --------------------------------------------------- |
| Latency           | Mở WebSocket thay vì polling; use HTTP/2 push       |
| Throughput        | Batch chunks (e.g., 100 tokens/chunk)               |
| UI Responsiveness | Render incrementally, không chờ full response       |
| Memory            | Stream xử lý từng chunk, không buffer full response |
| Cost              | Cache thường xuyên queries (giảm LLM calls)         |

**Cache Strategy:**

```typescript
// Cache common questions
const CACHED_RESPONSES = {
  "phim-hay-nhat": "Top 10 phim hay nhất trên Gió Phim...",
  "phim-moi-nhat": "Phim mới cập nhật hôm nay...",
};

// Check cache trước khi gọi LLM
if (message in CACHED_RESPONSES) {
  return CACHED_RESPONSES[message];
}

// Gọi LLM nếu không có trong cache
const response = await streamChat(message);
```

### 5. Recap - AI Chat Checklist

| Mục                               | Trạng thái |
| --------------------------------- | ---------- |
| Frontend Chat UI                  | HOÀN THÀNH |
| Streaming Hook (useChatStream)    | HOÀN THÀNH |
| Backend Chat Controller           | HOÀN THÀNH |
| Chat Service (Ollama integration) | HOÀN THÀNH |
| Authentication & Authorization    | HOÀN THÀNH |
| Error Handling                    | HOÀN THÀNH |

---

## Architecture & Data Flow

### High-Level System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     USER DEVICES                                  │
│  (Desktop Chrome / Safari / Android / iOS)                        │
└─────────────────────┬──────────────────────────────────────────┘
                      │ HTTPS
                      ↓
┌──────────────────────────────────────────────────────────────────┐
│            FRONTEND (Next.js 15 @ giophim.libsys.me)             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ App Router (React 18 Server/Client Components)            │  │
│  │ - /                     (Home page)                        │  │
│  │ - /movies               (Movie list page)                  │  │
│  │ - /movies/[slug]        (Movie detail + Dynamic SEO)       │  │
│  │ - /watch/[movieSlug]    (Video player - Streaming)        │  │
│  │ - /chat                 (AI Chat)                          │  │
│  │ - /profile              (User dashboard)                   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ SEO Endpoints                                              │  │
│  │ - /robots.txt           (Crawler directives)              │  │
│  │ - /sitemap.xml          (Dynamic sitemap)                 │  │
│  │ - /manifest.json        (PWA metadata)                    │  │
│  │ - /sw.js                (Service Worker)                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Storage                                                    │  │
│  │ - localStorage          (JWT tokens, user prefs)          │  │
│  │ - IndexedDB             (Offline episodes, cache)         │  │
│  │ - Service Worker Cache  (App shell, static assets)        │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────┬──────────────────────────────────────────────────┘
              │ REST API calls
              │ Authorization: Bearer JWT
              ↓
┌──────────────────────────────────────────────────────────────────┐
│          BACKEND (Spring Boot @ api.libsys.me)                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Controllers                                                │  │
│  │ - MovieController       (/api/movies/*, /api/tv/*)        │  │
│  │ - ChatController        (/api/chat/stream)                │  │
│  │ - CommentController     (/api/comments/*)                 │  │
│  │ - AuthController        (/api/auth/*, /api/oauth/*)       │  │
│  │ - SubscriptionController (/api/subscriptions/*)           │  │
│  │ - NotificationController (/api/notifications/*)           │  │
│  └────────┬──────────────────────────────────────────────────┘  │
│           │                                                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Services                                                   │  │
│  │ - MovieService          (CRUD movies, search, filter)     │  │
│  │ - ChatService           (Ollama LLM integration)          │  │
│  │ - SubscriptionAccessService (Verify access tier)          │  │
│  │ - AuthService           (JWT, OAuth2, Email verify)       │  │
│  │ - NotificationService   (Push notifications, email)       │  │
│  └────────┬──────────────────────────────────────────────────┘  │
│           │                                                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Database & Cache                                           │  │
│  │ - PostgreSQL            (Persistent data)                  │  │
│  │ - Redis                 (Session, cache, rate limiting)    │  │
│  │ - Elasticsearch         (Movie search)                     │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────┬──────────────────────────────────────────────────┘
              │
              ├─────────────────────────────────────────────────┐
              │                                                 │
              ↓                                                 ↓
    ┌─────────────────────┐                      ┌──────────────────────┐
    │ External Services   │                      │ Ollama LLM           │
    │ - HLS Video CDN     │                      │ (AI Chat inference)  │
    │ - Email Provider    │                      │ Model: mistral       │
    │ - OAuth2 Providers  │                      │ Port: 11434          │
    │ - Payment Gateway   │                      └──────────────────────┘
    └─────────────────────┘
```

### Authentication Flow

```
USER (Frontend)
  ↓ 1. POST /api/auth/login
  │   body: { email, password }
  ↓
BACKEND
  ├─ Hash password verification
  ├─ Generate JWT token + Refresh token
  ├─ Store refresh token in Redis
  └─ Return { accessToken, refreshToken, user }
  ↓ 2. Response
FRONTEND
  ├─ Store accessToken in localStorage
  ├─ Store refreshToken in httpOnly cookie
  ├─ Add Authorization header to all requests
  └─ Access token lifetime: 15 minutes

  ↓ 3. When access token expires
  │   POST /api/auth/refresh
  │   (Send refresh token)
  ↓
BACKEND
  ├─ Verify refresh token
  ├─ Generate new access token
  └─ Return new accessToken
  ↓
FRONTEND
  ├─ Update Authorization header
  ├─ Retry failed request
  └─ Continue seamlessly
```

### Movie Detail Page SEO Flow

```
SEARCH ENGINE (Googlebot)
  ↓ 1. GET /movies/phim-lop-nhoc
  ↓
NEXTJS SERVER (Server Component)
  ├─ Extract slug from URL params
  ├─ Call generateMetadata() function
  │  └─ Fetch API: GET /api/movies/slug/phim-lop-nhoc/detail
  ├─ Fetch movie data from backend
  ├─ Build metadata object:
  │  ├─ title: "Phim Lộp Nhóc | Gió Phim"
  │  ├─ description: "Xem phim Phim Lộp Nhóc HD..."
  │  ├─ openGraph: { type, url, title, images }
  │  ├─ twitter: { card, images }
  │  └─ canonical: full URL
  └─ Return <head> with metadata tags
  ↓ 2. HTTP 200
  │   <head>
  │   <title>Phim Lộp Nhóc | Gió Phim</title>
  │   <meta name="description" content="...">
  │   <meta property="og:type" content="video.movie">
  │   <meta property="og:image" content="...poster.jpg">
  │   <link rel="canonical" href="...">
  │   </head>
  │   <body>...</body>
  ↓
GOOGLEBOT
  ├─ Parse metadata
  ├─ Extract title, description, images
  ├─ Follow canonical URL
  ├─ Index page with structured data
  └─ Show in search results with rich snippet
```

---

## Câu Hỏi Phỏng Vấn Tiềm Năng

### 1. SEO & Indexing

**Q1: Làm thế nào để đảm bảo Google index tất cả các trang phim trong database?**

A:

- Triển khai dynamic `generateMetadata()` ở `/src/app/movies/[slug]/page.tsx` để tạo metadata độc lập cho từng phim
- Tạo sitemap.xml động (`/src/app/sitemap.xml/route.ts`) tự động list tất cả phim
- Submit sitemap đến Google Search Console
- Set cache header để sitemap update theo schedule

**Q2: robots.txt và sitemap.xml khác nhau như thế nào?**

A:

- robots.txt: Hướng dẫn crawlers NÊN crawl pages nào, KHÔNG crawl pages nào
- sitemap.xml: Cung cấp danh sách tất cả URLs + metadata (lastModified, priority, changeFreq) để crawlers discover content

**Q3: Canonical URL dùng để làm gì?**

A:

- Tránh duplicate content penalties (VD: /movies/phim-lop-nhoc vs /movies/phim-lop-nhoc/)
- Chỉ cho Google crawlers URL chính tắc để index
- Tập trung ranking score vào một URL duy nhất

**Q4: Metadata gì quan trọng nhất cho Movie pages?**

A:

- `<title>`: [Tên Phim] | [Tên Site] (chứa keyword)
- `<meta description>`: Tóm tắt phim + rating
- `og:image`: Poster phim (500x750px)
- `og:type`: "video.movie" (rich snippet)

### 2. PWA & Offline

**Q1: Service Worker hoạt động như thế nào?**

A:

- Chạy trong background thread (worker), tách biệt từ main thread
- Intercept network requests via `fetch` event
- Implement cache strategy: cache-first, network-first, stale-while-revalidate
- Handle push notifications, background sync

**Q2: Sự khác biệt giữa native app download vs PWA offline?**

A:

- Native: Tải từ App Store, ~100MB+, update qua app store
- PWA: Tải từ website, ~10-50MB (tùy content), update tự động, không cần app store

**Q3: IndexedDB dùng để lưu trữ gì?**

A:

- Lưu video blob (file binary) để xem offline
- Lưu cache dữ liệu API
- Lưu movie metadata, episode list
- Lưu chat history, user preferences

**Q4: Push notifications từ backend gửi như thế nào?**

A:

- Frontend subscribe: `registration.pushManager.subscribe()`
- Send subscription object đến backend
- Backend lưu subscription + userId
- Khi có event (phim mới, tập mới), backend gửi push message qua Web Push Protocol
- Service Worker nhận push, show notification popup

### 3. AI Chat & Streaming

**Q1: Tại sao phải stream response thay vì đợi full response?**

A:

- Giảm latency: Người dùng thấy text đang gõ ngay lập tức, không chờ 10 giây
- Cải thiện UX: Cảm giác app responsive
- Tiết kiệm memory: Xử lý từng chunk, không buffer full response
- Tối ưu bandwidth: Có thể hủy nếu user đóng chat

**Q2: SSE (Server-Sent Events) vs WebSocket?**

A:

- SSE: Unidirectional (server → client), đơn giản, dùng HTTP, auto-reconnect
- WebSocket: Bidirectional (client ↔ server), full-duplex, phức tạp hơn
- Chọn SSE cho chat vì chỉ cần server stream response

**Q3: Ollama LLM hoạt động như thế nào?**

A:

- Local LLM inference engine (chạy trên server)
- Model: Mistral, Llama, Neural Chat, etc.
- API endpoint: POST /api/generate
- Request: { model, prompt, stream }
- Response: Streaming text tokens

**Q4: Làm thế nào để rate-limit AI chat?**

A:

- Backend: Redis counter per userId per minute
- Limit: 10 requests/minute cho free user, unlimited cho premium
- Return 429 Too Many Requests nếu exceed
- Display user message "Vui lòng đợi..."

### 4. Performance & Optimization

**Q1: Core Web Vitals gồm cái gì?**

A:

- Largest Contentful Paint (LCP): Bao lâu để main content load? Target < 2.5s
- First Input Delay (FID): Bao lâu để respond sau click? Target < 100ms
- Cumulative Layout Shift (CLS): Có shifting content? Target < 0.1
- Tối ưu: Optimize images (WebP, lazy load), code splitting, caching

**Q2: Cách optimize image loading?**

A:

- Use WebP format thay vì JPEG (50% nhỏ hơn)
- Lazy loading: `loading="lazy"` hoặc Intersection Observer
- Responsive images: srcset cho khác screen sizes
- CDN: Serve từ edge server gần user

**Q3: Tại sao cache sitemap 24 giờ?**

A:

- Giảm database queries
- Sitemap change không thường xuyên (phim mới add hàng ngày, không hàng giờ)
- Tiết kiệm server resources
- Google recrawl sitemap mỗi vài ngày anyway

### 5. Security

**Q1: Tại sao hạn chế image remote domains?**

A:

- Tránh attacker inject malicious image URLs
- Tránh loading từ CDN không tin tưởng
- Ví dụ rủi ro: next/image xử lý attacker URL → SSRF attack

**Q2: JWT token storage - localStorage vs cookie?**

A:

- localStorage: Dễ bị XSS (JavaScript access)
- httpOnly cookie: Bảo mật hơn (server-only, không access từ JS)
- Recommendation: accessToken = httpOnly cookie, refreshToken = secure storage

**Q3: Làm thế nào prevent AI chat abuse?**

A:

- Rate limiting (requests/minute)
- Check user subscription tier
- Log chat queries (audit trail)
- Content filtering (block harmful requests)

### 6. Architecture Decision

**Q1: Tại sao dùng Next.js App Router thay vì Pages Router?**

A:

- Server Components (default) → better SEO, security
- Dynamic routes dễ dùng: `[slug]/page.tsx`
- Streaming support cho SSR
- Incremental Static Regeneration (ISR)
- Better organization

**Q2: Tại sao split frontend & backend?**

A:

- Scalability: Frontend scale independently
- Technology flexibility: Frontend = React/Next, Backend = Java Spring
- API-first: Reuse API cho mobile app, desktop app
- Security: Backend behind firewall, frontend public

**Q3: Tại sao Ollama local LLM thay vì OpenAI API?**

A:

- Cost: Local inference cheaper (server cost fixed)
- Privacy: Data không send third-party
- Offline: LLM inference offline, không internet dependency
- Customization: Fine-tune model cho domain-specific data

### 7. Troubleshooting

**Q1: Video player không load trên mobile Safari - nguyên nhân?**

A:

- Safari chặn Authorization header trên HLS requests
- Solution: Thêm token vào query string (`?token=xxx`)
- Fallback mechanism: Detect browser, dùng query token cho Safari

**Q2: Service Worker cache outdated - fix?**

A:

- Implement cache versioning (`v1`, `v2`, ...)
- Clean old caches khi cài đặt SW mới
- Add version hash vào asset URL
- Manual cache busting: User clear cache, reinstall

**Q3: Sitemap XML không update - debug?**

A:

- Check backend API `/api/movies` returns data
- Verify cache control header (không hard-cache)
- Test endpoint: curl `https://giophim.libsys.me/sitemap.xml`
- Check browser DevTools Network tab
- Resubmit sitemap trong Google Search Console

**Q4: AI Chat timeout 30 giây - fix?**

A:

- Ollama LLM quá chậm: Optimize model size
- Network latency: Move Ollama gần backend
- Increase timeout: Node.js default 30s → 120s
- Stream lâu hơn thay vì timeout: Chunk-based response

---

## Tổng Kết

Gió Phim được xây dựng với ba cột trụ chính:

1. **SEO-First**: Dynamic metadata per page, crawlers-friendly structure, indexed content
2. **PWA-Enabled**: Offline capability, push notifications, installable
3. **AI-Powered**: Intelligent chat assistant, streaming responses, premium feature

Kiến trúc này cải thiện:

- Search rankings (organic traffic)
- User engagement (offline mode, notifications)
- User experience (AI chat, performance)
- Monetization (AI chat as premium feature)

Tất cả các thành phần đã được triển khai, tested, và sẵn sàng production.
