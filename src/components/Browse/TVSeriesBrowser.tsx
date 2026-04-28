"use client";

import CinematicBrowsePage from "@/components/Browse/CinematicBrowsePage";

export default function TVSeriesBrowser() {
  return (
    <CinematicBrowsePage
      movieType="SERIES"
      mood="series"
      eyebrow="PHIM BỘ 2026"
      title="Những vũ trụ đáng theo dõi"
      subtitle="Theo dấu các câu chuyện dài hơi, mùa mới, tập mới và những series đang tạo nhịp thảo luận mạnh nhất trong cộng đồng Gió Phim."
      primaryLabel="Xem series nổi bật"
      secondaryLabel="Lướt các mùa phim"
    />
  );
}
