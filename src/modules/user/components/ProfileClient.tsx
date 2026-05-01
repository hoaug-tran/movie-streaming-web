"use client";

import Link from "next/link";
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
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  CameraAlt,
  Close as CloseIcon,
  Computer as DesktopIcon,
  EditRounded,
  PhoneAndroid as MobileIcon,
  Tablet as TabletIcon,
} from "@mui/icons-material";
import {
  AutoplayMode,
  formatDate,
  sessionStatus,
  subtitleLabels,
  SubtitleLanguage,
  useProfileData,
} from "./useProfileData";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

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

export function ProfileClient() {
  const d = useProfileData();

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
        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} lg={4} xl={3.5}>
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

              <Grid container>
                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    boxShadow: { md: "inset -1px 0 rgba(255,255,255,0.06)" },
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
                      <Typography variant="overline" color="text.secondary">
                        Thông tin tài khoản
                      </Typography>
                      <Typography variant="h5" fontWeight={900}>
                        Danh tính hiển thị
                      </Typography>
                    </Box>
                    <EditRounded color="primary" />
                  </Stack>
                  <Stack spacing={2}>
                    <TextField
                      label="Username"
                      value={profile.username ?? ""}
                      disabled
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Tên hiển thị"
                      value={d.fullName}
                      onChange={(e) => d.setFullName(e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Email"
                      value={profile.email}
                      disabled
                      fullWidth
                      size="small"
                    />
                    <Button
                      variant="contained"
                      onClick={d.saveProfile}
                      sx={{ alignSelf: "flex-start" }}
                    >
                      Lưu thay đổi
                    </Button>
                  </Stack>
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderBottom: 1,
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                >
                  <Typography variant="overline" color="text.secondary">
                    Bảo mật
                  </Typography>
                  <Typography variant="h5" fontWeight={900} gutterBottom>
                    Thay đổi email
                  </Typography>
                  {d.emailStep === "idle" && (
                    <Stack spacing={2}>
                      <Typography variant="body2" color="text.secondary">
                        Nhập email mới để nhận mã xác nhận hai bước.
                      </Typography>
                      <TextField
                        size="small"
                        placeholder="Email mới"
                        value={d.newEmail}
                        onChange={(e) => d.setNewEmail(e.target.value)}
                        fullWidth
                      />
                      <Button
                        variant="contained"
                        onClick={d.startEmailChange}
                        disabled={!d.newEmail}
                      >
                        Gửi mã
                      </Button>
                    </Stack>
                  )}
                  {d.emailStep === "current" && (
                    <Stack spacing={2}>
                      <Typography variant="body2" color="text.secondary">
                        Nhập mã xác nhận từ email hiện tại.
                      </Typography>
                      <TextField
                        size="small"
                        placeholder="OTP email hiện tại"
                        value={d.currentOtp}
                        onChange={(e) => d.setCurrentOtp(e.target.value)}
                        fullWidth
                      />
                      <Button variant="contained" onClick={d.verifyCurrentEmail}>
                        Xác nhận
                      </Button>
                    </Stack>
                  )}
                  {d.emailStep === "new" && (
                    <Stack spacing={2}>
                      <Typography variant="body2" color="text.secondary">
                        Nhập mã xác nhận từ email mới.
                      </Typography>
                      <TextField
                        size="small"
                        placeholder="OTP email mới"
                        value={d.newOtp}
                        onChange={(e) => d.setNewOtp(e.target.value)}
                        fullWidth
                      />
                      <Button variant="contained" onClick={d.verifyNewEmail}>
                        Hoàn tất
                      </Button>
                    </Stack>
                  )}
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    boxShadow: { md: "inset -1px 0 rgba(255,255,255,0.06)" },
                    borderBottom: 1,
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                >
                  <Typography variant="overline" color="text.secondary">
                    Trải nghiệm xem
                  </Typography>
                  <Typography variant="h5" fontWeight={900} gutterBottom>
                    Tùy chỉnh phát phim
                  </Typography>
                  <Stack spacing={2.5} sx={{ mt: 2 }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Phụ đề mặc định</InputLabel>
                      <Select
                        value={d.settings.subtitleLanguage}
                        label="Phụ đề mặc định"
                        onChange={(e) =>
                          d.saveSettings({
                            ...d.settings,
                            subtitleLanguage: e.target.value as SubtitleLanguage,
                          })
                        }
                      >
                        {Object.entries(subtitleLabels).map(([k, v]) => (
                          <MenuItem key={k} value={k}>
                            {v}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Tự động phát tập tiếp</InputLabel>
                      <Select
                        value={d.settings.autoplay}
                        label="Tự động phát tập tiếp"
                        onChange={(e) =>
                          d.saveSettings({
                            ...d.settings,
                            autoplay: e.target.value as AutoplayMode,
                          })
                        }
                      >
                        <MenuItem value="next">Bật</MenuItem>
                        <MenuItem value="off">Tắt</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={d.settings.matureContent}
                          onChange={(e) =>
                            d.saveSettings({ ...d.settings, matureContent: e.target.checked })
                          }
                        />
                      }
                      label="Hiển thị nội dung 18+"
                    />
                  </Stack>
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderBottom: 1,
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                >
                  <Typography variant="overline" color="text.secondary">
                    Thông báo email
                  </Typography>
                  <Typography variant="h5" fontWeight={900} gutterBottom>
                    Nhịp phim của bạn
                  </Typography>
                  <Stack spacing={1}>
                    {[
                      ["releaseDigest", "Phim mới", "Thông báo khi có phim phù hợp"],
                      ["newsletter", "Tin tức và ưu đãi", "Cập nhật tính năng mới"],
                      ["securityAlerts", "Cảnh báo bảo mật", "Đăng nhập và hoạt động bất thường"],
                    ].map(([key, title, desc], index) => (
                      <Box key={key}>
                        {index > 0 && (
                          <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.07)" }} />
                        )}
                        <FormControlLabel
                          control={
                            <Switch
                              checked={Boolean(d.settings[key as keyof typeof d.settings])}
                              onChange={(e) =>
                                d.saveSettings({ ...d.settings, [key]: e.target.checked })
                              }
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight={700}>
                                {title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {desc}
                              </Typography>
                            </Box>
                          }
                        />
                      </Box>
                    ))}
                  </Stack>
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{
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
                      <Typography variant="overline" color="text.secondary">
                        Bảo mật
                      </Typography>
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
                    <List disablePadding>
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

                <Grid item xs={12} md={6} sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Typography variant="overline" color="text.secondary">
                        Lịch sử thanh toán
                      </Typography>
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
                      <List disablePadding>
                        {d.history.map((item) => {
                          const payment = d.payments.find(
                            (entry) => entry.subscriptionId === item.id
                          );
                          return (
                            <ListItemButton
                              key={item.id}
                              onClick={() => d.setSelectedSubscription(item)}
                              sx={{ borderRadius: 1.5, mb: 0.5 }}
                            >
                              <ListItemText
                                primary={item.plan?.name ?? `Gói #${item.planId}`}
                                secondary={`${payment ? formatCurrency(Number(payment.amount)) : item.status} · ${formatDate(item.startAt)}`}
                              />
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

        <Dialog open={!!d.crop} onClose={() => d.setCrop(null)} maxWidth="sm" fullWidth>
          <DialogTitle
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            Chỉnh ảnh đại diện
            <IconButton size="small" onClick={() => d.setCrop(null)}>
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
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button variant="contained" fullWidth onClick={d.uploadCroppedAvatar}>
                    Lưu ảnh đại diện
                  </Button>
                  <Button variant="outlined" fullWidth onClick={() => d.setCrop(null)}>
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
                  const payment = d.payments.find(
                    (entry) => entry.subscriptionId === d.selectedSubscription!.id
                  );
                  const invoice = payment
                    ? d.invoices.find((entry) => entry.paymentTransactionId === payment.id)
                    : undefined;
                  const plan = d.selectedSubscription!.plan;
                  return (
                    <>
                      <Box>
                        <Typography variant="overline" color="text.secondary">
                          {d.selectedSubscription!.status}
                        </Typography>
                        <Typography variant="h5" fontWeight={950}>
                          {plan?.name ?? `Gói #${d.selectedSubscription!.planId}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {plan?.description ?? "Không có mô tả gói từ hệ thống."}
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        {[
                          [
                            "Giá gói",
                            plan
                              ? formatCurrency(plan.price)
                              : payment
                                ? formatCurrency(Number(payment.amount))
                                : "Chưa có",
                          ],
                          ["Chất lượng", plan?.videoQuality ?? "Chưa có"],
                          ["Thiết bị", plan ? `${plan.maxDevices} thiết bị` : "Chưa có"],
                          ["Không quảng cáo", plan?.hasAdsFree ? "Có" : "Không"],
                          ["Ngày bắt đầu", formatDate(d.selectedSubscription!.startAt)],
                          ["Ngày kết thúc", formatDate(d.selectedSubscription!.endAt)],
                          ["Tự động gia hạn", d.selectedSubscription!.autoRenew ? "Có" : "Không"],
                          ["Phương thức", payment?.paymentMethod ?? "Chưa có"],
                          [
                            "Mã thanh toán",
                            payment?.providerTransactionId ??
                              (payment ? `#${payment.id}` : "Chưa có"),
                          ],
                          ["Trạng thái thanh toán", payment?.status ?? "Chưa có"],
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
