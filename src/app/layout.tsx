import type { Metadata } from "next";
import Providers from "./providers";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Gió Phim — Xem Phim Online Chất Lượng Cao",
  description: "Khám phá hàng nghìn bộ phim và series hấp dẫn. Xem phim HD miễn phí tại Gió Phim.",
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
