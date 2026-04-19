import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ClientLayoutWrapper } from "./client-layout-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gió Phim - Gió đưa phim tới",
  description: "Gió đưa phim tới - Xem phim trực tuyến chất lượng cao mọi lúc, mọi nơi",
  keywords: ["phim", "xem phim online", "phim trực tuyến", "xem phim miễn phí", "phim HD"],
  authors: [{ name: "Gió Phim Team" }],
  openGraph: {
    title: "Gió Phim - Gió đưa phim tới",
    description: "Xem phim trực tuyến chất lượng cao mọi lúc, mọi nơi trên Gió Phim",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppRouterCacheProvider>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
