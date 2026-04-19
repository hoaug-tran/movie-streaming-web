import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gió Phim - Movie Streaming Platform",
  description: "Watch movies and TV shows online",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
