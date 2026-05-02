import type { Metadata } from "next";
import WatchlistClient from "@/modules/watchlist/components/WatchlistClient";

export const metadata: Metadata = {
  title: "Xem sau - Gió Phim",
  description:
    "Lưu lại những bộ phim bạn muốn xem và tiếp tục khám phá nội dung mới trên Gió Phim.",
};

export default function WatchlistPage() {
  return <WatchlistClient />;
}
