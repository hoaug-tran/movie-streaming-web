"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
import {
  ArrowBack,
  AutoAwesome,
  Cancel,
  CheckCircle,
  Diamond,
  LocalMovies,
  WorkspacePremium,
} from "@mui/icons-material";
import subscriptionService from "@/modules/subscription/api/subscription-service";
import { SubscriptionPlan } from "@/modules/subscription/types/subscription";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useSubscription } from "@/hooks/use-subscription";

type PlanMeta = {
  icon: React.ReactNode;
  accent: string;
  badge?: string;
  mood: string;
};

type Entitlement = {
  label: string;
  available: boolean;
};

const PLAN_META: Record<string, PlanMeta> = {
  BASIC: {
    icon: <LocalMovies sx={{ fontSize: 26 }} />,
    accent: "#8EA7E9",
    mood: "Gọn nhẹ",
  },
  PREMIUM: {
    icon: <WorkspacePremium sx={{ fontSize: 26 }} />,
    accent: "#C8102E",
    badge: "Phổ biến",
    mood: "Cân bằng",
  },
  PREMIUM_PLUS: {
    icon: <Diamond sx={{ fontSize: 26 }} />,
    accent: "#F4B400",
    badge: "Trọn vẹn",
    mood: "Cao cấp",
  },
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const hasFullHd = (plan?: SubscriptionPlan | null) => {
  const quality = plan?.videoQuality?.toUpperCase() ?? "";
  return quality.includes("FULL") || quality.includes("FHD") || quality.includes("1080");
};

const has4K = (plan?: SubscriptionPlan | null) => {
  const quality = plan?.videoQuality?.toUpperCase() ?? "";
  return quality.includes("4K");
};

const hasExclusiveMovies = (plan?: SubscriptionPlan | null) => {
  return plan?.code === "PREMIUM" || plan?.code === "PREMIUM_PLUS";
};

const getPlanEntitlements = (plan?: SubscriptionPlan | null): Entitlement[] => {
  const isPremiumPlus = plan?.code === "PREMIUM_PLUS";

  return [
    { label: "Không quảng cáo", available: Boolean(plan?.hasAdsFree) },
    {
      label: isPremiumPlus ? "4K" : "Full HD",
      available: isPremiumPlus ? has4K(plan) : hasFullHd(plan),
    },
    { label: "Nhiều thiết bị", available: Number(plan?.maxDevices ?? 1) > 1 },
    { label: "Phim mới - độc quyền", available: hasExclusiveMovies(plan) },
  ];
};

function EntitlementChip({ entitlement }: { entitlement: Entitlement }) {
  return (
    <Chip
      icon={
        entitlement.available ? (
          <CheckCircle sx={{ fontSize: 17 }} />
        ) : (
          <Cancel sx={{ fontSize: 17 }} />
        )
      }
      label={entitlement.label}
      sx={{
        color: entitlement.available ? "#f7fff9" : "rgba(255,255,255,0.56)",
        borderColor: entitlement.available ? "rgba(74,222,128,0.44)" : "rgba(255,255,255,0.13)",
        bgcolor: entitlement.available ? "rgba(74,222,128,0.10)" : "rgba(255,255,255,0.025)",
        "& .MuiChip-icon": {
          color: entitlement.available ? "#4ade80" : "rgba(255,255,255,0.38)",
        },
      }}
      variant="outlined"
    />
  );
}

function PlanCard({
  plan,
  active,
  disabled,
  actionLabel,
  onSelect,
}: {
  plan: SubscriptionPlan;
  active: boolean;
  disabled: boolean;
  actionLabel: string;
  onSelect: () => void;
}) {
  const meta = PLAN_META[plan.code] ?? PLAN_META.BASIC;
  const entitlements = getPlanEntitlements(plan);

  return (
    <Paper
      sx={{
        position: "relative",
        height: "100%",
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "rgba(18,18,22,0.86)",
        color: "#fff",
        border: "1px solid",
        borderColor: active ? meta.accent : "rgba(255,255,255,0.10)",
        backdropFilter: "blur(24px)",
        boxShadow: active ? `0 30px 90px ${meta.accent}30` : "0 20px 70px rgba(0,0,0,0.34)",
        transition: "transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease",
        "&:hover": {
          transform: "translateY(-8px)",
          borderColor: meta.accent,
          boxShadow: `0 34px 100px ${meta.accent}26`,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 80% 0%, ${meta.accent}30, transparent 34%)`,
          pointerEvents: "none",
        },
      }}
    >
      <Stack spacing={2.5} sx={{ position: "relative", height: "100%" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              color: meta.accent,
              bgcolor: `${meta.accent}18`,
              border: `1px solid ${meta.accent}30`,
            }}
          >
            {meta.icon}
          </Box>
          <Stack direction="row" spacing={1}>
            {meta.badge && (
              <Chip
                label={meta.badge}
                size="small"
                sx={{ bgcolor: meta.accent, color: "#111", fontWeight: 900 }}
              />
            )}
            {active && <Chip label="Đang dùng" size="small" color="success" />}
          </Stack>
        </Stack>

        <Box>
          <Typography
            variant="overline"
            sx={{ color: meta.accent, fontWeight: 900, letterSpacing: "0.12em" }}
          >
            {meta.mood}
          </Typography>
          <Typography variant="h4" fontWeight={950} sx={{ letterSpacing: "-0.04em" }}>
            {plan.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.58)", mt: 1, minHeight: 64 }}
          >
            {plan.description}
          </Typography>
        </Box>

        <Box>
          <Typography variant="h3" fontWeight={950} sx={{ letterSpacing: "-0.06em" }}>
            {formatPrice(plan.price)}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.52)" }}>
            {plan.durationDays} ngày · {plan.maxDevices} thiết bị · {plan.videoQuality}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.10)" }} />

        <Stack spacing={1.15} sx={{ flex: 1 }}>
          {entitlements.map((entitlement) => (
            <Stack key={entitlement.label} direction="row" spacing={1.2} alignItems="center">
              {entitlement.available ? (
                <CheckCircle sx={{ color: "#4ade80", fontSize: 18 }} />
              ) : (
                <Cancel sx={{ color: "rgba(255,255,255,0.34)", fontSize: 18 }} />
              )}
              <Typography
                variant="body2"
                sx={{
                  color: entitlement.available
                    ? "rgba(255,255,255,0.82)"
                    : "rgba(255,255,255,0.46)",
                }}
              >
                {entitlement.label}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Button
          fullWidth
          variant={active ? "outlined" : "contained"}
          disabled={disabled}
          onClick={onSelect}
          sx={{
            py: 1.35,
            borderRadius: 2,
            fontWeight: 900,
            textTransform: "none",
            ...(active
              ? { color: "#fff", borderColor: "rgba(255,255,255,0.28)" }
              : {
                  bgcolor: meta.accent,
                  color: meta.accent === "#F4B400" ? "#111" : "#fff",
                  "&:hover": { bgcolor: meta.accent, filter: "brightness(1.08)" },
                }),
          }}
        >
          {actionLabel}
        </Button>
      </Stack>
    </Paper>
  );
}

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { hasActiveSubscription, currentPlan } = useSubscription();

  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => subscriptionService.getActivePlans(),
    staleTime: 10 * 60 * 1000,
  });

  const orderedPlans = useMemo(() => [...(plans ?? [])].sort((a, b) => a.price - b.price), [plans]);
  const highestPlan = orderedPlans.at(-1) ?? null;
  const canUpgrade = Boolean(
    hasActiveSubscription &&
    currentPlan &&
    orderedPlans.some((plan) => plan.price > currentPlan.price)
  );
  const isAtHighestPlan = Boolean(
    hasActiveSubscription && currentPlan && highestPlan && currentPlan.id === highestPlan.id
  );

  const statusDescription = !hasActiveSubscription
    ? "Đăng ký để mở khóa trải nghiệm không quảng cáo."
    : canUpgrade
      ? "Gói của bạn đang hoạt động. Bạn có thể nâng cấp để mở thêm chất lượng cao, nhiều thiết bị và phim độc quyền."
      : "Bạn đang ở gói cao nhất. Mọi quyền lợi xem phim đã được mở khóa.";

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/pricing`);
      return;
    }
    router.push(`/subscription/checkout?planId=${plan.id}`);
  };

  const getPlanActionLabel = (plan: SubscriptionPlan) => {
    if (!hasActiveSubscription || !currentPlan) {
      return `Đăng ký ${plan.name}`;
    }
    if (currentPlan.id === plan.id) {
      return isAtHighestPlan ? "Gói cao nhất hiện tại" : "Gói hiện tại";
    }
    if (plan.price > currentPlan.price) {
      return `Nâng cấp lên ${plan.name}`;
    }
    return "Không thể hạ gói lúc này";
  };

  const isPlanDisabled = (plan: SubscriptionPlan) => {
    if (!hasActiveSubscription || !currentPlan) {
      return false;
    }
    return currentPlan.id === plan.id || plan.price <= currentPlan.price;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pt: { xs: 10, md: 12 },
        pb: 8,
        color: "#fff",
        bgcolor: "#060608",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 12% 8%, rgba(200,16,46,0.25), transparent 28%), radial-gradient(circle at 78% 0%, rgba(244,180,0,0.16), transparent 24%), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "auto, auto, 72px 72px, 72px 72px",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="xl" sx={{ position: "relative" }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{ color: "rgba(255,255,255,0.64)", mb: 4, textTransform: "none" }}
        >
          Quay lại
        </Button>

        <Grid container spacing={4} alignItems="center" sx={{ mb: { xs: 5, md: 7 } }}>
          <Grid item xs={12} md={7}>
            <Stack spacing={2.4}>
              <Chip
                icon={<AutoAwesome />}
                label="Gió Phim Pass"
                sx={{
                  alignSelf: "flex-start",
                  bgcolor: "rgba(200,16,46,0.16)",
                  color: "#fff",
                  border: "1px solid rgba(200,16,46,0.28)",
                  fontWeight: 800,
                }}
              />
              <Typography
                variant="h1"
                fontWeight={950}
                sx={{
                  fontSize: { xs: "2.5rem", md: "4.8rem" },
                  lineHeight: 0.92,
                  letterSpacing: "-0.075em",
                }}
              >
                Trải nghiệm điện ảnh theo cách của bạn.
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: "rgba(255,255,255,0.64)", maxWidth: 720, lineHeight: 1.7 }}
              >
                Chọn gói trước, xác nhận thông tin thanh toán sau. PayOS chỉ tạo mã QR khi bạn chủ
                động bấm tiếp tục ở trang xác nhận.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() =>
                    document.getElementById("pricing-plans")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Xem các gói
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  href="/profile"
                  sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.28)" }}
                >
                  Kiểm tra gói hiện tại
                </Button>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.06)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(22px)",
                minHeight: 300,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                backgroundImage:
                  "linear-gradient(135deg, rgba(200,16,46,0.24), rgba(255,255,255,0.03)), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 10px, transparent 10px 26px)",
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: "rgba(255,255,255,0.68)", fontWeight: 900 }}
              >
                Trạng thái hiện tại
              </Typography>
              <Box>
                <Typography variant="h3" fontWeight={950}>
                  {hasActiveSubscription ? currentPlan?.name : "Free"}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.66)", mt: 1 }}>
                  {statusDescription}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {getPlanEntitlements(currentPlan).map((entitlement) => (
                  <EntitlementChip key={entitlement.label} entitlement={entitlement} />
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Grid id="pricing-plans" container spacing={3} alignItems="stretch">
            {orderedPlans.map((plan) => (
              <Grid item xs={12} md={4} key={plan.id} sx={{ display: "flex" }}>
                <PlanCard
                  plan={plan}
                  active={currentPlan?.id === plan.id}
                  disabled={isPlanDisabled(plan)}
                  actionLabel={getPlanActionLabel(plan)}
                  onSelect={() => handleSelectPlan(plan)}
                />
              </Grid>
            ))}
          </Grid>
        )}

        <Typography sx={{ textAlign: "center", mt: 5, color: "rgba(255,255,255,0.42)" }}>
          Sử dụng chủ động, không lo tự động trừ phí. Khi gói sắp hết hạn, bạn chỉ cần thực hiện
          thanh toán qua mã QR mới để tiếp tục duy trì dịch vụ.
        </Typography>
      </Container>
    </Box>
  );
}
