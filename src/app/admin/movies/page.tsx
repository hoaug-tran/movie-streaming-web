"use client";

import { Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import AdminFormDrawer, { AdminFormField } from "@/modules/admin/components/AdminFormDrawer";
import AdminManagementPage, {
  AdminStatusChip,
} from "@/modules/admin/components/AdminManagementPage";
import { AdminMovie, AdminMoviePayload, adminService } from "@/modules/admin/api";

type MovieFormValues = AdminMoviePayload & Record<string, unknown>;

const movieFields: AdminFormField<MovieFormValues>[] = [
  { name: "title", label: "Tiêu đề", required: true, maxLength: 255 },
  { name: "originalTitle", label: "Tên gốc", maxLength: 255 },
  { name: "slug", label: "Slug", required: true, maxLength: 255 },
  { name: "description", label: "Mô tả", type: "textarea", maxLength: 5000 },
  {
    name: "posterUrl",
    label: "Poster",
    type: "image",
    maxLength: 1000,
    imageAspectRatio: "2 / 3",
    imageSizeHint: "Khuyến nghị 1000×1500px (2:3).",
  },
  {
    name: "bannerUrl",
    label: "Banner",
    type: "image",
    maxLength: 1000,
    imageAspectRatio: "16 / 9",
    imageSizeHint: "Khuyến nghị 1920×1080px (16:9).",
  },
  { name: "trailerUrl", label: "Trailer", type: "video", maxLength: 1000 },
  {
    name: "releaseYear",
    label: "Năm phát hành",
    type: "number",
    required: true,
    min: 1888,
    max: 2100,
  },
  { name: "country", label: "Quốc gia", maxLength: 100 },
  { name: "language", label: "Ngôn ngữ", maxLength: 100 },
  { name: "ageRating", label: "Age rating", maxLength: 20 },
  {
    name: "movieType",
    label: "Loại phim",
    type: "select",
    required: true,
    options: [
      { label: "Movie (Single)", value: "SINGLE" },
      { label: "Series", value: "SERIES" },
    ],
  },
  {
    name: "movieStatus",
    label: "Trạng thái",
    type: "select",
    required: true,
    options: [
      { label: "Draft", value: "DRAFT" },
      { label: "Reviewing", value: "REVIEWING" },
      { label: "Published", value: "PUBLISHED" },
      { label: "Archived", value: "ARCHIVED" },
    ],
  },
  { name: "isPremiumOnly", label: "Chỉ Premium", type: "switch" },
];

function toMovieForm(movie?: AdminMovie | null): MovieFormValues {
  return {
    title: movie?.title ?? "",
    originalTitle: movie?.originalTitle ?? "",
    slug: movie?.slug ?? "",
    description: movie?.description ?? "",
    posterUrl: movie?.posterUrl ?? "",
    bannerUrl: movie?.bannerUrl ?? "",
    trailerUrl: movie?.trailerUrl ?? "",
    releaseYear: movie?.releaseYear ?? new Date().getFullYear(),
    country: movie?.country ?? "",
    language: movie?.language ?? "",
    ageRating: movie?.ageRating ?? "",
    movieType: movie?.movieType ?? "SINGLE",
    movieStatus: movie?.movieStatus ?? "DRAFT",
    isPremiumOnly: Boolean(movie?.isPremiumOnly),
  };
}

export default function AdminMoviesPage() {
  const router = useRouter();
  return (
    <AdminManagementPage<AdminMovie>
      permission="movies:manage"
      title="Quản lý phim"
      description="Thêm, chỉnh sửa và quản lý trạng thái phát hành phim. Sau khi tạo phim, vào trang chi tiết để gắn danh mục, tag, diễn viên và đạo diễn."
      queryKey={["admin", "movies"]}
      queryFn={adminService.getMovies}
      searchPlaceholder="Tìm theo tên, slug, quốc gia, ngôn ngữ..."
      getSearchText={(movie) =>
        `${movie.title} ${movie.originalTitle ?? ""} ${movie.slug ?? ""} ${movie.country ?? ""} ${movie.language ?? ""}`
      }
      getStatus={(movie) => movie.movieStatus ?? "UNKNOWN"}
      extraFilters={[
        {
          key: "movieType",
          label: "Loại phim",
          options: [
            { label: "Phim lẻ", value: "SINGLE" },
            { label: "Phim bộ", value: "SERIES" },
          ],
          getValue: (movie) => movie.movieType ?? "",
        },
        {
          key: "premium",
          label: "Truy cập",
          options: [
            { label: "Miễn phí", value: "false" },
            { label: "Premium", value: "true" },
          ],
          getValue: (movie) => String(Boolean(movie.isPremiumOnly)),
        },
        {
          key: "ageRating",
          label: "Độ tuổi",
          options: [
            { label: "G (Mọi lứa tuổi)", value: "G" },
            { label: "PG (Có hướng dẫn)", value: "PG" },
            { label: "PG-13 (13+)", value: "PG-13" },
            { label: "R (17+)", value: "R" },
            { label: "R-17 (17+)", value: "R-17" },
            { label: "TV-14 (14+)", value: "TV-14" },
            { label: "TV-MA (18+)", value: "TV-MA" },
          ],
          getValue: (movie) => movie.ageRating ?? "",
        },
      ]}
      stats={[
        { label: "Tổng phim", getValue: (items) => items.length, tone: "cyan" },
        {
          label: "Premium",
          getValue: (items) => items.filter((item) => item.isPremiumOnly).length,
          tone: "violet",
        },
        {
          label: "Đã publish",
          getValue: (items) => items.filter((item) => item.movieStatus === "PUBLISHED").length,
          tone: "emerald",
        },
      ]}
      columns={[
        {
          key: "title",
          label: "Phim",
          render: (movie) => (
            <Stack>
              <Typography fontWeight={800}>{movie.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {[movie.releaseYear, movie.country, movie.language].filter(Boolean).join(" · ")}
              </Typography>
            </Stack>
          ),
        },
        {
          key: "type",
          label: "Loại",
          render: (movie) => <AdminStatusChip label={movie.movieType} tone="violet" />,
        },
        {
          key: "status",
          label: "Trạng thái",
          render: (movie) => (
            <AdminStatusChip
              label={movie.movieStatus}
              tone={movie.movieStatus === "PUBLISHED" ? "emerald" : "amber"}
            />
          ),
        },
        {
          key: "rating",
          label: "Rating",
          render: (movie) => (
            <Typography>
              {movie.averageRating ?? "-"} / 5 · {movie.totalReviews ?? 0} review
            </Typography>
          ),
        },
        {
          key: "views",
          label: "Lượt xem",
          render: (movie) => (
            <Typography>{(movie.viewCount ?? 0).toLocaleString("vi-VN")}</Typography>
          ),
        },
      ]}
      quickActions={[
        {
          id: "detail",
          label: "Chi tiết",
          tone: "cyan",
          href: (movie) => `/admin/movies/${movie.id}`,
        },
        {
          id: "toggleStatus",
          label: (movie: AdminMovie) =>
            movie.movieStatus === "PUBLISHED" ? "Ẩn (Draft)" : "Publish",
          tone: (movie: AdminMovie) => (movie.movieStatus === "PUBLISHED" ? "amber" : "emerald"),
          run: (movie) =>
            adminService.updateMovieStatus(
              movie.id,
              movie.movieStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
            ),
        },
        {
          id: "delete",
          label: "Xóa",
          tone: "rose",
          run: (movie) => adminService.deleteMovie(movie.id),
        },
      ]}
      createLabel="Thêm phim"
      onCreate={(payload) => adminService.createMovie(payload as AdminMoviePayload)}
      onCreateSuccess={(data) => {
        const movie = data as AdminMovie;
        if (movie?.id) router.push(`/admin/movies/${movie.id}`);
      }}
      onEdit={(movie, payload) => adminService.updateMovie(movie.id, payload as AdminMoviePayload)}
      renderForm={({ mode, item, open, submitting, error, onClose, onSubmit }) => (
        <AdminFormDrawer<MovieFormValues>
          open={open}
          mode={mode}
          title={mode === "create" ? "Thêm phim" : `Sửa ${item?.title ?? "phim"}`}
          description="Nhập thông tin cơ bản của phim. Sau khi tạo xong, vào trang chi tiết để thêm danh mục, tag, diễn viên, đạo diễn và studio."
          fields={movieFields}
          initialValues={toMovieForm(item)}
          submitting={submitting}
          error={error}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    />
  );
}
