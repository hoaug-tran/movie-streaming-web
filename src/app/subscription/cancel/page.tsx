"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Button, Chip, Container, Divider, Paper, Stack, Typography } from "@mui/material";
import { ArrowBack, Cancel, Home, Replay } from "@mui/icons-material";
import { useNotification } from "@/context/notification-context";

function SubscriptionCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notify } = useNotification();
  const orderCode = searchParams.get("orderCode") ?? searchParams.get("id") ?? "Không có";
  const status = searchParams.get("status") ?? "CANCELLED";

  useEffect(() => {
    notify({ message: "Thanh toán đã hủy.", severity: "warning" });
  }, [notify]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pt: { xs: 10, md: 12 },
        pb: 8,
        color: "#fff",
        bgcolor: "#050507",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 12%, rgba(244,180,0,0.16), transparent 28%), radial-gradient(circle at 82% 0%, rgba(200,16,46,0.20), transparent 24%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: "relative" }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push("/pricing")}
          sx={{ color: "rgba(255,255,255,0.64)", mb: 4, textTransform: "none" }}
        >
          Quay lại bảng giá
        </Button>

        <Paper
          sx={{
            p: { xs: 2.5, md: 4 },
            borderRadius: 3,
            color: "#fff",
            bgcolor: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 30px 100px rgba(0,0,0,0.42)",
          }}
        >
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                color: "#F4B400",
                bgcolor: "rgba(244,180,0,0.12)",
                border: "1px solid rgba(244,180,0,0.28)",
              }}
            >
              <Cancel sx={{ fontSize: 40 }} />
            </Box>

            <Box>
              <Chip label="Đã hủy" color="warning" variant="outlined" />
              <Typography
                variant="h1"
                fontWeight={950}
                sx={{ fontSize: { xs: "2.3rem", md: "3.6rem" }, mt: 2 }}
              >
                Thanh toán chưa hoàn tất
              </Typography>
            </Box>

            <Paper
              sx={{
                width: "100%",
                p: 2.5,
                borderRadius: 2.5,
                bgcolor: "rgba(0,0,0,0.18)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <Stack spacing={1.4} textAlign="left">
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Typography color="rgba(255,255,255,0.56)">Mã PayOS</Typography>
                  <Typography fontWeight={900}>{orderCode}</Typography>
                </Stack>
                <Divider sx={{ borderColor: "rgba(255,255,255,0.10)" }} />
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Typography color="rgba(255,255,255,0.56)">Trạng thái</Typography>
                  <Typography fontWeight={900}>{status}</Typography>
                </Stack>
              </Stack>
            </Paper>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.4} width="100%">
              <Button
                fullWidth
                component={Link}
                href="/pricing"
                variant="contained"
                startIcon={<Replay />}
              >
                Chọn lại gói
              </Button>
              <Button
                fullWidth
                component={Link}
                href="/"
                variant="outlined"
                startIcon={<Home />}
                sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.22)" }}
              >
                Trang chủ
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default function SubscriptionCancelPage() {
  return (
    <Suspense fallback={null}>
      <SubscriptionCancelContent />
    </Suspense>
  );
}
