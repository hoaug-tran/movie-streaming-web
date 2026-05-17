"use client";

import {
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import AdminManagementPage, {
  AdminStatusChip,
} from "@/modules/admin/components/AdminManagementPage";
import { AdminMovie, AdminEpisodePayload, adminService } from "@/modules/admin/api";
import { useState, useEffect, useRef } from "react";
import { convertToWebPObjectUrl } from "@/utils/convert-to-webp";
import Autocomplete from "@mui/material/Autocomplete";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

export default function AdminEpisodesPage() {
  return (
    <AdminManagementPage<AdminMovie>
      permission="movies:manage"
      title="Quản lý tập phim"
      description="Tạo tập phim và upload video ngay trong một bước."
      queryKey={["admin", "episodes", "movies"]}
      queryFn={adminService.getMovies}
      searchPlaceholder="Tìm phim, slug, trạng thái..."
      getSearchText={(movie) => `${movie.title} ${movie.slug ?? ""} ${movie.movieStatus ?? ""}`}
      stats={[
        { label: "Đầu phim", getValue: (items) => items.length, tone: "cyan" },
        {
          label: "Đã publish",
          getValue: (items) => items.filter((i) => i.movieStatus === "PUBLISHED").length,
          tone: "emerald",
        },
        {
          label: "Cần xử lý",
          getValue: (items) => items.filter((i) => i.movieStatus !== "PUBLISHED").length,
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
          render: (movie) => <AdminStatusChip label={movie.movieType || "SINGLE"} tone="violet" />,
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
          label: "Chi tiết",
          tone: "cyan",
          href: (movie) => `/admin/movies/${movie.id}`,
        },
      ]}
      createLabel="Thêm tập phim"
      onCreate={async (payload: any) => {
        const { movieId, _videoFile, _thumbnailPreview, ...episodeData } = payload;
        const created = await adminService.createEpisode(Number(movieId), {
          ...episodeData,
          videoUrl: "pending",
          thumbnailUrl: _thumbnailPreview || undefined,
        } as AdminEpisodePayload);
        if (_videoFile) {
          await new Promise<void>((resolve, reject) => {
            const fd = new FormData();
            fd.append("file", _videoFile);
            const xhr = new XMLHttpRequest();
            xhr.open("POST", `${API_BASE}/admin/media/episodes/${created.id}/source`);
            const token =
              typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
            if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error("Upload failed")));
            xhr.onerror = () => reject(new Error("Upload error"));
            xhr.send(fd);
          });
        }
        return created;
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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      adminService.getMovies().then(setMovies).catch(console.error);
      setFormData({
        movieId: "",
        title: "",
        episodeNumber: 1,
        durationSeconds: 0,
        isFreePreview: false,
        status: "DRAFT",
      });
      setVideoFile(null);
      setThumbnailPreview("");
    }
  }, [open]);

  const handleMovieSelect = async (movie: AdminMovie | null) => {
    if (!movie) {
      setFormData((f) => ({ ...f, movieId: "", episodeNumber: 1 }));
      return;
    }
    setFormData((f) => ({ ...f, movieId: String(movie.id) }));
    try {
      const detail = await adminService.getMovieDetail(movie.id);
      const nextEp = (detail.episodes?.length ?? 0) + 1;
      setFormData((f) => ({ ...f, movieId: String(movie.id), episodeNumber: nextEp }));
    } catch {
      setFormData((f) => ({ ...f, movieId: String(movie.id) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      episodeNumber: Number(formData.episodeNumber),
      durationSeconds: Number(formData.durationSeconds),
      _videoFile: videoFile,
      _thumbnailPreview: thumbnailPreview || undefined,
    });
  };

  return (
    <Dialog open={open} onClose={!submitting ? onClose : undefined} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 900 }}>Thêm tập phim mới</DialogTitle>
        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "20px", overflow: "visible" }}
        >
          {error && <Alert severity="error">{error}</Alert>}

          <Autocomplete
            options={movies}
            getOptionLabel={(m) => `${m.title} (${m.movieType})`}
            onChange={(_e, val) => handleMovieSelect(val)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Chọn phim"
                required
                size="small"
                InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
                placeholder="Gõ tên phim để tìm..."
              />
            )}
            fullWidth
            size="small"
          />

          <TextField
            label="Tiêu đề tập"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              type="number"
              label="Số tập"
              required
              value={formData.episodeNumber}
              onChange={(e) => setFormData({ ...formData, episodeNumber: Number(e.target.value) })}
              size="small"
              sx={{ flex: 1 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="number"
              label="Thời lượng (giây)"
              required
              value={formData.durationSeconds}
              onChange={(e) =>
                setFormData({ ...formData, durationSeconds: Number(e.target.value) })
              }
              size="small"
              sx={{ flex: 1 }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{ mb: 0.5, display: "block" }}
            >
              File Video *
            </Typography>
            <Box
              onClick={() => !submitting && videoInputRef.current?.click()}
              sx={{
                border: "2px dashed",
                borderColor: videoFile ? "primary.main" : "divider",
                borderRadius: 1.5,
                p: 2,
                textAlign: "center",
                cursor: submitting ? "default" : "pointer",
                "&:hover": { borderColor: submitting ? undefined : "primary.main" },
                transition: "border-color 0.2s",
              }}
            >
              <Typography variant="body2" color={videoFile ? "text.primary" : "text.disabled"}>
                {videoFile ? videoFile.name : "Nhấn để chọn file video (MP4, MKV, ...)"}
              </Typography>
              {videoFile && (
                <Typography variant="caption" color="text.secondary">
                  {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                </Typography>
              )}
            </Box>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/x-matroska,video/avi,video/quicktime,video/webm,.mp4,.mkv,.avi,.mov,.webm"
              hidden
              onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            />
          </Box>

          <Box>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{ mb: 0.5, display: "block" }}
            >
              Thumbnail
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              {thumbnailPreview && (
                <Box
                  component="img"
                  src={thumbnailPreview}
                  alt="thumb"
                  sx={{
                    width: 80,
                    aspectRatio: "16/9",
                    objectFit: "cover",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                />
              )}
              <Button
                size="small"
                variant="outlined"
                onClick={() => thumbInputRef.current?.click()}
              >
                {thumbnailPreview ? "Thay ảnh" : "Chọn ảnh thumbnail"}
              </Button>
              {thumbnailPreview && (
                <Button size="small" color="error" onClick={() => setThumbnailPreview("")}>
                  Xóa
                </Button>
              )}
            </Box>
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const { previewUrl } = await convertToWebPObjectUrl(f);
                setThumbnailPreview(previewUrl);
              }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel shrink>Trạng thái</InputLabel>
              <Select
                notched
                label="Trạng thái"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="DRAFT">Draft</MenuItem>
                <MenuItem value="HIDDEN">Hidden</MenuItem>
                <MenuItem value="PUBLISHED">Published</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel shrink>Xem miễn phí</InputLabel>
              <Select
                notched
                label="Xem miễn phí"
                value={formData.isFreePreview ? "true" : "false"}
                onChange={(e) =>
                  setFormData({ ...formData, isFreePreview: e.target.value === "true" })
                }
              >
                <MenuItem value="false">Không</MenuItem>
                <MenuItem value="true">Có</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!formData.movieId || !formData.title || !videoFile || submitting}
          >
            {submitting ? "Đang tạo & upload..." : "Tạo & Upload"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
