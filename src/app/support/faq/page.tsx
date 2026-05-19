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
  Collapse,
  ButtonBase,
} from "@mui/material";
import NextLink from "next/link";
import { ChevronDown, ChevronRight, Search, HelpCircle, Sparkles } from "lucide-react";
import { Footer } from "@/components/Layout/Footer";

type FaqCategoryId =
  | "account"
  | "library"
  | "pwa"
  | "billing"
  | "playback"
  | "security"
  | "personalize"
  | "notifications"
  | "shortcuts";

type Faq = {
  id: string;
  category: FaqCategoryId;
  question: string;
  answer: React.ReactNode;
};

const CATEGORY_LABEL: Record<FaqCategoryId, string> = {
  account: "Tài khoản",
  library: "Thư viện cá nhân",
  pwa: "Ngoại tuyến & PWA",
  billing: "Thanh toán",
  playback: "Trình phát",
  security: "Bảo mật",
  personalize: "Cá nhân hoá",
  notifications: "Thông báo",
  shortcuts: "Phím tắt",
};

const FAQS: Faq[] = [
  {
    id: "account-register",
    category: "account",
    question: "Tôi đăng ký tài khoản Gió Phim như thế nào?",
    answer: (
      <>
        Bấm <strong>Đăng nhập</strong> ở góc phải, chọn <strong>Tạo tài khoản</strong>, nhập email
        rồi xác nhận mã OTP gửi qua hộp thư. Sau khi đặt mật khẩu, bạn có thể bắt đầu xem ngay với
        gói Free.
      </>
    ),
  },
  {
    id: "account-recover",
    category: "account",
    question: "Quên mật khẩu thì khôi phục thế nào?",
    answer: (
      <>
        Vào trang <strong>Đăng nhập</strong> &gt; <strong>Quên mật khẩu</strong>, nhập email tài
        khoản. Hệ thống gửi liên kết đặt lại mật khẩu trong vòng 5 phút. Liên kết hết hạn sau 30
        phút và chỉ dùng được một lần.
      </>
    ),
  },
  {
    id: "library-watchlist",
    category: "library",
    question: "Sự khác nhau giữa Xem sau và Yêu thích?",
    answer: (
      <>
        <strong>Xem sau</strong> là hàng đợi phim bạn dự định xem, có thể sắp xếp theo thứ tự.{" "}
        <strong>Yêu thích</strong> là các phim bạn đánh dấu đã thích và là tín hiệu giúp đề xuất
        chính xác hơn.
      </>
    ),
  },
  {
    id: "library-history",
    category: "library",
    question: "Lịch sử xem có giới hạn không?",
    answer: (
      <>
        Không. Bạn có thể xoá từng mục hoặc xoá toàn bộ trong <strong>Hồ sơ &gt; Lịch sử</strong>.
        Khi xoá, dữ liệu đề xuất cá nhân hoá sẽ được làm mới sau 24 giờ.
      </>
    ),
  },
  {
    id: "pwa-install",
    category: "pwa",
    question: "Cài Gió Phim như ứng dụng thế nào?",
    answer: (
      <>
        Trên Chrome/Edge, mở giophim.libsys.me, bấm biểu tượng cài đặt cạnh thanh địa chỉ. Trên iOS,
        bấm <strong>Chia sẻ &gt; Thêm vào màn hình chính</strong>. Sau khi cài, bạn có thể tải phim
        và xem khi không có mạng.
      </>
    ),
  },
  {
    id: "pwa-download",
    category: "pwa",
    question: "Phim tải về có giới hạn thời gian không?",
    answer: (
      <>
        Có. Mỗi tệp được mã hoá và tự xoá sau <strong>48 giờ</strong> kể từ khi tải xong, đảm bảo
        bản quyền. Bạn có thể tải lại bất cứ lúc nào miễn còn kết nối Internet.
      </>
    ),
  },
  {
    id: "billing-payos",
    category: "billing",
    question: "Tại sao tôi lại được điều hướng sang PayOS?",
    answer: (
      <>
        Gió Phim sử dụng PayOS cho thanh toán bằng QR code. PayOS xử lý dữ liệu thẻ và tài khoản
        ngân hàng để bảo vệ thông tin nhạy cảm. Sau khi thanh toán, gói được kích hoạt tự động.
      </>
    ),
  },
  {
    id: "billing-refund",
    category: "billing",
    question: "Tôi có thể yêu cầu hoàn tiền không?",
    answer: (
      <>
        Bạn được hoàn tiền tỉ lệ trong <strong>7 ngày</strong> đầu nếu chưa phát sinh việc xem nội
        dung Premium. Liên hệ với chúng tôi qua{" "}
        <MuiLink
          component={NextLink}
          href="/support/contact"
          sx={{ color: "primary.main", fontWeight: 700 }}
        >
          form Liên hệ
        </MuiLink>
        .
      </>
    ),
  },
  {
    id: "billing-cycle",
    category: "billing",
    question: "Gói có tự động gia hạn không?",
    answer: (
      <>
        Mặc định Gió Phim không tự trừ tiền. Khi gói sắp hết hạn, hệ thống chỉ gửi thông báo để bạn
        chủ động thanh toán mã QR mới.
      </>
    ),
  },
  {
    id: "playback-quality",
    category: "playback",
    question: "Tại sao đôi khi phim bị giảm chất lượng?",
    answer: (
      <>
        Trình phát của chúng tôi tự điều chỉnh độ phân giải theo tốc độ mạng để tránh buffer. Bạn có
        thể vào menu <strong>Cài đặt</strong> trong trình phát để khoá ở mức cố định.
      </>
    ),
  },
  {
    id: "playback-subtitle",
    category: "playback",
    question: "Tôi muốn bật phụ đề tiếng Anh thì làm sao?",
    answer: (
      <>
        Trong trình phát, mở menu <strong>Phụ đề</strong>, chọn ngôn ngữ. Hệ thống sẽ ghi nhớ lựa
        chọn cho lần xem sau cùng phim đó.
      </>
    ),
  },
  {
    id: "security-2fa",
    category: "security",
    question: "Gió Phim có hỗ trợ xác thực hai bước?",
    answer: (
      <>
        Có. Bạn có thể bật trong <strong>Hồ sơ &gt; Bảo mật</strong>. Khi đăng nhập từ thiết bị mới,
        hệ thống yêu cầu mã OTP gửi qua email.
      </>
    ),
  },
  {
    id: "security-devices",
    category: "security",
    question: "Quản lý thiết bị tin cậy ở đâu?",
    answer: (
      <>
        Vào <strong>Hồ sơ &gt; Thiết bị</strong> để xem danh sách phiên đang hoạt động. Nhấn{" "}
        <strong>Đăng xuất</strong> để chấm dứt phiên trên thiết bị bất kỳ.
      </>
    ),
  },
  {
    id: "personalize-genre",
    category: "personalize",
    question: "Làm sao để Gió Phim đề xuất chuẩn hơn?",
    answer: (
      <>
        Hãy thêm phim vào <strong>Yêu thích</strong>, chấm điểm và đánh dấu đã xem. Bạn cũng có thể
        chỉnh thể loại quan tâm trong <strong>Hồ sơ &gt; Sở thích</strong>.
      </>
    ),
  },
  {
    id: "notifications-push",
    category: "notifications",
    question: "Tôi không nhận được thông báo đẩy?",
    answer: (
      <>
        Hãy kiểm tra: (1) đã cấp quyền thông báo cho trình duyệt; (2) đã bật{" "}
        <strong>Thông báo</strong> trong Hồ sơ; (3) thiết bị có cài Gió Phim như PWA. Trên iOS, push
        hoạt động khi đã thêm vào màn hình chính.
      </>
    ),
  },
  {
    id: "notifications-types",
    category: "notifications",
    question: "Tôi sẽ nhận được những loại thông báo nào?",
    answer: (
      <>
        Có 4 nhóm: phim mới phù hợp, nhắc gói sắp hết hạn, cảnh báo bảo mật và cập nhật hệ thống
        quan trọng. Bạn có thể tắt từng nhóm trong <strong>Cài đặt thông báo</strong>.
      </>
    ),
  },
  {
    id: "shortcuts-list",
    category: "shortcuts",
    question: "Phím tắt khi xem trên máy tính?",
    answer: (
      <>
        <strong>Space</strong>: phát/dừng · <strong>F</strong>: toàn màn hình · <strong>M</strong>:
        tắt tiếng · <strong>← / →</strong>: tua 5 giây · <strong>↑ / ↓</strong>: âm lượng ·{" "}
        <strong>0-9</strong>: nhảy tới phần trăm tương ứng.
      </>
    ),
  },
];

const FILTER_TABS: { id: FaqCategoryId | "all"; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "account", label: "Tài khoản" },
  { id: "library", label: "Thư viện" },
  { id: "pwa", label: "Ngoại tuyến" },
  { id: "billing", label: "Thanh toán" },
  { id: "playback", label: "Trình phát" },
  { id: "security", label: "Bảo mật" },
  { id: "personalize", label: "Cá nhân hoá" },
  { id: "notifications", label: "Thông báo" },
  { id: "shortcuts", label: "Phím tắt" },
];

export default function FaqPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [filter, setFilter] = useState<FaqCategoryId | "all">("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>("account-register");

  const filtered = useMemo(() => {
    let list = FAQS;
    if (filter !== "all") list = list.filter((f) => f.category === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((f) => f.question.toLowerCase().includes(q));
    }
    return list;
  }, [filter, query]);

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
            backgroundImage: `radial-gradient(circle at 14% 22%, ${alpha(theme.palette.primary.main, isDark ? 0.18 : 0.12)}, transparent 38%)`,
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
              Câu hỏi thường gặp
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
                Hỗ trợ · FAQ
              </Typography>
            </Box>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: "2.2rem", sm: "2.7rem", md: "3.4rem" },
                fontWeight: 950,
                letterSpacing: "-0.045em",
                lineHeight: 1.05,
                color: "text.primary",
              }}
            >
              Câu hỏi{" "}
              <Box component="span" sx={{ color: "primary.main", fontStyle: "italic" }}>
                thường gặp
              </Box>
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "0.95rem", md: "1.05rem" },
                color: "text.secondary",
                lineHeight: 1.7,
              }}
            >
              Tổng hợp những thắc mắc phổ biến nhất được người xem Gió Phim đặt ra. Lọc theo nhóm,
              hoặc gõ từ khoá để tìm nhanh đáp án.
            </Typography>

            <Box
              sx={{
                mt: 1,
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: 2,
                py: 1.25,
                borderRadius: 2,
                backgroundColor: isDark
                  ? alpha(theme.palette.background.paper, 0.7)
                  : theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                "&:focus-within": {
                  borderColor: alpha(theme.palette.primary.main, 0.45),
                },
              }}
            >
              <Search size={18} color={theme.palette.text.secondary} />
              <InputBase
                fullWidth
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm câu hỏi..."
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

      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 6, md: 9 } }}>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            mb: 4,
          }}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <ButtonBase
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                sx={{
                  px: 1.75,
                  py: 0.85,
                  borderRadius: 99,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  border: `1px solid ${isActive ? alpha(theme.palette.primary.main, 0.4) : theme.palette.divider}`,
                  color: isActive ? "primary.main" : "text.secondary",
                  backgroundColor: isActive
                    ? alpha(theme.palette.primary.main, isDark ? 0.14 : 0.08)
                    : "transparent",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: alpha(theme.palette.primary.main, 0.4),
                    color: "primary.main",
                  },
                }}
              >
                {tab.label}
              </ButtonBase>
            );
          })}
        </Box>

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
            <HelpCircle size={36} style={{ opacity: 0.5, marginBottom: 12 }} />
            <Typography sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}>
              Không tìm thấy câu hỏi phù hợp
            </Typography>
            <Typography sx={{ fontSize: "0.9rem" }}>
              Hãy thử từ khoá khác hoặc{" "}
              <MuiLink
                component={NextLink}
                href="/support/contact"
                sx={{ color: "primary.main", fontWeight: 700 }}
              >
                gửi câu hỏi cho chúng tôi
              </MuiLink>
              .
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {filtered.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <Box
                  key={faq.id}
                  id={faq.id}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${isOpen ? alpha(theme.palette.primary.main, 0.35) : theme.palette.divider}`,
                    backgroundColor: isDark
                      ? alpha(theme.palette.background.paper, 0.5)
                      : theme.palette.background.paper,
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                  }}
                >
                  <ButtonBase
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    sx={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                      px: { xs: 2, md: 2.75 },
                      py: 2.25,
                      textAlign: "left",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                      <Box
                        sx={{
                          fontSize: "0.66rem",
                          fontWeight: 800,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "primary.main",
                          backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.14 : 0.08),
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          flexShrink: 0,
                        }}
                      >
                        {CATEGORY_LABEL[faq.category]}
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: "0.95rem", md: "1.02rem" },
                          color: "text.primary",
                          lineHeight: 1.4,
                        }}
                      >
                        {faq.question}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        flexShrink: 0,
                        color: isOpen ? "primary.main" : "text.secondary",
                        transition: "transform 0.25s",
                        transform: isOpen ? "rotate(180deg)" : "none",
                      }}
                    >
                      <ChevronDown size={18} />
                    </Box>
                  </ButtonBase>
                  <Collapse in={isOpen} timeout={250} unmountOnExit>
                    <Box
                      sx={{
                        px: { xs: 2, md: 2.75 },
                        pb: 2.5,
                        pt: 0,
                        color: "text.secondary",
                        fontSize: "0.92rem",
                        lineHeight: 1.75,
                        borderTop: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Box sx={{ pt: 2 }}>{faq.answer}</Box>
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Stack>
        )}

        <Box
          sx={{
            mt: { xs: 5, md: 7 },
            p: { xs: 3, md: 3.5 },
            borderRadius: 2.5,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: isDark
              ? alpha(theme.palette.background.paper, 0.5)
              : theme.palette.background.paper,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "auto 1fr auto" },
            alignItems: "center",
            gap: 2.5,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              color: "primary.main",
              backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.14 : 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
            }}
          >
            <Sparkles size={20} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}>
              Bạn không thấy câu hỏi của mình?
            </Typography>
            <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", lineHeight: 1.7 }}>
              Hãy gửi câu hỏi cho đội ngũ Gió Phim. Câu hỏi hữu ích sẽ được tổng hợp vào FAQ trong
              các bản cập nhật tiếp theo.
            </Typography>
          </Box>
          <ButtonBase
            component={NextLink}
            href="/support/contact"
            sx={{
              px: 2.5,
              py: 1.25,
              borderRadius: 1.5,
              fontWeight: 800,
              color: "primary.contrastText",
              backgroundColor: "primary.main",
              boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.35)}`,
              "&:hover": {
                boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.45)}`,
              },
            }}
          >
            Gửi câu hỏi
          </ButtonBase>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
