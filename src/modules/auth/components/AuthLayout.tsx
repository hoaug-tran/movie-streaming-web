"use client";

import React from "react";
import { Box, Paper, Typography, alpha, useTheme, Stack } from "@mui/material";
import Link from "next/link";
import { ArrowBackIosNewOutlined } from "@mui/icons-material";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  kineticText?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  kineticText = "AUTHENTICATION",
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        backgroundColor: "#000000",
        overflow: "hidden",
      }}
    >
      {/* Left Panel: Kinetic Aesthetic (60%) */}
      <Box
        sx={{
          flex: { lg: 1.25 },
          position: "relative",
          display: { xs: "none", lg: "flex" },
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0a0a0a 0%, #000 100%)",
        }}
      >
        {/* Cinematic Backdrop */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url('https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2070&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4,
            filter: "grayscale(100%)",
            transition: "all 0.8s ease",
          }}
        />

        {/* Glass Overlay with Accent Glow */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 30% 30%, ${alpha(theme.palette.primary.main, 0.15)}, transparent 50%), radial-gradient(circle at 70% 70%, ${alpha(theme.palette.secondary.main, 0.1)}, transparent 50%)`,
            zIndex: 1,
          }}
        />

        {/* Kinetic Typography */}
        <Box
          sx={{
            position: "absolute",
            left: "-5%",
            bottom: "10%",
            zIndex: 2,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          <Typography
            sx={{
              fontSize: "12vw",
              fontWeight: 950,
              color: "transparent",
              WebkitTextStroke: `1.5px ${alpha(theme.palette.common.white, 0.1)}`,
              letterSpacing: "-0.05em",
              lineHeight: 0.8,
              transform: "rotate(-10deg)",
              textTransform: "uppercase",
            }}
          >
            {kineticText}
          </Typography>
        </Box>

        {/* Branding/Back Button */}
        <Box sx={{ position: "absolute", top: 40, left: 40, zIndex: 10 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                color: "white",
                "&:hover": { color: "primary.main" },
                transition: "all 0.3s ease",
              }}
            >
              <ArrowBackIosNewOutlined sx={{ fontSize: 16 }} />
              <Typography variant="button" sx={{ letterSpacing: "0.1em", fontWeight: 900 }}>
                VỀ TRANG CHỦ
              </Typography>
            </Stack>
          </Link>
        </Box>

        <Box sx={{ position: "relative", zIndex: 3, p: 8, maxWidth: 600 }}>
          <Typography
            variant="h1"
            sx={{
              color: "white",
              fontSize: "3.5rem",
              fontWeight: 950,
              mb: 2,
              letterSpacing: "-0.04em",
            }}
          >
            Gió Phim{" "}
            <Box component="span" sx={{ color: "primary.main" }}>
              .
            </Box>
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "1.1rem",
              fontWeight: 500,
              lineHeight: 1.8,
            }}
          >
            Chào mừng bạn đến với thế giới của những câu chuyện điện ảnh bất hủ. Trải nghiệm giải
            trí chuẩn 2026 ngay tại đây.
          </Typography>
        </Box>
      </Box>

      {/* Right Panel: Glassmorphic Form (40%) */}
      <Box
        sx={{
          flex: { lg: 0.75 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 5,
          p: { xs: 2.5, sm: 6, lg: 8 },
          background: { xs: "linear-gradient(to bottom, #0a0a0a, #000)", lg: "transparent" },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 460 }}>
          {/* Mobile Branding */}
          <Box sx={{ display: { xs: "block", lg: "none" }, mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 950, color: "white" }}>
              Gió Phim{" "}
              <Box component="span" sx={{ color: "primary.main" }}>
                .
              </Box>
            </Typography>
          </Box>

          <Box sx={{ mb: 5 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 950,
                color: "white",
                letterSpacing: "-0.04em",
                mb: 1.5,
                fontSize: { xs: "2.2rem", lg: "2.8rem" },
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  fontWeight: 500,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              "@keyframes fadeInUp": {
                from: { opacity: 0, transform: "translateY(20px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
