"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Box, Container, Typography, Button, Grid, Chip, CircularProgress } from "@mui/material";
import { CheckCircle, ArrowBack, WorkspacePremium, Star, Diamond } from "@mui/icons-material";
import subscriptionService from "@/modules/subscription/api/subscription-service";
import { SubscriptionPlan } from "@/modules/subscription/types/subscription";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useSubscription } from "@/hooks/use-subscription";

const PLAN_META: Record<
  string,
  { icon: React.ReactNode; gradient: string; accent: string; badge?: string }
> = {
  BASIC: {
    icon: <Star sx={{ fontSize: 28 }} />,
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    accent: "#6c9bcf",
  },
  PREMIUM: {
    icon: <WorkspacePremium sx={{ fontSize: 28 }} />,
    gradient: "linear-gradient(135deg, #1a0a2e 0%, #2d1b69 100%)",
    accent: "#a855f7",
    badge: "Phổ biến",
  },
  PREMIUM_PLUS: {
    icon: <Diamond sx={{ fontSize: 28 }} />,
    gradient: "linear-gradient(135deg, #1a0a0a 0%, #3d0d0d 100%)",
    accent: "#C8102E",
    badge: "Tốt nhất",
  },
};

const PLAN_FEATURES: Record<string, string[]> = {
  BASIC: [
    "Không quảng cáo",
    "1 thiết bị cùng lúc",
    "Chất lượng HD",
    "Phần lớn thư viện phim",
    "7 ngày sử dụng",
  ],
  PREMIUM: [
    "Không quảng cáo",
    "2 thiết bị cùng lúc",
    "Chất lượng Full HD",
    "Hầu hết nội dung",
    "30 ngày sử dụng",
  ],
  PREMIUM_PLUS: [
    "Không quảng cáo",
    "4 thiết bị cùng lúc",
    "Chất lượng Ultra HD 4K",
    "Toàn bộ thư viện",
    "Phim mới & độc quyền",
    "30 ngày sử dụng",
  ],
};

function PlanCard({ plan, onSelect }: { plan: SubscriptionPlan; onSelect: () => void }) {
  const meta = PLAN_META[plan.code] ?? PLAN_META["BASIC"];
  const features = PLAN_FEATURES[plan.code] ?? [];
  const priceFormatted = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(plan.price);

  return (
    <Box
      sx={{
        position: "relative",
        background: meta.gradient,
        border: `1px solid ${meta.accent}40`,
        borderRadius: 3,
        p: { xs: 3, md: 4 },
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: `0 24px 48px ${meta.accent}30`,
          borderColor: `${meta.accent}80`,
        },
      }}
    >
      {meta.badge && (
        <Chip
          label={meta.badge}
          size="small"
          sx={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: meta.accent,
            color: "#fff",
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: "0.72rem",
            letterSpacing: "0.05em",
          }}
        />
      )}

      <Box sx={{ color: meta.accent, mb: 2 }}>{meta.icon}</Box>

      <Typography
        sx={{
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: "1.3rem",
          mb: 0.5,
        }}
      >
        {plan.name}
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography
          sx={{
            color: "#fff",
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: "2.2rem",
            lineHeight: 1,
          }}
        >
          {priceFormatted}
        </Typography>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.45)",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.8rem",
            mt: 0.5,
          }}
        >
          / {plan.durationDays} ngày
        </Typography>
      </Box>

      <Box sx={{ flex: 1, mb: 3 }}>
        {features.map((f) => (
          <Box
            key={f}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 1.2,
            }}
          >
            <CheckCircle sx={{ color: meta.accent, fontSize: 16, flexShrink: 0 }} />
            <Typography
              sx={{
                color: "rgba(255,255,255,0.8)",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.87rem",
              }}
            >
              {f}
            </Typography>
          </Box>
        ))}
      </Box>

      <Button
        fullWidth
        variant="contained"
        onClick={onSelect}
        sx={{
          bgcolor: meta.accent,
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: "0.95rem",
          py: 1.4,
          borderRadius: 2,
          textTransform: "none",
          "&:hover": {
            bgcolor: meta.accent,
            filter: "brightness(1.15)",
          },
        }}
      >
        Chọn gói {plan.name}
      </Button>
    </Box>
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

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/pricing`);
      return;
    }
    router.push(`/pricing/checkout?planId=${plan.id}`);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#080808",
        pt: { xs: 10, md: 12 },
        pb: 8,
      }}
    >
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{
            color: "rgba(255,255,255,0.5)",
            fontFamily: "Inter, sans-serif",
            textTransform: "none",
            mb: 4,
            "&:hover": { color: "#fff" },
          }}
        >
          Quay lại
        </Button>

        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              color: "#fff",
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: { xs: "1.8rem", md: "2.8rem" },
              mb: 1.5,
            }}
          >
            Nâng cấp trải nghiệm xem phim
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.45)",
              fontFamily: "Inter, sans-serif",
              fontSize: "1.05rem",
              maxWidth: 520,
              mx: "auto",
            }}
          >
            {hasActiveSubscription
              ? `Gói hiện tại: ${currentPlan?.name}. Bạn có thể nâng cấp bất kỳ lúc nào.`
              : "Chọn gói phù hợp để xem phim không giới hạn, không quảng cáo."}
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#C8102E" }} />
          </Box>
        ) : (
          <Grid container spacing={3} alignItems="stretch">
            {(plans ?? []).map((plan) => (
              <Grid item xs={12} md={4} key={plan.id} sx={{ display: "flex" }}>
                <PlanCard plan={plan} onSelect={() => handleSelectPlan(plan)} />
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.25)",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.8rem",
            }}
          >
            Việc đăng ký được gia hạn tự động. Bạn có thể huỷ bất kỳ lúc nào.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
