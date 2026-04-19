"use client";

import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useRouter } from "next/navigation";

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navLinkSx = {
    color: "#ffffff",
    fontWeight: 500,
    fontSize: "0.95rem",
    textDecoration: "none",
    transition: "color 0.25s ease, opacity 0.25s ease",
    opacity: 1,
    "&:hover": {
      color: "#22d3ee",
      opacity: 1,
    },
  };

  const navButtonSx = {
    color: "#ffffff",
    transition: "color 0.25s ease, opacity 0.25s ease",
    opacity: 1,
    "&:hover": {
      color: "#22d3ee",
      opacity: 1,
      backgroundColor: "transparent",
    },
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: isScrolled ? "rgba(10, 15, 25, 0.78)" : "rgba(10, 15, 25, 0)",
        backdropFilter: isScrolled ? "blur(12px)" : "blur(0px)",
        WebkitBackdropFilter: isScrolled ? "blur(12px)" : "blur(0px)",
        borderBottom: isScrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        boxShadow: isScrolled ? "0 8px 24px rgba(0,0,0,0.18)" : "none",
        transition:
          "background-color 0.35s ease, backdrop-filter 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease",
        zIndex: 1000,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          minHeight: { xs: 64, md: 72 },
          px: { xs: 2, md: 4 },
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.35rem", md: "1.6rem" },
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              cursor: "pointer",
              opacity: 1,
              transition: "opacity 0.25s ease",
              "&:hover": {
                opacity: 0.92,
              },
            }}
          >
            Gió Phim
          </Typography>
        </Link>

        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            gap: 3,
            alignItems: "center",
            flex: 1,
            ml: 5,
          }}
        >
          <Box component={Link} href="/movies" sx={navLinkSx}>
            Khám phá
          </Box>

          <Box component={Link} href="/watchlist" sx={navLinkSx}>
            Danh sách theo dõi
          </Box>

          <Box component={Link} href="/trending" sx={navLinkSx}>
            Thịnh hành
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
          {isAuthenticated ? (
            <>
              <Link href="/profile" style={{ textDecoration: "none" }}>
                <Button sx={navButtonSx}>Tài khoản</Button>
              </Link>

              {user?.role === "ROLE_ADMIN" && (
                <Link href="/admin" style={{ textDecoration: "none" }}>
                  <Button sx={navButtonSx}>Admin</Button>
                </Link>
              )}

              <Button onClick={handleLogout} sx={navButtonSx}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{ textDecoration: "none" }}>
                <Button sx={navButtonSx}>Đăng nhập</Button>
              </Link>

              <Link href="/auth/register" style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  sx={{
                    background: "linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)",
                    color: "white",
                    px: 2.2,
                    py: 0.9,
                    borderRadius: 2,
                    boxShadow: "none",
                    transition: "transform 0.25s ease, opacity 0.25s ease",
                    "&:hover": {
                      opacity: 0.9,
                      boxShadow: "none",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  Đăng ký
                </Button>
              </Link>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
