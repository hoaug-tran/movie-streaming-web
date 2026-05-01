import { Metadata } from "next";
import { ProfileClient } from "@/modules/user/components/ProfileClient";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân | Movie Streaming",
  description: "Quản lý hồ sơ, email, tư cách thành viên, giao dịch và cài đặt bảo mật tài khoản.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
