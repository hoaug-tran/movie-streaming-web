"use client";

import { Box, IconButton, LinearProgress, Typography, Collapse, Tooltip } from "@mui/material";
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
  if (phase === "done") return <CheckCircle sx={{ fontSize: 20, color: "#22c55e" }} />;
  if (phase === "error") return <ErrorOutline sx={{ fontSize: 20, color: "#ef4444" }} />;
  if (phase === "finalizing") return <HourglassTop sx={{ fontSize: 20, color: "#f59e0b" }} />;
  return <CloudUpload sx={{ fontSize: 20, color: "#6366f1" }} />;
}

function TaskRow({ task, onClose }: { task: UploadTask; onClose: () => void }) {
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

  return (
    <Box
      sx={{
        bgcolor: "rgba(20,20,20,0.96)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 2,
        p: 1.75,
        minWidth: 320,
        maxWidth: 400,
        color: "#fff",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
        <PhaseIcon phase={task.phase} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "#fff",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {task.label}
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.7rem",
              color: "rgba(255,255,255,0.55)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {task.fileName}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: "rgba(255,255,255,0.6)", "&:hover": { color: "#fff" } }}
        >
          <Close sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: isDone ? "#22c55e" : isError ? "#ef4444" : isFinalizing ? "#f59e0b" : "#6366f1",
          }}
        >
          {phaseLabel}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.5)",
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
          bgcolor: "rgba(255,255,255,0.1)",
          "& .MuiLinearProgress-bar": {
            borderRadius: 1,
            background: isDone
              ? "linear-gradient(90deg, #10b981, #34d399)"
              : isError
                ? "linear-gradient(90deg, #ef4444, #f87171)"
                : isFinalizing
                  ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                  : "linear-gradient(90deg, #6366f1, #8b5cf6)",
          },
        }}
      />

      {!isDone && !isError && (task.phase === "uploading" || task.phase === "finalizing") && (
        <Box sx={{ display: "flex", gap: 1.5, mt: 0.75 }}>
          {task.speedKBps > 0 && (
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.68rem",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {formatSpeed(task.speedKBps)}
            </Typography>
          )}
          {task.etaSeconds !== null && task.phase === "uploading" && (
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.68rem",
                color: "rgba(255,255,255,0.5)",
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
            fontFamily: "Inter, sans-serif",
            fontSize: "0.7rem",
            color: isError ? "#fca5a5" : "rgba(255,255,255,0.55)",
            mt: 0.75,
            lineHeight: 1.4,
          }}
        >
          {task.message}
        </Typography>
      )}
    </Box>
  );
}

export default function UploadProgressSnackbar() {
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
      <Box
        sx={{
          bgcolor: "rgba(20,20,20,0.96)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 2,
          px: 1.5,
          py: 0.75,
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "#fff",
        }}
      >
        <CloudUpload sx={{ fontSize: 18, color: "#6366f1" }} />
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: "0.78rem",
            fontWeight: 700,
            flex: 1,
          }}
        >
          {headerLabel}
        </Typography>
        {doneCount > 0 && (
          <Tooltip title="Xóa các mục đã xong">
            <IconButton
              size="small"
              onClick={clearDone}
              sx={{ color: "rgba(255,255,255,0.6)", "&:hover": { color: "#fff" } }}
            >
              <Close sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={collapsed ? "Mở rộng" : "Thu gọn"}>
          <IconButton
            size="small"
            onClick={() => setCollapsed((p) => !p)}
            sx={{ color: "rgba(255,255,255,0.6)", "&:hover": { color: "#fff" } }}
          >
            {collapsed ? (
              <ExpandLess sx={{ fontSize: 18 }} />
            ) : (
              <ExpandMore sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

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
