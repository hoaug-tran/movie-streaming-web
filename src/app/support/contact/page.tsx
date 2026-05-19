"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Breadcrumbs,
  Link as MuiLink,
  TextField,
  MenuItem,
  Button,
  alpha,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import NextLink from "next/link";
import {
  ChevronRight,
  Mail,
  MessageCircle,
  Send,
  Github,
  Facebook,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Footer } from "@/components/Layout/Footer";
import { supportService, type SupportTopic } from "@/services/support-service";

const TOPICS: { value: SupportTopic; label: string }[] = [
  { value: "account", label: "Tài khoản & đăng nhập" },
  { value: "billing", label: "Thanh toán & gói cước" },
  { value: "playback", label: "Trình phát & chất lượng" },
  { value: "bug", label: "Báo lỗi kỹ thuật" },
  { value: "partnership", label: "Hợp tác nội dung" },
  { value: "other", label: "Khác" },
];

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    label: "Email quản trị viên",
    value: "hi@trkhoang.com",
    href: "mailto:hi@trkhoang.com",
    description: "Trả lời trong 24 giờ làm việc",
  },
  {
    icon: ShieldCheck,
    label: "Email dự phòng",
    value: "hoaug@duck.com",
    href: "mailto:hoaug@duck.com",
    description: "Dùng khi email chính chưa phản hồi",
  },
  {
    icon: MessageCircle,
    label: "Cộng đồng Facebook",
    value: "facebook.com/hoaugtr",
    href: "https://www.facebook.com/hoaugtr/",
    description: "Cập nhật nhanh và mẹo dùng hằng tuần",
  },
  {
    icon: Github,
    label: "Báo lỗi kỹ thuật",
    value: "github.com/hoaug-tran",
    href: "https://github.com/hoaug-tran",
    description: "Mở issue chi tiết kèm log/screenshot",
  },
];

const PROMISES = [
  {
    icon: Clock,
    title: "Phản hồi trong 24 giờ",
    description: "Mỗi yêu cầu đều có người phụ trách kèm số ticket để theo dõi.",
  },
  {
    icon: ShieldCheck,
    title: "Bảo mật thông tin",
    description: "Nội dung trao đổi được mã hoá và chỉ truy cập bởi đội vận hành.",
  },
  {
    icon: CheckCircle2,
    title: "Theo sát đến khi xong",
    description: "Chúng tôi không khép ticket cho đến khi bạn xác nhận hài lòng.",
  },
];

export default function ContactPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "account" as SupportTopic,
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: keyof typeof form): React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> =>
    (event) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError("Vui lòng điền đầy đủ tên, email, tiêu đề và nội dung.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await supportService.submitContact({
        name: form.name.trim(),
        email: form.email.trim(),
        topic: form.topic,
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSuccessInfo(
        `Đã gửi tới quản trị viên. Mã ticket ${response.ticketId} - bạn sẽ nhận phản hồi qua email ${form.email.trim()}.`
      );
      setForm({ name: "", email: "", topic: "account", subject: "", message: "" });
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Không gửi được yêu cầu. Vui lòng thử lại sau.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
      <Box
        sx={{
          position: "relative",
          pt: { xs: 11, md: 14 },
          pb: { xs: 4, md: 6 },
          overflow: "hidden",
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: isDark
            ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`
            : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle at 14% 22%, ${alpha(theme.palette.primary.main, isDark ? 0.18 : 0.12)}, transparent 38%), radial-gradient(circle at 92% 0%, ${alpha(theme.palette.text.primary, isDark ? 0.06 : 0.04)}, transparent 35%)`,
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative" }}>
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            sx={{
              mb: 3,
              fontSize: "0.78rem",
              "& .MuiBreadcrumbs-separator": { color: "text.disabled", mx: 0.75 },
            }}
          >
            <MuiLink
              component={NextLink}
              href="/"
              sx={{
                textDecoration: "none",
                color: "text.secondary",
                fontSize: "0.78rem",
                fontWeight: 500,
                "&:hover": { color: "text.primary" },
              }}
            >
              Trang chủ
            </MuiLink>
            <MuiLink
              component={NextLink}
              href="/support"
              sx={{
                textDecoration: "none",
                color: "text.secondary",
                fontSize: "0.78rem",
                fontWeight: 500,
                "&:hover": { color: "text.primary" },
              }}
            >
              Hỗ trợ
            </MuiLink>
            <Typography sx={{ color: "text.primary", fontWeight: 600, fontSize: "0.78rem" }}>
              Liên hệ
            </Typography>
          </Breadcrumbs>

          <Stack spacing={2.5} sx={{ maxWidth: 760 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Box
                sx={{
                  width: 6,
                  height: 18,
                  backgroundColor: "primary.main",
                  borderRadius: 0.5,
                  boxShadow: `0 0 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "primary.main",
                }}
              >
                Liên hệ Gió Phim
              </Typography>
            </Box>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: "2.2rem", sm: "2.8rem", md: "3.6rem" },
                fontWeight: 950,
                letterSpacing: "-0.045em",
                lineHeight: 1.05,
                color: "text.primary",
              }}
            >
              Có chuyện gì,{" "}
              <Box component="span" sx={{ color: "primary.main", fontStyle: "italic" }}>
                chúng tôi nghe
              </Box>
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "0.95rem", md: "1.05rem" },
                color: "text.secondary",
                lineHeight: 1.7,
              }}
            >
              Yêu cầu của bạn được gửi thẳng đến hộp thư quản trị viên Gió Phim, kèm mã ticket để
              theo dõi. Cam kết phản hồi trong 24 giờ làm việc.
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 6, md: 9 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.3fr) minmax(0, 1fr)" },
            gap: { xs: 4, md: 5 },
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 2.5,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: isDark
                ? alpha(theme.palette.background.paper, 0.55)
                : theme.palette.background.paper,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "primary.main",
                mb: 1,
              }}
            >
              Form yêu cầu hỗ trợ
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "1.4rem", md: "1.75rem" },
                fontWeight: 900,
                letterSpacing: "-0.025em",
                color: "text.primary",
                mb: 3,
              }}
            >
              Mô tả vấn đề bạn đang gặp
            </Typography>

            <Stack spacing={2.5}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  label="Họ và tên"
                  required
                  value={form.name}
                  onChange={handleChange("name")}
                  variant="outlined"
                  fullWidth
                  size="small"
                  inputProps={{ maxLength: 120 }}
                />
                <TextField
                  label="Email liên hệ"
                  required
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  variant="outlined"
                  fullWidth
                  size="small"
                  inputProps={{ maxLength: 160 }}
                />
              </Box>
              <TextField
                select
                label="Chủ đề"
                value={form.topic}
                onChange={handleChange("topic")}
                fullWidth
                size="small"
              >
                {TOPICS.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Tiêu đề"
                required
                value={form.subject}
                onChange={handleChange("subject")}
                fullWidth
                size="small"
                inputProps={{ maxLength: 200 }}
              />
              <TextField
                label="Nội dung chi tiết"
                required
                value={form.message}
                onChange={handleChange("message")}
                fullWidth
                multiline
                minRows={5}
                inputProps={{ maxLength: 4000 }}
                helperText="Vui lòng đính kèm thông tin về thiết bị, trình duyệt và bước tái hiện nếu là báo lỗi."
              />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
              >
                <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                  Bằng việc gửi yêu cầu, bạn đồng ý với{" "}
                  <MuiLink
                    component={NextLink}
                    href="/legal/privacy"
                    sx={{ color: "primary.main", fontWeight: 700 }}
                  >
                    Chính sách bảo mật
                  </MuiLink>
                  .
                </Typography>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<Send size={16} />}
                  disabled={submitting}
                  sx={{
                    fontWeight: 800,
                    px: 3,
                    py: 1.2,
                    borderRadius: 1.5,
                    boxShadow: `0 14px 36px ${alpha(theme.palette.primary.main, 0.35)}`,
                    "&:hover": {
                      boxShadow: `0 18px 50px ${alpha(theme.palette.primary.main, 0.45)}`,
                    },
                  }}
                >
                  {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
                </Button>
              </Stack>
            </Stack>
          </Box>

          <Stack spacing={2}>
            {CONTACT_CHANNELS.map((channel) => (
              <Box
                key={channel.label}
                component="a"
                href={channel.href}
                target={channel.href.startsWith("http") ? "_blank" : undefined}
                rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                  p: 2.25,
                  borderRadius: 2,
                  textDecoration: "none",
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: isDark
                    ? alpha(theme.palette.background.paper, 0.5)
                    : theme.palette.background.paper,
                  transition: "border-color 0.2s, transform 0.2s",
                  "&:hover": {
                    borderColor: alpha(theme.palette.primary.main, 0.4),
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 1.25,
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    color: "primary.main",
                    backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.14 : 0.08),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                  }}
                >
                  <channel.icon size={18} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "text.secondary",
                      mb: 0.25,
                    }}
                  >
                    {channel.label}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.95rem" }}>
                    {channel.value}
                  </Typography>
                  <Typography sx={{ fontSize: "0.82rem", color: "text.secondary", mt: 0.25 }}>
                    {channel.description}
                  </Typography>
                </Box>
              </Box>
            ))}

            <Box
              sx={{
                mt: 1,
                p: 2.5,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.06 : 0.04),
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    color: "primary.main",
                    backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.12),
                  }}
                >
                  <Facebook size={15} />
                </Box>
                <Typography sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.95rem" }}>
                  Theo dõi đội ngũ
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", lineHeight: 1.7 }}>
                Cập nhật tính năng mới, phim hot và lịch bảo trì qua Facebook
                <Box component="span" sx={{ color: "primary.main", fontWeight: 700 }}>
                  {" "}
                  @hoaugtr
                </Box>{" "}
                và GitHub{" "}
                <Box component="span" sx={{ color: "primary.main", fontWeight: 700 }}>
                  hoaug-tran
                </Box>
                .
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            mt: { xs: 5, md: 7 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {PROMISES.map((p) => (
            <Box
              key={p.title}
              sx={{
                p: 2.75,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: isDark
                  ? alpha(theme.palette.background.paper, 0.5)
                  : theme.palette.background.paper,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.25 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 1,
                    display: "grid",
                    placeItems: "center",
                    color: "primary.main",
                    backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.14 : 0.08),
                  }}
                >
                  <p.icon size={16} />
                </Box>
                <Typography sx={{ fontWeight: 800, color: "text.primary" }}>{p.title}</Typography>
              </Stack>
              <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", lineHeight: 1.65 }}>
                {p.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>

      <Footer />

      <Snackbar
        open={Boolean(successInfo)}
        autoHideDuration={6000}
        onClose={() => setSuccessInfo(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessInfo(null)}
          severity="success"
          sx={{ width: "100%", fontWeight: 600 }}
        >
          {successInfo}
        </Alert>
      </Snackbar>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="warning"
          sx={{ width: "100%", fontWeight: 600 }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
