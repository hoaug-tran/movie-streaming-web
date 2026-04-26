"use client";

import React from "react";
import { Box, Container, Paper, useTheme, useMediaQuery, IconButton, Tooltip } from "@mui/material";
import { HomeIcon } from "./LucideIcons";
import Link from "next/link";

interface AuthContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ children, title, subtitle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: isMobile ? 2 : 4,
        position: "relative",
        minHeight: "100vh",
      }}
    >
      <Tooltip title="Quay về trang chủ">
        <Link href="/">
          <IconButton
            sx={{
              position: "absolute",
              top: 20,
              left: 20,
              color: "rgba(255, 255, 255, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(15, 15, 30, 0.5)",
              transition: "all 0.3s ease",
              "&:hover": {
                color: "#E63946",
                borderColor: "#E63946",
                backgroundColor: "rgba(230, 57, 70, 0.1)",
                transform: "scale(1.1)",
              },
            }}
          >
            <HomeIcon />
          </IconButton>
        </Link>
      </Tooltip>

      <Container maxWidth="xs" sx={{ position: "relative", zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: isMobile ? 3 : 4,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "rgba(255, 255, 255, 0.1)",
            backgroundColor: "rgba(15, 15, 30, 0.75)",
            backdropFilter: "blur(30px)",
            boxShadow: "0 8px 32px rgba(230, 57, 70, 0.1)",
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Box
              component="h1"
              sx={{
                fontSize: isMobile ? "1.75rem" : "2rem",
                fontWeight: 700,
                mb: 1,
                color: "#FFFFFF",
              }}
            >
              {title}
            </Box>
            {subtitle && (
              <Box
                component="p"
                sx={{
                  fontSize: "0.95rem",
                  color: "rgba(255, 255, 255, 0.6)",
                  m: 0,
                }}
              >
                {subtitle}
              </Box>
            )}
          </Box>

          {children}
        </Paper>
      </Container>
    </Box>
  );
};
