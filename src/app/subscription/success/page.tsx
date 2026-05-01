"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  ErrorOutline,
  Home,
  HourglassTop,
  Replay,
  WorkspacePremium,
} from "@mui/icons-material";
import subscriptionService from "@/modules/subscription/api/subscription-service";
import { useNotification } from "@/context/notification-context";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value?: string) => {
  if (!value) return "Đang chờ PayOS xác nhận";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value)
  );
};

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { notify } = useNotification();
  const orderCode = searchParams.get("orderCode") ?? "";
  const [paymentResult, setPaymentResult] = useState<Awaited<
    ReturnType<typeof subscriptionService.verifyPayment>
  > | null>(null);
  const [isVerifying, setIsVerifying] = useState(Boolean(orderCode));
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const {
    data: history,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["my-subscriptions", "history"],
    queryFn: () => subscriptionService.getMySubscriptions(),
    refetchInterval: (query) => {
      const latest = query.state.data?.[0];
      return latest?.status === "PENDING" ? 3000 : false;
    },
  });

  const subscription = useMemo(() => history?.[0] ?? null, [history]);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderCode) {
        setIsVerifying(false);
        setVerifyError("Không tìm thấy mã giao dịch để kiểm tra thanh toán.");
        return;
      }

      setIsVerifying(true);
      setVerifyError(null);

      try {
        const result = await subscriptionService.verifyPayment(orderCode);
        setPaymentResult(result);
        queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
        queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
        await refetch();
      } catch {
        setVerifyError(
          "Chưa thể kết nối máy chủ để kiểm tra thanh toán. Hệ thống sẽ tự đối soát lại, bạn có thể bấm kiểm tra lại sau ít phút."
        );
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [orderCode, queryClient, refetch]);

  useEffect(() => {
    notify({
      message: orderCode
        ? "Đang kiểm tra thanh toán trực tiếp từ PayOS qua máy chủ."
        : "Không tìm thấy mã giao dịch để kiểm tra.",
      severity: orderCode ? "info" : "warning",
    });
  }, [notify, orderCode]);

  const paymentStatus = paymentResult?.status ?? subscription?.status;
  const isActive =
    paymentResult?.subscriptionStatus === "ACTIVE" || subscription?.status === "ACTIVE";
  const isPending = paymentStatus === "PENDING" || isVerifying;
  const isFailed = paymentStatus === "FAILED" || Boolean(verifyError && !isVerifying);
  const displayAmount = paymentResult?.amount ?? subscription?.plan?.price ?? 0;
  const displayPlanName =
    paymentResult?.planName ?? subscription?.plan?.name ?? `Gói #${subscription?.planId ?? "-"}`;
  const displayEndAt = paymentResult?.endAt ?? subscription?.endAt;
  const verifyPayment = async () => {
    if (!orderCode) return;
    setIsVerifying(true);
    setVerifyError(null);
    try {
      const result = await subscriptionService.verifyPayment(orderCode);
      setPaymentResult(result);
      queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
      queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
      await refetch();
    } catch {
      setVerifyError(
        "Chưa thể kết nối máy chủ để kiểm tra thanh toán. Hệ thống sẽ tự đối soát lại, bạn có thể bấm kiểm tra lại sau ít phút."
      );
    } finally {
      setIsVerifying(false);
    }
  };

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
            "radial-gradient(circle at 18% 12%, rgba(74,222,128,0.22), transparent 28%), radial-gradient(circle at 82% 0%, rgba(200,16,46,0.18), transparent 24%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: "relative" }}>
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
                width: 76,
                height: 76,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                color: "#4ade80",
                bgcolor: "rgba(74,222,128,0.12)",
                border: "1px solid rgba(74,222,128,0.28)",
              }}
            >
              {isFailed ? (
                <ErrorOutline sx={{ fontSize: 42 }} />
              ) : isPending ? (
                <HourglassTop sx={{ fontSize: 42 }} />
              ) : (
                <CheckCircle sx={{ fontSize: 42 }} />
              )}
            </Box>

            <Box>
              <Chip
                label={
                  isActive
                    ? "Gói đã kích hoạt"
                    : isFailed
                      ? "Cần kiểm tra lại"
                      : "Đang đồng bộ PayOS"
                }
                color={isActive ? "success" : isFailed ? "error" : "warning"}
              />
              <Typography
                variant="h1"
                fontWeight={950}
                sx={{ fontSize: { xs: "2.4rem", md: "4rem" }, mt: 2 }}
              >
                {isActive
                  ? "Thanh toán thành công."
                  : isFailed
                    ? "Chưa xác minh được thanh toán."
                    : "Đang xác minh thanh toán."}
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.64)", mt: 1.5, lineHeight: 1.8 }}>
                {verifyError ??
                  "Gió Phim đang kiểm tra trạng thái thật từ PayOS qua máy chủ. Trang này không dùng dữ liệu trạng thái trên URL nên kết quả luôn được đối soát an toàn."}
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
              {isLoading ? (
                <Stack alignItems="center" py={3}>
                  <CircularProgress />
                </Stack>
              ) : (
                <Stack spacing={1.4} textAlign="left">
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography color="rgba(255,255,255,0.56)">Mã PayOS</Typography>
                    <Typography fontWeight={900}>{orderCode || "Không có"}</Typography>
                  </Stack>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.10)" }} />
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography color="rgba(255,255,255,0.56)">Gói</Typography>
                    <Typography fontWeight={900}>{displayPlanName}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography color="rgba(255,255,255,0.56)">Số tiền</Typography>
                    <Typography fontWeight={900}>{formatPrice(displayAmount)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography color="rgba(255,255,255,0.56)">Trạng thái</Typography>
                    <Typography fontWeight={900}>{paymentStatus ?? "Đang kiểm tra"}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography color="rgba(255,255,255,0.56)">Có hiệu lực đến</Typography>
                    <Typography fontWeight={900}>{formatDate(displayEndAt)}</Typography>
                  </Stack>
                </Stack>
              )}
            </Paper>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.4} width="100%">
              <Button
                fullWidth
                component={Link}
                href="/profile"
                variant="contained"
                startIcon={<WorkspacePremium />}
              >
                Xem gói trong hồ sơ
              </Button>
              <Button
                fullWidth
                component={Link}
                href="/"
                variant="outlined"
                startIcon={<Home />}
                sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.22)" }}
              >
                Về trang chủ
              </Button>
              <Button
                fullWidth
                variant="text"
                startIcon={<Replay />}
                onClick={verifyPayment}
                sx={{ color: "rgba(255,255,255,0.72)" }}
              >
                Kiểm tra lại
              </Button>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ color: "rgba(255,255,255,0.46)" }}
            >
              <Typography variant="caption">
                Gói không tự động gia hạn. Bạn có thể gia hạn thủ công khi gần hết hạn.
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
