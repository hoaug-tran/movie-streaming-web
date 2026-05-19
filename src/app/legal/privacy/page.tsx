import type { Metadata } from "next";
import { Box, Stack, Typography } from "@mui/material";
import { ShieldCheck } from "lucide-react";
import { InfoPageShell } from "@/components/Layout/InfoPageShell";

export const metadata: Metadata = {
  title: "Chính sách bảo mật | Gió Phim",
  description:
    "Chính sách bảo mật Gió Phim - cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân của người xem.",
};

export default function PrivacyPolicyPage() {
  return (
    <InfoPageShell
      eyebrow="Pháp lý"
      title={
        <>
          Chính sách{" "}
          <Box component="span" sx={{ color: "primary.main", fontStyle: "italic" }}>
            bảo mật
          </Box>
        </>
      }
      subtitle="Gió Phim cam kết bảo vệ thông tin cá nhân của bạn. Tài liệu này mô tả rõ ràng dữ liệu chúng tôi thu thập, mục đích sử dụng và quyền của bạn đối với dữ liệu đó."
      meta="Cập nhật lần cuối: 17/05/2026"
      breadcrumbs={[{ label: "Pháp lý" }, { label: "Chính sách bảo mật" }]}
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
            <ShieldCheck size={18} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, mb: 0.5, color: "text.primary" }}>
              Tóm tắt nhanh
            </Typography>
            <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", lineHeight: 1.7 }}>
              Chúng tôi chỉ thu thập dữ liệu cần thiết để vận hành dịch vụ, không bán dữ liệu cho
              bên thứ ba và mã hoá toàn bộ thông tin nhạy cảm. Bạn có thể yêu cầu xem, chỉnh sửa
              hoặc xoá tài khoản bất cứ lúc nào.
            </Typography>
          </Box>
        </Stack>
      }
      sections={[
        {
          id: "scope",
          title: "Phạm vi áp dụng",
          content: (
            <>
              <p>
                Chính sách này áp dụng cho mọi dịch vụ do Gió Phim cung cấp, bao gồm website{" "}
                <strong>giophim.libsys.me</strong>, ứng dụng web tiến bộ (PWA), các API công khai và
                mọi tính năng đi kèm như tải phim ngoại tuyến, đăng ký gói Premium hoặc bình luận
                trong cộng đồng.
              </p>
              <p>
                Bằng việc tạo tài khoản hoặc sử dụng dịch vụ, bạn đồng ý với các nguyên tắc xử lý dữ
                liệu được mô tả trong tài liệu này. Nếu bạn không đồng ý với bất kỳ điều khoản nào,
                vui lòng ngừng sử dụng dịch vụ.
              </p>
            </>
          ),
        },
        {
          id: "data-collected",
          title: "Dữ liệu chúng tôi thu thập",
          content: (
            <>
              <p>
                Gió Phim chỉ thu thập những thông tin tối thiểu cần thiết để tài khoản hoạt động ổn
                định và cải thiện trải nghiệm xem phim của bạn:
              </p>
              <ul>
                <li>
                  <strong>Thông tin tài khoản:</strong> email, tên hiển thị, mật khẩu được mã hoá
                  một chiều, ảnh đại diện và sở thích thể loại.
                </li>
                <li>
                  <strong>Dữ liệu sử dụng:</strong> lịch sử xem, danh sách yêu thích, xem sau, tiến
                  độ tập, đánh giá và bình luận bạn để lại.
                </li>
                <li>
                  <strong>Dữ liệu thiết bị:</strong> loại thiết bị, hệ điều hành, trình duyệt, độ
                  phân giải và mã định danh phiên để xác thực thiết bị tin cậy.
                </li>
                <li>
                  <strong>Dữ liệu thanh toán:</strong> mã giao dịch và trạng thái gói thuê bao do
                  PayOS trả về. Chúng tôi <strong>không</strong> lưu số thẻ hay mật khẩu ngân hàng.
                </li>
                <li>
                  <strong>Dữ liệu chẩn đoán:</strong> nhật ký lỗi, hiệu năng phát phim và sự kiện
                  bảo mật để khắc phục sự cố và phát hiện gian lận.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "purpose",
          title: "Mục đích sử dụng",
          content: (
            <>
              <p>Dữ liệu thu thập được sử dụng cho những mục đích cụ thể và minh bạch:</p>
              <ul>
                <li>Cấp tài khoản, xác thực đăng nhập và quản lý phiên thiết bị tin cậy.</li>
                <li>Đề xuất phim cá nhân hoá theo lịch sử xem và đánh giá của bạn.</li>
                <li>Xử lý đơn hàng gói Premium, kích hoạt quyền lợi và gia hạn dịch vụ.</li>
                <li>
                  Gửi thông báo quan trọng như cảnh báo bảo mật, biên lai thanh toán và thông tin
                  cập nhật chính sách.
                </li>
                <li>Phòng chống gian lận, lạm dụng tài khoản và vi phạm bản quyền.</li>
                <li>Phân tích tổng hợp phi danh tính để cải thiện chất lượng dịch vụ.</li>
              </ul>
            </>
          ),
        },
        {
          id: "sharing",
          title: "Chia sẻ với bên thứ ba",
          content: (
            <>
              <p>
                Gió Phim không bán hoặc cho thuê dữ liệu cá nhân. Chúng tôi chỉ chia sẻ dữ liệu
                trong các trường hợp giới hạn sau:
              </p>
              <ul>
                <li>
                  <strong>Đối tác hạ tầng:</strong> nhà cung cấp lưu trữ đám mây, CDN, dịch vụ email
                  giao dịch và cổng thanh toán PayOS - tất cả đều tuân thủ hợp đồng xử lý dữ liệu
                  (DPA) tương đương GDPR.
                </li>
                <li>
                  <strong>Yêu cầu pháp lý:</strong> khi có lệnh hợp pháp từ cơ quan có thẩm quyền
                  hoặc khi cần bảo vệ quyền lợi và an toàn của người dùng.
                </li>
                <li>
                  <strong>Chuyển giao doanh nghiệp:</strong> trường hợp sáp nhập hoặc bán mảng kinh
                  doanh, chúng tôi sẽ thông báo trước ít nhất 30 ngày.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "retention",
          title: "Lưu trữ và bảo mật",
          content: (
            <>
              <p>
                Dữ liệu được lưu trữ tại trung tâm dữ liệu đặt ở Việt Nam, kèm cơ chế sao lưu mã hoá
                theo lịch hằng ngày. Mật khẩu được băm bằng BCrypt, dữ liệu nhạy cảm trên đường
                truyền sử dụng TLS 1.3.
              </p>
              <ul>
                <li>Dữ liệu tài khoản: lưu trong suốt thời gian bạn sử dụng dịch vụ.</li>
                <li>Lịch sử thanh toán: lưu tối thiểu 5 năm để đáp ứng quy định kế toán.</li>
                <li>Phim tải ngoại tuyến: tự động xoá khỏi thiết bị sau 48 giờ.</li>
                <li>Nhật ký bảo mật: lưu 90 ngày trước khi ẩn danh hoá.</li>
              </ul>
            </>
          ),
        },
        {
          id: "rights",
          title: "Quyền của người dùng",
          content: (
            <>
              <p>Bạn có quyền chủ động đối với dữ liệu cá nhân của mình:</p>
              <ul>
                <li>
                  <strong>Truy cập:</strong> xem toàn bộ dữ liệu tài khoản trong mục Hồ sơ &gt; Cài
                  đặt.
                </li>
                <li>
                  <strong>Chỉnh sửa:</strong> cập nhật thông tin cá nhân, ảnh đại diện, sở thích bất
                  kỳ lúc nào.
                </li>
                <li>
                  <strong>Xoá tài khoản:</strong> yêu cầu xoá hoàn toàn dữ liệu, kèm thời gian xử lý
                  tối đa 14 ngày làm việc.
                </li>
                <li>
                  <strong>Phản đối xử lý:</strong> tắt đề xuất cá nhân hoá hoặc thông báo marketing
                  trong cài đặt.
                </li>
                <li>
                  <strong>Khiếu nại:</strong> liên hệ với chúng tôi tại{" "}
                  <strong>hi@trkhoang.com</strong> nếu bạn cho rằng dữ liệu bị xử lý sai mục đích.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "children",
          title: "Người dùng dưới 16 tuổi",
          content: (
            <>
              <p>
                Gió Phim không cố ý thu thập dữ liệu của trẻ em dưới 16 tuổi. Một số nội dung 18+
                chỉ hiển thị sau khi xác minh độ tuổi. Phụ huynh có thể yêu cầu xoá tài khoản của
                con bằng cách gửi email kèm giấy tờ chứng minh quan hệ tới{" "}
                <strong>hi@trkhoang.com</strong>.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          title: "Thay đổi chính sách",
          content: (
            <>
              <p>
                Khi có thay đổi đáng kể, chúng tôi sẽ thông báo qua email và banner trên trang chủ
                ít nhất 14 ngày trước khi áp dụng. Phiên bản trước được lưu lại trong kho lưu trữ
                công khai để bạn có thể đối chiếu.
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
            Liên hệ về quyền riêng tư
          </Typography>
          <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
            Bộ phận Bảo mật dữ liệu - Gió Phim
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", lineHeight: 1.7 }}>
            Email: <strong>hi@trkhoang.com</strong> (dự phòng <strong>hoaug@duck.com</strong>) ·
            Thời gian phản hồi tối đa 5 ngày làm việc. Với các yêu cầu khẩn cấp về xâm phạm dữ liệu,
            vui lòng ghi tiêu đề bắt đầu bằng <strong>[Khẩn]</strong>.
          </Typography>
        </Stack>
      }
      related={[
        {
          label: "Điều khoản dịch vụ",
          description: "Quyền và nghĩa vụ khi sử dụng nền tảng Gió Phim.",
          href: "/legal/terms",
        },
        {
          label: "Chính sách Cookie",
          description: "Loại cookie chúng tôi sử dụng và cách bạn kiểm soát chúng.",
          href: "/legal/cookies",
        },
      ]}
    />
  );
}
