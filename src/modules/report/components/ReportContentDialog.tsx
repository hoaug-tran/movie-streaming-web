"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import { useCreateReport } from "@/modules/report/hooks/useCreateReport";
import { CreateReportRequest } from "@/modules/report/types/report";

const reportTitleMaxLength = 255;
const reportDescriptionMaxLength = 2000;

type ReportContentDialogProps = {
  open: boolean;
  targetLabel: string;
  targetType: "comment" | "review";
  targetId: number | null;
  onClose: () => void;
};

export function ReportContentDialog({
  open,
  targetLabel,
  targetType,
  targetId,
  onClose,
}: ReportContentDialogProps) {
  const createReport = useCreateReport();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setReason("");
      setDescription("");
      setMessage(null);
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!targetId || createReport.isPending) return;

    const trimmedReason = reason.trim();
    const trimmedDescription = description.trim();
    if (!trimmedReason) {
      setMessage("Vui lòng nhập tiêu đề báo cáo.");
      return;
    }

    const payload: CreateReportRequest = {
      reason: trimmedReason,
      description: trimmedDescription || undefined,
      ...(targetType === "comment" ? { commentId: targetId } : { reviewId: targetId }),
    };

    try {
      await createReport.mutateAsync(payload);
      setMessage("Đã gửi báo cáo. Cảm ơn bạn đã giúp cộng đồng an toàn hơn.");
      setTimeout(onClose, 650);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể gửi báo cáo lúc này.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight={950} letterSpacing="-0.03em">
            Báo cáo {targetType === "comment" ? "bình luận" : "review"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {targetLabel}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={1.5}>
            {message && (
              <Alert severity={message.startsWith("Đã") ? "success" : "error"}>{message}</Alert>
            )}
            <TextField
              id="report-title-input"
              label="Tiêu đề báo cáo"
              value={reason}
              onChange={(event) => setReason(event.target.value.slice(0, reportTitleMaxLength))}
              inputProps={{ maxLength: reportTitleMaxLength }}
              disabled={createReport.isPending}
              required
              fullWidth
              helperText={`${reason.length}/${reportTitleMaxLength} ký tự`}
            />
            <TextField
              id="report-description-input"
              label="Nội dung"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value.slice(0, reportDescriptionMaxLength))
              }
              inputProps={{ maxLength: reportDescriptionMaxLength }}
              disabled={createReport.isPending}
              multiline
              minRows={4}
              fullWidth
              helperText={`${description.length}/${reportDescriptionMaxLength} ký tự`}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} disabled={createReport.isPending}>
            Hủy
          </Button>
          <Button
            id="report-submit-button"
            type="submit"
            variant="contained"
            disabled={createReport.isPending || !reason.trim() || !targetId}
            startIcon={<SendRoundedIcon />}
          >
            Gửi báo cáo
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
