"use client";

import CinematicBrowsePage from "@/components/Browse/CinematicBrowsePage";

export default function MovieBrowser() {
  return (
    <CinematicBrowsePage
      movieType="SINGLE"
      mood="cinema"
      eyebrow="PHIM LẺ 2026"
      title="Điện ảnh không đứng yên"
      subtitle="Một không gian discovery dành cho những buổi xem trọn vẹn: từ bom tấn đại chúng, phim tác giả đến các cú twist cần được xem ngay trong đêm."
      primaryLabel="Xem spotlight"
      secondaryLabel="Khám phá phim"
    />
  );
}
