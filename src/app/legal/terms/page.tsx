import type { Metadata } from "next";
import { Box, Stack, Typography } from "@mui/material";
import { ScrollText } from "lucide-react";
import { InfoPageShell } from "@/components/Layout/InfoPageShell";

export const metadata: Metadata = {
  title: "Điều khoản dịch vụ | Gió Phim",
  description:
    "Điều khoản dịch vụ Gió Phim - quyền, nghĩa vụ, thanh toán và chính sách sử dụng nền tảng xem phim trực tuyến.",
};

export default function TermsOfServicePage() {
  return (
    <InfoPageShell
      eyebrow="Pháp lý"
      title={
        <>
          Điều khoản{" "}
          <Box component="span" sx={{ color: "primary.main", fontStyle: "italic" }}>
            dịch vụ
          </Box>
        </>
      }
      subtitle="Khi sử dụng Gió Phim, bạn đồng ý với các điều khoản dưới đây. Vui lòng đọc kỹ trước khi đăng ký, thanh toán hoặc đăng tải nội dung."
      meta="Hiệu lực từ: 01/06/2026"
      breadcrumbs={[{ label: "Pháp lý" }, { label: "Điều khoản dịch vụ" }]}
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
            <ScrollText size={18} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, mb: 0.5, color: "text.primary" }}>
              Hợp đồng giữa bạn và Gió Phim
            </Typography>
            <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", lineHeight: 1.7 }}>
              Văn bản này thiết lập quan hệ pháp lý giữa người dùng và Công ty Gió Phim. Việc tiếp
              tục sử dụng dịch vụ sau khi điều khoản có hiệu lực được xem là chấp thuận toàn bộ các
              điều khoản dưới đây.
            </Typography>
          </Box>
        </Stack>
      }
      sections={[
        {
          id: "acceptance",
          title: "Chấp thuận điều khoản",
          content: (
            <>
              <p>
                Khi tạo tài khoản, đăng nhập hoặc thực hiện bất kỳ thao tác nào trên nền tảng, bạn
                xác nhận đã đọc, hiểu và đồng ý ràng buộc bởi điều khoản này cùng các tài liệu được
                dẫn chiếu (Chính sách bảo mật, Chính sách Cookie).
              </p>
              <p>
                Người dùng dưới 18 tuổi cần có sự đồng ý của cha mẹ hoặc người giám hộ hợp pháp khi
                thực hiện thanh toán.
              </p>
            </>
          ),
        },
        {
          id: "account",
          title: "Tài khoản và bảo mật",
          content: (
            <>
              <ul>
                <li>Mỗi người chỉ được sở hữu một tài khoản chính cho mục đích cá nhân.</li>
                <li>
                  Bạn chịu trách nhiệm bảo vệ mật khẩu, mã OTP và phiên thiết bị tin cậy. Hãy đăng
                  xuất khi sử dụng thiết bị công cộng.
                </li>
                <li>
                  Vui lòng thông báo cho Gió Phim trong vòng 24 giờ nếu phát hiện truy cập bất
                  thường.
                </li>
                <li>
                  Việc cho thuê, mua bán, chia sẻ tài khoản nhằm mục đích thương mại bị nghiêm cấm
                  và là căn cứ chấm dứt dịch vụ ngay lập tức.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "subscription",
          title: "Gói thuê bao và thanh toán",
          content: (
            <>
              <p>
                Gió Phim cung cấp ba gói trả phí Basic, Premium và Premium Plus cùng tài khoản miễn
                phí với quền lợi khác nhau về chất lượng phát, số thiết bị đồng thời và phim độc
                quyền. Chi tiết quyền lợi xem tại trang <strong>/pricing</strong>.
              </p>
              <ul>
                <li>
                  Thanh toán qua PayOS bằng mã QR. Gió Phim không tự động trừ tiền định kỳ trừ khi
                  bạn kích hoạt tuỳ chọn gia hạn tự động.
                </li>
                <li>
                  Gói có hiệu lực ngay khi giao dịch được PayOS xác nhận, kể cả khi trong khung giờ
                  khuyến mại.
                </li>
                <li>
                  Phí đã thanh toán không hoàn trả, ngoại trừ trường hợp lỗi kỹ thuật do Gió Phim
                  không cung cấp được dịch vụ trong &gt; 72 giờ liên tục.
                </li>
                <li>
                  Bạn có thể yêu cầu hoàn tiền tỉ lệ trong vòng 7 ngày kể từ ngày thanh toán nếu
                  chưa phát sinh việc xem phim Premium.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "content",
          title: "Nội dung và bản quyền",
          content: (
            <>
              <p>
                Toàn bộ phim, thumbnail, mô tả và tài nguyên hiển thị trên Gió Phim được cấp phép
                hợp pháp từ các đối tác phát hành hoặc thuộc sở hữu của Gió Phim. Người dùng chỉ
                được:
              </p>
              <ul>
                <li>Xem trực tuyến phục vụ mục đích cá nhân, phi thương mại.</li>
                <li>
                  Tải về xem ngoại tuyến trong tối đa 48 giờ thông qua tính năng chính thức của ứng
                  dụng.
                </li>
                <li>Chia sẻ liên kết phim, không phát tán file gốc.</li>
              </ul>
              <p>
                Mọi hành vi sao chép, phát hành lại, livestream, tải lên nền tảng khác hoặc bẻ khoá
                DRM là hành vi vi phạm pháp luật và sẽ bị xử lý.
              </p>
            </>
          ),
        },
        {
          id: "user-content",
          title: "Nội dung do người dùng tạo",
          content: (
            <>
              <p>Khi bình luận, đánh giá hoặc gửi phản hồi, bạn cam kết:</p>
              <ul>
                <li>Không đăng nội dung vi phạm pháp luật, kích động bạo lực, phân biệt đối xử.</li>
                <li>Không quảng cáo, spam, lừa đảo hoặc dẫn link độc hại.</li>
                <li>Không tiết lộ thông tin cá nhân của người khác khi chưa được phép.</li>
                <li>Không tiết lộ tình tiết quan trọng (spoiler) mà không gắn cảnh báo.</li>
              </ul>
              <p>
                Gió Phim được quyền ẩn, chỉnh sửa hoặc xoá nội dung vi phạm và áp dụng biện pháp
                cảnh cáo, hạn chế bình luận hoặc khoá tài khoản.
              </p>
            </>
          ),
        },
        {
          id: "prohibited",
          title: "Hành vi bị cấm",
          content: (
            <>
              <ul>
                <li>Truy cập trái phép API hoặc cố tình gây quá tải hệ thống.</li>
                <li>Sử dụng bot, trình tự động để cào dữ liệu hay tạo tài khoản hàng loạt.</li>
                <li>Phá vỡ cơ chế giới hạn thiết bị, chất lượng phát hoặc DRM.</li>
                <li>Mạo danh nhân viên Gió Phim hoặc người khác.</li>
                <li>Lợi dụng lỗ hổng bảo mật chưa công bố vào mục đích phi đạo đức.</li>
              </ul>
            </>
          ),
        },
        {
          id: "termination",
          title: "Tạm ngưng và chấm dứt",
          content: (
            <>
              <p>
                Gió Phim có quyền tạm ngưng hoặc chấm dứt tài khoản nếu phát hiện vi phạm các điều
                khoản, hành vi gian lận thanh toán hoặc theo yêu cầu của cơ quan có thẩm quyền. Khi
                tài khoản bị chấm dứt, các gói thuê bao đang hoạt động sẽ chấm dứt hiệu lực và phí
                không được hoàn trả nếu nguyên nhân xuất phát từ vi phạm.
              </p>
              <p>Người dùng có thể chủ động đóng tài khoản trong mục Hồ sơ &gt; Cài đặt.</p>
            </>
          ),
        },
        {
          id: "liability",
          title: "Giới hạn trách nhiệm",
          content: (
            <>
              <p>
                Dịch vụ được cung cấp trên cơ sở &quot;hiện trạng&quot;. Trong phạm vi pháp luật cho
                phép, Gió Phim không chịu trách nhiệm cho các thiệt hại gián tiếp như mất dữ liệu,
                mất lợi nhuận hoặc gián đoạn vì sự kiện bất khả kháng.
              </p>
              <p>
                Tổng giá trị bồi thường cho mỗi tài khoản, nếu phát sinh, không vượt quá tổng số
                tiền bạn đã thanh toán cho Gió Phim trong 12 tháng gần nhất.
              </p>
            </>
          ),
        },
        {
          id: "law",
          title: "Luật áp dụng và giải quyết tranh chấp",
          content: (
            <>
              <p>
                Điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Tranh chấp phát sinh sẽ được
                giải quyết thông qua thương lượng. Trường hợp không đạt được thoả thuận, tranh chấp
                sẽ được đưa ra Toà án nhân dân có thẩm quyền tại Thành phố Hồ Chí Minh.
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
            Liên hệ pháp lý
          </Typography>
          <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
            Bộ phận Pháp chế - Gió Phim
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", lineHeight: 1.7 }}>
            Email: <strong>hi@trkhoang.com</strong> (dự phòng <strong>hoaug@duck.com</strong>) · Địa
            chỉ: 123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh. Mọi thông báo pháp lý cần được gửi bằng
            văn bản kèm chữ ký người đại diện hợp pháp.
          </Typography>
        </Stack>
      }
      related={[
        {
          label: "Chính sách bảo mật",
          description: "Chi tiết về dữ liệu được thu thập và quyền của bạn.",
          href: "/legal/privacy",
        },
        {
          label: "Chính sách Cookie",
          description: "Loại cookie và cách quản lý lựa chọn của bạn.",
          href: "/legal/cookies",
        },
      ]}
    />
  );
}
