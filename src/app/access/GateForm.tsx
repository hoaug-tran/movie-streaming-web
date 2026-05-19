"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
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

      router.replace(next.startsWith("/") ? next : "/");
      router.refresh();
    } catch {
      setError("Không thể kết nối máy chủ. Thử lại sau.");
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        px: 2,
        py: 4,
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
        maxWidth="sm"
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            backdropFilter: "blur(20px)",
            background: alpha(theme.palette.background.paper, 0.82),
            border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
            boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6)",
          }}
        >
          <Stack spacing={3}>
            <Stack alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
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
                <Image src="/icons/logo.webp" alt="Gió Phim" width={40} height={40} priority />
              </Box>

              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  textAlign: "center",
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
                }}
              >
                Trước khi vào Gió Phim, vui lòng đọc và đồng ý các điều khoản bên dưới.
              </Typography>
            </Stack>

            <Divider sx={{ borderColor: theme.palette.divider }} />

            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <SchoolOutlinedIcon
                  sx={{
                    color: theme.palette.primary.light,
                    mt: 0.3,
                    fontSize: 20,
                  }}
                />

                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.primary,
                    lineHeight: 1.7,
                  }}
                >
                  Trang web này là <b>đồ án học tập phi thương mại</b> thuộc chương trình tốt nghiệp
                  đại học. Không thu phí người dùng, không phát sinh doanh thu, không quảng cáo.
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <GavelOutlinedIcon
                  sx={{
                    color: theme.palette.primary.main,
                    mt: 0.3,
                    fontSize: 20,
                  }}
                />

                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.primary,
                    lineHeight: 1.7,
                  }}
                >
                  Một số nội dung phim có thể vi phạm quyền tác giả nếu sử dụng ngoài mục đích minh
                  hoạ kỹ thuật. Bằng việc tiếp tục, bạn xác nhận chỉ truy cập với mục đích học tập,
                  nghiên cứu cá nhân và không phân phối lại.
                </Typography>
              </Stack>
            </Stack>

            <Divider sx={{ borderColor: theme.palette.divider }} />

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2}>
                <TextField
                  type="password"
                  label="Mật khẩu truy cập"
                  placeholder="Nhập mật khẩu được chia sẻ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  fullWidth
                  required
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon
                          sx={{
                            color: theme.palette.text.secondary,
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
                  size="large"
                  disabled={loading || !password}
                  fullWidth
                  sx={{
                    py: 1.4,
                    fontWeight: 600,
                    fontSize: "1rem",
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
