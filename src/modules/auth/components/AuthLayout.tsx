"use client";

import React from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import Link from "next/link";
import { ArrowBackIosNewOutlined } from "@mui/icons-material";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#000000",
      }}
    >
      {/* Background Image with Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
          },
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: 40,
          left: 40,
          zIndex: 10,
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "rgba(255, 255, 255, 0.6)",
              transition: "all 0.3s ease",
              "&:hover": {
                color: "#ffffff",
                transform: "translateX(-4px)",
              },
            }}
          >
            <ArrowBackIosNewOutlined sx={{ fontSize: 14 }} />
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", letterSpacing: "0.02em" }}>
              VỀ TRANG CHỦ
            </Typography>
          </Box>
        </Link>
      </Box>

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1, px: { xs: 2, sm: 3 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 0,
            border: "1px solid rgba(255, 255, 255, 0.12)",
            backgroundColor: "rgba(20, 20, 20, 0.8)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 800,
                mb: 1.5,
                color: "#ffffff",
                letterSpacing: "-0.04em",
                fontSize: { xs: "1.85rem", sm: "2.25rem" },
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {children}
        </Paper>
      </Container>
    </Box>
  );
};
