"use client";

import { Box, Container, Grid, Typography, Link, Stack, Divider } from "@mui/material";
import NextLink from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Duyệt Phim",
      links: [
        { label: "Trang chủ", href: "/" },
        { label: "Phim Lẻ", href: "/movies" },
        { label: "Thịnh hành", href: "/movies?sort=trending" },
        { label: "Mới nhất", href: "/movies?sort=latest" },
      ],
    },
    {
      title: "Hỗ trợ",
      links: [
        { label: "Trung tâm trợ giúp", href: "#" },
        { label: "Liên hệ", href: "#" },
        { label: "Câu hỏi thường gặp", href: "#" },
        { label: "Trạng thái hệ thống", href: "#" },
      ],
    },
    {
      title: "Pháp lý",
      links: [
        { label: "Chính sách bảo mật", href: "#" },
        { label: "Điều khoản dịch vụ", href: "#" },
        { label: "Chính sách Cookie", href: "#" },
      ],
    },
  ];

  return (
    <Box
      sx={{
        backgroundColor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        color: "text.primary",
        py: { xs: 4, md: 6 },
        mt: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {footerSections.map((section) => (
            <Grid item xs={6} sm={4} md={3} key={section.title}>
              <Typography
                variant="overline"
                sx={{
                  display: "block",
                  mb: 2,
                  color: "text.primary",
                }}
              >
                {section.title}
              </Typography>
              <Stack spacing={1}>
                {section.links.map((link) => (
                  <Link
                    key={link.label}
                    component={NextLink}
                    href={link.href}
                    sx={{
                      color: "text.secondary",
                      textDecoration: "none",
                      fontSize: "14px",
                      transition: "color 0.3s ease",
                      "&:hover": {
                        color: "primary.main",
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}

          <Grid item xs={6} sm={4} md={3}>
            <Typography
              variant="overline"
              sx={{
                display: "block",
                mb: 2,
                color: "text.primary",
              }}
            >
              Theo dõi chúng tôi
            </Typography>
            <Stack direction="row" spacing={2}>
              <Link
                href="#"
                sx={{
                  color: "text.secondary",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "primary.main" },
                }}
              >
                FB
              </Link>
              <Link
                href="#"
                sx={{
                  color: "text.secondary",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "primary.main" },
                }}
              >
                TW
              </Link>
              <Link
                href="#"
                sx={{
                  color: "text.secondary",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "primary.main" },
                }}
              >
                IG
              </Link>
              <Link
                href="#"
                sx={{
                  color: "text.secondary",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "primary.main" },
                }}
              >
                YT
              </Link>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: "divider" }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            © {currentYear} Gió phim. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Xem phim trực tuyến chất lượng cao mọi lúc, mọi nơi trên Gió Phim
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
