"use client";

import {
  Box,
  IconButton,
  LinearProgress,
  Typography,
  Collapse,
  Tooltip,
  Paper,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Close,
  CloudUpload,
  CheckCircle,
  ErrorOutline,
  HourglassTop,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { useState } from "react";
import { useUploadProgress, UploadTask } from "@/context/upload-progress-context";

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

function formatSpeed(kbps: number) {
  if (kbps < 1024) return `${kbps.toFixed(0)} KB/s`;
  return `${(kbps / 1024).toFixed(1)} MB/s`;
}

function PhaseIcon({ phase }: { phase: UploadTask["phase"] }) {
  const theme = useTheme();
  const sx = { fontSize: 20 } as const;
  if (phase === "done") return <CheckCircle sx={{ ...sx, color: theme.palette.success.main }} />;
  if (phase === "error") return <ErrorOutline sx={{ ...sx, color: theme.palette.error.main }} />;
  if (phase === "finalizing")
    return <HourglassTop sx={{ ...sx, color: theme.palette.warning.main }} />;
  return <CloudUpload sx={{ ...sx, color: theme.palette.primary.main }} />;
}

function TaskRow({ task, onClose }: { task: UploadTask; onClose: () => void }) {
  const theme = useTheme();
  const isDone = task.phase === "done";
  const isError = task.phase === "error";
  const isFinalizing = task.phase === "finalizing";
  const isPreparing = task.phase === "preparing";

  const phaseLabel = isDone
    ? "Hoàn tất"
    : isError
      ? "Lỗi"
      : isFinalizing
        ? "Đang ghép file"
        : isPreparing
          ? "Đang chuẩn bị"
          : `Upload ${task.percent}%`;

  const accentColor = isDone
    ? theme.palette.success.main
    : isError
      ? theme.palette.error.main
      : isFinalizing
        ? theme.palette.warning.main
        : theme.palette.primary.main;

  const accentDark = isDone
    ? theme.palette.success.dark
    : isError
      ? theme.palette.error.dark
      : isFinalizing
        ? theme.palette.warning.dark
        : theme.palette.primary.dark;

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: alpha(theme.palette.background.paper, 0.96),
        backdropFilter: "blur(12px)",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        p: 1.75,
        minWidth: 320,
        maxWidth: 400,
        color: theme.palette.text.primary,
        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
        <PhaseIcon phase={task.phase} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "text.primary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {task.label}
          </Typography>
          <Typography
            sx={{
              fontSize: "0.7rem",
              color: "text.secondary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {task.fileName}
          </Typography>
        </Box>
        <Tooltip title="Đóng" placement="top" arrow>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: "text.secondary",
              "&:hover": { color: "text.primary", bgcolor: "action.hover" },
            }}
          >
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <Typography
          sx={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: accentColor,
          }}
        >
          {phaseLabel}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: "text.secondary",
          }}
        >
          {formatBytes(task.bytesUploaded)} / {formatBytes(task.totalBytes)}
        </Typography>
      </Box>

      <LinearProgress
        variant={isFinalizing || isPreparing ? "indeterminate" : "determinate"}
        value={task.percent}
        sx={{
          height: 6,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.divider, 0.4),
          "& .MuiLinearProgress-bar": {
            borderRadius: 1,
            background: `linear-gradient(90deg, ${accentColor}, ${accentDark})`,
          },
        }}
      />

      {!isDone && !isError && (task.phase === "uploading" || task.phase === "finalizing") && (
        <Box sx={{ display: "flex", gap: 1.5, mt: 0.75 }}>
          {task.speedKBps > 0 && (
            <Typography
              sx={{
                fontSize: "0.68rem",
                color: "text.secondary",
              }}
            >
              {formatSpeed(task.speedKBps)}
            </Typography>
          )}
          {task.etaSeconds !== null && task.phase === "uploading" && (
            <Typography
              sx={{
                fontSize: "0.68rem",
                color: "text.secondary",
              }}
            >
              ETA: {formatEta(task.etaSeconds)}
            </Typography>
          )}
        </Box>
      )}

      {task.message && (
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: isError ? "error.light" : "text.secondary",
            mt: 0.75,
            lineHeight: 1.4,
          }}
        >
          {task.message}
        </Typography>
      )}
    </Paper>
  );
}

export default function UploadProgressSnackbar() {
  const theme = useTheme();
  const { tasks, removeTask, clearDone } = useUploadProgress();
  const [collapsed, setCollapsed] = useState(false);

  if (tasks.length === 0) return null;

  const activeTasks = tasks.filter((t) => t.phase !== "done");
  const doneCount = tasks.length - activeTasks.length;
  const headerLabel =
    activeTasks.length > 0
      ? `${activeTasks.length} đang upload${doneCount > 0 ? ` · ${doneCount} xong` : ""}`
      : `${doneCount} đã xong`;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 16, md: 24 },
        right: { xs: 16, md: 24 },
        zIndex: 1500,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        maxHeight: "80vh",
        overflowY: "auto",
        pointerEvents: "auto",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.96),
          backdropFilter: "blur(12px)",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          px: 1.5,
          py: 0.75,
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "text.primary",
        }}
      >
        <CloudUpload sx={{ fontSize: 18, color: "primary.main" }} />
        <Typography
          sx={{
            fontSize: "0.78rem",
            fontWeight: 700,
            flex: 1,
            color: "text.primary",
          }}
        >
          {headerLabel}
        </Typography>
        {doneCount > 0 && (
          <Tooltip title="Xóa các mục đã xong" placement="top" arrow>
            <IconButton
              size="small"
              onClick={clearDone}
              sx={{
                color: "text.secondary",
                "&:hover": { color: "text.primary", bgcolor: "action.hover" },
              }}
            >
              <Close sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={collapsed ? "Mở rộng" : "Thu gọn"} placement="top" arrow>
          <IconButton
            size="small"
            onClick={() => setCollapsed((p) => !p)}
            sx={{
              color: "text.secondary",
              "&:hover": { color: "text.primary", bgcolor: "action.hover" },
            }}
          >
            {collapsed ? (
              <ExpandLess sx={{ fontSize: 18 }} />
            ) : (
              <ExpandMore sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Tooltip>
      </Paper>

      <Collapse in={!collapsed} unmountOnExit>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onClose={() => removeTask(task.id)} />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
