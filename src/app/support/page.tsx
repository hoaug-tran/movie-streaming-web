"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Breadcrumbs,
  Link as MuiLink,
  InputBase,
  alpha,
  useTheme,
  ButtonBase,
} from "@mui/material";
import NextLink from "next/link";
import {
  Search,
  ChevronRight,
  PlayCircle,
  Download,
  CreditCard,
  ShieldCheck,
  Smartphone,
  UserCog,
  HelpCircle,
  MessageSquare,
  Activity,
  LifeBuoy,
} from "lucide-react";
import { Footer } from "@/components/Layout/Footer";

type ArticleLink = {
  title: string;
  href: string;
};

type Category = {
  icon: typeof PlayCircle;
  title: string;
  description: string;
  articles: ArticleLink[];
  accent: string;
};

const CATEGORIES: Category[] = [
  {
    icon: PlayCircle,
    title: "Bắt đầu xem phim",
    description: "Tạo tài khoản, dò tìm phim phù hợp và phát lần đầu.",
    accent: "#C8102E",
    articles: [
      { title: "Cách đăng ký tài khoản Gió Phim", href: "/support/faq#account" },
      { title: "Khám phá theo tâm trạng và thể loại", href: "/discovery" },
      { title: "Sử dụng danh sách Xem sau và Yêu thích", href: "/support/faq#library" },
    ],
  },
  {
    icon: Download,
    title: "Tải phim ngoại tuyến",
    description: "Cài đặt PWA, tải phim và xem khi không có mạng.",
    accent: "#7B2FBE",
    articles: [
      { title: "Cài Gió Phim như ứng dụng (PWA)", href: "/support/faq#pwa" },
      { title: "Cách tải phim về thiết bị", href: "/downloads" },
      { title: "Vì sao phim chỉ giữ được 48 giờ?", href: "/legal/cookies#duration" },
    ],
  },
  {
    icon: CreditCard,
    title: "Gói cước & thanh toán",
    description: "Hiểu rõ Basic, Premium, Premium Plus và quy trình PayOS.",
    accent: "#F4B400",
    articles: [
      { title: "So sánh các gói thuê bao", href: "/pricing" },
      { title: "Thanh toán bằng mã QR PayOS", href: "/support/faq#billing" },
      { title: "Yêu cầu hoàn tiền và huỷ gói", href: "/legal/terms#subscription" },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Bảo mật tài khoản",
    description: "Mật khẩu, OTP và quản lý thiết bị tin cậy.",
    accent: "#1565C0",
    articles: [
      { title: "Đặt mật khẩu mạnh và đổi định kỳ", href: "/support/faq#security" },
      { title: "Quản lý thiết bị đã đăng nhập", href: "/profile" },
      { title: "Khi nghi ngờ tài khoản bị xâm nhập", href: "/support/contact" },
    ],
  },
  {
    icon: Smartphone,
    title: "Trình phát & chất lượng",
    description: "Khắc phục giật, lag, lỗi phụ đề và độ phân giải.",
    accent: "#00897B",
    articles: [
      { title: "Tự động chọn chất lượng theo mạng", href: "/support/faq#playback-quality" },
      { title: "Bật phụ đề và đa âm thanh", href: "/support/faq#playback-subtitle" },
      { title: "Phím tắt khi xem trên máy tính", href: "/support/faq#shortcuts-list" },
    ],
  },
  {
    icon: UserCog,
    title: "Hồ sơ & cá nhân hoá",
    description: "Đổi avatar, sở thích thể loại và quyền riêng tư.",
    accent: "#E85D04",
    articles: [
      { title: "Cập nhật ảnh đại diện và tên hiển thị", href: "/profile" },
      { title: "Tinh chỉnh thể loại đề xuất", href: "/support/faq#personalize" },
      { title: "Tắt thông báo đẩy", href: "/support/faq#notifications" },
    ],
  },
];

const QUICK_LINKS = [
  {
    icon: HelpCircle,
    title: "Câu hỏi thường gặp",
    description: "Bộ câu hỏi được hỏi nhiều nhất, có giải đáp chi tiết.",
    href: "/support/faq",
  },
  {
    icon: MessageSquare,
    title: "Liên hệ chúng tôi",
    description: "Gửi yêu cầu và nhận phản hồi trong vòng 24 giờ làm việc.",
    href: "/support/contact",
  },
  {
    icon: Activity,
    title: "Trạng thái hệ thống",
    description: "Theo dõi tình trạng máy chủ, CDN và cổng thanh toán theo thời gian thực.",
    href: "/support/status",
  },
];

export default function SupportHubPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return CATEGORIES;
    const q = query.toLowerCase();
    return CATEGORIES.map((cat) => ({
      ...cat,
      articles: cat.articles.filter(
        (a) => a.title.toLowerCase().includes(q) || cat.title.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.articles.length > 0);
  }, [query]);

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
      <Box
        sx={{
          position: "relative",
          pt: { xs: 11, md: 14 },
          pb: { xs: 5, md: 8 },
          overflow: "hidden",
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: isDark
            ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`
            : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle at 14% 18%, ${alpha(theme.palette.primary.main, isDark ? 0.18 : 0.12)}, transparent 38%), radial-gradient(circle at 92% 0%, ${alpha(theme.palette.text.primary, isDark ? 0.06 : 0.04)}, transparent 35%)`,
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
            <Typography sx={{ color: "text.primary", fontWeight: 600, fontSize: "0.78rem" }}>
              Trung tâm trợ giúp
            </Typography>
          </Breadcrumbs>

          <Stack spacing={3} alignItems="center" sx={{ textAlign: "center" }}>
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
                Hỗ trợ
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
                maxWidth: 760,
              }}
            >
              Bạn cần{" "}
              <Box component="span" sx={{ color: "primary.main", fontStyle: "italic" }}>
                trợ giúp
              </Box>{" "}
              gì hôm nay?
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "0.95rem", md: "1.05rem" },
                color: "text.secondary",
                lineHeight: 1.7,
                maxWidth: 640,
              }}
            >
              Khám phá kho hướng dẫn, mẹo dùng PWA và xử lý sự cố. Mọi câu trả lời đều được biên
              soạn bởi đội ngũ Gió Phim.
            </Typography>

            <Box
              sx={{
                width: "100%",
                maxWidth: 600,
                mt: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 2.25,
                py: 1.5,
                borderRadius: 2,
                backgroundColor: isDark
                  ? alpha(theme.palette.background.paper, 0.7)
                  : theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: `0 14px 40px ${alpha(theme.palette.common.black, isDark ? 0.4 : 0.06)}`,
                transition: "border-color 0.2s, box-shadow 0.2s",
                "&:focus-within": {
                  borderColor: alpha(theme.palette.primary.main, 0.45),
                  boxShadow: `0 18px 50px ${alpha(theme.palette.primary.main, 0.18)}`,
                },
              }}
            >
              <Search size={18} color={theme.palette.text.secondary} />
              <InputBase
                fullWidth
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo từ khoá: thanh toán, ngoại tuyến, OTP..."
                sx={{
                  fontSize: "0.95rem",
                  color: "text.primary",
                  "& input::placeholder": { color: "text.secondary", opacity: 1 },
                }}
              />
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 7 }, pb: { xs: 5, md: 8 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
            mb: { xs: 5, md: 7 },
          }}
        >
          {QUICK_LINKS.map((q) => (
            <ButtonBase
              key={q.href}
              component={NextLink}
              href={q.href}
              sx={{
                display: "block",
                textAlign: "left",
                p: { xs: 2.5, md: 3 },
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: isDark
                  ? alpha(theme.palette.background.paper, 0.5)
                  : theme.palette.background.paper,
                transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  borderColor: alpha(theme.palette.primary.main, 0.4),
                  transform: "translateY(-3px)",
                  boxShadow: `0 18px 40px ${alpha(theme.palette.common.black, isDark ? 0.36 : 0.08)}`,
                },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start">
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
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  <q.icon size={20} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}>
                    {q.title}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "0.85rem", color: "text.secondary", lineHeight: 1.6 }}
                  >
                    {q.description}
                  </Typography>
                </Box>
              </Stack>
            </ButtonBase>
          ))}
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 3 }}>
          <Box>
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "primary.main",
                mb: 0.5,
              }}
            >
              Khám phá theo chủ đề
            </Typography>
            <Typography
              component="h2"
              sx={{
                fontSize: { xs: "1.5rem", md: "2rem" },
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: "text.primary",
              }}
            >
              {query ? `Kết quả cho "${query}"` : "Chọn nhóm chủ đề bạn quan tâm"}
            </Typography>
          </Box>
        </Stack>

        {filtered.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              borderRadius: 2,
              border: `1px dashed ${theme.palette.divider}`,
              color: "text.secondary",
            }}
          >
            <LifeBuoy size={40} style={{ opacity: 0.5, marginBottom: 12 }} />
            <Typography sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}>
              Chưa có bài viết phù hợp
            </Typography>
            <Typography sx={{ fontSize: "0.9rem" }}>
              Thử từ khoá khác, hoặc{" "}
              <MuiLink
                component={NextLink}
                href="/support/contact"
                sx={{ color: "primary.main", fontWeight: 700 }}
              >
                liên hệ trực tiếp với chúng tôi
              </MuiLink>
              .
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
              gap: 2.5,
            }}
          >
            {filtered.map((cat) => (
              <Box
                key={cat.title}
                sx={{
                  position: "relative",
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: isDark
                    ? alpha(theme.palette.background.paper, 0.5)
                    : theme.palette.background.paper,
                  overflow: "hidden",
                  transition: "border-color 0.2s, transform 0.2s",
                  "&:hover": {
                    borderColor: alpha(cat.accent, 0.4),
                    transform: "translateY(-2px)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at 100% 0%, ${alpha(cat.accent, isDark ? 0.16 : 0.1)}, transparent 50%)`,
                    pointerEvents: "none",
                  },
                }}
              >
                <Stack spacing={2} sx={{ position: "relative" }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 1.5,
                      display: "grid",
                      placeItems: "center",
                      color: cat.accent,
                      backgroundColor: alpha(cat.accent, isDark ? 0.16 : 0.1),
                      border: `1px solid ${alpha(cat.accent, 0.3)}`,
                    }}
                  >
                    <cat.icon size={20} />
                  </Box>

                  <Box>
                    <Typography
                      sx={{ fontWeight: 800, fontSize: "1.05rem", color: "text.primary" }}
                    >
                      {cat.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        color: "text.secondary",
                        lineHeight: 1.6,
                        mt: 0.5,
                      }}
                    >
                      {cat.description}
                    </Typography>
                  </Box>

                  <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                    {cat.articles.map((a) => (
                      <MuiLink
                        key={a.title}
                        component={NextLink}
                        href={a.href}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          px: 1.25,
                          py: 1,
                          borderRadius: 1,
                          textDecoration: "none",
                          color: "text.secondary",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          transition: "background-color 0.2s, color 0.2s",
                          "&:hover": {
                            color: "text.primary",
                            backgroundColor: alpha(cat.accent, isDark ? 0.1 : 0.06),
                          },
                        }}
                      >
                        {a.title}
                        <ChevronRight size={14} />
                      </MuiLink>
                    ))}
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Box>
        )}

        <Box
          sx={{
            mt: { xs: 6, md: 8 },
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, isDark ? 0.18 : 0.1)}, ${alpha(theme.palette.primary.main, isDark ? 0.06 : 0.04)})`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.4fr auto" },
            gap: 3,
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "primary.main",
                mb: 0.75,
              }}
            >
              Vẫn chưa tìm được câu trả lời?
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "1.25rem", md: "1.6rem" },
                fontWeight: 900,
                letterSpacing: "-0.025em",
                color: "text.primary",
                mb: 1,
              }}
            >
              Đội ngũ Gió Phim luôn sẵn sàng hỗ trợ bạn.
            </Typography>
            <Typography sx={{ color: "text.secondary", lineHeight: 1.7, fontSize: "0.92rem" }}>
              Gửi câu hỏi qua form liên hệ - chúng tôi phản hồi trong tối đa 24 giờ làm việc và miễn
              phí cho mọi tài khoản.
            </Typography>
          </Box>
          <ButtonBase
            component={NextLink}
            href="/support/contact"
            sx={{
              alignSelf: { xs: "flex-start", md: "center" },
              px: 3.25,
              py: 1.5,
              borderRadius: 1.5,
              fontWeight: 800,
              color: "primary.contrastText",
              backgroundColor: "primary.main",
              boxShadow: `0 14px 36px ${alpha(theme.palette.primary.main, 0.35)}`,
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: `0 18px 50px ${alpha(theme.palette.primary.main, 0.45)}`,
              },
            }}
          >
            Liên hệ ngay
            <ChevronRight size={18} style={{ marginLeft: 6 }} />
          </ButtonBase>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
