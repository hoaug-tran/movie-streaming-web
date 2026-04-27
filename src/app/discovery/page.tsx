import { Box, Container, Typography, Breadcrumbs, Link as MuiLink } from "@mui/material";
import Link from "next/link";
import { Metadata } from "next";
import VibeExplorer from "@/components/Discovery/VibeExplorer";

export const metadata: Metadata = {
  title: "Khám Phá | Gió Phim",
  description: "Trạm lọc chuyên sâu giúp bạn tìm kiếm nội dung điện ảnh phù hợp nhất.",
};

export default function DiscoveryPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        pt: { xs: 10, md: 14 },
        pb: 8,
        backgroundColor: "background.default",
      }}
    >
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
            Khám phá Vibe
          </Typography>
        </Breadcrumbs>

        <Typography
          variant="h2"
          mb={0.5}
          fontWeight={800}
          letterSpacing="-0.03em"
          sx={{ fontSize: { xs: "1.75rem", md: "2.5rem" } }}
        >
          Khám Phá Vibe
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={5}
          sx={{ fontSize: "0.9rem", fontWeight: 400 }}
        >
          Tìm kiếm nội dung phù hợp với tâm trạng của bạn hôm nay.
        </Typography>

        <VibeExplorer />
      </Container>
    </Box>
  );
}
