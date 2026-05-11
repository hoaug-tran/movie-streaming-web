"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
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
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";

export type AdminFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "switch"
  | "datetime"
  | "image";

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
}

function coerceValue(value: unknown): string | number | boolean {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
    return value;
  return "";
}

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
}: AdminFormDrawerProps<TForm>) {
  const theme = useTheme();
  const [values, setValues] = useState<TForm>(initialValues);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setValues(initialValues);
      setValidationErrors({});
    }
  }, [initialValues, open]);

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
        <Divider />

        <DialogContent sx={{ p: 3, maxHeight: "72vh" }}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
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
                  <Stack key={field.name} spacing={1.25}>
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Typography fontWeight={900}>{field.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {field.imageSizeHint ?? "Upload ảnh, crop/resize theo khung trước khi lưu."}
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        position: "relative",
                        aspectRatio: field.imageAspectRatio ?? "16 / 9",
                        borderRadius: 1.5,
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
                        <Stack alignItems="center" spacing={1} color="text.secondary">
                          <CloudUploadRoundedIcon />
                          <Typography variant="body2" fontWeight={800}>
                            Chọn ảnh upload
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadRoundedIcon />}
                      sx={{ alignSelf: "flex-start", borderRadius: 1.5, fontWeight: 900 }}
                    >
                      Upload ảnh
                      <input
                        hidden
                        accept="image/*"
                        type="file"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          const objectUrl = URL.createObjectURL(file);
                          setValues((current) => ({ ...current, [field.name]: objectUrl }));
                        }}
                      />
                    </Button>
                    <TextField
                      id={`admin-form-${field.name}`}
                      label={`${field.label} URL sau upload/crop`}
                      value={previewUrl}
                      onChange={(event) =>
                        setValues((current) => ({ ...current, [field.name]: event.target.value }))
                      }
                      helperText={validationErrors[field.name] || field.helperText}
                      error={Boolean(validationErrors[field.name])}
                      fullWidth
                    />
                  </Stack>
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
                  type={
                    field.type === "number"
                      ? "number"
                      : field.type === "datetime"
                        ? "datetime-local"
                        : "text"
                  }
                  label={field.label}
                  required={field.required}
                  value={coerceValue(value)}
                  error={Boolean(validationErrors[field.name])}
                  helperText={validationErrors[field.name] || field.helperText}
                  InputLabelProps={{ shrink: field.type === "datetime" ? true : undefined }}
                  inputProps={{ min: field.min, max: field.max, maxLength: field.maxLength }}
                  onChange={(event) => {
                    const nextValue =
                      field.type === "number" ? Number(event.target.value) : event.target.value;
                    setValues((current) => ({ ...current, [field.name]: nextValue }));
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
