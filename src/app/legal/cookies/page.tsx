import type { Metadata } from "next";
import { Box, Stack, Typography } from "@mui/material";
import { Cookie } from "lucide-react";
import { InfoPageShell } from "@/components/Layout/InfoPageShell";

export const metadata: Metadata = {
  title: "Chính sách Cookie | Gió Phim",
  description:
    "Cách Gió Phim sử dụng cookie và công nghệ tương tự để cải thiện trải nghiệm xem phim, đề xuất nội dung và bảo vệ tài khoản.",
};

export default function CookiePolicyPage() {
  return (
    <InfoPageShell
      eyebrow="Pháp lý"
      title={
        <>
          Chính sách{" "}
          <Box component="span" sx={{ color: "primary.main", fontStyle: "italic" }}>
            Cookie
          </Box>
        </>
      }
      subtitle="Cookie giúp Gió Phim ghi nhớ lựa chọn xem, giữ phiên đăng nhập và đo lường hiệu năng. Tài liệu này giải thích loại cookie chúng tôi dùng và cách bạn kiểm soát chúng."
      meta="Cập nhật lần cuối: 17/05/2026"
      breadcrumbs={[{ label: "Pháp lý" }, { label: "Chính sách Cookie" }]}
      intro={
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.25,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              color: "primary.main",
              backgroundColor: "rgba(200,16,46,0.16)",
            }}
          >
            <Cookie size={18} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, mb: 0.5, color: "text.primary" }}>
              Bạn đang kiểm soát
            </Typography>
            <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", lineHeight: 1.7 }}>
              Cookie thiết yếu luôn được bật để dịch vụ hoạt động. Cookie phân tích và cá nhân hoá
              có thể tắt bất cứ lúc nào trong Cài đặt &gt; Quyền riêng tư.
            </Typography>
          </Box>
        </Stack>
      }
      sections={[
        {
          id: "what",
          title: "Cookie là gì?",
          content: (
            <>
              <p>
                Cookie là tệp văn bản nhỏ được trình duyệt lưu trữ khi bạn truy cập website. Bên
                cạnh cookie, Gió Phim còn dùng các công nghệ tương tự như localStorage, IndexedDB và
                service worker để hỗ trợ trải nghiệm ngoại tuyến và đẩy thông báo.
              </p>
            </>
          ),
        },
        {
          id: "types",
          title: "Các loại cookie chúng tôi sử dụng",
          content: (
            <>
              <ul>
                <li>
                  <strong>Cookie thiết yếu:</strong> đảm bảo đăng nhập, xác thực thiết bị tin cậy,
                  ngăn tấn công CSRF và xử lý thanh toán PayOS. Bạn không thể tắt nhóm này nếu vẫn
                  muốn sử dụng dịch vụ.
                </li>
                <li>
                  <strong>Cookie ưu thích:</strong> ghi nhớ ngôn ngữ, chế độ tối, âm lượng, vị trí
                  phụ đề và tốc độ phát.
                </li>
                <li>
                  <strong>Cookie phân tích:</strong> đo lường lượt xem, thời gian phát trung bình,
                  tỷ lệ buffer để cải thiện chất lượng dịch vụ. Dữ liệu được tổng hợp ẩn danh.
                </li>
                <li>
                  <strong>Cookie cá nhân hoá:</strong> ghi nhận thể loại bạn yêu thích để đề xuất
                  phim phù hợp ở trang chủ.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "storage",
          title: "Bộ nhớ ngoại tuyến (PWA)",
          content: (
            <>
              <p>Khi bạn cài Gió Phim như ứng dụng (PWA), trình duyệt sẽ lưu trữ:</p>
              <ul>
                <li>Service worker để phục vụ trang khi mất mạng.</li>
                <li>IndexedDB lưu phim đã tải, tự động xoá sau 48 giờ.</li>
                <li>localStorage cho preferences và token đẩy thông báo.</li>
              </ul>
              <p>
                Bạn có thể xoá toàn bộ dữ liệu này bằng cách gỡ ứng dụng hoặc xoá lịch sử trình
                duyệt.
              </p>
            </>
          ),
        },
        {
          id: "third-party",
          title: "Cookie từ bên thứ ba",
          content: (
            <>
              <p>Gió Phim chỉ tích hợp dịch vụ bên thứ ba khi cần thiết:</p>
              <ul>
                <li>
                  <strong>PayOS:</strong> trang thanh toán được mở trong cửa sổ riêng, cookie do
                  PayOS quản lý theo chính sách của họ.
                </li>
                <li>
                  <strong>Google Fonts:</strong> tải font Inter qua CDN; chúng tôi đã cấu hình tuỳ
                  chọn không gửi tham chiếu trang.
                </li>
                <li>
                  <strong>Cloudflare Turnstile:</strong> dùng cho xác thực không cần CAPTCHA gây
                  phiền nhiễu.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "control",
          title: "Cách bạn kiểm soát",
          content: (
            <>
              <p>Bạn có thể quản lý cookie theo nhiều cách:</p>
              <ul>
                <li>
                  Vào <strong>Cài đặt &gt; Quyền riêng tư</strong> để bật/tắt nhóm cookie không
                  thiết yếu.
                </li>
                <li>
                  Sử dụng tính năng &quot;Xoá dữ liệu duyệt web&quot; của trình duyệt để xoá toàn bộ
                  cookie.
                </li>
                <li>Kích hoạt chế độ Riêng tư/Ẩn danh để không lưu cookie sau phiên.</li>
                <li>Tắt thông báo đẩy trong Cài đặt &gt; Thông báo nếu không muốn nhận push.</li>
              </ul>
              <p>
                Lưu ý rằng việc tắt cookie thiết yếu có thể khiến tính năng đăng nhập, tải phim
                ngoại tuyến hoặc thanh toán không hoạt động.
              </p>
            </>
          ),
        },
        {
          id: "duration",
          title: "Thời gian lưu trữ",
          content: (
            <>
              <ul>
                <li>Cookie phiên: tự xoá khi đóng trình duyệt.</li>
                <li>
                  Cookie xác thực: tối đa 30 ngày, có thể gia hạn nếu chọn &quot;Ghi nhớ thiết
                  bị&quot;.
                </li>
                <li>Cookie ưu thích và phân tích: tối đa 12 tháng.</li>
                <li>Phim ngoại tuyến: 48 giờ kể từ khi tải xong.</li>
              </ul>
            </>
          ),
        },
        {
          id: "updates",
          title: "Cập nhật chính sách",
          content: (
            <>
              <p>
                Khi danh mục cookie được mở rộng, chúng tôi sẽ hiển thị banner đồng ý lại để bạn xem
                xét. Bản mới sẽ ghi rõ ngày hiệu lực ở đầu tài liệu.
              </p>
            </>
          ),
        },
      ]}
      contactNote={
        <Stack spacing={1.25}>
          <Typography
            sx={{
              fontSize: "0.78rem",
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "primary.main",
            }}
          >
            Cần thêm hỗ trợ?
          </Typography>
          <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
            Đội ngũ trải nghiệm - Gió Phim
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", lineHeight: 1.7 }}>
            Gửi câu hỏi tới <strong>hi@trkhoang.com</strong> hoặc xem hướng dẫn tại Trung tâm trợ
            giúp. Chúng tôi cam kết phản hồi trong vòng 3 ngày làm việc.
          </Typography>
        </Stack>
      }
      related={[
        {
          label: "Chính sách bảo mật",
          description: "Cách chúng tôi xử lý và bảo vệ dữ liệu cá nhân.",
          href: "/legal/privacy",
        },
        {
          label: "Trung tâm trợ giúp",
          description: "Hướng dẫn nhanh và mẹo sử dụng Gió Phim.",
          href: "/support",
        },
      ]}
    />
  );
}
