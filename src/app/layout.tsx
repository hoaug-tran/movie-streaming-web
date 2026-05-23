import type { Metadata, Viewport } from "next";
import Providers from "./providers";
import "../styles/globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://giophim.libsys.me";
const APP_LOGO = `${APP_URL}/icons/logo.webp`;

export const metadata: Metadata = {
  title: "Gió phim - Gió đưa, phim tới",
  description: "Khám phá hàng nghìn bộ phim và series hấp dẫn. Xem phim HD miễn phí tại Gió Phim.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gió Phim",
  },
  formatDetection: { telephone: false },
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: APP_URL,
    title: "Gió phim - Gió đưa, phim tới",
    description:
      "Khám phá hàng nghìn bộ phim và series hấp dẫn. Xem phim HD miễn phí tại Gió Phim.",
    siteName: "Gió Phim",
    images: [
      {
        url: APP_LOGO,
        width: 512,
        height: 512,
        alt: "Gió Phim Logo",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gió phim - Gió đưa, phim tới",
    description:
      "Khám phá hàng nghìn bộ phim và series hấp dẫn. Xem phim HD miễn phí tại Gió Phim.",
    images: [APP_LOGO],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.webp", sizes: "192x192", type: "image/webp" },
      { url: "/icons/icon-512.webp", sizes: "512x512", type: "image/webp" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon-180.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/apple-touch-icon-167.png", sizes: "167x167", type: "image/png" },
      { url: "/icons/apple-touch-icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/apple-touch-icon-120.png", sizes: "120x120", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#C8102E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Gió Phim" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="color-scheme" content="dark" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/apple-touch-icon-167.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-touch-icon-120.png" />
        <link rel="apple-touch-icon-precomposed" href="/icons/apple-touch-icon-180.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  console.log('[SW] Registering /sw.js...');
                  navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
                    .then(function(reg) {
                      console.log('[SW] Registered OK — scope:', reg.scope);
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
                    })
                    .catch(function(err) {
                      console.error('[SW] Registration FAILED:', err);
                    });
                  var refreshing = false;
                  navigator.serviceWorker.addEventListener('controllerchange', function() {
                    if (refreshing) return;
                    refreshing = true;
                    window.location.reload();
                  });
                });
              } else {
                console.warn('[SW] serviceWorker not supported in this browser');
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
