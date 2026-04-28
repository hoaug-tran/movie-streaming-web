import { Box, Typography, Breadcrumbs, Link as MuiLink } from "@mui/material";
import Link from "next/link";
import { Metadata } from "next";
import VibeExplorer from "@/components/Discovery/VibeExplorer";

export const metadata: Metadata = {
  title: "Khám Phá | Gió Phim",
  description: "Khám phá kho phim khổng lồ theo thể loại, thập niên và xếp hạng.",
};

export default function DiscoveryPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        pt: { xs: 10, md: 13 },
        pb: 12,
        backgroundColor: "background.default",
        px: { xs: 2, md: 5, lg: 7 },
      }}
    >
      <Breadcrumbs
        aria-label="breadcrumb"
        sx={{
          mb: 3,
          fontSize: "0.8rem",
          "& .MuiBreadcrumbs-separator": { color: "text.disabled" },
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
          Khám phá
        </Typography>
      </Breadcrumbs>

      <Box sx={{ mb: { xs: 4, md: 5 } }}>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: "2rem", sm: "2.6rem", md: "3.5rem" },
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: "text.primary",
            mb: 1.5,
          }}
        >
          Tìm phim{" "}
          <Box component="span" sx={{ color: "primary.main", fontStyle: "italic" }}>
            theo ý bạn
          </Box>
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: "0.9rem", md: "1rem" },
            color: "text.secondary",
            fontWeight: 400,
            maxWidth: 520,
          }}
        >
          Lọc theo thể loại, thập niên và xếp hạng — hoặc bấm{" "}
          <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
            Ngẫu nhiên
          </Box>{" "}
          để bất ngờ.
        </Typography>
      </Box>

      <VibeExplorer />
    </Box>
  );
}
