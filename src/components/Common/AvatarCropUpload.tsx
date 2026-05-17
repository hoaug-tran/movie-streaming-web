"use client";

import { ChangeEvent, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { CameraAlt, Close as CloseIcon } from "@mui/icons-material";

const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type CropState = {
  previewUrl: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
};

function createCroppedFile(
  sourceUrl: string,
  zoom: number,
  offsetX: number,
  offsetY: number
): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const size = 512;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas unavailable"));
        return;
      }
      canvas.width = size;
      canvas.height = size;
      const scale = Math.max(size / image.width, size / image.height) * zoom;
      const w = image.width * scale;
      const h = image.height * scale;
      const x = (size - w) / 2 + offsetX * 2;
      const y = (size - h) / 2 + offsetY * 2;
      ctx.drawImage(image, x, y, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Crop failed"));
            return;
          }
          resolve(new File([blob], "avatar.webp", { type: "image/webp" }));
        },
        "image/webp",
        0.92
      );
    };
    image.onerror = () => reject(new Error("Invalid image"));
    image.src = sourceUrl;
  });
}

interface AvatarCropUploadProps {
  currentUrl?: string | null;
  size?: number;
  onCropped: (file: File, previewUrl: string) => void;
  onClear?: () => void;
}

export default function AvatarCropUpload({
  currentUrl,
  size = 64,
  onCropped,
  onClear,
}: AvatarCropUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cropMoveRef = useRef({ x: 0, y: 0, frame: 0 });
  const [crop, setCrop] = useState<CropState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!AVATAR_TYPES.has(file.type)) {
      setError("Chỉ hỗ trợ JPG, PNG hoặc WEBP.");
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setError("Ảnh không được vượt quá 5MB.");
      return;
    }
    if (crop?.previewUrl) URL.revokeObjectURL(crop.previewUrl);
    setError(null);
    setCrop({
      previewUrl: URL.createObjectURL(file),
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      isDragging: false,
    });
  };

  const updateCrop = (next: Partial<CropState>) =>
    setCrop((prev) => (prev ? { ...prev, ...next } : prev));

  const moveCrop = (dx: number, dy: number) => {
    cropMoveRef.current.x += dx;
    cropMoveRef.current.y += dy;
    if (cropMoveRef.current.frame) return;
    cropMoveRef.current.frame = requestAnimationFrame(() => {
      const deltaX = cropMoveRef.current.x;
      const deltaY = cropMoveRef.current.y;
      cropMoveRef.current.x = 0;
      cropMoveRef.current.y = 0;
      cropMoveRef.current.frame = 0;
      setCrop((prev) => {
        if (!prev || !prev.isDragging) return prev;
        const limit = 120 * prev.zoom;
        return {
          ...prev,
          offsetX: Math.max(-limit, Math.min(limit, prev.offsetX + deltaX)),
          offsetY: Math.max(-limit, Math.min(limit, prev.offsetY + deltaY)),
        };
      });
    });
  };

  const handleSave = async () => {
    if (!crop) return;
    setSaving(true);
    try {
      const file = await createCroppedFile(crop.previewUrl, crop.zoom, crop.offsetX, crop.offsetY);
      const preview = URL.createObjectURL(file);
      onCropped(file, preview);
      URL.revokeObjectURL(crop.previewUrl);
      setCrop(null);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    if (crop?.previewUrl) URL.revokeObjectURL(crop.previewUrl);
    setCrop(null);
  };

  return (
    <>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          onClick={() => inputRef.current?.click()}
          sx={{
            width: size,
            height: size,
            borderRadius: "50%",
            overflow: "hidden",
            border: (t) => `2px dashed ${t.palette.divider}`,
            cursor: "pointer",
            flexShrink: 0,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: (t) => t.palette.action.hover,
            "&:hover": { borderColor: "primary.main" },
            transition: "border-color 0.2s",
          }}
        >
          {currentUrl ? (
            <Box
              component="img"
              src={currentUrl}
              alt="avatar"
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <CameraAlt sx={{ color: "text.disabled", fontSize: size * 0.38 }} />
          )}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(0,0,0,0.38)",
              opacity: 0,
              borderRadius: "50%",
              transition: "opacity 0.18s",
              "&:hover": { opacity: 1 },
            }}
          >
            <CameraAlt sx={{ color: "white", fontSize: size * 0.32 }} />
          </Box>
        </Box>

        <Box>
          <Typography variant="body2" fontWeight={700}>
            Ảnh đại diện
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Nhấn để chọn ảnh.
          </Typography>
          {error && (
            <Typography variant="caption" color="error" sx={{ display: "block" }}>
              {error}
            </Typography>
          )}
          {currentUrl && onClear && (
            <Typography
              variant="caption"
              color="error"
              sx={{ display: "block", cursor: "pointer", mt: 0.25 }}
              onClick={onClear}
            >
              Xóa ảnh
            </Typography>
          )}
        </Box>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </Stack>

      <Dialog open={!!crop} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          Chỉnh ảnh đại diện
          <IconButton size="small" disabled={saving} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", justifyContent: "center" }}>
          {crop && (
            <Stack spacing={3} alignItems="center" sx={{ width: "100%" }}>
              <Box
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  updateCrop({ isDragging: true });
                }}
                onPointerMove={(e) => moveCrop(e.movementX, e.movementY)}
                onPointerUp={(e) => {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                  updateCrop({ isDragging: false });
                }}
                sx={{
                  width: { xs: 280, sm: 360 },
                  height: { xs: 280, sm: 360 },
                  mx: "auto",
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "relative",
                  cursor: crop.isDragging ? "grabbing" : "grab",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 0 0 999px rgba(0,0,0,0.08), inset 0 0 0 2px rgba(255,255,255,0.22)",
                }}
              >
                <Box
                  component="img"
                  src={crop.previewUrl}
                  alt="Crop preview"
                  draggable={false}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `translate(${crop.offsetX}px, ${crop.offsetY}px) scale(${crop.zoom})`,
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                />
              </Box>
              <Box sx={{ width: "100%", maxWidth: 320 }}>
                <Typography variant="body2" fontWeight={700} gutterBottom>
                  Thu phóng
                </Typography>
                <Slider
                  min={1}
                  max={2.5}
                  step={0.05}
                  value={crop.zoom}
                  onChange={(_, v) => updateCrop({ zoom: Number(v) })}
                />
                <Typography variant="caption" color="text.secondary">
                  Kéo ảnh để căn mặt vào giữa khung tròn, sau đó lưu.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1.25} justifyContent="center">
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSave}
                  disabled={saving}
                  sx={{ minWidth: 96 }}
                >
                  {saving ? "Đang xử lý..." : "Lưu"}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={saving}
                  onClick={handleClose}
                  sx={{ minWidth: 88 }}
                >
                  Hủy
                </Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
