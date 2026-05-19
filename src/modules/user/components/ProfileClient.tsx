"use client";

import Link from "next/link";
import { memo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Slider,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  CameraAlt,
  Close as CloseIcon,
  Computer as DesktopIcon,
  EditRounded,
  RefreshRounded,
  PhoneAndroid as MobileIcon,
  Tablet as TabletIcon,
} from "@mui/icons-material";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import authService from "@/modules/auth/api/auth-service";
import { PasswordInput } from "@/modules/auth/components/PasswordInput";
import { useNotification } from "@/context/notification-context";
import { usePushNotification } from "@/hooks/use-push-notification";
import { PaymentTransaction, UserSubscription } from "@/modules/subscription/types/subscription";
import { formatDate, sessionStatus, useProfileData } from "./useProfileData";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

function PushNotificationSettings() {
  const { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe } =
    usePushNotification();

  if (!isSupported) {
    return (
      <Box
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Trình duyệt của bạn không hỗ trợ thông báo đẩy.
        </Typography>
      </Box>
    );
  }

  if (permission === "denied") {
    return (
      <Box
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: "rgba(200,16,46,0.06)",
          border: "1px solid rgba(200,16,46,0.2)",
        }}
      >
        <Typography variant="body2" fontWeight={700} color="error.main" gutterBottom>
          Thông báo đã bị chặn
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vào cài đặt trình duyệt → Quyền riêng tư → Thông báo → Cho phép trang web này gửi thông
          báo.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: isSubscribed ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.04)",
          border: isSubscribed
            ? "1px solid rgba(34,197,94,0.2)"
            : "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="body2" fontWeight={700}>
            {isSubscribed ? "Thông báo đang bật" : "Thông báo đang tắt"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isSubscribed
              ? "Bạn sẽ nhận được thông báo về phim mới và hoạt động tài khoản."
              : "Bật để nhận thông báo ngay cả khi không mở ứng dụng."}
          </Typography>
        </Box>
        <Switch
          checked={isSubscribed}
          disabled={isLoading}
          onChange={isSubscribed ? unsubscribe : subscribe}
          color="success"
        />
      </Box>
      {isSubscribed && (
        <Typography variant="caption" color="text.disabled">
          Thiết bị này đã đăng ký nhận thông báo đẩy. Bạn có thể tắt bất cứ lúc nào.
        </Typography>
      )}
    </Stack>
  );
}

const cardSx = {
  bgcolor: "rgba(18,18,22,0.66)",
  border: 1,
  borderColor: "rgba(255,255,255,0.08)",
  borderRadius: 2,
  boxShadow: "0 18px 54px rgba(0,0,0,0.14)",
  backdropFilter: "blur(22px)",
};

const softCardSx = {
  ...cardSx,
  height: "100%",
};

const getDeviceIcon = (type?: string) => {
  const t = type?.toLowerCase() || "";
  if (t.includes("mobile") || t.includes("phone")) return <MobileIcon />;
  if (t.includes("tablet") || t.includes("ipad")) return <TabletIcon />;
  return <DesktopIcon />;
};

type ChipTone = "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";

const subscriptionStatusMap: Record<string, { label: string; color: ChipTone }> = {
  ACTIVE: { label: "Đang hoạt động", color: "success" },
  PENDING: { label: "Đang xử lý", color: "warning" },
  CANCELLED: { label: "Đã hủy", color: "default" },
  EXPIRED: { label: "Hết hạn", color: "error" },
};

const paymentStatusMap: Record<string, { label: string; color: ChipTone }> = {
  SUCCESS: { label: "Đã thanh toán", color: "success" },
  PENDING: { label: "Đang chờ", color: "warning" },
  FAILED: { label: "Thất bại", color: "error" },
  CANCELLED: { label: "Đã hủy", color: "default" },
  EXPIRED: { label: "Đã hết hạn", color: "error" },
};

const getSubscriptionStatusMeta = (status?: string) =>
  subscriptionStatusMap[status ?? ""] ?? {
    label: status ? `Trạng thái: ${status}` : "Chưa có",
    color: "default" as ChipTone,
  };

const getPaymentStatusMeta = (status?: string) =>
  paymentStatusMap[status ?? ""] ?? {
    label: status ? `Trạng thái: ${status}` : "Chưa có",
    color: "default" as ChipTone,
  };

const findPaymentForSubscription = (
  payments: PaymentTransaction[],
  subscription: UserSubscription
) => payments.find((entry) => Number(entry.subscriptionId) === Number(subscription.id));

const getSubscriptionAmountLabel = (
  subscription: UserSubscription,
  payment?: PaymentTransaction
) => {
  if (payment?.amount !== undefined && payment.amount !== null) {
    return formatCurrency(Number(payment.amount));
  }

  if (subscription.plan?.price !== undefined && subscription.plan.price !== null) {
    return formatCurrency(Number(subscription.plan.price));
  }

  return "Chưa có giá từ hệ thống";
};

const canVerifyPendingPayment = (payment?: PaymentTransaction) =>
  payment?.status === "PENDING" && Boolean(payment.providerTransactionId);

const AccountProfileForm = memo(function AccountProfileForm({
  username,
  email,
  initialFullName,
  onSave,
}: {
  username: string;
  email: string;
  initialFullName: string;
  onSave: (name: string) => Promise<void>;
}) {
  const [draftName, setDraftName] = useState(initialFullName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraftName(initialFullName);
  }, [initialFullName]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draftName.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2}>
      <TextField label="Username" value={username} disabled fullWidth size="small" />
      <TextField
        label="Tên hiển thị"
        value={draftName}
        onChange={(e) => setDraftName(e.target.value)}
        fullWidth
        size="small"
      />
      <TextField label="Email" value={email} disabled fullWidth size="small" />
      <Button
        variant="contained"
        onClick={handleSave}
        disabled={saving || draftName.trim() === initialFullName}
        sx={{ alignSelf: "flex-start" }}
      >
        Lưu thay đổi
      </Button>
    </Stack>
  );
});

const EmailChangeForm = memo(function EmailChangeForm({
  step,
  onStart,
  onVerifyCurrent,
  onVerifyNew,
}: {
  step: "idle" | "current" | "new";
  onStart: (email: string) => Promise<void>;
  onVerifyCurrent: (otp: string) => Promise<void>;
  onVerifyNew: (otp: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [currentOtp, setCurrentOtp] = useState("");
  const [newOtp, setNewOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setLoading(true);
    try {
      await action();
    } finally {
      setLoading(false);
    }
  };

  if (step === "current") {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Nhập mã xác nhận từ email hiện tại.
        </Typography>
        <TextField
          size="small"
          placeholder="OTP email hiện tại"
          value={currentOtp}
          onChange={(e) => setCurrentOtp(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          disabled={loading || !currentOtp}
          onClick={() => run(() => onVerifyCurrent(currentOtp))}
        >
          Xác nhận
        </Button>
      </Stack>
    );
  }

  if (step === "new") {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Nhập mã xác nhận từ email mới.
        </Typography>
        <TextField
          size="small"
          placeholder="OTP email mới"
          value={newOtp}
          onChange={(e) => setNewOtp(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          disabled={loading || !newOtp}
          onClick={() => run(() => onVerifyNew(newOtp))}
        >
          Hoàn tất
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Nhập email mới để nhận mã xác nhận hai bước.
      </Typography>
      <TextField
        size="small"
        placeholder="Email mới"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
      />
      <Button
        variant="contained"
        disabled={loading || !email}
        onClick={() => run(() => onStart(email.trim()))}
      >
        Gửi mã
      </Button>
    </Stack>
  );
});

const PasswordChangeForm = memo(function PasswordChangeForm({
  onPasswordChanged,
}: {
  onPasswordChanged: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [expiresInSeconds, setExpiresInSeconds] = useState(0);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!challengeToken) return;
    const timer = window.setInterval(() => {
      setExpiresInSeconds((value) => Math.max(value - 1, 0));
      setResendCooldownSeconds((value) => Math.max(value - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [challengeToken]);

  const validatePasswords = () => {
    const nextErrors: Record<string, string> = {};
    if (!currentPassword) nextErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    if (!newPassword) nextErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (newPassword.length < 6) nextErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    if (!confirmNewPassword) nextErrors.confirmNewPassword = "Vui lòng xác nhận mật khẩu mới";
    else if (newPassword !== confirmNewPassword) {
      nextErrors.confirmNewPassword = "Mật khẩu không khớp";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const requestOtp = async () => {
    if (!validatePasswords()) return;

    setLoading(true);
    try {
      const challenge = await authService.startChangePassword(currentPassword);
      setChallengeToken(challenge.challengeToken ?? "");
      setMaskedEmail(challenge.email ?? "email của bạn");
      setExpiresInSeconds(challenge.expiresInSeconds ?? 600);
      setResendCooldownSeconds(challenge.resendAfterSeconds ?? 60);
      setOtp("");
      setErrors({});
    } catch (err) {
      setErrors({ currentPassword: err instanceof Error ? err.message : "Không thể gửi OTP" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) return;
    if (!challengeToken) {
      setErrors({ otp: "Vui lòng gửi OTP trước" });
      return;
    }
    if (!otp) {
      setErrors({ otp: "Vui lòng nhập mã OTP" });
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
        challengeToken,
        otp,
      });
      onPasswordChanged();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setOtp("");
      setChallengeToken("");
    } catch (err) {
      setErrors({ otp: err instanceof Error ? err.message : "Đổi mật khẩu thất bại" });
    } finally {
      setLoading(false);
    }
  };

  const expiryLabel = `${Math.floor(expiresInSeconds / 60)}:${String(expiresInSeconds % 60).padStart(2, "0")}`;

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Nhập mật khẩu hiện tại, mật khẩu mới, rồi xác minh OTP qua email trước khi cập nhật.
      </Typography>
      <PasswordInput
        label="Mật khẩu hiện tại"
        value={currentPassword}
        onChange={setCurrentPassword}
        error={!!errors.currentPassword}
        helperText={errors.currentPassword}
        placeholder="Mật khẩu hiện tại"
        size="small"
      />
      <PasswordInput
        label="Mật khẩu mới"
        value={newPassword}
        onChange={setNewPassword}
        error={!!errors.newPassword}
        helperText={errors.newPassword}
        placeholder="Mật khẩu mới"
        size="small"
      />
      <PasswordInput
        label="Xác nhận mật khẩu mới"
        value={confirmNewPassword}
        onChange={setConfirmNewPassword}
        error={!!errors.confirmNewPassword}
        helperText={errors.confirmNewPassword}
        placeholder="Xác nhận mật khẩu mới"
        size="small"
      />
      {challengeToken && (
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            OTP đã gửi đến {maskedEmail}. Mã hết hạn sau {expiryLabel}.
          </Typography>
          <TextField
            label="Mã OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            error={!!errors.otp}
            helperText={errors.otp}
            placeholder="000000"
            fullWidth
            size="small"
          />
        </Stack>
      )}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
        <Button
          variant={challengeToken ? "outlined" : "contained"}
          disabled={loading || (challengeToken ? resendCooldownSeconds > 0 : false)}
          onClick={requestOtp}
          sx={{ alignSelf: "flex-start" }}
        >
          {challengeToken
            ? resendCooldownSeconds > 0
              ? `Gửi lại sau ${resendCooldownSeconds}s`
              : "Gửi lại OTP"
            : loading
              ? "Đang gửi..."
              : "Gửi OTP"}
        </Button>
        {challengeToken && (
          <Button
            variant="contained"
            disabled={loading || !otp || expiresInSeconds <= 0}
            onClick={handleChangePassword}
            sx={{ alignSelf: "flex-start" }}
          >
            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </Button>
        )}
      </Stack>
    </Stack>
  );
});

export function ProfileClient() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const { notify } = useNotification();
  const d = useProfileData();
  const [profileTab, setProfileTab] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/auth/login?redirect=/profile");
    }
  }, [authLoading, isAuthenticated, router]);

  const handlePasswordChanged = () => {
    notify({
      message: "Mật khẩu đã được cập nhật. Bạn sẽ được đăng xuất sau 5 giây.",
      severity: "success",
    });
    window.setTimeout(() => {
      void logout();
    }, 5000);
  };

  if (authLoading || (!authLoading && !isAuthenticated)) {
    return (
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Stack alignItems="center" spacing={2}>
          <LinearProgress sx={{ width: "100%", maxWidth: 420, borderRadius: 99 }} />
          <Typography color="text.secondary">Đang kiểm tra phiên đăng nhập...</Typography>
        </Stack>
      </Container>
    );
  }

  if (d.state === "loading") {
    return (
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Stack alignItems="center" spacing={2}>
          <LinearProgress sx={{ width: "100%", maxWidth: 420, borderRadius: 99 }} />
          <Typography color="text.secondary">Đang tải không gian cá nhân...</Typography>
        </Stack>
      </Container>
    );
  }

  if (d.state === "error" || !d.profile) {
    return (
      <Container maxWidth="lg" sx={{ py: 12, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Phiên đăng nhập cần được làm mới
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Nếu bạn vừa đăng nhập, hãy tải lại trang.
        </Typography>
        <Button variant="contained" component={Link} href="/auth/login">
          Đi tới đăng nhập
        </Button>
      </Container>
    );
  }

  const profile = d.profile;
  const activeDevices = d.sessions.filter((s) => !s.isRevoked).length;
  const planName = d.currentSubscription?.plan?.name ?? "Miễn phí";
  const totalPaid = d.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const latestInvoice = d.invoices[0];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pt: { xs: 9, md: 11 },
        pb: 7,
        background:
          "radial-gradient(circle at 8% 0%, rgba(200,16,46,0.16), transparent 30%), radial-gradient(circle at 92% 8%, rgba(244,180,0,0.10), transparent 26%)",
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} lg={4} xl={3.5} sx={{ alignSelf: "flex-start" }}>
            <Stack spacing={3} sx={{ position: { lg: "sticky" }, top: 96 }}>
              <Paper sx={{ ...cardSx, overflow: "hidden", minHeight: { lg: 318 } }}>
                <Box
                  sx={{
                    height: 110,
                    background:
                      "linear-gradient(135deg, rgba(200,16,46,0.95), rgba(27,27,31,0.9)), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.24), transparent 28%)",
                  }}
                />
                <Stack alignItems="center" spacing={1.5} sx={{ px: 3, pb: 3, mt: -7 }}>
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      src={d.avatarUrl}
                      alt={profile.fullName || profile.username}
                      sx={{
                        width: 132,
                        height: 132,
                        border: 4,
                        borderColor: "background.paper",
                        boxShadow: "0 18px 50px rgba(0,0,0,0.36)",
                      }}
                    />
                    <IconButton
                      onClick={() => d.fileInputRef.current?.click()}
                      sx={{
                        position: "absolute",
                        right: 2,
                        bottom: 8,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        boxShadow: "0 10px 28px rgba(200,16,46,0.35)",
                        "&:hover": { bgcolor: "primary.dark" },
                      }}
                      aria-label="Đổi ảnh đại diện"
                    >
                      <CameraAlt />
                    </IconButton>
                  </Box>
                  <input
                    ref={d.fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    hidden
                    onChange={d.selectAvatar}
                  />
                  <Box textAlign="center">
                    <Typography variant="h5" fontWeight={900}>
                      {profile.fullName || profile.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      @{profile.username} · {profile.email}
                    </Typography>
                  </Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    justifyContent="center"
                    useFlexGap
                  >
                    <Chip label={planName} color="primary" />
                    <Chip label={`${activeDevices} thiết bị đang hoạt động`} variant="outlined" />
                  </Stack>
                </Stack>
              </Paper>

              <Card sx={softCardSx}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="overline" color="text.secondary">
                          Gói của bạn
                        </Typography>
                        <Typography variant="h5" fontWeight={900}>
                          {planName}
                        </Typography>
                      </Box>
                      {!d.currentSubscription && (
                        <Button variant="contained" component={Link} href="/pricing">
                          Nâng cấp
                        </Button>
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {d.currentSubscription?.plan?.description ??
                        "Mở khóa trải nghiệm xem phim không quảng cáo, chất lượng cao và nhiều thiết bị hơn."}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={d.currentSubscription ? Math.min(100, d.premiumDays * 3.33) : 0}
                      sx={{ height: 8, borderRadius: 99 }}
                    />
                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Còn lại
                        </Typography>
                        <Typography fontWeight={800}>{d.premiumDays} ngày</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Gia hạn
                        </Typography>
                        <Typography fontWeight={800}>
                          {d.currentSubscription?.autoRenew ? "Đang bật" : "Đang tắt"}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Button
                      variant="outlined"
                      disabled={!d.currentSubscription}
                      onClick={d.toggleAutoRenew}
                    >
                      {d.currentSubscription?.autoRenew
                        ? "Tắt tự động gia hạn"
                        : "Bật tự động gia hạn"}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          <Grid item xs={12} lg={8} xl={8.5}>
            <Paper sx={{ ...cardSx, overflow: "hidden" }}>
              <Box sx={{ p: { xs: 2.5, md: 3.5 }, borderBottom: 1, borderColor: "divider" }}>
                <Typography variant="overline" color="text.secondary">
                  Không gian điều khiển
                </Typography>
                <Typography variant="h4" fontWeight={950} sx={{ mt: 0.5 }}>
                  Tài khoản, bảo mật và trải nghiệm xem
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 720 }}>
                  Các thiết lập được gom theo từng nhóm chức năng để dễ quét mắt hơn, không tách
                  thành quá nhiều card rời rạc.
                </Typography>
              </Box>

              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "rgba(255,255,255,0.07)",
                  px: { xs: 1.5, md: 2.5 },
                }}
              >
                <Tabs
                  value={profileTab}
                  onChange={(_, value) => setProfileTab(value)}
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="Nhóm cài đặt hồ sơ"
                  sx={{
                    "& .MuiTab-root": {
                      minHeight: 58,
                      fontWeight: 900,
                      textTransform: "none",
                    },
                  }}
                >
                  <Tab label="Thông tin tài khoản" id="profile-tab-account" />
                  <Tab label="Bảo mật" id="profile-tab-security" />
                  <Tab label="Thông báo" id="profile-tab-notifications" />
                  <Tab label="Đăng ký" id="profile-tab-subscription" />
                </Tabs>
              </Box>

              <Grid container>
                <Grid
                  item
                  xs={12}
                  md={12}
                  sx={{
                    display: profileTab === 0 ? "block" : "none",
                    p: { xs: 2.5, md: 3 },
                    borderBottom: 1,
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Typography variant="h5" fontWeight={900}>
                        Danh tính hiển thị
                      </Typography>
                    </Box>
                    <EditRounded color="primary" />
                  </Stack>
                  <AccountProfileForm
                    username={profile.username ?? ""}
                    email={profile.email}
                    initialFullName={d.fullName}
                    onSave={d.saveProfile}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{
                    display: profileTab === 1 ? "block" : "none",
                    p: { xs: 2.5, md: 3 },
                    borderBottom: 1,
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                >
                  <Typography variant="h5" fontWeight={900} gutterBottom>
                    Thay đổi email
                  </Typography>
                  <EmailChangeForm
                    step={d.emailStep}
                    onStart={d.startEmailChange}
                    onVerifyCurrent={d.verifyCurrentEmail}
                    onVerifyNew={d.verifyNewEmail}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{
                    display: profileTab === 1 ? "block" : "none",
                    p: { xs: 2.5, md: 3 },
                    borderBottom: 1,
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                >
                  <Typography variant="h5" fontWeight={900} gutterBottom>
                    Đổi mật khẩu
                  </Typography>
                  <PasswordChangeForm onPasswordChanged={handlePasswordChanged} />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sx={{
                    display: profileTab === 2 ? "block" : "none",
                    p: { xs: 2.5, md: 3 },
                    borderBottom: 1,
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                >
                  <Typography variant="h5" fontWeight={900} gutterBottom>
                    Thông báo đẩy
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Nhận thông báo ngay trên thiết bị khi có phim mới, ưu đãi hoặc hoạt động tài
                    khoản - kể cả khi bạn không mở ứng dụng.
                  </Typography>
                  <PushNotificationSettings />
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{
                    display: profileTab === 1 ? "block" : "none",
                    p: { xs: 2.5, md: 3 },
                    boxShadow: { md: "inset -1px 0 rgba(255,255,255,0.06)" },
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Typography variant="h5" fontWeight={900}>
                        Thiết bị đã đăng nhập
                      </Typography>
                    </Box>
                    <Chip label={`${d.sessions.length} thiết bị`} variant="outlined" />
                  </Stack>
                  {d.sessions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Chưa có thiết bị nào.
                    </Typography>
                  ) : (
                    <List
                      disablePadding
                      sx={{
                        maxHeight: 226,
                        overflowY: d.sessions.length > 3 ? "auto" : "visible",
                        pr: d.sessions.length > 3 ? 0.75 : 0,
                        mr: d.sessions.length > 3 ? -0.75 : 0,
                        scrollbarWidth: "thin",
                        scrollbarColor: "rgba(244,180,0,0.55) rgba(255,255,255,0.06)",
                        "&::-webkit-scrollbar": { width: 7 },
                        "&::-webkit-scrollbar-track": {
                          bgcolor: "rgba(255,255,255,0.06)",
                          borderRadius: 99,
                        },
                        "&::-webkit-scrollbar-thumb": {
                          bgcolor: "rgba(244,180,0,0.55)",
                          borderRadius: 99,
                        },
                      }}
                    >
                      {d.sessions.map((session) => (
                        <ListItemButton
                          key={session.id}
                          onClick={() => d.setSelectedSession(session)}
                          sx={{ borderRadius: 1.5, mb: 0.5 }}
                        >
                          <ListItemIcon sx={{ minWidth: 42 }}>
                            {getDeviceIcon(session.deviceType)}
                          </ListItemIcon>
                          <ListItemText
                            primary={session.deviceName}
                            secondary={`${session.deviceType} · ${session.ipAddress ? (d.sessionLocations[session.ipAddress] ?? sessionStatus(session)) : sessionStatus(session)}`}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  )}
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={12}
                  sx={{ display: profileTab === 3 ? "block" : "none", p: { xs: 2.5, md: 3 } }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Typography variant="h5" fontWeight={900}>
                        Gói đã đăng ký
                      </Typography>
                    </Box>
                    <Chip label={`${d.payments.length} thanh toán`} variant="outlined" />
                  </Stack>
                  {d.history.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Chưa có giao dịch nào.
                    </Typography>
                  ) : (
                    <Stack spacing={2}>
                      <Grid container spacing={1.5}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Đã thanh toán
                          </Typography>
                          <Typography fontWeight={900}>{formatCurrency(totalPaid)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Hóa đơn gần nhất
                          </Typography>
                          <Typography fontWeight={900}>
                            {latestInvoice?.invoiceNumber ?? "Chưa có"}
                          </Typography>
                        </Grid>
                      </Grid>
                      <List
                        disablePadding
                        sx={{
                          maxHeight: 292,
                          overflowY: "auto",
                          pr: 0.75,
                          mr: -0.75,
                          scrollbarWidth: "thin",
                          scrollbarColor: "rgba(244,180,0,0.55) rgba(255,255,255,0.06)",
                          "&::-webkit-scrollbar": { width: 7 },
                          "&::-webkit-scrollbar-track": {
                            bgcolor: "rgba(255,255,255,0.06)",
                            borderRadius: 99,
                          },
                          "&::-webkit-scrollbar-thumb": {
                            bgcolor: "rgba(244,180,0,0.55)",
                            borderRadius: 99,
                          },
                        }}
                      >
                        {d.history.map((item) => {
                          const payment = findPaymentForSubscription(d.payments, item);
                          const subscriptionMeta = getSubscriptionStatusMeta(item.status);
                          const paymentMeta = getPaymentStatusMeta(payment?.status);
                          return (
                            <ListItemButton
                              key={item.id}
                              onClick={() => d.setSelectedSubscription(item)}
                              sx={{
                                borderRadius: 1.5,
                                mb: 0.75,
                                alignItems: "stretch",
                                flexDirection: { xs: "column", sm: "row" },
                                gap: { xs: 1.25, sm: 2 },
                                py: { xs: 1.35, sm: 1 },
                              }}
                            >
                              <ListItemText
                                primary={item.plan?.name ?? `Gói #${item.planId}`}
                                secondary={`${getSubscriptionAmountLabel(item, payment)} · ${formatDate(item.startAt)}`}
                                sx={{
                                  minWidth: 0,
                                  m: 0,
                                  flex: 1,
                                  "& .MuiListItemText-primary": {
                                    fontWeight: 800,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  },
                                  "& .MuiListItemText-secondary": {
                                    overflowWrap: "anywhere",
                                  },
                                }}
                              />
                              <Stack
                                direction="row"
                                spacing={0.75}
                                useFlexGap
                                flexWrap="wrap"
                                justifyContent={{ xs: "flex-start", sm: "flex-end" }}
                                alignItems="center"
                                sx={{
                                  flexShrink: 0,
                                  maxWidth: { xs: "100%", sm: "52%" },
                                  "& .MuiChip-root": {
                                    maxWidth: "100%",
                                  },
                                  "& .MuiChip-label": {
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  },
                                }}
                              >
                                <Chip
                                  size="small"
                                  color={subscriptionMeta.color}
                                  label={subscriptionMeta.label}
                                  variant="outlined"
                                />
                                {payment && (
                                  <Chip
                                    size="small"
                                    color={paymentMeta.color}
                                    label={paymentMeta.label}
                                  />
                                )}
                              </Stack>
                            </ListItemButton>
                          );
                        })}
                      </List>
                    </Stack>
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <Dialog
          open={!!d.crop}
          onClose={() => !d.avatarUploading && d.setCrop(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            Chỉnh ảnh đại diện
            <IconButton size="small" disabled={d.avatarUploading} onClick={() => d.setCrop(null)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ display: "flex", justifyContent: "center" }}>
            {d.crop && (
              <Stack spacing={3} alignItems="center" sx={{ width: "100%" }}>
                <Box
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    d.updateCrop({ isDragging: true });
                  }}
                  onPointerMove={(e) => d.moveCrop(e.movementX, e.movementY)}
                  onPointerUp={(e) => {
                    e.currentTarget.releasePointerCapture(e.pointerId);
                    d.updateCrop({ isDragging: false });
                  }}
                  sx={{
                    width: { xs: 280, sm: 360 },
                    height: { xs: 280, sm: 360 },
                    mx: "auto",
                    borderRadius: "50%",
                    overflow: "hidden",
                    position: "relative",
                    cursor: d.crop.isDragging ? "grabbing" : "grab",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow:
                      "0 0 0 999px rgba(0,0,0,0.08), inset 0 0 0 2px rgba(255,255,255,0.22)",
                  }}
                >
                  <Box
                    component="img"
                    src={d.crop.previewUrl}
                    alt="Avatar preview"
                    draggable={false}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: `translate(${d.crop.offsetX}px, ${d.crop.offsetY}px) scale(${d.crop.zoom})`,
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={700} gutterBottom>
                    Thu phóng
                  </Typography>
                  <Slider
                    min={1}
                    max={2.5}
                    step={0.05}
                    value={d.crop.zoom}
                    onChange={(_, value) => d.updateCrop({ zoom: Number(value) })}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Kéo ảnh để căn mặt vào giữa khung tròn, sau đó lưu ảnh.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1.25} justifyContent="center">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={d.uploadCroppedAvatar}
                    disabled={d.avatarUploading}
                    sx={{ minWidth: 96 }}
                  >
                    {d.avatarUploading ? "Đang lưu..." : "Lưu"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={d.avatarUploading}
                    onClick={() => d.setCrop(null)}
                    sx={{ minWidth: 88 }}
                  >
                    Hủy
                  </Button>
                </Stack>
              </Stack>
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!d.selectedSubscription}
          onClose={() => d.setSelectedSubscription(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            Chi tiết gói đăng ký
            <IconButton size="small" onClick={() => d.setSelectedSubscription(null)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {d.selectedSubscription && (
              <Stack spacing={3}>
                {(() => {
                  const selectedSubscription = d.selectedSubscription!;
                  const payment = findPaymentForSubscription(d.payments, selectedSubscription);
                  const invoice = payment
                    ? d.invoices.find((entry) => entry.paymentTransactionId === payment.id)
                    : undefined;
                  const plan = selectedSubscription.plan;
                  const subscriptionMeta = getSubscriptionStatusMeta(selectedSubscription.status);
                  const paymentMeta = getPaymentStatusMeta(payment?.status);
                  const allowVerify = canVerifyPendingPayment(payment);
                  return (
                    <>
                      <Box>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          flexWrap="wrap"
                          sx={{ mb: 1 }}
                        >
                          <Chip
                            size="small"
                            color={subscriptionMeta.color}
                            label={subscriptionMeta.label}
                            variant="outlined"
                          />
                          {payment && (
                            <Chip
                              size="small"
                              color={paymentMeta.color}
                              label={paymentMeta.label}
                            />
                          )}
                        </Stack>
                        <Typography variant="h5" fontWeight={950}>
                          {plan?.name ?? `Gói #${selectedSubscription.planId}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {plan?.description ?? "Không có mô tả gói từ hệ thống."}
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        {[
                          ["Giá gói", getSubscriptionAmountLabel(selectedSubscription, payment)],
                          ["Chất lượng", plan?.videoQuality ?? "Chưa có"],
                          ["Thiết bị", plan ? `${plan.maxDevices} thiết bị` : "Chưa có"],
                          ["Không quảng cáo", plan?.hasAdsFree ? "Có" : "Không"],
                          ["Ngày bắt đầu", formatDate(selectedSubscription.startAt)],
                          ["Ngày kết thúc", formatDate(selectedSubscription.endAt)],
                          ["Tự động gia hạn", selectedSubscription.autoRenew ? "Có" : "Không"],
                          ["Phương thức", payment?.paymentMethod ?? "Chưa có"],
                          [
                            "Mã thanh toán",
                            payment?.providerTransactionId ??
                              (payment ? `#${payment.id}` : "Chưa có"),
                          ],
                          ["Trạng thái gói", subscriptionMeta.label],
                          ["Trạng thái thanh toán", paymentMeta.label],
                          ["Hóa đơn", invoice?.invoiceNumber ?? "Chưa có"],
                          ["Ngày xuất hóa đơn", formatDate(invoice?.issuedAt)],
                        ].map(([label, value]) => (
                          <Grid item xs={12} sm={6} key={String(label)}>
                            <Typography variant="caption" color="text.secondary">
                              {label}
                            </Typography>
                            <Typography variant="body1" fontWeight={700}>
                              {value}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                      {payment?.status === "PENDING" && (
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1.5}
                          alignItems={{ xs: "stretch", sm: "center" }}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: 1,
                            borderColor: "rgba(244,180,0,0.35)",
                            background:
                              "linear-gradient(135deg, rgba(244,180,0,0.14), rgba(200,16,46,0.08))",
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight={900}>
                              Thanh toán đang chờ xác nhận
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Nếu bạn đã thanh toán trên PayOS, bấm kiểm tra lại để đồng bộ trạng
                              thái mới nhất từ backend.
                            </Typography>
                          </Box>
                          <Button
                            id="profile-verify-pending-payment"
                            variant="contained"
                            color="warning"
                            startIcon={<RefreshRounded />}
                            disabled={
                              !allowVerify || d.verifyingOrderCode === payment.providerTransactionId
                            }
                            onClick={() => {
                              if (allowVerify) {
                                d.verifyPendingPayment(payment.providerTransactionId!);
                              }
                            }}
                            sx={{ fontWeight: 900, whiteSpace: "nowrap" }}
                          >
                            {d.verifyingOrderCode === payment.providerTransactionId
                              ? "Đang kiểm tra..."
                              : "Kiểm tra lại"}
                          </Button>
                        </Stack>
                      )}
                    </>
                  );
                })()}
              </Stack>
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!d.selectedSession}
          onClose={() => d.setSelectedSession(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            Chi tiết thiết bị
            <IconButton size="small" onClick={() => d.setSelectedSession(null)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {d.selectedSession && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {d.selectedSession.deviceName}
                  </Typography>
                  <Chip
                    label={sessionStatus(d.selectedSession)}
                    color={d.selectedSession.isRevoked ? "error" : "success"}
                  />
                </Box>
                <Grid container spacing={2}>
                  {[
                    ["Loại thiết bị", d.selectedSession.deviceType],
                    ["Địa chỉ IP", d.selectedSession.ipAddress],
                    [
                      "Vị trí",
                      d.selectedSession.ipAddress
                        ? (d.sessionLocations[d.selectedSession.ipAddress] ?? "Đang xác định")
                        : "Không rõ",
                    ],
                    ["Tạo lúc", formatDate(d.selectedSession.createdAt)],
                    ["Hoạt động cuối", formatDate(d.selectedSession.lastActiveAt)],
                  ].map(([label, value]) => (
                    <Grid item xs={6} key={String(label)}>
                      <Typography variant="caption" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {value}
                      </Typography>
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      User Agent
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                      {d.selectedSession.userAgent || "Không rõ"}
                    </Typography>
                  </Grid>
                </Grid>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={() => {
                    d.revokeSession(d.selectedSession!.id);
                    d.setSelectedSession(null);
                  }}
                  disabled={d.selectedSession.isRevoked}
                >
                  Thu hồi quyền truy cập
                </Button>
              </Stack>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}
