"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Alert,
  Stack,
  Paper,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Snackbar,
} from "@mui/material";
import type { AlertColor } from "@mui/material";
import {
  ArrowBack,
  Add,
  Delete,
  Person,
  Category,
  LocalOffer,
  Business,
  VideoLibrary,
  Edit,
  Refresh,
} from "@mui/icons-material";
import {
  adminService,
  AdminMovieDetail,
  AdminMovieType,
  AdminMovieStatus,
  AdminCategory,
  AdminTag,
  AdminTagPayload,
  AdminPerson,
  AdminPersonPayload,
  AdminStudio,
  AdminStudioPayload,
  AdminMoviePersonPayload,
  AdminMovieStudioPayload,
  AdminEpisodePayload,
  AdminMoviePayload,
  TranscodeProgress,
} from "@/modules/admin/api";
import AvatarCropUpload from "@/components/Common/AvatarCropUpload";
import { useState, useRef, useEffect, useCallback } from "react";
import { convertToWebPObjectUrl } from "@/utils/convert-to-webp";
import { useUploadProgress } from "@/context/upload-progress-context";
import { getAdminErrorMessage } from "@/modules/admin/utils/admin-errors";
import LinearProgress from "@mui/material/LinearProgress";
import CloudUpload from "@mui/icons-material/CloudUpload";
import CheckCircle from "@mui/icons-material/CheckCircle";
import HourglassTop from "@mui/icons-material/HourglassTop";

type UploadStatus = {
  percent: number;
  phase: "uploading" | "finalizing" | "done";
  bytesUploaded: number;
  totalBytes: number;
  currentChunk: number;
  totalChunks: number;
  speedKBps: number;
  etaSeconds: number | null;
  message: string;
};

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function formatEta(s: number | null) {
  if (s == null || !isFinite(s)) return "--";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

function UploadStatusBar({ status }: { status: UploadStatus | null }) {
  if (!status) {
    return (
      <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
        <Typography variant="caption" color="text.secondary">
          Đang chuẩn bị upload...
        </Typography>
        <LinearProgress sx={{ mt: 0.5, borderRadius: 1, height: 6 }} />
      </Box>
    );
  }
  const isDone = status.phase === "done";
  const isFinalizing = status.phase === "finalizing";
  const phaseColor = isDone ? "success.main" : isFinalizing ? "warning.main" : "primary.main";
  const phaseIcon = isDone ? (
    <CheckCircle sx={{ fontSize: 18, color: "success.main" }} />
  ) : isFinalizing ? (
    <HourglassTop sx={{ fontSize: 18, color: "warning.main" }} />
  ) : (
    <CloudUpload sx={{ fontSize: 18, color: "primary.main" }} />
  );
  const phaseLabel = isDone
    ? "Hoàn tất"
    : isFinalizing
      ? "Đang ghép file"
      : `Upload ${status.percent}%`;
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        bgcolor: "action.hover",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
        {phaseIcon}
        <Typography variant="body2" fontWeight={700} color={phaseColor}>
          {phaseLabel}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Typography variant="caption" color="text.secondary">
          {formatBytes(status.bytesUploaded)} / {formatBytes(status.totalBytes)}
        </Typography>
      </Box>
      <LinearProgress
        variant={isFinalizing ? "indeterminate" : "determinate"}
        value={status.percent}
        sx={{
          height: 8,
          borderRadius: 1,
          bgcolor: "divider",
          "& .MuiLinearProgress-bar": {
            borderRadius: 1,
            background: isDone
              ? "linear-gradient(90deg, #10b981, #34d399)"
              : isFinalizing
                ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                : "linear-gradient(90deg, #6366f1, #8b5cf6)",
          },
        }}
      />
      <Box sx={{ mt: 0.75, display: "flex", flexWrap: "wrap", gap: 1.25 }}>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: "100%" }}>
          {status.message}
        </Typography>
        {status.totalChunks > 1 && (
          <Chip
            size="small"
            label={`Chunk ${status.currentChunk}/${status.totalChunks}`}
            sx={{ height: 20, fontSize: 11 }}
          />
        )}
        {status.phase === "uploading" && status.speedKBps > 0 && (
          <Chip
            size="small"
            label={`${(status.speedKBps / 1024).toFixed(2)} MB/s`}
            sx={{ height: 20, fontSize: 11 }}
          />
        )}
        {status.phase === "uploading" && status.etaSeconds != null && (
          <Chip
            size="small"
            label={`Còn ~${formatEta(status.etaSeconds)}`}
            sx={{ height: 20, fontSize: 11 }}
          />
        )}
      </Box>
    </Box>
  );
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

const PERSON_ROLES = [
  "ACTOR",
  "ACTRESS",
  "DIRECTOR",
  "WRITER",
  "PRODUCER",
  "VOICE_ACTOR",
  "CAMEO",
  "COMPOSER",
  "CINEMATOGRAPHER",
  "EDITOR",
];
const STUDIO_ROLES = ["PRODUCTION", "DISTRIBUTION", "NETWORK", "ANIMATION_STUDIO"];

const PERSON_ROLE_LABELS: Record<string, string> = {
  ACTOR: "Diễn viên nam",
  ACTRESS: "Diễn viên nữ",
  DIRECTOR: "Đạo diễn",
  WRITER: "Biên kịch",
  PRODUCER: "Nhà sản xuất",
  VOICE_ACTOR: "Lồng tiếng",
  CAMEO: "Khách mời",
  COMPOSER: "Nhạc sĩ",
  CINEMATOGRAPHER: "Quay phim",
  EDITOR: "Dựng phim",
};

const STUDIO_ROLE_LABELS: Record<string, string> = {
  PRODUCTION: "Sản xuất",
  DISTRIBUTION: "Phân phối",
  NETWORK: "Kênh phát hành",
  ANIMATION_STUDIO: "Xưởng hoạt hình",
};

const EPISODE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Bản nháp",
  HIDDEN: "Đã ẩn",
  PUBLISHED: "Đã xuất bản",
};

export default function AdminMovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);
  const router = useRouter();
  const qc = useQueryClient();
  const uploadProgress = useUploadProgress();

  const { data: movie, isLoading } = useQuery<AdminMovieDetail>({
    queryKey: ["admin", "movie", movieId],
    queryFn: () => adminService.getMovieDetail(movieId),
  });

  const { data: allCategories = [] } = useQuery<AdminCategory[]>({
    queryKey: ["admin", "categories"],
    queryFn: () => adminService.getCategories(),
  });

  const { data: allTags = [] } = useQuery<AdminTag[]>({
    queryKey: ["admin", "tags"],
    queryFn: () => adminService.getTags(),
  });

  const { data: allPersons = [] } = useQuery<AdminPerson[]>({
    queryKey: ["admin", "persons"],
    queryFn: () => adminService.getPersons(),
  });

  const { data: allStudios = [] } = useQuery<AdminStudio[]>({
    queryKey: ["admin", "studios"],
    queryFn: () => adminService.getStudios(),
  });

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["admin", "movie", movieId], refetchType: "active" });

  const addCat = useMutation({
    mutationFn: (cid: number) => adminService.addMovieCategory(movieId, cid),
    onSuccess: () => {
      invalidate();
      setSnackbar({ open: true, severity: "success", message: "Đã gắn thể loại cho phim." });
    },
    onError: (err: unknown) =>
      setSnackbar({
        open: true,
        severity: "error",
        message: getAdminErrorMessage(err, "Không thể gắn thể loại."),
      }),
  });
  const removeCat = useMutation({
    mutationFn: (cid: number) => adminService.removeMovieCategory(movieId, cid),
    onSuccess: () => {
      invalidate();
      setSnackbar({ open: true, severity: "success", message: "Đã gỡ thể loại khỏi phim." });
    },
    onError: (err: unknown) => {
      const message = getAdminErrorMessage(err, "Không thể gỡ thể loại.");
      setDialogError(message);
      setSnackbar({ open: true, severity: "error", message });
    },
  });
  const addTag = useMutation({
    mutationFn: (tid: number) => adminService.addMovieTag(movieId, tid),
    onSuccess: () => {
      invalidate();
      setSnackbar({ open: true, severity: "success", message: "Đã gắn tag cho phim." });
    },
    onError: (err: unknown) =>
      setSnackbar({
        open: true,
        severity: "error",
        message: getAdminErrorMessage(err, "Không thể gắn tag."),
      }),
  });
  const removeTag = useMutation({
    mutationFn: (tid: number) => adminService.removeMovieTag(movieId, tid),
    onSuccess: () => {
      invalidate();
      setSnackbar({ open: true, severity: "success", message: "Đã gỡ tag khỏi phim." });
    },
    onError: (err: unknown) => {
      const message = getAdminErrorMessage(err, "Không thể gỡ tag.");
      setDialogError(message);
      setSnackbar({ open: true, severity: "error", message });
    },
  });
  const addPerson = useMutation({
    mutationFn: (p: AdminMoviePersonPayload) => adminService.addMoviePerson(movieId, p),
    onSuccess: () => {
      invalidate();
      setSnackbar({ open: true, severity: "success", message: "Đã gắn nhân sự cho phim." });
    },
    onError: (err: unknown) =>
      setSnackbar({
        open: true,
        severity: "error",
        message: getAdminErrorMessage(err, "Không thể gắn diễn viên / đạo diễn."),
      }),
  });
  const removePerson = useMutation({
    mutationFn: (mpid: number) => adminService.removeMoviePerson(movieId, mpid),
    onSuccess: () => {
      invalidate();
      setSnackbar({ open: true, severity: "success", message: "Đã xóa nhân sự khỏi phim." });
    },
    onError: (err: unknown) => {
      const message = getAdminErrorMessage(err, "Không thể xóa gắn kết diễn viên / đạo diễn.");
      setDialogError(message);
      setSnackbar({ open: true, severity: "error", message });
    },
  });
  const updatePerson = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<AdminMoviePersonPayload> }) =>
      adminService.updateMoviePerson(id, payload),
    onSuccess: () => {
      invalidate();
      setEditPersonDialog(false);
      setSnackbar({ open: true, severity: "success", message: "Đã cập nhật vai trò." });
    },
    onError: (err: unknown) => {
      const message = getAdminErrorMessage(err, "Không thể cập nhật vai trò.");
      setDialogError(message);
      setSnackbar({ open: true, severity: "error", message });
    },
  });
  const addStudio = useMutation({
    mutationFn: (p: AdminMovieStudioPayload) => adminService.addMovieStudio(movieId, p),
    onSuccess: () => {
      invalidate();
      setSnackbar({ open: true, severity: "success", message: "Đã gắn studio / nhà sản xuất." });
    },
    onError: (err: unknown) =>
      setSnackbar({
        open: true,
        severity: "error",
        message: getAdminErrorMessage(err, "Không thể gắn studio / nhà sản xuất."),
      }),
  });
  const removeStudio = useMutation({
    mutationFn: (msid: number) => adminService.removeMovieStudio(movieId, msid),
    onSuccess: () => {
      invalidate();
      setSnackbar({ open: true, severity: "success", message: "Đã xóa studio / nhà sản xuất." });
    },
    onError: (err: unknown) => {
      const message = getAdminErrorMessage(err, "Không thể xóa studio / nhà sản xuất.");
      setDialogError(message);
      setSnackbar({ open: true, severity: "error", message });
    },
  });
  const updateStudio = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<AdminMovieStudioPayload> }) =>
      adminService.updateMovieStudio(id, payload),
    onSuccess: () => {
      invalidate();
      setEditStudioDialog(false);
      setSnackbar({ open: true, severity: "success", message: "Đã cập nhật vai trò studio." });
    },
    onError: (err: unknown) => {
      const message = getAdminErrorMessage(err, "Không thể cập nhật studio.");
      setDialogError(message);
      setSnackbar({ open: true, severity: "error", message });
    },
  });
  const createCategory = useMutation({
    mutationFn: (p: { name: string; slug: string }) => adminService.createCategory(p),
    onSuccess: (cat) => {
      addCat.mutate(cat.id);
      setNewCatName("");
      setSnackbar({ open: true, severity: "success", message: "Đã tạo thể loại mới." });
    },
    onError: (err: unknown) =>
      setSnackbar({
        open: true,
        severity: "error",
        message: getAdminErrorMessage(err, "Không thể tạo thể loại mới."),
      }),
  });
  const addEpisode = useMutation({
    mutationFn: (p: AdminEpisodePayload) => adminService.createEpisode(movieId, p),
    onSuccess: () => {
      invalidate();
      setSnackbar({ open: true, severity: "success", message: "Đã tạo tập phim." });
    },
    onError: (err: unknown) => {
      const message = getAdminErrorMessage(err, "Không thể tạo tập phim.");
      setDialogError(message);
      setSnackbar({ open: true, severity: "error", message });
    },
  });
  const updateEpisodeMutation = useMutation({
    mutationFn: ({ episodeId, p }: { episodeId: number; p: AdminEpisodePayload }) =>
      adminService.updateEpisode(movieId, episodeId, p),
    onSuccess: () => {
      invalidate();
      setEditEpisodeDialog(false);
      setSnackbar({ open: true, severity: "success", message: "Đã cập nhật tập phim." });
    },
    onError: (err: unknown) => {
      const message = getAdminErrorMessage(err, "Không thể cập nhật tập phim.");
      setDialogError(message);
      setSnackbar({ open: true, severity: "error", message });
    },
  });
  const deleteEpisode = useMutation({
    mutationFn: (episodeId: number) => adminService.deleteEpisode(movieId, episodeId),
    onSuccess: () => {
      invalidate();
      setSnackbar({ open: true, severity: "success", message: "Đã xóa tập phim." });
    },
    onError: (err: unknown) => {
      const message = getAdminErrorMessage(err, "Không thể xóa tập phim.");
      setDialogError(message);
      setSnackbar({ open: true, severity: "error", message });
    },
  });
  const retranscodeEpisode = useMutation({
    mutationFn: (episodeId: number) => adminService.retranscodeEpisode(episodeId),
    onSuccess: (_data, episodeId) => {
      setTranscodeJobs((prev) => ({
        ...prev,
        [episodeId]: {
          episodeId,
          status: "PENDING",
          targetQualities: ["720p", "1080p", "4K"],
          completedQualities: [],
          failedQualities: [],
          skippedQualities: [],
          percent: 0,
        },
      }));
      setSnackbar({
        open: true,
        severity: "info",
        message: `Đã khởi chạy render lại HLS cho tập #${episodeId}. Theo dõi tiến trình bên dưới.`,
      });
      invalidate();
    },
    onError: (err: unknown) => {
      setSnackbar({
        open: true,
        severity: "error",
        message: `Render lại thất bại: ${err instanceof Error ? err.message : String(err)}`,
      });
    },
  });
  const retranscodeMovie = useMutation({
    mutationFn: () => adminService.retranscodeMovie(movieId),
    onSuccess: (results) => {
      const seed: Record<number, TranscodeProgress> = {};
      results.forEach((r) => {
        const epId = Number(r.id ?? 0);
        if (!epId) return;
        seed[epId] = {
          episodeId: epId,
          status: "PENDING",
          targetQualities: ["720p", "1080p", "4K"],
          completedQualities: [],
          failedQualities: [],
          skippedQualities: [],
          percent: 0,
        };
      });
      (movie?.episodes ?? []).forEach((ep) => {
        if (!seed[ep.id]) {
          seed[ep.id] = {
            episodeId: ep.id,
            status: "PENDING",
            targetQualities: ["720p", "1080p", "4K"],
            completedQualities: [],
            failedQualities: [],
            skippedQualities: [],
            percent: 0,
          };
        }
      });
      setTranscodeJobs((prev) => ({ ...prev, ...seed }));
      setSnackbar({
        open: true,
        severity: "info",
        message: `Đã khởi chạy render lại ${Object.keys(seed).length} tập.`,
      });
      invalidate();
    },
    onError: (err: unknown) => {
      setSnackbar({
        open: true,
        severity: "error",
        message: `Render lại tất cả thất bại: ${err instanceof Error ? err.message : String(err)}`,
      });
    },
  });
  const createTag = useMutation({
    mutationFn: (p: AdminTagPayload) => adminService.createTag(p),
    onSuccess: (tag) => {
      addTag.mutate(tag.id);
      setNewTagName("");
      setSnackbar({ open: true, severity: "success", message: "Đã tạo tag mới." });
    },
    onError: (err: unknown) =>
      setSnackbar({
        open: true,
        severity: "error",
        message: getAdminErrorMessage(err, "Không thể tạo tag mới."),
      }),
  });
  const createPerson = useMutation({
    mutationFn: (p: AdminPersonPayload) => adminService.createPerson(p),
    onSuccess: (person) => {
      setPersonForm((prev) => ({ ...prev, personId: person.id }));
      qc.invalidateQueries({ queryKey: ["admin", "persons"] });
      setSnackbar({ open: true, severity: "success", message: "Đã tạo nhân sự mới." });
    },
    onError: (err: unknown) =>
      setSnackbar({
        open: true,
        severity: "error",
        message: getAdminErrorMessage(err, "Không thể tạo người mới."),
      }),
  });
  const createStudio = useMutation({
    mutationFn: (p: AdminStudioPayload) => adminService.createStudio(p),
    onSuccess: (studio) => {
      setStudioForm((prev) => ({ ...prev, studioId: studio.id }));
      qc.invalidateQueries({ queryKey: ["admin", "studios"] });
      setSnackbar({ open: true, severity: "success", message: "Đã tạo studio mới." });
    },
    onError: (err: unknown) =>
      setSnackbar({
        open: true,
        severity: "error",
        message: getAdminErrorMessage(err, "Không thể tạo studio mới."),
      }),
  });

  const [addCatId, setAddCatId] = useState<number | "">("");
  const [transcodeJobs, setTranscodeJobs] = useState<Record<number, TranscodeProgress>>({});
  const [confirmRetranscodeEpisodeId, setConfirmRetranscodeEpisodeId] = useState<number | null>(
    null
  );
  const [confirmRetranscodeAll, setConfirmRetranscodeAll] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    severity: AlertColor;
    message: string;
  }>({ open: false, severity: "info", message: "" });
  const [dialogError, setDialogError] = useState<string | null>(null);

  useEffect(() => {
    const ids = Object.keys(transcodeJobs).map(Number);
    if (ids.length === 0) return;
    const allDone = ids.every((id) => {
      const j = transcodeJobs[id];
      return j && (j.status === "DONE" || j.status === "FAILED");
    });
    if (allDone) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const data = await adminService.transcodeProgressBatch(ids);
        if (cancelled) return;
        setTranscodeJobs((prev) => {
          const next = { ...prev };
          ids.forEach((id) => {
            const fresh = (data as Record<string, TranscodeProgress>)[String(id)];
            if (fresh) next[id] = fresh;
          });
          return next;
        });
        const finishedSomething = Object.values(data as Record<string, TranscodeProgress>).some(
          (p) => p.status === "DONE" || p.status === "FAILED"
        );
        if (finishedSomething) invalidate();
      } catch {
        // best-effort polling, ignore network blips
      }
    };
    const interval = setInterval(tick, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    
  }, [transcodeJobs]);
  const [addTagId, setAddTagId] = useState<number | "">("");
  const [newTagName, setNewTagName] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [personDialog, setPersonDialog] = useState(false);
  const [studioDialog, setStudioDialog] = useState(false);
  const [editPersonDialog, setEditPersonDialog] = useState(false);
  const [editPersonId, setEditPersonId] = useState<number | null>(null);
  const [editPersonForm, setEditPersonForm] = useState<{
    role: string;
    characterName: string;
    displayOrder: number;
  }>({ role: "ACTOR", characterName: "", displayOrder: 1 });
  const [editStudioDialog, setEditStudioDialog] = useState(false);
  const [editStudioId, setEditStudioId] = useState<number | null>(null);
  const [editStudioRole, setEditStudioRole] = useState("PRODUCTION");
  const [episodeDialog, setEpisodeDialog] = useState(false);
  const [editEpisodeDialog, setEditEpisodeDialog] = useState(false);
  const [editEpisodeId, setEditEpisodeId] = useState<number | null>(null);
  const [editEpisodeForm, setEditEpisodeForm] = useState<AdminEpisodePayload>({
    title: "",
    episodeNumber: 1,
    durationSeconds: 0,
    isFreePreview: false,
    status: "DRAFT",
    videoUrl: "",
    thumbnailUrl: "",
  });
  const [editEpisodeNumberStr, setEditEpisodeNumberStr] = useState("1");
  const [editEpisodeDurationStr, setEditEpisodeDurationStr] = useState("0");
  const [editEpisodeVideoFile, setEditEpisodeVideoFile] = useState<File | null>(null);
  const [editEpisodeVideoPreviewUrl, setEditEpisodeVideoPreviewUrl] = useState<string>("");
  const [editEpisodeThumbnailPreview, setEditEpisodeThumbnailPreview] = useState<string>("");
  const [editEpisodeUploading, setEditEpisodeUploading] = useState(false);
  const [editEpisodeUploadStatus, setEditEpisodeUploadStatus] = useState<UploadStatus | null>(null);
  const [editEpisodeThumbnailUploading, setEditEpisodeThumbnailUploading] = useState(false);
  const editEpisodeVideoInputRef = useRef<HTMLInputElement>(null);
  const editEpisodeThumbInputRef = useRef<HTMLInputElement>(null);
  const [episodeVideoPreviewUrl, setEpisodeVideoPreviewUrl] = useState<string>("");
  const [episodeNumberStr, setEpisodeNumberStr] = useState("1");
  const [episodeDurationStr, setEpisodeDurationStr] = useState("0");
  const [newPersonForm, setNewPersonForm] = useState<
    AdminPersonPayload & { _avatarFile?: File | null }
  >({
    fullName: "",
    stageName: "",
    biography: "",
    birthDate: "",
    nationality: "",
    avatarUrl: "",
  });
  const [newStudioForm, setNewStudioForm] = useState<
    AdminStudioPayload & { _logoFile?: File | null }
  >({
    name: "",
    slug: "",
    description: "",
    logoUrl: "",
    country: "",
    websiteUrl: "",
  });
  const [editInfoOpen, setEditInfoOpen] = useState(false);
  const [infoForm, setInfoForm] = useState<AdminMoviePayload | null>(null);
  const [imageUploading, setImageUploading] = useState<"poster" | "banner" | null>(null);
  const [movieUploading, setMovieUploading] = useState(false);
  const [movieUploadProgress, setMovieUploadProgress] = useState(0);
  const movieVideoInputRef = useRef<HTMLInputElement>(null);

  const startMovieSourceUpload = useCallback(
    (file: File, onSuccess?: (videoUrl: string) => void) => {
      setMovieUploading(true);
      setMovieUploadProgress(0);
      const taskId = uploadProgress.startTask({
        label: `Video phim single`,
        fileName: file.name,
        totalBytes: file.size,
      });

      adminService
        .uploadMovieSourceSmart(
          movieId,
          file,
          (s) => {
            setMovieUploadProgress(s.percent);
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
        )
        .then((res) => {
          setMovieUploading(false);
          setMovieUploadProgress(0);
          if (res?.videoUrl) onSuccess?.(res.videoUrl);
          if (res?.id) {
            setTranscodeJobs((prev) => ({
              ...prev,
              [res.id]: {
                episodeId: res.id,
                status: "PENDING",
                targetQualities: ["720p", "1080p", "4K"],
                completedQualities: [],
                failedQualities: [],
                skippedQualities: [],
                currentQuality: null,
                percent: 0,
                message: "Upload xong, server đang chuẩn bị transcode...",
              },
            }));
          }
          uploadProgress.finishTask(
            taskId,
            true,
            "Upload xong, server đang transcode 720p/1080p/4K (chạy ngầm vài phút)..."
          );
          setSnackbar({
            open: true,
            severity: "success",
            message: "Upload video phim xong, server đang transcode 720p/1080p/4K.",
          });
          invalidate();
        })
        .catch((err) => {
          console.error("[Upload movie source]", err);
          setMovieUploading(false);
          setMovieUploadProgress(0);
          uploadProgress.finishTask(
            taskId,
            false,
            err instanceof Error ? err.message : String(err)
          );
          setSnackbar({
            open: true,
            severity: "error",
            message: getAdminErrorMessage(err, "Upload video phim thất bại."),
          });
        });
    },
    
    [movieId]
  );

  const startMovieTrailerUpload = useCallback(
    (file: File, onSuccess?: (videoUrl: string) => void) => {
      setMovieUploading(true);
      setMovieUploadProgress(0);
      const taskId = uploadProgress.startTask({
        label: `Trailer phim single`,
        fileName: file.name,
        totalBytes: file.size,
      });

      adminService
        .uploadMovieTrailerSmart(
          movieId,
          file,
          (s) => {
            setMovieUploadProgress(s.percent);
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
        )
        .then((res) => {
          setMovieUploading(false);
          setMovieUploadProgress(0);
          if (res?.videoUrl) onSuccess?.(res.videoUrl);
          uploadProgress.finishTask(taskId, true, "Upload trailer xong!");
          setSnackbar({
            open: true,
            severity: "success",
            message: "Upload trailer phim xong.",
          });
          invalidate();
        })
        .catch((err) => {
          console.error("[Upload movie trailer]", err);
          setMovieUploading(false);
          setMovieUploadProgress(0);
          uploadProgress.finishTask(
            taskId,
            false,
            err instanceof Error ? err.message : String(err)
          );
          setSnackbar({
            open: true,
            severity: "error",
            message: getAdminErrorMessage(err, "Upload trailer phim thất bại."),
          });
        });
    },
    
    [movieId]
  );

  const updateMovie = useMutation({
    mutationFn: (p: AdminMoviePayload) => adminService.updateMovie(movieId, p),
    onSuccess: () => {
      invalidate();
      setEditInfoOpen(false);
      setSnackbar({ open: true, severity: "success", message: "Đã cập nhật thông tin phim." });
    },
    onError: (err: unknown) => {
      setSnackbar({
        open: true,
        severity: "error",
        message: getAdminErrorMessage(err, "Không thể cập nhật thông tin phim."),
      });
    },
  });

  
  
  
  
  

  const [episodeForm, setEpisodeForm] = useState<AdminEpisodePayload>({
    title: "",
    episodeNumber: (movie?.episodes ?? []).length + 1,
    durationSeconds: 0,
    isFreePreview: false,
    status: "DRAFT",
    videoUrl: "",
    thumbnailUrl: "",
  });
  const [episodeVideoFile, setEpisodeVideoFile] = useState<File | null>(null);
  const [episodeThumbnailPreview, setEpisodeThumbnailPreview] = useState<string>("");
  const [episodeUploadStatus, setEpisodeUploadStatus] = useState<UploadStatus | null>(null);
  const [episodeUploading, setEpisodeUploading] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const [personForm, setPersonForm] = useState<AdminMoviePersonPayload>({
    personId: 0,
    role: "ACTOR",
    characterName: "",
    displayOrder: 1,
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["ACTOR"]);
  const [studioForm, setStudioForm] = useState<AdminMovieStudioPayload>({
    studioId: 0,
    role: "PRODUCTION",
  });

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  if (!movie) return <Alert severity="error">Không tìm thấy phim.</Alert>;

  const existingCatIds = new Set((movie.categories ?? []).map((c) => c.id));
  const existingTagIds = new Set((movie.tags ?? []).map((t) => t.id));
  const singleMovieEpisode = movie.movieType === "SINGLE" ? (movie.episodes ?? [])[0] : null;

  const resetEpisodeForm = () => {
    setEpisodeForm({
      title: "",
      episodeNumber: (movie?.episodes ?? []).length + 1,
      durationSeconds: 0,
      isFreePreview: false,
      status: "DRAFT",
      videoUrl: "",
      thumbnailUrl: "",
    });
    setEpisodeVideoFile(null);
    setEpisodeThumbnailPreview("");
    setEpisodeUploadStatus(null);
  };

  const sectionSx = {
    p: 2.5,
    bgcolor: "background.paper",
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <IconButton onClick={() => router.back()} size="small">
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={800}>
            {movie.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {movie.slug} · {movie.movieType} · {movie.movieStatus}
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Edit />}
          onClick={() => {
            setInfoForm({
              title: movie.title ?? "",
              originalTitle: movie.originalTitle ?? "",
              slug: movie.slug ?? "",
              description: movie.description ?? "",
              posterUrl: movie.posterUrl ?? "",
              bannerUrl: movie.bannerUrl ?? "",
              trailerUrl: movie.trailerUrl ?? "",
              releaseYear: movie.releaseYear ?? new Date().getFullYear(),
              country: movie.country ?? "",
              language: movie.language ?? "",
              ageRating: movie.ageRating ?? "",
              movieType: (movie.movieType as AdminMovieType) ?? "SINGLE",
              movieStatus: (movie.movieStatus as AdminMovieStatus) ?? "DRAFT",
              isPremiumOnly: Boolean(movie.isPremiumOnly),
              commentsLocked: Boolean(movie.commentsLocked),
              reviewsLocked: Boolean(movie.reviewsLocked),
            });
            setEditInfoOpen(true);
          }}
        >
          Sửa thông tin
        </Button>
      </Box>

      <Stack spacing={2.5}>
        <Paper sx={sectionSx} elevation={0}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Category sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography fontWeight={700}>Thể loại</Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {(movie.categories ?? []).length === 0 && (
              <Typography variant="caption" color="text.secondary">
                Chưa có thể loại
              </Typography>
            )}
            {(movie.categories ?? []).map((c) => (
              <Tooltip key={c.id} title="Xóa thể loại" arrow placement="top">
                <Chip
                  label={c.name}
                  size="small"
                  onDelete={() => removeCat.mutate(c.id)}
                  deleteIcon={
                    <Delete
                      sx={{
                        fontSize: "0.95rem !important",
                        color: "error.main !important",
                        "&:hover": { color: "error.dark !important" },
                      }}
                    />
                  }
                />
              </Tooltip>
            ))}
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel shrink>Thêm thể loại</InputLabel>
              <Select
                value={addCatId}
                label="Thêm thể loại"
                notched
                displayEmpty
                onChange={(e) => setAddCatId(Number(e.target.value))}
              >
                {allCategories
                  .filter((c) => !existingCatIds.has(c.id))
                  .map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              size="small"
              disabled={!addCatId || addCat.isPending}
              onClick={() => {
                if (addCatId) {
                  addCat.mutate(addCatId);
                  setAddCatId("");
                }
              }}
              startIcon={<Add />}
            >
              Thêm
            </Button>
            <TextField
              size="small"
              placeholder="Tạo thể loại mới..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newCatName.trim()) {
                  const slug = newCatName
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "");
                  createCategory.mutate({ name: newCatName.trim(), slug });
                }
              }}
              sx={{ minWidth: 180 }}
              InputProps={{
                endAdornment: (
                  <Button
                    size="small"
                    disabled={!newCatName.trim() || createCategory.isPending}
                    onClick={() => {
                      const slug = newCatName
                        .trim()
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, "");
                      createCategory.mutate({ name: newCatName.trim(), slug });
                    }}
                    sx={{ minWidth: 0, px: 1 }}
                  >
                    <Add fontSize="small" />
                  </Button>
                ),
              }}
            />
          </Box>
        </Paper>

        <Paper sx={sectionSx} elevation={0}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <LocalOffer sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography fontWeight={700}>Tags</Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {(movie.tags ?? []).length === 0 && (
              <Typography variant="caption" color="text.secondary">
                Chưa có tag
              </Typography>
            )}
            {(movie.tags ?? []).map((t) => (
              <Tooltip key={t.id} title="Xóa tag" arrow placement="top">
                <Chip
                  label={t.name}
                  size="small"
                  variant="outlined"
                  onDelete={() => removeTag.mutate(t.id)}
                  deleteIcon={
                    <Delete
                      sx={{
                        fontSize: "0.95rem !important",
                        color: "error.main !important",
                        "&:hover": { color: "error.dark !important" },
                      }}
                    />
                  }
                />
              </Tooltip>
            ))}
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel shrink>Thêm tag</InputLabel>
              <Select
                value={addTagId}
                label="Thêm tag"
                notched
                displayEmpty
                onChange={(e) => setAddTagId(Number(e.target.value))}
              >
                {allTags
                  .filter((t) => !existingTagIds.has(t.id))
                  .map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              size="small"
              disabled={!addTagId || addTag.isPending}
              onClick={() => {
                if (addTagId) {
                  addTag.mutate(addTagId);
                  setAddTagId("");
                }
              }}
              startIcon={<Add />}
            >
              Thêm
            </Button>
            <TextField
              size="small"
              placeholder="Tạo tag mới..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTagName.trim()) {
                  const slug = newTagName
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "");
                  createTag.mutate({ name: newTagName.trim(), slug });
                }
              }}
              sx={{ minWidth: 180 }}
              InputProps={{
                endAdornment: (
                  <Button
                    size="small"
                    disabled={!newTagName.trim() || createTag.isPending}
                    onClick={() => {
                      const slug = newTagName
                        .trim()
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, "");
                      createTag.mutate({ name: newTagName.trim(), slug });
                    }}
                    sx={{ minWidth: 0, px: 1 }}
                  >
                    <Add fontSize="small" />
                  </Button>
                ),
              }}
            />
          </Box>
        </Paper>

        <Paper sx={sectionSx} elevation={0}>
          <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Person sx={{ fontSize: 18, color: "primary.main" }} />
              <Typography fontWeight={700}>Diễn viên / Đạo diễn</Typography>
            </Box>
            <Button size="small" startIcon={<Add />} onClick={() => setPersonDialog(true)}>
              Thêm
            </Button>
          </Box>
          {(movie.persons ?? []).length === 0 && (
            <Typography variant="caption" color="text.secondary">
              Chưa có người tham gia
            </Typography>
          )}
          <Stack spacing={0.5}>
            {(() => {
              const grouped = new Map<
                number,
                {
                  personId: number;
                  name: string;
                  entries: NonNullable<AdminMovieDetail["persons"]>[number][];
                }
              >();
              (movie.persons ?? []).forEach((mp) => {
                const pid = mp.person?.id ?? 0;
                if (!grouped.has(pid)) {
                  grouped.set(pid, { personId: pid, name: mp.person?.fullName ?? "", entries: [] });
                }
                const group = grouped.get(pid);
                if (group) group.entries.push(mp);
              });
              return Array.from(grouped.values()).map(({ personId, name, entries }) => (
                <Box
                  key={personId}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                    py: 0.75,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700}>
                      {name}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      flexWrap="wrap"
                      useFlexGap
                      sx={{ mt: 0.5 }}
                    >
                      {(entries ?? []).map((mp) => (
                        <Box key={mp.id} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Chip
                            label={PERSON_ROLE_LABELS[mp.role ?? ""] ?? mp.role}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: "0.68rem" }}
                          />
                          {mp.characterName && (
                            <Typography variant="caption" color="text.secondary">
                              vai {mp.characterName}
                            </Typography>
                          )}
                          <Tooltip title="Sửa vai trò">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setEditPersonId(mp.id);
                                setEditPersonForm({
                                  role: mp.role ?? "ACTOR",
                                  characterName: mp.characterName ?? "",
                                  displayOrder: mp.displayOrder ?? 1,
                                });
                                setEditPersonDialog(true);
                              }}
                            >
                              <Edit sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa vai trò">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removePerson.mutate(mp.id)}
                            >
                              <Delete sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              ));
            })()}
          </Stack>
        </Paper>

        <Paper sx={sectionSx} elevation={0}>
          <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Business sx={{ fontSize: 18, color: "primary.main" }} />
              <Typography fontWeight={700}>Studio / Nhà sản xuất</Typography>
            </Box>
            <Button size="small" startIcon={<Add />} onClick={() => setStudioDialog(true)}>
              Thêm
            </Button>
          </Box>
          {(movie.studios ?? []).length === 0 && (
            <Typography variant="caption" color="text.secondary">
              Chưa có studio
            </Typography>
          )}
          <Stack spacing={0.5}>
            {(movie.studios ?? []).map((ms) => (
              <Box key={ms.id} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
                <Chip
                  label={STUDIO_ROLE_LABELS[ms.role ?? ""] ?? ms.role}
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ minWidth: 120, fontSize: "0.7rem" }}
                />
                <Typography variant="body2" fontWeight={600}>
                  {ms.studio.name}
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Tooltip title="Sửa">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => {
                      setEditStudioId(ms.id);
                      setEditStudioRole(ms.role ?? "PRODUCTION");
                      setEditStudioDialog(true);
                    }}
                  >
                    <Edit sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Xóa">
                  <IconButton size="small" color="error" onClick={() => removeStudio.mutate(ms.id)}>
                    <Delete sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
          </Stack>
        </Paper>

        <Paper sx={sectionSx} elevation={0}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <VideoLibrary sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography fontWeight={700} sx={{ flex: 1 }}>
              {movie.movieType === "SINGLE"
                ? "Video phim"
                : `Tập phim (${(movie.episodes ?? []).length})`}
            </Typography>
            {movie.movieType === "SINGLE" && singleMovieEpisode && (
              <Button
                size="small"
                variant="outlined"
                color="warning"
                startIcon={
                  (retranscodeEpisode.isPending &&
                    retranscodeEpisode.variables === singleMovieEpisode.id) ||
                  transcodeJobs[singleMovieEpisode.id]?.status === "PENDING" ||
                  transcodeJobs[singleMovieEpisode.id]?.status === "RUNNING" ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <Refresh />
                  )
                }
                onClick={() => setConfirmRetranscodeEpisodeId(singleMovieEpisode.id)}
                disabled={
                  (retranscodeEpisode.isPending &&
                    retranscodeEpisode.variables === singleMovieEpisode.id) ||
                  transcodeJobs[singleMovieEpisode.id]?.status === "PENDING" ||
                  transcodeJobs[singleMovieEpisode.id]?.status === "RUNNING"
                }
                sx={{ mr: 1 }}
              >
                Render lại HLS
              </Button>
            )}
            {movie.movieType !== "SINGLE" && (movie.episodes ?? []).length > 0 && (
              <Button
                size="small"
                variant="outlined"
                color="warning"
                startIcon={
                  retranscodeMovie.isPending ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <Refresh />
                  )
                }
                onClick={() => setConfirmRetranscodeAll(true)}
                disabled={
                  retranscodeMovie.isPending ||
                  Object.values(transcodeJobs).some(
                    (j) => j.status === "PENDING" || j.status === "RUNNING"
                  )
                }
                sx={{ mr: 1 }}
              >
                Render lại tất cả
              </Button>
            )}
            {movie.movieType !== "SINGLE" && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Add />}
                onClick={() => {
                  setEpisodeForm({
                    title: "",
                    episodeNumber: (movie.episodes ?? []).length + 1,
                    durationSeconds: 0,
                    isFreePreview: false,
                    status: "DRAFT",
                  });
                  setEpisodeDialog(true);
                }}
              >
                Thêm tập
              </Button>
            )}
          </Box>
          {movie.movieType === "SINGLE" && (
            <Box sx={{ mb: 1.5 }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ mb: 0.5, display: "block" }}
              >
                File Video *
              </Typography>
              <Box
                onClick={() => !movieUploading && movieVideoInputRef.current?.click()}
                sx={{
                  border: "2px dashed",
                  borderColor: movieUploading ? "primary.main" : "divider",
                  borderRadius: 1.5,
                  p: 2,
                  textAlign: "center",
                  cursor: movieUploading ? "default" : "pointer",
                  "&:hover": { borderColor: movieUploading ? undefined : "primary.main" },
                  transition: "border-color 0.2s",
                }}
              >
                <Typography
                  variant="body2"
                  color={movieUploading ? "primary.main" : "text.disabled"}
                >
                  {movieUploading
                    ? `Đang upload... ${movieUploadProgress}% (xem chi tiết ở góc phải)`
                    : movie.trailerUrl
                      ? `Đã có video: ${movie.trailerUrl.split("/").pop()}  —  Nhấn để thay file mới`
                      : "Nhấn để chọn file video (MP4, MKV, ...) — upload xong sẽ tự transcode"}
                </Typography>
              </Box>
              <input
                ref={movieVideoInputRef}
                type="file"
                accept="video/mp4,video/x-matroska,video/avi,video/quicktime,video/webm,.mp4,.mkv,.avi,.mov,.webm"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  startMovieSourceUpload(file);
                }}
              />
            </Box>
          )}
          {movie.movieType === "SINGLE" && !singleMovieEpisode && !movieUploading && (
            <Alert severity="info" sx={{ mb: 1.5 }}>
              Sau lần upload đầu tiên, hệ thống sẽ tạo video ẩn cho phim single và tự transcode HLS.
              Nút render lại sẽ xuất hiện sau khi upload thành công.
            </Alert>
          )}
          {(movie.episodes ?? []).length === 0 && (
            <Typography variant="caption" color="text.secondary">
              Chưa có tập phim nào.
            </Typography>
          )}
          <Stack spacing={0.5}>
            {(movie.episodes ?? []).map((ep) => {
              const job = transcodeJobs[ep.id];
              const isActive = !!job && (job.status === "PENDING" || job.status === "RUNNING");
              const isFinished = !!job && (job.status === "DONE" || job.status === "FAILED");
              return (
                <Box
                  key={ep.id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.75,
                    py: 0.75,
                    px: 1,
                    borderRadius: 1,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: { xs: "flex-start", sm: "center" },
                      gap: 1.25,
                      flexWrap: { xs: "wrap", sm: "nowrap" },
                    }}
                  >
                    <Chip
                      label={`Tập ${ep.episodeNumber}`}
                      size="small"
                      sx={{ minWidth: 60, fontSize: "0.7rem" }}
                    />
                    <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                      {ep.title}
                    </Typography>
                    <Chip
                      label={ep.videoUrl ? "Có video" : "Chưa có video"}
                      size="small"
                      color={ep.videoUrl ? "success" : "warning"}
                      variant="outlined"
                      sx={{ fontSize: "0.68rem" }}
                    />
                    <Chip
                      label={EPISODE_STATUS_LABELS[ep.status ?? ""] ?? ep.status}
                      size="small"
                      variant="outlined"
                      color={
                        ep.status === "PUBLISHED"
                          ? "success"
                          : ep.status === "HIDDEN"
                            ? "error"
                            : "default"
                      }
                      sx={{ fontSize: "0.68rem" }}
                    />
                    <Tooltip title="Sửa tập">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setEditEpisodeId(ep.id);
                          setEditEpisodeForm({
                            title: ep.title,
                            episodeNumber: ep.episodeNumber,
                            durationSeconds: ep.durationSeconds,
                            isFreePreview: ep.isFreePreview,
                            status: ep.status,
                            videoUrl: ep.videoUrl ?? "",
                            thumbnailUrl: ep.thumbnailUrl ?? "",
                          });
                          setEditEpisodeNumberStr(String(ep.episodeNumber));
                          setEditEpisodeDurationStr(String(ep.durationSeconds));
                          setEditEpisodeThumbnailPreview(ep.thumbnailUrl ?? "");
                          setEditEpisodeVideoFile(null);
                          if (editEpisodeVideoPreviewUrl)
                            URL.revokeObjectURL(editEpisodeVideoPreviewUrl);
                          setEditEpisodeVideoPreviewUrl("");
                          setEditEpisodeUploading(false);
                          setEditEpisodeUploadStatus(null);
                          setEditEpisodeDialog(true);
                        }}
                      >
                        <Edit sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Render lại HLS">
                      <span>
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => setConfirmRetranscodeEpisodeId(ep.id)}
                          disabled={
                            (retranscodeEpisode.isPending &&
                              retranscodeEpisode.variables === ep.id) ||
                            transcodeJobs[ep.id]?.status === "PENDING" ||
                            transcodeJobs[ep.id]?.status === "RUNNING"
                          }
                        >
                          {(retranscodeEpisode.isPending &&
                            retranscodeEpisode.variables === ep.id) ||
                          transcodeJobs[ep.id]?.status === "PENDING" ||
                          transcodeJobs[ep.id]?.status === "RUNNING" ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <Refresh sx={{ fontSize: 16 }} />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Xóa tập">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteEpisode.mutate(ep.id)}
                        disabled={deleteEpisode.isPending}
                      >
                        <Delete sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  {(isActive || isFinished) && (
                    <Box
                      sx={{
                        mt: 0.5,
                        p: { xs: 1.25, sm: 1.5 },
                        borderRadius: 1.5,
                        bgcolor: "action.hover",
                        border: "1px solid",
                        borderColor:
                          isFinished && job.status === "FAILED"
                            ? "error.light"
                            : isFinished
                              ? "success.light"
                              : "warning.light",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: { xs: "flex-start", sm: "center" },
                          justifyContent: "space-between",
                          gap: 1.25,
                          mb: 1,
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" fontWeight={800} sx={{ display: "block" }}>
                            {isActive
                              ? job.status === "PENDING"
                                ? "Đang chờ khởi chạy…"
                                : `Đang transcode ${job.currentQuality ?? ""}…`
                              : job.status === "DONE"
                                ? "Render lại hoàn tất"
                                : "Render lại thất bại"}
                          </Typography>
                          {job.message && (
                            <Typography
                              variant="caption"
                              color={
                                isFinished && job.status === "FAILED" ? "error" : "text.secondary"
                              }
                              sx={{ display: "block", mt: 0.25 }}
                            >
                              {job.message}
                            </Typography>
                          )}
                        </Box>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.75}
                          sx={{ flexShrink: 0 }}
                        >
                          <Chip
                            size="small"
                            label={`${job.percent}%`}
                            color={
                              isFinished && job.status === "FAILED"
                                ? "error"
                                : isFinished
                                  ? "success"
                                  : "warning"
                            }
                            variant={isActive ? "filled" : "outlined"}
                            sx={{ height: 22, fontSize: "0.68rem", fontWeight: 800 }}
                          />
                          {isFinished && (
                            <IconButton
                              size="small"
                              onClick={() =>
                                setTranscodeJobs((prev) => {
                                  const next = { ...prev };
                                  delete next[ep.id];
                                  return next;
                                })
                              }
                              sx={{ width: 24, height: 24 }}
                            >
                              <Delete sx={{ fontSize: 14 }} />
                            </IconButton>
                          )}
                        </Stack>
                      </Box>
                      <LinearProgress
                        variant={
                          isActive && job.status === "PENDING" ? "indeterminate" : "determinate"
                        }
                        value={job.percent}
                        color={
                          isFinished && job.status === "FAILED"
                            ? "error"
                            : isFinished
                              ? "success"
                              : "warning"
                        }
                        sx={{ borderRadius: 1, height: 7 }}
                      />
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                        {job.targetQualities.map((q) => {
                          const done = job.completedQualities.includes(q);
                          const failed = job.failedQualities.includes(q);
                          const skipped = job.skippedQualities.includes(q);
                          const current = job.currentQuality === q && isActive;
                          return (
                            <Chip
                              key={q}
                              size="small"
                              label={q}
                              color={
                                done
                                  ? "success"
                                  : failed
                                    ? "error"
                                    : skipped
                                      ? "default"
                                      : current
                                        ? "warning"
                                        : "default"
                              }
                              variant={done || failed || current ? "filled" : "outlined"}
                              sx={{ height: 22, fontSize: "0.65rem", fontWeight: 700 }}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Stack>
        </Paper>
      </Stack>

      <Dialog
        open={episodeDialog}
        onClose={() => {
          if (!addEpisode.isPending && !episodeUploading) {
            setDialogError(null);
            setEpisodeDialog(false);
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle fontWeight={700}>Thêm tập phim</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "20px", overflow: "visible" }}
        >
          <TextField
            label="Tiêu đề tập"
            value={episodeForm.title}
            onChange={(e) => setEpisodeForm((prev) => ({ ...prev, title: e.target.value }))}
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Số tập"
              value={episodeNumberStr}
              onChange={(e) => {
                const v = e.target.value;
                setEpisodeNumberStr(v);
                const n = parseInt(v, 10);
                if (!isNaN(n)) setEpisodeForm((prev) => ({ ...prev, episodeNumber: n }));
              }}
              onBlur={() => setEpisodeNumberStr(String(episodeForm.episodeNumber))}
              size="small"
              sx={{ flex: 1 }}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Thời lượng (giây)"
              value={episodeDurationStr}
              onChange={(e) => {
                const v = e.target.value;
                setEpisodeDurationStr(v);
                const n = parseInt(v, 10);
                if (!isNaN(n)) setEpisodeForm((prev) => ({ ...prev, durationSeconds: n }));
              }}
              onBlur={() => setEpisodeDurationStr(String(episodeForm.durationSeconds))}
              size="small"
              sx={{ flex: 1 }}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
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
              onClick={() => !episodeUploading && videoInputRef.current?.click()}
              sx={{
                border: "2px dashed",
                borderColor: episodeVideoFile ? "primary.main" : "divider",
                borderRadius: 1.5,
                p: 2,
                textAlign: "center",
                cursor: episodeUploading ? "default" : "pointer",
                "&:hover": { borderColor: episodeUploading ? undefined : "primary.main" },
                transition: "border-color 0.2s",
              }}
            >
              <Typography
                variant="body2"
                color={episodeVideoFile ? "text.primary" : "text.disabled"}
              >
                {episodeVideoFile
                  ? episodeVideoFile.name
                  : "Nhấn để chọn file video (MP4, MKV, ...)"}
              </Typography>
              {episodeVideoFile && (
                <Typography variant="caption" color="text.secondary">
                  {(episodeVideoFile.size / 1024 / 1024).toFixed(1)} MB
                </Typography>
              )}
            </Box>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/x-matroska,video/avi,video/quicktime,video/webm,.mp4,.mkv,.avi,.mov,.webm"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                e.target.value = "";
                setEpisodeVideoFile(f);
                if (episodeVideoPreviewUrl) URL.revokeObjectURL(episodeVideoPreviewUrl);
                setEpisodeVideoPreviewUrl(f ? URL.createObjectURL(f) : "");
              }}
            />
            {episodeVideoPreviewUrl && (
              <Box
                component="video"
                src={episodeVideoPreviewUrl}
                controls
                sx={{ mt: 1, width: "100%", borderRadius: 1, maxHeight: 180 }}
              />
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
              {episodeThumbnailPreview && (
                <Box
                  component="img"
                  src={episodeThumbnailPreview}
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
                {episodeThumbnailPreview ? "Thay ảnh" : "Chọn ảnh thumbnail"}
              </Button>
              {episodeThumbnailPreview && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => {
                    setEpisodeThumbnailPreview("");
                    setEpisodeForm((prev) => ({ ...prev, thumbnailUrl: "" }));
                    if (thumbInputRef.current) thumbInputRef.current.value = "";
                  }}
                >
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
                e.target.value = "";
                const { file: webpFile, previewUrl } = await convertToWebPObjectUrl(f);
                setEpisodeThumbnailPreview(previewUrl);
                try {
                  const res = await adminService.uploadImage(webpFile);
                  setEpisodeThumbnailPreview(res.videoUrl);
                  setEpisodeForm((prev) => ({ ...prev, thumbnailUrl: res.videoUrl }));
                } catch {}
              }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel shrink>Trạng thái</InputLabel>
              <Select
                notched
                label="Trạng thái"
                value={episodeForm.status}
                onChange={(e) => setEpisodeForm((prev) => ({ ...prev, status: e.target.value }))}
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
                value={episodeForm.isFreePreview ? "true" : "false"}
                onChange={(e) =>
                  setEpisodeForm((prev) => ({ ...prev, isFreePreview: e.target.value === "true" }))
                }
              >
                <MenuItem value="false">Không</MenuItem>
                <MenuItem value="true">Có</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {episodeUploading && <UploadStatusBar status={episodeUploadStatus} />}
        </DialogContent>
        {dialogError && (
          <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
            {dialogError}
          </Alert>
        )}
        <DialogActions>
          <Button
            onClick={() => setEpisodeDialog(false)}
            disabled={addEpisode.isPending || episodeUploading}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={
              !episodeForm.title || !episodeVideoFile || addEpisode.isPending || episodeUploading
            }
            onClick={() => {
              const payload = {
                ...episodeForm,
                episodeNumber: parseInt(episodeNumberStr, 10) || episodeForm.episodeNumber,
                durationSeconds: parseInt(episodeDurationStr, 10) || 0,
                videoUrl: "pending",
                thumbnailUrl: episodeThumbnailPreview || undefined,
              };
              addEpisode.mutate(payload, {
                onSuccess: (created) => {
                  if (!episodeVideoFile) {
                    setEpisodeDialog(false);
                    resetEpisodeForm();
                    return;
                  }
                  setEpisodeUploading(true);
                  setEpisodeUploadStatus(null);
                  const taskId = uploadProgress.startTask({
                    label: `Tập ${payload.episodeNumber}: ${payload.title}`,
                    fileName: episodeVideoFile.name,
                    totalBytes: episodeVideoFile.size,
                  });
                  adminService
                    .uploadEpisodeSourceSmart(
                      created.id,
                      episodeVideoFile,
                      (s) => {
                        setEpisodeUploadStatus(s);
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
                    )
                    .then(() => {
                      setEpisodeUploading(false);
                      setEpisodeDialog(false);
                      resetEpisodeForm();
                      uploadProgress.finishTask(
                        taskId,
                        true,
                        "Upload xong, server đang transcode 720p/1080p/4K (chạy ngầm vài phút)..."
                      );
                      invalidate();
                    })
                    .catch((err) => {
                      console.error("[Upload]", err);
                      setEpisodeUploading(false);
                      uploadProgress.finishTask(
                        taskId,
                        false,
                        err instanceof Error ? err.message : String(err)
                      );
                    });
                },
              });
            }}
          >
            {addEpisode.isPending
              ? "Đang tạo..."
              : episodeUploading
                ? "Uploading..."
                : "Tạo & Upload"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editEpisodeDialog}
        onClose={() => {
          if (!updateEpisodeMutation.isPending && !editEpisodeUploading) {
            setDialogError(null);
            setEditEpisodeDialog(false);
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle fontWeight={700}>Sửa tập phim</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "20px", overflow: "visible" }}
        >
          <TextField
            label="Tiêu đề tập"
            value={editEpisodeForm.title}
            onChange={(e) => setEditEpisodeForm((prev) => ({ ...prev, title: e.target.value }))}
            fullWidth
            size="small"
            required
            InputLabelProps={{ shrink: true }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Số tập"
              value={editEpisodeNumberStr}
              onChange={(e) => {
                const v = e.target.value;
                setEditEpisodeNumberStr(v);
                const n = parseInt(v, 10);
                if (!isNaN(n)) setEditEpisodeForm((prev) => ({ ...prev, episodeNumber: n }));
              }}
              onBlur={() => setEditEpisodeNumberStr(String(editEpisodeForm.episodeNumber))}
              size="small"
              sx={{ flex: 1 }}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Thời lượng (giây)"
              value={editEpisodeDurationStr}
              onChange={(e) => {
                const v = e.target.value;
                setEditEpisodeDurationStr(v);
                const n = parseInt(v, 10);
                if (!isNaN(n)) setEditEpisodeForm((prev) => ({ ...prev, durationSeconds: n }));
              }}
              onBlur={() => setEditEpisodeDurationStr(String(editEpisodeForm.durationSeconds))}
              size="small"
              sx={{ flex: 1 }}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
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
              Thay video (tùy chọn)
            </Typography>
            {editEpisodeForm.videoUrl && !editEpisodeVideoFile && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 0.5, display: "block" }}
              >
                Hiện tại: {editEpisodeForm.videoUrl.split("/").pop()}
              </Typography>
            )}
            <Box
              onClick={() => !editEpisodeUploading && editEpisodeVideoInputRef.current?.click()}
              sx={{
                border: "2px dashed",
                borderColor: editEpisodeVideoFile ? "primary.main" : "divider",
                borderRadius: 1.5,
                p: 2,
                textAlign: "center",
                cursor: editEpisodeUploading ? "default" : "pointer",
                "&:hover": { borderColor: editEpisodeUploading ? undefined : "primary.main" },
                transition: "border-color 0.2s",
              }}
            >
              <Typography
                variant="body2"
                color={editEpisodeVideoFile ? "text.primary" : "text.disabled"}
              >
                {editEpisodeVideoFile ? editEpisodeVideoFile.name : "Nhấn để chọn file video mới"}
              </Typography>
            </Box>
            <input
              ref={editEpisodeVideoInputRef}
              type="file"
              accept="video/mp4,video/x-matroska,video/avi,video/quicktime,video/webm,.mp4,.mkv,.avi,.mov,.webm"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                e.target.value = "";
                setEditEpisodeVideoFile(f);
                if (editEpisodeVideoPreviewUrl) URL.revokeObjectURL(editEpisodeVideoPreviewUrl);
                setEditEpisodeVideoPreviewUrl(f ? URL.createObjectURL(f) : "");
              }}
            />
            {editEpisodeVideoPreviewUrl && (
              <Box
                component="video"
                src={editEpisodeVideoPreviewUrl}
                controls
                sx={{ mt: 1, width: "100%", borderRadius: 1, maxHeight: 180 }}
              />
            )}
            {editEpisodeUploading && (
              <Box sx={{ mt: 1 }}>
                <UploadStatusBar status={editEpisodeUploadStatus} />
              </Box>
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
              {editEpisodeThumbnailPreview && (
                <Box
                  component="img"
                  src={editEpisodeThumbnailPreview}
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
                disabled={editEpisodeThumbnailUploading}
                onClick={() => editEpisodeThumbInputRef.current?.click()}
              >
                {editEpisodeThumbnailUploading
                  ? "Đang upload..."
                  : editEpisodeThumbnailPreview
                    ? "Thay ảnh"
                    : "Chọn thumbnail"}
              </Button>
              {editEpisodeThumbnailPreview && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => {
                    setEditEpisodeThumbnailPreview("");
                    setEditEpisodeForm((f) => ({ ...f, thumbnailUrl: "" }));
                    if (editEpisodeThumbInputRef.current)
                      editEpisodeThumbInputRef.current.value = "";
                  }}
                >
                  Xóa
                </Button>
              )}
            </Box>
            <input
              ref={editEpisodeThumbInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                e.target.value = "";
                setEditEpisodeThumbnailUploading(true);
                try {
                  const { file: webpFile, previewUrl } = await convertToWebPObjectUrl(f);
                  setEditEpisodeThumbnailPreview(previewUrl);
                  const res = await adminService.uploadImage(webpFile);
                  setEditEpisodeThumbnailPreview(res.videoUrl);
                  setEditEpisodeForm((prev) => ({ ...prev, thumbnailUrl: res.videoUrl }));
                } finally {
                  setEditEpisodeThumbnailUploading(false);
                }
              }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel shrink>Trạng thái</InputLabel>
              <Select
                notched
                label="Trạng thái"
                value={editEpisodeForm.status}
                onChange={(e) =>
                  setEditEpisodeForm((prev) => ({ ...prev, status: e.target.value }))
                }
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
                value={editEpisodeForm.isFreePreview ? "true" : "false"}
                onChange={(e) =>
                  setEditEpisodeForm((prev) => ({
                    ...prev,
                    isFreePreview: e.target.value === "true",
                  }))
                }
              >
                <MenuItem value="false">Không</MenuItem>
                <MenuItem value="true">Có</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        {dialogError && (
          <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
            {dialogError}
          </Alert>
        )}
        <DialogActions>
          <Button
            onClick={() => setEditEpisodeDialog(false)}
            disabled={updateEpisodeMutation.isPending || editEpisodeUploading}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={
              !editEpisodeForm.title || updateEpisodeMutation.isPending || editEpisodeUploading
            }
            onClick={() => {
              if (!editEpisodeId) return;
              const finalForm = {
                ...editEpisodeForm,
                episodeNumber: parseInt(editEpisodeNumberStr, 10) || editEpisodeForm.episodeNumber,
                durationSeconds: parseInt(editEpisodeDurationStr, 10) || 0,
              };
              updateEpisodeMutation.mutate(
                { episodeId: editEpisodeId, p: finalForm },
                {
                  onSuccess: () => {
                    if (!editEpisodeVideoFile) return;
                    setEditEpisodeUploading(true);
                    setEditEpisodeUploadStatus(null);
                    const taskId = uploadProgress.startTask({
                      label: `Sửa tập ${finalForm.episodeNumber}: ${finalForm.title}`,
                      fileName: editEpisodeVideoFile.name,
                      totalBytes: editEpisodeVideoFile.size,
                    });
                    adminService
                      .uploadEpisodeSourceSmart(
                        editEpisodeId,
                        editEpisodeVideoFile,
                        (s) => {
                          setEditEpisodeUploadStatus(s);
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
                      )
                      .then(() => {
                        setEditEpisodeUploading(false);
                        setEditEpisodeVideoFile(null);
                        uploadProgress.finishTask(
                          taskId,
                          true,
                          "Upload xong, server đang transcode 720p/1080p/4K..."
                        );
                        invalidate();
                      })
                      .catch((err) => {
                        console.error("[Upload]", err);
                        setEditEpisodeUploading(false);
                        uploadProgress.finishTask(
                          taskId,
                          false,
                          err instanceof Error ? err.message : String(err)
                        );
                      });
                  },
                }
              );
            }}
          >
            {updateEpisodeMutation.isPending
              ? "Đang lưu..."
              : editEpisodeUploading
                ? "Uploading..."
                : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={personDialog}
        onClose={() => {
          setDialogError(null);
          setPersonDialog(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle fontWeight={700}>Gắn diễn viên / đạo diễn</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "20px", overflow: "visible" }}
        >
          <FormControl fullWidth size="small">
            <InputLabel shrink id="person-select-label">
              Chọn diễn viên có sẵn
            </InputLabel>
            <Select
              notched
              labelId="person-select-label"
              label="Chọn diễn viên có sẵn"
              displayEmpty
              value={personForm.personId || ""}
              onChange={(e) => setPersonForm({ ...personForm, personId: Number(e.target.value) })}
            >
              <MenuItem value="">-- Chọn --</MenuItem>
              {allPersons.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.fullName}
                  {p.stageName ? ` (${p.stageName})` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
            Hoặc tạo người mới:
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <AvatarCropUpload
              currentUrl={newPersonForm.avatarUrl ?? ""}
              onCropped={(_file, previewUrl) =>
                setNewPersonForm((p) => ({ ...p, avatarUrl: previewUrl }))
              }
              onClear={() => setNewPersonForm((p) => ({ ...p, avatarUrl: "" }))}
              size={72}
            />
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <TextField
                size="small"
                label="Họ tên *"
                value={newPersonForm.fullName}
                onChange={(e) => setNewPersonForm((p) => ({ ...p, fullName: e.target.value }))}
                fullWidth
              />
              <TextField
                size="small"
                label="Tên nghệ danh"
                value={newPersonForm.stageName ?? ""}
                onChange={(e) => setNewPersonForm((p) => ({ ...p, stageName: e.target.value }))}
                fullWidth
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  size="small"
                  label="Quốc tịch"
                  value={newPersonForm.nationality ?? ""}
                  onChange={(e) => setNewPersonForm((p) => ({ ...p, nationality: e.target.value }))}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Ngày sinh"
                  value={newPersonForm.birthDate ?? ""}
                  onChange={(e) => setNewPersonForm((p) => ({ ...p, birthDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
              </Box>
              <Button
                size="small"
                variant="outlined"
                disabled={!newPersonForm.fullName.trim() || createPerson.isPending}
                onClick={() => createPerson.mutate({ ...newPersonForm })}
              >
                {createPerson.isPending ? "Đang tạo..." : "Tạo & chọn người này"}
              </Button>
            </Box>
          </Box>
          <FormControl fullWidth size="small">
            <InputLabel shrink id="person-role-label">
              Vai trò (chọn nhiều)
            </InputLabel>
            <Select
              multiple
              notched
              labelId="person-role-label"
              label="Vai trò (chọn nhiều)"
              value={selectedRoles}
              onChange={(e) =>
                setSelectedRoles(
                  typeof e.target.value === "string"
                    ? e.target.value.split(",")
                    : (e.target.value as string[])
                )
              }
              renderValue={(selected) => (selected as string[]).join(", ")}
            >
              {PERSON_ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(r)}
                    readOnly
                    style={{ marginRight: 8 }}
                  />
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              size="small"
              label="Tên nhân vật (nếu có)"
              value={personForm.characterName ?? ""}
              onChange={(e) => setPersonForm({ ...personForm, characterName: e.target.value })}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              type="number"
              label="Thứ tự"
              value={personForm.displayOrder ?? 0}
              onChange={(e) =>
                setPersonForm({ ...personForm, displayOrder: Number(e.target.value) })
              }
              sx={{ width: 100 }}
            />
          </Box>
        </DialogContent>
        {dialogError && (
          <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
            {dialogError}
          </Alert>
        )}
        <DialogActions>
          <Button onClick={() => setPersonDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            disabled={!personForm.personId || selectedRoles.length === 0 || addPerson.isPending}
            onClick={async () => {
              let order = personForm.displayOrder ?? 1;
              for (const role of selectedRoles) {
                await new Promise<void>((resolve, reject) =>
                  addPerson.mutate(
                    { ...personForm, role, displayOrder: order++ },
                    { onSuccess: () => resolve(), onError: () => reject() }
                  )
                );
              }
              setPersonDialog(false);
              setSelectedRoles(["ACTOR"]);
              setPersonForm({
                personId: 0,
                role: "ACTOR",
                characterName: "",
                displayOrder: (movie.persons ?? []).length + selectedRoles.length + 1,
              });
              setNewPersonForm({
                fullName: "",
                stageName: "",
                biography: "",
                birthDate: "",
                nationality: "",
                avatarUrl: "",
              });
            }}
          >
            {addPerson.isPending
              ? "Đang thêm..."
              : `Gắn vào phim${selectedRoles.length > 1 ? ` (${selectedRoles.length} vai trò)` : ""}`}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={studioDialog}
        onClose={() => {
          setDialogError(null);
          setStudioDialog(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle fontWeight={700}>Thêm studio / nhà sản xuất</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "20px", overflow: "visible" }}
        >
          <FormControl fullWidth size="small">
            <InputLabel shrink id="studio-select-label">
              Chọn studio có sẵn
            </InputLabel>
            <Select
              notched
              labelId="studio-select-label"
              label="Chọn studio có sẵn"
              displayEmpty
              value={studioForm.studioId || ""}
              onChange={(e) => setStudioForm({ ...studioForm, studioId: Number(e.target.value) })}
            >
              <MenuItem value="">-- Chọn --</MenuItem>
              {allStudios.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
            Hoặc tạo studio mới:
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <AvatarCropUpload
              currentUrl={newStudioForm.logoUrl ?? ""}
              onCropped={(_file, previewUrl) =>
                setNewStudioForm((s) => ({ ...s, logoUrl: previewUrl }))
              }
              onClear={() => setNewStudioForm((s) => ({ ...s, logoUrl: "" }))}
              size={72}
            />
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <TextField
                size="small"
                label="Tên studio *"
                value={newStudioForm.name}
                onChange={(e) =>
                  setNewStudioForm((s) => ({
                    ...s,
                    name: e.target.value,
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, ""),
                  }))
                }
                fullWidth
              />
              <TextField
                size="small"
                label="Slug"
                value={newStudioForm.slug}
                onChange={(e) => setNewStudioForm((s) => ({ ...s, slug: e.target.value }))}
                fullWidth
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  size="small"
                  label="Quốc gia"
                  value={newStudioForm.country ?? ""}
                  onChange={(e) => setNewStudioForm((s) => ({ ...s, country: e.target.value }))}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  label="Website"
                  value={newStudioForm.websiteUrl ?? ""}
                  onChange={(e) => setNewStudioForm((s) => ({ ...s, websiteUrl: e.target.value }))}
                  sx={{ flex: 1 }}
                />
              </Box>
              <Button
                size="small"
                variant="outlined"
                disabled={!newStudioForm.name.trim() || createStudio.isPending}
                onClick={() => createStudio.mutate({ ...newStudioForm })}
              >
                {createStudio.isPending ? "Đang tạo..." : "Tạo & chọn studio này"}
              </Button>
            </Box>
          </Box>
          <FormControl fullWidth size="small">
            <InputLabel shrink id="studio-role-label">
              Vai trò
            </InputLabel>
            <Select
              notched
              labelId="studio-role-label"
              label="Vai trò"
              displayEmpty
              value={studioForm.role}
              onChange={(e) => setStudioForm({ ...studioForm, role: e.target.value })}
            >
              {STUDIO_ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        {dialogError && (
          <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
            {dialogError}
          </Alert>
        )}
        <DialogActions>
          <Button onClick={() => setStudioDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            disabled={!studioForm.studioId || addStudio.isPending}
            onClick={() => {
              addStudio.mutate(studioForm, {
                onSuccess: () => {
                  setStudioDialog(false);
                  setStudioForm({ studioId: 0, role: "PRODUCTION" });
                  setNewStudioForm({
                    name: "",
                    slug: "",
                    description: "",
                    logoUrl: "",
                    country: "",
                    websiteUrl: "",
                  });
                },
              });
            }}
          >
            Thêm vào phim
          </Button>
        </DialogActions>
      </Dialog>

      {}
      <Dialog
        open={editPersonDialog}
        onClose={() => {
          setDialogError(null);
          setEditPersonDialog(false);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle fontWeight={700}>Sửa vai trò diễn viên</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "20px" }}>
          <FormControl fullWidth size="small">
            <InputLabel shrink id="edit-person-role-label">
              Vai trò
            </InputLabel>
            <Select
              notched
              labelId="edit-person-role-label"
              label="Vai trò"
              value={editPersonForm.role}
              onChange={(e) => setEditPersonForm({ ...editPersonForm, role: e.target.value })}
            >
              {PERSON_ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Tên nhân vật (nếu có)"
            value={editPersonForm.characterName}
            onChange={(e) =>
              setEditPersonForm({ ...editPersonForm, characterName: e.target.value })
            }
            fullWidth
          />
          <TextField
            size="small"
            type="number"
            label="Thứ tự"
            value={editPersonForm.displayOrder}
            onChange={(e) =>
              setEditPersonForm({ ...editPersonForm, displayOrder: Number(e.target.value) })
            }
            fullWidth
          />
        </DialogContent>
        {dialogError && (
          <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
            {dialogError}
          </Alert>
        )}
        <DialogActions>
          <Button onClick={() => setEditPersonDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            disabled={updatePerson.isPending}
            onClick={() => {
              if (!editPersonId) return;
              updatePerson.mutate({ id: editPersonId, payload: editPersonForm });
            }}
          >
            {updatePerson.isPending ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

      {}
      <Dialog
        open={editStudioDialog}
        onClose={() => {
          setDialogError(null);
          setEditStudioDialog(false);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle fontWeight={700}>Sửa vai trò studio</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "20px" }}>
          <FormControl fullWidth size="small">
            <InputLabel shrink id="edit-studio-role-label">
              Vai trò
            </InputLabel>
            <Select
              notched
              labelId="edit-studio-role-label"
              label="Vai trò"
              value={editStudioRole}
              onChange={(e) => setEditStudioRole(e.target.value)}
            >
              {STUDIO_ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        {dialogError && (
          <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
            {dialogError}
          </Alert>
        )}
        <DialogActions>
          <Button onClick={() => setEditStudioDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            disabled={updateStudio.isPending}
            onClick={() => {
              if (!editStudioId) return;
              updateStudio.mutate({ id: editStudioId, payload: { role: editStudioRole } });
            }}
          >
            {updateStudio.isPending ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

      {infoForm && (
        <Dialog
          open={editInfoOpen}
          onClose={() => !updateMovie.isPending && setEditInfoOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle fontWeight={700}>Sửa thông tin phim</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "20px" }}>
            {updateMovie.isError && (
              <Alert severity="error">
                {getAdminErrorMessage(updateMovie.error, "Lưu thất bại. Vui lòng thử lại.")}
              </Alert>
            )}
            <Box
              sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}
            >
              <TextField
                size="small"
                label="Tiêu đề"
                required
                value={infoForm.title}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setInfoForm((f) => f && { ...f, title: e.target.value })}
              />
              <TextField
                size="small"
                label="Tên gốc"
                value={infoForm.originalTitle ?? ""}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setInfoForm((f) => f && { ...f, originalTitle: e.target.value })}
              />
              <TextField
                size="small"
                label="Slug"
                required
                value={infoForm.slug}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setInfoForm((f) => f && { ...f, slug: e.target.value })}
              />
              <TextField
                size="small"
                type="number"
                label="Năm phát hành"
                value={infoForm.releaseYear}
                InputLabelProps={{ shrink: true }}
                onChange={(e) =>
                  setInfoForm((f) => f && { ...f, releaseYear: Number(e.target.value) })
                }
              />
              <TextField
                size="small"
                label="Quốc gia"
                value={infoForm.country ?? ""}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setInfoForm((f) => f && { ...f, country: e.target.value })}
              />
              <TextField
                size="small"
                label="Ngôn ngữ"
                value={infoForm.language ?? ""}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setInfoForm((f) => f && { ...f, language: e.target.value })}
              />
              <TextField
                size="small"
                label="Age rating"
                value={infoForm.ageRating ?? ""}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setInfoForm((f) => f && { ...f, ageRating: e.target.value })}
              />
              <FormControl size="small">
                <InputLabel shrink id="edit-type-label">
                  Loại phim
                </InputLabel>
                <Select
                  native
                  notched
                  labelId="edit-type-label"
                  label="Loại phim"
                  value={infoForm.movieType || "SINGLE"}
                  onChange={(e) =>
                    setInfoForm(
                      (f) =>
                        f && {
                          ...f,
                          movieType: (e.target as HTMLSelectElement).value as AdminMovieType,
                        }
                    )
                  }
                >
                  <option value="SINGLE">Movie (Single)</option>
                  <option value="SERIES">Series</option>
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel shrink id="edit-status-label">
                  Trạng thái
                </InputLabel>
                <Select
                  native
                  notched
                  labelId="edit-status-label"
                  label="Trạng thái"
                  value={infoForm.movieStatus || "DRAFT"}
                  onChange={(e) =>
                    setInfoForm(
                      (f) =>
                        f && {
                          ...f,
                          movieStatus: (e.target as HTMLSelectElement).value as AdminMovieStatus,
                        }
                    )
                  }
                >
                  <option value="DRAFT">Draft</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(infoForm.isPremiumOnly)}
                    onChange={(e) =>
                      setInfoForm((f) => f && { ...f, isPremiumOnly: e.target.checked })
                    }
                  />
                }
                label="Chỉ Premium"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(infoForm.commentsLocked)}
                    onChange={(e) =>
                      setInfoForm((f) => f && { ...f, commentsLocked: e.target.checked })
                    }
                    color="warning"
                  />
                }
                label="Khóa bình luận"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(infoForm.reviewsLocked)}
                    onChange={(e) =>
                      setInfoForm((f) => f && { ...f, reviewsLocked: e.target.checked })
                    }
                    color="warning"
                  />
                }
                label="Khóa đánh giá"
              />
            </Box>
            <TextField
              size="small"
              label="Mô tả"
              multiline
              rows={4}
              value={infoForm.description ?? ""}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setInfoForm((f) => f && { ...f, description: e.target.value })}
              fullWidth
            />
            <Box>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ mb: 0.5, display: "block" }}
              >
                Poster (2:3)
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                {infoForm.posterUrl && (
                  <Box
                    component="img"
                    src={infoForm.posterUrl}
                    alt="poster"
                    sx={{
                      width: 80,
                      aspectRatio: "2/3",
                      objectFit: "cover",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                )}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    component="label"
                    disabled={imageUploading === "poster"}
                  >
                    {imageUploading === "poster"
                      ? "Đang upload..."
                      : infoForm.posterUrl
                        ? "Thay poster"
                        : "Upload poster"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        setImageUploading("poster");
                        try {
                          const { file: webpFile, previewUrl } = await convertToWebPObjectUrl(f);
                          setInfoForm((prev) => prev && { ...prev, posterUrl: previewUrl });
                          const res = await adminService.uploadImage(webpFile);
                          setInfoForm((prev) => prev && { ...prev, posterUrl: res.videoUrl });
                        } finally {
                          setImageUploading(null);
                        }
                      }}
                    />
                  </Button>
                  {infoForm.posterUrl && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setInfoForm((f) => f && { ...f, posterUrl: "" })}
                    >
                      Xóa
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
            <Box>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ mb: 0.5, display: "block" }}
              >
                Banner (16:9)
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                {infoForm.bannerUrl && (
                  <Box
                    component="img"
                    src={infoForm.bannerUrl}
                    alt="banner"
                    sx={{
                      width: 160,
                      aspectRatio: "16/9",
                      objectFit: "cover",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                )}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    component="label"
                    disabled={imageUploading === "banner"}
                  >
                    {imageUploading === "banner"
                      ? "Đang upload..."
                      : infoForm.bannerUrl
                        ? "Thay banner"
                        : "Upload banner"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        setImageUploading("banner");
                        try {
                          const { file: webpFile, previewUrl } = await convertToWebPObjectUrl(f);
                          setInfoForm((prev) => prev && { ...prev, bannerUrl: previewUrl });
                          const res = await adminService.uploadImage(webpFile);
                          setInfoForm((prev) => prev && { ...prev, bannerUrl: res.videoUrl });
                        } finally {
                          setImageUploading(null);
                        }
                      }}
                    />
                  </Button>
                  {infoForm.bannerUrl && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setInfoForm((f) => f && { ...f, bannerUrl: "" })}
                    >
                      Xóa
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
            <Box>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ mb: 0.5, display: "block" }}
              >
                Video / Trailer
              </Typography>
              {infoForm.trailerUrl && !infoForm.trailerUrl.startsWith("blob:") && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.5, display: "block" }}
                >
                  Hiện tại: {infoForm.trailerUrl.split("/").pop()}
                </Typography>
              )}
              <Box
                onClick={() => !movieUploading && movieVideoInputRef.current?.click()}
                sx={{
                  border: "2px dashed",
                  borderColor: movieUploading ? "primary.main" : "divider",
                  borderRadius: 1.5,
                  p: 2,
                  textAlign: "center",
                  cursor: movieUploading ? "default" : "pointer",
                  "&:hover": { borderColor: movieUploading ? undefined : "primary.main" },
                  transition: "border-color 0.2s",
                }}
              >
                <Typography
                  variant="body2"
                  color={movieUploading ? "primary.main" : "text.disabled"}
                >
                  {movieUploading
                    ? `Đang upload... ${movieUploadProgress}% (xem chi tiết ở góc phải)`
                    : "Nhấn để chọn file video mới (MP4, MKV, ...) — tự động upload"}
                </Typography>
              </Box>
              <input
                ref={movieVideoInputRef}
                type="file"
                accept="video/mp4,video/x-matroska,video/avi,video/quicktime,video/webm,.mp4,.mkv,.avi,.mov,.webm"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  startMovieTrailerUpload(file, (videoUrl) => {
                    setInfoForm((f) => f && { ...f, trailerUrl: videoUrl });
                  });
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditInfoOpen(false)} disabled={updateMovie.isPending}>
              Hủy
            </Button>
            <Button
              variant="contained"
              disabled={!infoForm.title || !infoForm.slug || updateMovie.isPending}
              onClick={() => updateMovie.mutate(infoForm)}
            >
              {updateMovie.isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Dialog
        open={confirmRetranscodeEpisodeId !== null}
        onClose={() => setConfirmRetranscodeEpisodeId(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle fontWeight={700}>
          {movie.movieType === "SINGLE"
            ? "Render lại HLS cho phim single?"
            : "Render lại HLS cho tập này?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Hệ thống sẽ transcode lại video gốc thành 3 chất lượng (720p, 1080p, 4K) và ghi đè các
            segment hiện có. Quá trình chạy ngầm và mất vài phút. Người xem có thể gặp gián đoạn
            ngắn cho tới khi 720p sẵn sàng.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRetranscodeEpisodeId(null)}>Hủy</Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<Refresh />}
            onClick={() => {
              if (confirmRetranscodeEpisodeId !== null) {
                retranscodeEpisode.mutate(confirmRetranscodeEpisodeId);
              }
              setConfirmRetranscodeEpisodeId(null);
            }}
          >
            Render lại
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmRetranscodeAll}
        onClose={() => setConfirmRetranscodeAll(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle fontWeight={700}>Render lại HLS cho tất cả tập?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Hệ thống sẽ transcode lại{" "}
            <Box component="span" sx={{ fontWeight: 700 }}>
              {(movie?.episodes ?? []).length} tập
            </Box>{" "}
            thành 3 chất lượng. Mỗi tập mất vài phút, các tập chạy tuần tự nên có thể tốn nhiều giờ.
            Bạn có thể theo dõi tiến trình ngay tại danh sách tập.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRetranscodeAll(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<Refresh />}
            onClick={() => {
              retranscodeMovie.mutate();
              setConfirmRetranscodeAll(false);
            }}
          >
            Render lại tất cả
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{
          top: {
            xs: "calc(env(safe-area-inset-top, 0px) + 76px)",
            md: "calc(env(safe-area-inset-top, 0px) + 84px)",
          },
          right: { xs: "10vw", sm: 24 },
          left: { xs: "10vw", sm: "auto" },
          width: { xs: "80vw", sm: "auto" },
          maxWidth: { xs: "80vw", sm: 520 },
        }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
