"use client";

import {
  Typography,
  Stack,
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
  Chip,
} from "@mui/material";
import AdminManagementPage, {
  AdminStatusChip,
} from "@/modules/admin/components/AdminManagementPage";
import {
  AdminEpisodeListItem,
  AdminEpisodePayload,
  AdminMovie,
  adminService,
} from "@/modules/admin/api";
import { useState, useEffect, useRef } from "react";
import { convertToWebPObjectUrl } from "@/utils/convert-to-webp";
import Autocomplete from "@mui/material/Autocomplete";
import { useUploadProgress } from "@/context/upload-progress-context";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Bản nháp" },
  { value: "HIDDEN", label: "Đã ẩn" },
  { value: "PUBLISHED", label: "Đã xuất bản" },
];

const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map((option) => [option.value, option.label])
);

function formatDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export default function AdminEpisodesPage() {
  const uploadProgress = useUploadProgress();

  return (
    <AdminManagementPage<AdminEpisodeListItem>
      permission="movies:manage"
      title="Quản lý tập phim"
      description="Tạo, chỉnh sửa và xóa tập phim cho toàn bộ thư viện. Hỗ trợ upload video và transcode HLS."
      queryKey={["admin", "episodes", "list"]}
      queryFn={adminService.getEpisodes}
      searchPlaceholder="Tìm theo tiêu đề tập, tên phim, slug..."
      getSearchText={(ep) =>
        `${ep.title ?? ""} ${ep.movieTitle ?? ""} ${ep.movieSlug ?? ""} tập ${ep.episodeNumber ?? ""}`
      }
      getStatus={(ep) => ep.status ?? "UNKNOWN"}
      extraFilters={[
        {
          key: "freePreview",
          label: "Truy cập",
          options: [
            { label: "Miễn phí", value: "true" },
            { label: "Premium", value: "false" },
          ],
          getValue: (ep) => String(Boolean(ep.isFreePreview)),
        },
      ]}
      stats={[
        { label: "Tổng tập", getValue: (items) => items.length, tone: "cyan" },
        {
          label: "Đã xuất bản",
          getValue: (items) => items.filter((i) => i.status === "PUBLISHED").length,
          tone: "emerald",
        },
        {
          label: "Cần xử lý",
          getValue: (items) => items.filter((i) => i.status !== "PUBLISHED").length,
          tone: "amber",
        },
      ]}
      columns={[
        {
          key: "episode",
          label: "Tập",
          render: (ep) => (
            <Stack direction="row" spacing={1.5} alignItems="center">
              {ep.thumbnailUrl ? (
                <Box
                  component="img"
                  src={ep.thumbnailUrl}
                  alt={ep.title}
                  sx={{
                    width: 96,
                    aspectRatio: "16/9",
                    objectFit: "cover",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 96,
                    aspectRatio: "16/9",
                    bgcolor: "action.hover",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Typography variant="caption" color="text.disabled">
                    Chưa có ảnh
                  </Typography>
                </Box>
              )}
              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={800} noWrap>
                  {ep.title}
                </Typography>
                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                  <Chip
                    size="small"
                    label={`Tập ${ep.episodeNumber ?? "—"}`}
                    sx={{ height: 20, fontSize: 11, fontWeight: 800 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatDuration(ep.durationSeconds)}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          ),
        },
        {
          key: "movie",
          label: "Thuộc phim",
          render: (ep) => (
            <Stack spacing={0.25}>
              <Typography variant="body2" fontWeight={700} noWrap>
                {ep.movieTitle ?? `#${ep.movieId ?? "—"}`}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {[
                  ep.movieReleaseYear,
                  ep.movieCountry,
                  ep.movieType === "SERIES"
                    ? "Phim bộ"
                    : ep.movieType === "SINGLE"
                      ? "Phim lẻ"
                      : ep.movieType,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Typography>
            </Stack>
          ),
        },
        {
          key: "qualities",
          label: "Chất lượng",
          render: (ep) => {
            const qs = ep.availableQualities ?? [];
            if (qs.length === 0)
              return (
                <Typography variant="caption" color="text.disabled">
                  —
                </Typography>
              );
            return (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {qs.map((q) => (
                  <Chip
                    key={q}
                    size="small"
                    label={q}
                    sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                  />
                ))}
              </Stack>
            );
          },
        },
        {
          key: "access",
          label: "Truy cập",
          render: (ep) => (
            <AdminStatusChip
              label={ep.isFreePreview ? "Miễn phí" : "Premium"}
              tone={ep.isFreePreview ? "emerald" : "violet"}
            />
          ),
        },
        {
          key: "status",
          label: "Trạng thái",
          render: (ep) => (
            <AdminStatusChip
              label={STATUS_LABELS[ep.status ?? "DRAFT"] ?? "Bản nháp"}
              tone={ep.status === "PUBLISHED" ? "emerald" : "amber"}
            />
          ),
        },
      ]}
      quickActions={[
        {
          id: "view",
          label: "Mở phim",
          tone: "cyan",
          href: (ep) => (ep.movieId ? `/admin/movies/${ep.movieId}` : "#"),
          disabled: (ep) => !ep.movieId,
        },
        {
          id: "retranscode",
          label: "Render lại",
          tone: "amber",
          run: async (ep) => {
            await adminService.retranscodeEpisode(ep.id);
          },
        },
      ]}
      createLabel="Thêm tập phim"
      onCreate={async (payload) => {
        const p = payload as CreatePayload;
        const { movieId, _videoFile, _thumbnailPreview, ...episodeData } = p;
        const created = await adminService.createEpisode(Number(movieId), {
          ...episodeData,
          videoUrl: "pending",
          thumbnailUrl: _thumbnailPreview || undefined,
        } as AdminEpisodePayload);
        if (_videoFile) {
          const taskId = uploadProgress.startTask({
            label: `Tập ${episodeData.episodeNumber}: ${episodeData.title}`,
            fileName: _videoFile.name,
            totalBytes: _videoFile.size,
          });
          try {
            await adminService.uploadEpisodeSourceSmart(
              created.id,
              _videoFile,
              (s) => {
                uploadProgress.updateTask(taskId, {
                  percent: s.percent,
                  phase: s.phase,
                  bytesUploaded: s.bytesUploaded,
                  totalBytes: s.totalBytes,
                  speedKBps: s.speedKBps,
                  etaSeconds: s.etaSeconds,
                  message: s.message,
                });
              },
              API_BASE
            );
            uploadProgress.finishTask(
              taskId,
              true,
              "Upload xong, server đang transcode 720p/1080p/4K..."
            );
          } catch (err) {
            uploadProgress.finishTask(
              taskId,
              false,
              err instanceof Error ? err.message : String(err)
            );
            throw err;
          }
        }
        return created;
      }}
      onEdit={async (item, payload) => {
        const p = payload as EditPayload;
        const { movieId: newMovieIdStr, _videoFile, _thumbnailPreview, ...episodeData } = p;
        const currentMovieId = Number(item.movieId);
        const targetMovieId = newMovieIdStr ? Number(newMovieIdStr) : currentMovieId;
        const updated = await adminService.updateEpisode(currentMovieId, item.id, {
          ...episodeData,
          movieId: targetMovieId,
          // Giữ nguyên videoUrl cũ trong DB (BE update không đổi video_url, chỉ update qua upload).
          thumbnailUrl: _thumbnailPreview || item.thumbnailUrl || undefined,
        } as AdminEpisodePayload);
        if (_videoFile) {
          const taskId = uploadProgress.startTask({
            label: `Re-upload tập ${episodeData.episodeNumber}: ${episodeData.title}`,
            fileName: _videoFile.name,
            totalBytes: _videoFile.size,
          });
          try {
            await adminService.uploadEpisodeSourceSmart(
              item.id,
              _videoFile,
              (s) => {
                uploadProgress.updateTask(taskId, {
                  percent: s.percent,
                  phase: s.phase,
                  bytesUploaded: s.bytesUploaded,
                  totalBytes: s.totalBytes,
                  speedKBps: s.speedKBps,
                  etaSeconds: s.etaSeconds,
                  message: s.message,
                });
              },
              API_BASE
            );
            uploadProgress.finishTask(
              taskId,
              true,
              "Upload xong, server đang transcode 720p/1080p/4K..."
            );
          } catch (err) {
            uploadProgress.finishTask(
              taskId,
              false,
              err instanceof Error ? err.message : String(err)
            );
            throw err;
          }
        }
        return updated;
      }}
      onDelete={async (item) => {
        if (!item.movieId) {
          throw new Error("Tập phim này không gắn với phim nào, không thể xóa.");
        }
        await adminService.deleteEpisode(Number(item.movieId), item.id);
      }}
      renderForm={({ mode, item, open, submitting, error, onClose, onSubmit }) => (
        <EpisodeFormDialog
          mode={mode}
          item={item}
          open={open}
          submitting={submitting}
          error={error}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    />
  );
}

type CreatePayload = {
  movieId: string;
  title: string;
  episodeNumber: number;
  durationSeconds: number;
  isFreePreview: boolean;
  status: string;
  _videoFile: File | null;
  _thumbnailPreview?: string;
};

type EditPayload = {
  movieId: string;
  title: string;
  episodeNumber: number;
  durationSeconds: number;
  isFreePreview: boolean;
  status: string;
  _videoFile: File | null;
  _thumbnailPreview?: string;
};

function EpisodeFormDialog({
  mode,
  item,
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: {
  mode: "create" | "edit";
  item: AdminEpisodeListItem | null;
  open: boolean;
  submitting: boolean;
  error: React.ReactNode;
  onClose: () => void;
  onSubmit: (payload: unknown) => void;
}) {
  const isEdit = mode === "edit";

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
    if (!open) return;
    setVideoFile(null);
    // Luôn preload danh sách phim để người dùng có thể đổi phim cha cả khi edit.
    adminService.getMovies().then(setMovies).catch(console.error);

    if (isEdit && item) {
      setFormData({
        movieId: String(item.movieId ?? ""),
        title: item.title ?? "",
        episodeNumber: item.episodeNumber ?? 1,
        durationSeconds: item.durationSeconds ?? 0,
        isFreePreview: Boolean(item.isFreePreview),
        status: item.status || "DRAFT",
      });
      setThumbnailPreview(item.thumbnailUrl ?? "");
    } else {
      setFormData({
        movieId: "",
        title: "",
        episodeNumber: 1,
        durationSeconds: 0,
        isFreePreview: false,
        status: "DRAFT",
      });
      setThumbnailPreview("");
    }
  }, [open, isEdit, item]);

  const handleMovieSelect = async (movie: AdminMovie | null) => {
    if (!movie) {
      setFormData((f) => ({ ...f, movieId: "" }));
      return;
    }
    setFormData((f) => ({ ...f, movieId: String(movie.id) }));
    // Khi tạo mới và user chọn phim, tự set số tập = (số tập hiện có) + 1
    if (!isEdit) {
      try {
        const detail = await adminService.getMovieDetail(movie.id);
        const nextEp = (detail.episodes?.length ?? 0) + 1;
        setFormData((f) => ({ ...f, movieId: String(movie.id), episodeNumber: nextEp }));
      } catch {
        // ignore, giữ episodeNumber cũ
      }
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

  const canSubmit = isEdit
    ? Boolean(formData.title) && Boolean(formData.movieId) && !submitting
    : Boolean(formData.movieId) && Boolean(formData.title) && Boolean(videoFile) && !submitting;

  return (
    <Dialog open={open} onClose={!submitting ? onClose : undefined} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 900 }}>
          {isEdit ? `Chỉnh sửa tập #${item?.episodeNumber ?? ""}` : "Thêm tập phim mới"}
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "20px", overflow: "visible" }}
        >
          {error && <Alert severity="error">{error as React.ReactNode}</Alert>}

          <Autocomplete
            options={movies}
            getOptionLabel={(m) => `${m.title} (${m.movieType})`}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            value={movies.find((m) => String(m.id) === formData.movieId) ?? null}
            onChange={(_e, val) => handleMovieSelect(val)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={isEdit ? "Phim cha (có thể đổi sang phim khác)" : "Chọn phim"}
                required
                size="small"
                InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
                placeholder={isEdit ? "Chọn phim mới để gán lại..." : "Gõ tên phim để tìm..."}
                helperText={
                  isEdit && item && String(item.movieId) !== formData.movieId
                    ? `Tập sẽ được chuyển từ “${item.movieTitle}” sang phim đã chọn.`
                    : undefined
                }
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
              {isEdit ? "Thay video (tuỳ chọn)" : "File Video *"}
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
                {videoFile
                  ? videoFile.name
                  : isEdit
                    ? "Nhấn để upload video mới (không bắt buộc)"
                    : "Nhấn để chọn file video (MP4, MKV, ...)"}
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
            {isEdit && item?.videoUrl && !videoFile && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                Hiện tại: {item.videoUrl}
              </Typography>
            )}
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
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
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
          <Button type="submit" variant="contained" disabled={!canSubmit}>
            {submitting
              ? isEdit
                ? "Đang cập nhật..."
                : "Đang tạo & upload..."
              : isEdit
                ? "Lưu thay đổi"
                : "Tạo & Upload"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
