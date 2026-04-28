import { Box, Container, Typography, Breadcrumbs, Link as MuiLink } from "@mui/material";
import Link from "next/link";
import { Metadata } from "next";
import MovieBrowser from "@/components/Browse/MovieBrowser";

export const metadata: Metadata = {
  title: "Phim Lẻ | Gió Phim",
  description: "Khám phá bộ sưu tập phim lẻ quy mô lớn với các bộ phim hay nhất.",
};

export default function MoviesPage() {
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <Box sx={{ pt: { xs: 10, md: 14 }, pb: { xs: 0.75, md: 1 } }}>
        <Container maxWidth="xl">
          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{
              mb: 3,
              fontSize: "0.8rem",
              "& .MuiBreadcrumbs-separator": { color: "text.secondary" },
            }}
          >
            <MuiLink
              component={Link}
              href="/"
              sx={{
                textDecoration: "none",
                color: "text.secondary",
                fontSize: "0.8rem",
                transition: "color 0.2s",
                "&:hover": { color: "text.primary" },
              }}
            >
              Trang chủ
            </MuiLink>
            <Typography color="text.primary" fontWeight={500} fontSize="0.8rem">
              Phim Lẻ
            </Typography>
          </Breadcrumbs>

          <Typography
            variant="h2"
            mb={0.5}
            fontWeight={800}
            letterSpacing="-0.03em"
            sx={{ fontSize: { xs: "1.75rem", md: "2.5rem" } }}
          >
            Phim Lẻ
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "0.9rem", fontWeight: 400 }}
          >
            Thư viện phim lẻ đa dạng, cập nhật liên tục mỗi ngày.
          </Typography>
        </Container>
      </Box>

      <MovieBrowser />
    </Box>
  );
}
