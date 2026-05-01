"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowBack, CreditScore, Diamond, WorkspacePremium } from "@mui/icons-material";
import subscriptionService from "@/modules/subscription/api/subscription-service";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useNotification } from "@/context/notification-context";
import type { PaymentCheckoutResponse } from "@/modules/subscription/types/subscription";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.56)" }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={800} textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}

export default function SubscriptionCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { notify } = useNotification();
  const planId = Number(searchParams.get("planId"));
  const [checkoutSession, setCheckoutSession] = useState<PaymentCheckoutResponse | null>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => subscriptionService.getActivePlans(),
    staleTime: 10 * 60 * 1000,
  });

  const selectedPlan = useMemo(
    () => plans?.find((plan) => plan.id === planId) ?? null,
    [planId, plans]
  );

  const checkoutMutation = useMutation({
    mutationFn: (selectedPlanId: number) => subscriptionService.createCheckout(selectedPlanId),
    onSuccess: (checkout) => {
      if (!checkout.checkoutUrl) {
        notify({ message: "Không nhận được đường dẫn thanh toán từ PayOS.", severity: "error" });
        return;
      }
      setCheckoutSession(checkout);
      notify({
        message: "Đã tạo phiên thanh toán. Vui lòng kiểm tra số tiền.",
        severity: "success",
      });
    },
    onError: (error: any) => {
      notify({
        message: error?.message || "Không thể tạo phiên thanh toán lúc này.",
        severity: "error",
      });
    },
  });

  const handleContinue = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/subscription/checkout?planId=${planId}`);
      return;
    }
    if (!selectedPlan) {
      notify({ message: "Gói đăng ký không hợp lệ hoặc đã ngừng bán.", severity: "error" });
      return;
    }
    if (checkoutSession?.checkoutUrl) {
      window.location.assign(checkoutSession.checkoutUrl);
      return;
    }
    checkoutMutation.mutate(selectedPlan.id);
  };

  const billingLabel =
    checkoutSession?.billingType === "UPGRADE"
      ? "Nâng cấp có bù trừ"
      : checkoutSession?.billingType === "RENEWAL"
        ? "Gia hạn gói hiện tại"
        : "Đăng ký mới";

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
            "radial-gradient(circle at 12% 12%, rgba(200,16,46,0.22), transparent 30%), radial-gradient(circle at 88% 0%, rgba(244,180,0,0.12), transparent 24%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push("/pricing")}
          sx={{ color: "rgba(255,255,255,0.64)", mb: 4, textTransform: "none" }}
        >
          Quay lại bảng giá
        </Button>

        <Grid container spacing={3.5} alignItems="stretch">
          <Grid item xs={12} md={7}>
            <Paper
              sx={{
                height: "100%",
                p: { xs: 2.5, md: 4 },
                borderRadius: 3,
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.065)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(24px)",
                boxShadow: "0 28px 90px rgba(0,0,0,0.42)",
              }}
            >
              <Stack spacing={2.5} justifyContent="space-between" sx={{ height: "100%" }}>
                <Stack spacing={1.5}>
                  <Chip
                    label="Xác nhận gói"
                    sx={{
                      alignSelf: "flex-start",
                      bgcolor: "rgba(200,16,46,0.16)",
                      color: "#fff",
                      border: "1px solid rgba(200,16,46,0.28)",
                      fontWeight: 900,
                    }}
                  />
                  <Typography
                    variant="h1"
                    fontWeight={950}
                    sx={{ fontSize: { xs: "2.4rem", md: "4rem" }, lineHeight: 0.96 }}
                  >
                    Sẵn sàng thanh toán?
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.64)", lineHeight: 1.7 }}>
                    Kiểm tra lại gói và số tiền trước khi mở cổng thanh toán PayOS.
                  </Typography>
                </Stack>

                <Paper
                  sx={{
                    p: 2.4,
                    borderRadius: 2.5,
                    bgcolor: "rgba(0,0,0,0.18)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <Stack spacing={1.4}>
                    <DetailRow label="Phương thức" value="Chuyển khoản ngân hàng" />
                    <DetailRow label="Gia hạn" value="Thủ công" />
                    <DetailRow label="Loại thanh toán" value={billingLabel} />
                  </Stack>
                </Paper>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper
              sx={{
                height: "100%",
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                color: "#fff",
                bgcolor: "rgba(12,12,16,0.92)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(22px)",
              }}
            >
              {isLoading ? (
                <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 360 }}>
                  <CircularProgress />
                </Stack>
              ) : selectedPlan ? (
                <Stack spacing={2.4}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: 2.5,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "rgba(200,16,46,0.16)",
                        color: "#fff",
                        border: "1px solid rgba(200,16,46,0.3)",
                      }}
                    >
                      {selectedPlan.code === "PREMIUM_PLUS" ? <Diamond /> : <WorkspacePremium />}
                    </Box>
                    <Chip
                      label={`${selectedPlan.durationDays} ngày`}
                      color="success"
                      variant="outlined"
                    />
                  </Stack>

                  <Box>
                    <Typography
                      variant="overline"
                      sx={{ color: "rgba(255,255,255,0.55)", fontWeight: 900 }}
                    >
                      Gói đã chọn
                    </Typography>
                    <Typography variant="h3" fontWeight={950}>
                      {selectedPlan.name}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="h2" fontWeight={950} sx={{ letterSpacing: "-0.06em" }}>
                      {formatPrice(selectedPlan.price)}
                    </Typography>
                  </Box>

                  <Divider sx={{ borderColor: "rgba(255,255,255,0.10)" }} />

                  <Stack spacing={1.3}>
                    <DetailRow
                      label="Thiết bị tối đa"
                      value={`${selectedPlan.maxDevices} thiết bị`}
                    />
                    <DetailRow label="Chất lượng" value={selectedPlan.videoQuality} />
                    <DetailRow
                      label="Không quảng cáo"
                      value={selectedPlan.hasAdsFree ? "Có" : "Không"}
                    />
                  </Stack>

                  {checkoutSession ? (
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "rgba(255,255,255,0.055)",
                        border: "1px solid rgba(255,255,255,0.10)",
                      }}
                    >
                      <Stack spacing={1.2}>
                        <DetailRow
                          label="Giá gói mới"
                          value={formatPrice(checkoutSession.originalAmount ?? selectedPlan.price)}
                        />
                        {checkoutSession.billingType === "UPGRADE" ? (
                          <>
                            <DetailRow
                              label={`Tín dụng còn lại${checkoutSession.remainingDays ? ` (${checkoutSession.remainingDays} ngày)` : ""}`}
                              value={`-${formatPrice(checkoutSession.creditAmount ?? 0)}`}
                            />
                            <DetailRow
                              label="Gói hiện tại"
                              value={checkoutSession.currentPlanName || "Đang hoạt động"}
                            />
                          </>
                        ) : null}
                        <Divider sx={{ borderColor: "rgba(255,255,255,0.10)" }} />
                        <DetailRow
                          label="Cần thanh toán"
                          value={formatPrice(
                            checkoutSession.chargedAmount ??
                              checkoutSession.amount ??
                              selectedPlan.price
                          )}
                        />
                      </Stack>
                    </Paper>
                  ) : null}

                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    startIcon={
                      checkoutMutation.isPending ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <CreditScore />
                      )
                    }
                    disabled={checkoutMutation.isPending}
                    onClick={handleContinue}
                    sx={{ py: 1.45, borderRadius: 2, fontWeight: 900, textTransform: "none" }}
                  >
                    {checkoutMutation.isPending
                      ? "Đang tạo phiên..."
                      : checkoutSession?.checkoutUrl
                        ? "Mở PayOS để thanh toán"
                        : "Xem số tiền thanh toán"}
                  </Button>

                  <Button
                    fullWidth
                    component={Link}
                    href="/pricing"
                    variant="outlined"
                    sx={{
                      color: "#fff",
                      borderColor: "rgba(255,255,255,0.18)",
                      textTransform: "none",
                    }}
                  >
                    Chọn gói khác
                  </Button>
                </Stack>
              ) : (
                <Stack
                  spacing={2}
                  alignItems="flex-start"
                  justifyContent="center"
                  sx={{ minHeight: 360 }}
                >
                  <Typography variant="h4" fontWeight={950}>
                    Không tìm thấy gói
                  </Typography>
                  <Button component={Link} href="/pricing" variant="contained">
                    Quay lại bảng giá
                  </Button>
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
