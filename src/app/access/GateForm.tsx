"use client";

import { useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box,
  Container,
  Stack,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Divider,
  InputAdornment,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import Image from "next/image";

export default function GateForm() {
  const searchParams = useSearchParams();
  const theme = useTheme();

  const next = searchParams.get("next") || "/";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/access/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload?.ok) {
        setError(payload?.message || "Mật khẩu không đúng. Thử lại nhé.");
        setLoading(false);
        return;
      }

      const target = next.startsWith("/") ? next : "/";
      window.location.assign(target);
    } catch {
      setError("Không thể kết nối máy chủ. Thử lại sau.");
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        px: { xs: 1.25, sm: 2 },
        pt: { xs: "calc(env(safe-area-inset-top, 0px) + 16px)", sm: 4 },
        pb: { xs: "calc(env(safe-area-inset-bottom, 0px) + 16px)", sm: 4 },
        background: `
          radial-gradient(
            circle at 20% 20%,
            ${alpha(theme.palette.primary.main, 0.18)},
            transparent 50%
          ),
          radial-gradient(
            circle at 80% 0%,
            ${alpha(theme.palette.primary.light, 0.1)},
            transparent 45%
          ),
          linear-gradient(
            135deg,
            ${theme.palette.background.default} 0%,
            ${alpha(theme.palette.background.paper, 0.95)} 100%
          )
        `,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(${alpha(
            theme.palette.common.white,
            0.04
          )} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />

      <Container
        maxWidth="xs"
        sx={{
          position: "relative",
          zIndex: 1,
          px: { xs: 0.5, sm: 2 },
          maxWidth: { xs: 360, sm: 420 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.75, sm: 4 },
            borderRadius: { xs: 2.5, sm: 4 },
            backdropFilter: "blur(20px)",
            background: alpha(theme.palette.background.paper, 0.82),
            border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
            boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6)",
          }}
        >
          <Stack spacing={{ xs: 1.5, sm: 3 }}>
            <Stack alignItems="center" spacing={{ xs: 0.75, sm: 1.25 }}>
              <Box
                sx={{
                  width: { xs: 44, sm: 64 },
                  height: { xs: 44, sm: 64 },
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `
                    linear-gradient(
                      135deg,
                      ${alpha(theme.palette.primary.main, 0.22)},
                      ${alpha(theme.palette.primary.light, 0.12)}
                    )
                  `,
                  border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                }}
              >
                <Image
                  src="/icons/logo.webp"
                  alt="Gió Phim"
                  width={26}
                  height={26}
                  priority
                  style={{ width: "auto", height: "auto", maxWidth: 28, maxHeight: 28 }}
                />
              </Box>

              <Typography
                component="h1"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  textAlign: "center",
                  fontSize: { xs: "1.15rem", sm: "1.85rem" },
                  background: `
                    linear-gradient(
                      135deg,
                      ${theme.palette.text.primary} 0%,
                      ${theme.palette.primary.light} 100%
                    )
                  `,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Cổng truy cập
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  textAlign: "center",
                  maxWidth: 380,
                  fontSize: { xs: "0.72rem", sm: "0.875rem" },
                  lineHeight: 1.45,
                }}
              >
                Vui lòng đọc và đồng ý các điều khoản bên dưới.
              </Typography>
            </Stack>

            <Divider
              sx={{ borderColor: theme.palette.divider, display: { xs: "none", sm: "block" } }}
            />

            <Stack spacing={{ xs: 1, sm: 1.5 }}>
              <Stack direction="row" spacing={{ xs: 1, sm: 1.25 }} alignItems="flex-start">
                <SchoolOutlinedIcon
                  sx={{
                    color: theme.palette.primary.light,
                    mt: 0.2,
                    fontSize: { xs: 16, sm: 20 },
                    flexShrink: 0,
                  }}
                />

                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.primary,
                    lineHeight: { xs: 1.4, sm: 1.55 },
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                  }}
                >
                  Trang web này là <b>đồ án học tập phi thương mại</b> thuộc chương trình tốt nghiệp
                  đại học. Không thu phí, không quảng cáo.
                </Typography>
              </Stack>

              <Stack direction="row" spacing={{ xs: 1, sm: 1.25 }} alignItems="flex-start">
                <GavelOutlinedIcon
                  sx={{
                    color: theme.palette.primary.main,
                    mt: 0.2,
                    fontSize: { xs: 16, sm: 20 },
                    flexShrink: 0,
                  }}
                />

                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.primary,
                    lineHeight: { xs: 1.4, sm: 1.55 },
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                  }}
                >
                  Một số nội dung có thể vi phạm bản quyền nếu dùng ngoài mục đích minh hoạ kỹ
                  thuật. Tiếp tục nghĩa là bạn cam kết chỉ truy cập để học tập và không phân phối
                  lại.
                </Typography>
              </Stack>
            </Stack>

            <Divider
              sx={{ borderColor: theme.palette.divider, display: { xs: "none", sm: "block" } }}
            />

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={{ xs: 1.25, sm: 2 }}>
                <TextField
                  type="password"
                  label="Mật khẩu truy cập"
                  placeholder="Nhập mật khẩu được chia sẻ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  fullWidth
                  required
                  size="small"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: { xs: 18, sm: 22 },
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      background: alpha(theme.palette.common.white, 0.03),
                      borderRadius: 2,

                      "& fieldset": {
                        borderColor: theme.palette.divider,
                      },

                      "&:hover fieldset": {
                        borderColor: alpha(theme.palette.primary.main, 0.45),
                      },

                      "&.Mui-focused fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                    },

                    "& .MuiInputBase-input": {
                      color: theme.palette.text.primary,
                    },

                    "& .MuiInputLabel-root": {
                      color: theme.palette.text.secondary,
                    },
                  }}
                />

                {error ? (
                  <Alert
                    severity="error"
                    sx={{
                      borderRadius: 2,
                      background: alpha(theme.palette.error.main, 0.12),
                      border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    }}
                  >
                    {error}
                  </Alert>
                ) : null}

                <Button
                  type="submit"
                  variant="contained"
                  size="medium"
                  disabled={loading || !password}
                  fullWidth
                  sx={{
                    py: { xs: 0.9, sm: 1.4 },
                    fontWeight: 700,
                    fontSize: { xs: "0.85rem", sm: "1rem" },
                    borderRadius: 2,
                    textTransform: "none",
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    border: `1px solid ${alpha(theme.palette.primary.light, 0.2)}`,
                    transition: "all 0.2s ease",

                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                      borderColor: alpha(theme.palette.primary.light, 0.35),
                    },

                    "&:active": {
                      transform: "scale(0.99)",
                    },

                    "&.Mui-disabled": {
                      backgroundColor: theme.palette.action.disabledBackground,
                      color: theme.palette.action.disabled,
                      borderColor: "transparent",
                    },
                  }}
                >
                  {loading ? "Đang xác thực..." : "Đồng ý và tiếp tục"}
                </Button>
              </Stack>
            </Box>

            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                opacity: 0.6,
                textAlign: "center",
                display: "block",
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
              }}
            >
              Sau khi xác thực, thiết bị này sẽ được nhớ trong 1 năm.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
