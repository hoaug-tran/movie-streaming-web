import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Phim đã tải | Gió Phim",
  description: "Danh sách phim đã tải về thiết bị để xem offline không cần kết nối mạng.",
};

export default function DownloadsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
