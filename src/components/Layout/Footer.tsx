"use client";

import {
  Box,
  Container,
  Typography,
  Link,
  Stack,
  Divider,
  IconButton,
  alpha,
  useTheme,
} from "@mui/material";
import NextLink from "next/link";
import Image from "next/image";
import { Facebook, Github, Mail } from "lucide-react";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};

const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "Duyệt phim",
    links: [
      { label: "Trang chủ", href: "/" },
      { label: "Khám phá", href: "/discovery" },
      { label: "Phim bộ", href: "/tv" },
      { label: "Phim lẻ", href: "/movies" },
      { label: "Bảng giá", href: "/pricing" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Trung tâm trợ giúp", href: "/support" },
      { label: "Liên hệ", href: "/support/contact" },
      { label: "Câu hỏi thường gặp", href: "/support/faq" },
      { label: "Trạng thái hệ thống", href: "/support/status" },
    ],
  },
  {
    title: "Pháp lý",
    links: [
      { label: "Chính sách bảo mật", href: "/legal/privacy" },
      { label: "Điều khoản dịch vụ", href: "/legal/terms" },
      { label: "Chính sách Cookie", href: "/legal/cookies" },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/hoaugtr/",
    icon: <Facebook size={16} strokeWidth={2.2} />,
  },
  {
    label: "GitHub",
    href: "https://github.com/hoaug-tran",
    icon: <Github size={16} strokeWidth={2.2} />,
  },
  {
    label: "Email",
    href: "mailto:hi@trkhoang.com",
    icon: <Mail size={16} strokeWidth={2.2} />,
  },
];

export function Footer() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        position: "relative",
        backgroundColor: isDark
          ? alpha(theme.palette.background.paper, 0.6)
          : theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        color: "text.primary",
        pt: { xs: 6, md: 8 },
        pb: { xs: 4, md: 5 },
        mt: { xs: 6, md: 10 },
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: isDark
            ? `radial-gradient(circle at 0% 0%, ${alpha(theme.palette.primary.main, 0.08)}, transparent 38%), radial-gradient(circle at 100% 0%, ${alpha(theme.palette.primary.main, 0.05)}, transparent 30%)`
            : `radial-gradient(circle at 0% 0%, ${alpha(theme.palette.primary.main, 0.05)}, transparent 36%)`,
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1.4fr 1fr 1fr 1fr",
            },
            gap: { xs: 4, md: 5 },
            mb: { xs: 5, md: 6 },
          }}
        >
          <Stack spacing={2.5} sx={{ maxWidth: 380 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Box
                component={NextLink}
                href="/"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.25,
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <Image
                  src="/icons/logo.webp"
                  alt="Gió Phim"
                  width={36}
                  height={36}
                  style={{ objectFit: "cover" }}
                  priority
                />
              </Box>
              <Typography
                component={NextLink}
                href="/"
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 900,
                  fontSize: "1.4rem",
                  letterSpacing: "-0.04em",
                  color: "text.primary",
                  textDecoration: "none",
                }}
              >
                Gió Phim
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                lineHeight: 1.7,
              }}
            >
              Gió đưa, phim tới. Nền tảng xem phim trực tuyến chất lượng cao với kho phim lẻ và phim
              bộ phong phú, hỗ trợ tải về để xem khi không có mạng.
            </Typography>

            <Stack direction="row" spacing={1}>
              {SOCIAL_LINKS.map((social) => (
                <IconButton
                  key={social.label}
                  component="a"
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={social.label}
                  size="small"
                  sx={{
                    width: 36,
                    height: 36,
                    color: "text.secondary",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: "primary.main",
                      borderColor: alpha(theme.palette.primary.main, 0.4),
                      backgroundColor: alpha(theme.palette.primary.main, 0.06),
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Stack>

          {FOOTER_SECTIONS.map((section) => (
            <Stack key={section.title} spacing={1.75}>
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "text.primary",
                }}
              >
                {section.title}
              </Typography>
              <Stack spacing={1.25}>
                {section.links.map((link) => (
                  <Link
                    key={link.label}
                    component={NextLink}
                    href={link.href}
                    sx={{
                      color: "text.secondary",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      transition: "color 0.2s ease, transform 0.2s ease",
                      width: "fit-content",
                      "&:hover": {
                        color: "primary.main",
                        transform: "translateX(2px)",
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </Stack>
          ))}
        </Box>

        <Divider sx={{ borderColor: theme.palette.divider }} />

        <Box
          sx={{
            mt: { xs: 3, md: 4 },
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.78rem",
            }}
          >
            © {currentYear} Gió Phim. All rights reserved.
          </Typography>
          <Stack
            direction="row"
            spacing={2.5}
            sx={{
              flexWrap: "wrap",
              rowGap: 1,
            }}
          >
            <Link
              component={NextLink}
              href="/legal/privacy"
              sx={{
                color: "text.secondary",
                textDecoration: "none",
                fontSize: "0.78rem",
                "&:hover": { color: "primary.main" },
              }}
            >
              Bảo mật
            </Link>
            <Link
              component={NextLink}
              href="/legal/terms"
              sx={{
                color: "text.secondary",
                textDecoration: "none",
                fontSize: "0.78rem",
                "&:hover": { color: "primary.main" },
              }}
            >
              Điều khoản
            </Link>
            <Link
              component={NextLink}
              href="/legal/cookies"
              sx={{
                color: "text.secondary",
                textDecoration: "none",
                fontSize: "0.78rem",
                "&:hover": { color: "primary.main" },
              }}
            >
              Cookie
            </Link>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.78rem",
              }}
            >
              Phát triển bởi Trần Kính Hoàng (hoaug)
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
