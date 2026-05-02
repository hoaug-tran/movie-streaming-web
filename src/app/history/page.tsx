import type { Metadata } from "next";
import HistoryClient from "@/modules/watch-history/components/HistoryClient";

export const metadata: Metadata = {
  title: "Lịch sử xem | Movie Streaming",
  description:
    "Theo dõi lịch sử xem phim, tiến độ tập phim và tiếp tục xem nội dung yêu thích của bạn trên Movie Streaming.",
};

export default function HistoryPage() {
  return <HistoryClient />;
}
