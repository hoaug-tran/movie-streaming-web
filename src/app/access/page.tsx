import { Suspense } from "react";
import type { Metadata } from "next";
import GateForm from "./GateForm";

export const metadata: Metadata = {
  title: "Cổng truy cập – Gió Phim",
  description: "Cổng truy cập đồ án học tập Gió Phim.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AccessGatePage() {
  return (
    <Suspense fallback={null}>
      <GateForm />
    </Suspense>
  );
}
