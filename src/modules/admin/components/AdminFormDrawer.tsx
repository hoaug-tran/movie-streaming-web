"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import { convertToWebPObjectUrl } from "@/utils/convert-to-webp";
import { adminService } from "@/modules/admin/api";

export type AdminFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "switch"
  | "datetime"
  | "image"
  | "video";

export interface AdminFormField<TForm extends Record<string, unknown>> {
  name: keyof TForm & string;
  label: string;
  type?: AdminFieldType;
  required?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  helperText?: string;
  options?: Array<{ label: string; value: string | number | boolean }>;
  grid?: "full" | "half";
  imageAspectRatio?: string;
  imageSizeHint?: string;
}

export interface AdminFormDrawerProps<TForm extends Record<string, unknown>> {
  open: boolean;
  title: string;
  description: string;
  mode: "create" | "edit";
  fields: AdminFormField<TForm>[];
  initialValues: TForm;
  submitting?: boolean;
  error?: ReactNode;
  onClose: () => void;
  onSubmit: (values: TForm) => void;
  meta?: Array<{ label: string; value: ReactNode; helperText?: ReactNode }>;
  extraHeader?: ReactNode;
}

function coerceValue(value: unknown): string | number | boolean {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
    return value;
  return "";
}

const EMPTY_META: Array<{ label: string; value: ReactNode; helperText?: ReactNode }> = [];

export default function AdminFormDrawer<TForm extends Record<string, unknown>>({
  open,
  title,
  description,
  mode,
  fields,
  initialValues,
  submitting = false,
  error,
  onClose,
  onSubmit,
  meta = EMPTY_META,
  extraHeader,
}: AdminFormDrawerProps<TForm>) {
  const theme = useTheme();
  const [values, setValues] = useState<TForm>(initialValues);
  const [localStrings, setLocalStrings] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (open) {
      setValues(initialValues);
      setValidationErrors({});
      const strings: Record<string, string> = {};
      fields.forEach((f) => {
        if (f.type === "number") strings[f.name] = String(initialValues[f.name] ?? "");
      });
      setLocalStrings(strings);
    }
  }, [initialValues, open, fields]);

  const requiredFields = useMemo(() => fields.filter((field) => field.required), [fields]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    requiredFields.forEach((field) => {
      const value = values[field.name];
      if (value === undefined || value === null || String(value).trim() === "") {
        nextErrors[field.name] = `${field.label} bắt buộc.`;
      }
    });

    fields.forEach((field) => {
      const value = values[field.name];
      if (field.maxLength && typeof value === "string" && value.length > field.maxLength) {
        nextErrors[field.name] = `${field.label} tối đa ${field.maxLength} ký tự.`;
      }
      if (field.type === "number" && value !== undefined && value !== null && value !== "") {
        const numericValue = Number(value);
        if (Number.isNaN(numericValue)) nextErrors[field.name] = `${field.label} phải là số.`;
        if (field.min !== undefined && numericValue < field.min) {
          nextErrors[field.name] = `${field.label} phải >= ${field.min}.`;
        }
        if (field.max !== undefined && numericValue > field.max) {
          nextErrors[field.name] = `${field.label} phải <= ${field.max}.`;
        }
      }
    });

    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit(values);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      PaperProps={{
        sx: {
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1.5,
          boxShadow: `0 24px 80px ${theme.palette.common.black}`,
        },
      }}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ p: 3, pb: 2 }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 800 }}>
            {mode === "create" ? "Create" : "Edit"}
          </Typography>
          <Typography
            component="h2"
            variant="h4"
            sx={{ fontWeight: 900, letterSpacing: "-0.04em" }}
          >
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {description}
          </Typography>
        </DialogTitle>
        {extraHeader && <Box sx={{ pt: 1 }}>{extraHeader}</Box>}
        <Divider />

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {meta.length > 0 && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                  gap: 1.25,
                }}
              >
                {meta.map((item) => (
                  <Box
                    key={String(item.label)}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: theme.palette.background.paper,
                      minWidth: 0,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <InfoOutlinedIcon fontSize="small" color="primary" />
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                        {item.label}
                      </Typography>
                    </Stack>
                    <Typography sx={{ mt: 0.5, fontWeight: 900 }} noWrap>
                      {item.value}
                    </Typography>
                    {item.helperText && (
                      <Typography variant="caption" color="text.secondary">
                        {item.helperText}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}
            {fields.map((field) => {
              const value = values[field.name];
              if (field.type === "switch") {
                return (
                  <FormControlLabel
                    key={field.name}
                    control={
                      <Switch
                        checked={Boolean(value)}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            [field.name]: event.target.checked,
                          }))
                        }
                      />
                    }
                    label={field.label}
                  />
                );
              }
              if (field.type === "image") {
                const previewUrl = typeof value === "string" ? value : "";
                return (
                  <Stack key={field.name} spacing={1}>
                    <Typography fontWeight={900} variant="body2">
                      {field.label}
                      {field.imageSizeHint && (
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          {field.imageSizeHint}
                        </Typography>
                      )}
                    </Typography>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box
                        sx={{
                          flexShrink: 0,
                          width: 120,
                          aspectRatio: field.imageAspectRatio ?? "16 / 9",
                          borderRadius: 1,
                          overflow: "hidden",
                          border: `1px dashed ${theme.palette.divider}`,
                          bgcolor: theme.palette.background.paper,
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        {previewUrl ? (
                          <Box
                            component="img"
                            src={previewUrl}
                            alt={field.label}
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <Stack alignItems="center" spacing={0.5} color="text.disabled">
                            <CloudUploadRoundedIcon fontSize="small" />
                            <Typography variant="caption" fontWeight={700} textAlign="center">
                              Chưa có ảnh
                            </Typography>
                          </Stack>
                        )}
                      </Box>
                      <Stack spacing={1} flex={1}>
                        <TextField
                          id={`admin-form-${field.name}`}
                          label={`${field.label} URL`}
                          value={previewUrl}
                          size="small"
                          onChange={(event) =>
                            setValues((current) => ({
                              ...current,
                              [field.name]: event.target.value,
                            }))
                          }
                          helperText={validationErrors[field.name] || field.helperText}
                          error={Boolean(validationErrors[field.name])}
                          fullWidth
                        />
                        <Button
                          component="label"
                          variant="outlined"
                          size="small"
                          startIcon={
                            uploadingField === field.name ? (
                              <CircularProgress size={14} />
                            ) : (
                              <CloudUploadRoundedIcon />
                            )
                          }
                          disabled={uploadingField === field.name}
                          sx={{ alignSelf: "flex-start", borderRadius: 1, fontWeight: 800 }}
                        >
                          {uploadingField === field.name ? "Đang upload..." : "Upload ảnh"}
                          <input
                            hidden
                            accept="image/*"
                            type="file"
                            ref={(el) => {
                              fileInputRefs.current[field.name] = el;
                            }}
                            onChange={async (event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              event.target.value = "";
                              setUploadingField(field.name);
                              try {
                                const { file: webpFile } = await convertToWebPObjectUrl(file);
                                const res = await adminService.uploadImage(webpFile);
                                setValues((current) => ({
                                  ...current,
                                  [field.name]: res.videoUrl,
                                }));
                              } catch {
                                // keep existing value on error
                              } finally {
                                setUploadingField(null);
                              }
                            }}
                          />
                        </Button>
                      </Stack>
                    </Stack>
                  </Stack>
                );
              }
              if (field.type === "video") {
                const videoUrl = typeof value === "string" ? value : "";
                return (
                  <Stack key={field.name} spacing={1}>
                    <Typography fontWeight={900} variant="body2">
                      {field.label}
                    </Typography>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box
                        sx={{
                          flexShrink: 0,
                          width: 160,
                          aspectRatio: "16 / 9",
                          borderRadius: 1,
                          overflow: "hidden",
                          border: `1px dashed ${theme.palette.divider}`,
                          bgcolor: theme.palette.background.paper,
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        {videoUrl ? (
                          <Box
                            component="video"
                            src={videoUrl}
                            controls={false}
                            muted
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <Stack alignItems="center" spacing={0.5} color="text.disabled">
                            <CloudUploadRoundedIcon fontSize="small" />
                            <Typography variant="caption" fontWeight={700} textAlign="center">
                              Chưa có video
                            </Typography>
                          </Stack>
                        )}
                      </Box>
                      <Stack spacing={1} flex={1}>
                        <TextField
                          id={`admin-form-${field.name}`}
                          label={`${field.label} URL`}
                          value={videoUrl}
                          size="small"
                          onChange={(event) =>
                            setValues((current) => ({
                              ...current,
                              [field.name]: event.target.value,
                            }))
                          }
                          helperText={validationErrors[field.name] || field.helperText}
                          error={Boolean(validationErrors[field.name])}
                          fullWidth
                        />
                        <Button
                          component="label"
                          variant="outlined"
                          size="small"
                          startIcon={
                            uploadingField === field.name ? (
                              <CircularProgress size={14} />
                            ) : (
                              <CloudUploadRoundedIcon />
                            )
                          }
                          disabled={uploadingField === field.name}
                          sx={{ alignSelf: "flex-start", borderRadius: 1, fontWeight: 800 }}
                        >
                          {uploadingField === field.name ? "Đang upload..." : "Upload video"}
                          <input
                            hidden
                            accept="video/*"
                            type="file"
                            ref={(el) => {
                              fileInputRefs.current[field.name] = el;
                            }}
                            onChange={async (event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              event.target.value = "";
                              setUploadingField(field.name);
                              try {
                                const res = await adminService.uploadVideo(file);
                                setValues((current) => ({
                                  ...current,
                                  [field.name]: res.videoUrl,
                                }));
                              } catch {
                                // keep existing value on error
                              } finally {
                                setUploadingField(null);
                              }
                            }}
                          />
                        </Button>
                      </Stack>
                    </Stack>
                  </Stack>
                );
              }

              if (field.type === "number") {
                const strVal = localStrings[field.name] ?? String(value ?? "");
                return (
                  <TextField
                    key={field.name}
                    id={`admin-form-${field.name}`}
                    fullWidth
                    label={field.label}
                    required={field.required}
                    value={strVal}
                    error={Boolean(validationErrors[field.name])}
                    helperText={validationErrors[field.name] || field.helperText}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxLength: field.maxLength,
                    }}
                    onChange={(event) => {
                      const raw = event.target.value;
                      setLocalStrings((s) => ({ ...s, [field.name]: raw }));
                      const n = parseInt(raw, 10);
                      if (!isNaN(n)) setValues((current) => ({ ...current, [field.name]: n }));
                    }}
                    onBlur={() => {
                      setLocalStrings((s) => ({
                        ...s,
                        [field.name]: String(values[field.name] ?? ""),
                      }));
                    }}
                  />
                );
              }

              return (
                <TextField
                  key={field.name}
                  id={`admin-form-${field.name}`}
                  fullWidth
                  select={field.type === "select"}
                  multiline={field.type === "textarea"}
                  rows={field.type === "textarea" ? 4 : undefined}
                  type={field.type === "datetime" ? "datetime-local" : "text"}
                  label={field.label}
                  required={field.required}
                  value={coerceValue(value)}
                  error={Boolean(validationErrors[field.name])}
                  helperText={validationErrors[field.name] || field.helperText}
                  InputLabelProps={{ shrink: field.type === "datetime" ? true : undefined }}
                  inputProps={{ maxLength: field.maxLength }}
                  onChange={(event) => {
                    setValues((current) => ({ ...current, [field.name]: event.target.value }));
                  }}
                >
                  {field.options?.map((option) => (
                    <MenuItem key={String(option.value)} value={String(option.value)}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              );
            })}
          </Stack>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ p: 3 }}>
          <Button
            id="admin-form-cancel"
            variant="outlined"
            onClick={onClose}
            sx={{ borderRadius: 1.5, fontWeight: 900 }}
          >
            Hủy
          </Button>
          <Button
            id="admin-form-submit"
            type="submit"
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            disabled={submitting}
            sx={{ borderRadius: 1.5, fontWeight: 900 }}
          >
            {submitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
