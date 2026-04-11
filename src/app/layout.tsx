import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClientProvider } from "react-query";
import { AuthProvider } from "@/context/auth-context";
import { lightTheme } from "@/config/theme";
import { queryClient } from "@/config/react-query";
import Navbar from "@/components/Layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gio Phim - Movie Streaming Platform",
  description: "Watch movies and TV shows online with Gio Phim",
  keywords: ["movies", "TV shows", "streaming", "watch online"],
  authors: [{ name: "Gio Phim Team" }],
  openGraph: {
    title: "Gio Phim - Movie Streaming Platform",
    description: "Watch movies and TV shows online with Gio Phim",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppRouterCacheProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={lightTheme}>
              <AuthProvider>
                <Navbar />
                <main>{children}</main>
              </AuthProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
