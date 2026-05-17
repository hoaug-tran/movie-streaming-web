import { redirect } from "next/navigation";

export default function AdminCommentsRedirect() {
  redirect("/admin/moderation");
}
