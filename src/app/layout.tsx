import type { Metadata } from "next";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Gió Phim - Movie Streaming Platform",
  description: "Watch movies and TV shows online",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
