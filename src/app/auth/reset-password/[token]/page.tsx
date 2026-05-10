"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordTokenPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/forgot-password");
  }, [router]);

  return null;
}
