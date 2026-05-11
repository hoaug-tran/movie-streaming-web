"use client";

import { Typography } from "@mui/material";
import AdminManagementPage, {
  AdminStatusChip,
} from "@/modules/admin/components/AdminManagementPage";
import { AdminMovie, adminService } from "@/modules/admin/api";

export default function AdminEpisodesPage() {
  return (
    <AdminManagementPage<AdminMovie>
      permission="movies:manage"
      title="Quản lý tập phim"
      description="Điểm vào quản lý tập theo phim. Chọn phim để đối soát số tập và trạng thái xuất bản."
      queryKey={["admin", "episodes", "movies"]}
      queryFn={adminService.getMovies}
      searchPlaceholder="Tìm phim, slug, trạng thái..."
      getSearchText={(movie) => `${movie.title} ${movie.slug ?? ""} ${movie.movieStatus ?? ""}`}
      stats={[
        { label: "Đầu phim", getValue: (items) => items.length, tone: "cyan" },
        {
          label: "Đã publish",
          getValue: (items) => items.filter((item) => item.movieStatus === "PUBLISHED").length,
          tone: "emerald",
        },
        {
          label: "Cần xử lý",
          getValue: (items) => items.filter((item) => item.movieStatus !== "PUBLISHED").length,
          tone: "amber",
        },
      ]}
      columns={[
        {
          key: "movie",
          label: "Phim",
          render: (movie) => <Typography fontWeight={800}>{movie.title}</Typography>,
        },
        {
          key: "type",
          label: "Loại",
          render: (movie) => <AdminStatusChip label={movie.movieType || "MOVIE"} tone="violet" />,
        },
        {
          key: "status",
          label: "Trạng thái",
          render: (movie) => (
            <AdminStatusChip
              label={movie.movieStatus || "DRAFT"}
              tone={movie.movieStatus === "PUBLISHED" ? "emerald" : "amber"}
            />
          ),
        },
      ]}
      quickActions={[
        {
          id: "view",
          label: "Xem chi tiết",
          tone: "cyan",
          run: (movie) => {
            window.open(`/admin/movies?id=${movie.id}`, "_self");
            return Promise.resolve();
          },
        },
      ]}
      onCreate={async (payload: any) => {
        const { movieId, ...episodeData } = payload;
        return adminService.createEpisode(Number(movieId), episodeData);
      }}
      renderForm={({ mode, open, submitting, error, onClose, onSubmit }) => {
        if (mode !== "create") return null;
        return (
          <EpisodeFormDialog
            open={open}
            submitting={submitting}
            error={error}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        );
      }}
    />
  );
}

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
} from "@mui/material";
import { useState, useEffect } from "react";

function EpisodeFormDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean;
  submitting: boolean;
  error: React.ReactNode;
  onClose: () => void;
  onSubmit: (payload: any) => void;
}) {
  const [movies, setMovies] = useState<AdminMovie[]>([]);
  const [formData, setFormData] = useState({
    movieId: "",
    title: "",
    episodeNumber: 1,
    durationSeconds: 0,
    isFreePreview: false,
    status: "DRAFT",
  });

  useEffect(() => {
    if (open) {
      adminService.getMovies().then(setMovies).catch(console.error);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      episodeNumber: Number(formData.episodeNumber),
      durationSeconds: Number(formData.durationSeconds),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 900 }}>Tạo tập phim mới</DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            select
            label="Chọn Phim"
            required
            value={formData.movieId}
            onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
          >
            {movies.map((movie) => (
              <MenuItem key={movie.id} value={movie.id}>
                {movie.title} ({movie.movieType})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Tiêu đề tập"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <TextField
            type="number"
            label="Tập số"
            required
            value={formData.episodeNumber}
            onChange={(e) => setFormData({ ...formData, episodeNumber: Number(e.target.value) })}
          />
          <TextField
            type="number"
            label="Thời lượng (giây)"
            required
            value={formData.durationSeconds}
            onChange={(e) => setFormData({ ...formData, durationSeconds: Number(e.target.value) })}
          />
          <TextField
            select
            label="Trạng thái"
            required
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <MenuItem value="DRAFT">Bản nháp</MenuItem>
            <MenuItem value="PUBLISHED">Xuất bản</MenuItem>
          </TextField>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isFreePreview}
                onChange={(e) => setFormData({ ...formData, isFreePreview: e.target.checked })}
              />
            }
            label="Cho phép xem thử miễn phí"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            Tạo
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
