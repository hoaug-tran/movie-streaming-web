import type { Metadata } from "next";
import FavoritesClient from "@/modules/favorite/components/FavoritesClient";

export const metadata: Metadata = {
  title: "Phim yêu thích | Movie Streaming",
  description:
    "Quản lý các bộ phim bạn đã yêu thích, tìm kiếm nhanh và xoá phim khỏi bộ sưu tập cá nhân trên Movie Streaming.",
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
