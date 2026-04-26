"use client";

import React, { useState, useEffect, useContext } from "react";
import { AppBar, Toolbar, Typography, Box, Button, useTheme } from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { usePathname } from "next/navigation";
import { UserProfileDropdown } from "@/components/UI/UserProfileDropdown";
import { ThemeContext } from "@/app/providers";

import {
  LightModeOutlined,
  DarkModeOutlined,
  SettingsBrightnessOutlined,
} from "@mui/icons-material";

const Navbar: React.FC = () => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useContext(ThemeContext);
  const { isAuthenticated, user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname.startsWith("/auth")) {
    return null;
  }

  const navLinkSx = {
    color: "text.primary",
    fontWeight: 500,
    fontSize: "0.95rem",
    textDecoration: "none",
    transition: "color 0.25s ease, opacity 0.25s ease",
    opacity: 0.9,
    "&:hover": {
      color: "primary.main",
      opacity: 1,
    },
    "&.active": {
      color: "primary.main",
      fontWeight: 600,
    },
  };

  const navButtonSx = {
    color: "text.primary",
    transition: "all 0.25s ease",
    borderRadius: 0,
    textTransform: "none",
    fontWeight: 500,
    minWidth: "auto",
    px: 1.5,
    "&:hover": {
      backgroundColor: "action.hover",
    },
  };

  const renderThemeIcon = () => {
    switch (mode) {
      case "light":
        return <LightModeOutlined fontSize="small" />;
      case "dark":
        return <DarkModeOutlined fontSize="small" />;
      case "system":
        return <SettingsBrightnessOutlined fontSize="small" />;
      default:
        return <SettingsBrightnessOutlined fontSize="small" />;
    }
  };

  const handleToggleMode = () => {
    const modes: ("light" | "dark" | "system")[] = ["light", "dark", "system"];
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    toggleColorMode(modes[nextIndex]);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: isScrolled ? theme.palette.background.paper : "transparent",
        backgroundImage: "none",
        borderBottom: isScrolled ? `1px solid ${theme.palette.divider}` : "1px solid transparent",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
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
              letterSpacing: "-0.04em",
              color: "text.primary",
              cursor: "pointer",
              transition: "opacity 0.25s ease",
              "&:hover": {
                opacity: 0.8,
              },
            }}
          >
            Gió Phim
          </Typography>
        </Link>

        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            gap: 4,
            alignItems: "center",
            flex: 1,
            ml: 6,
          }}
        >
          <Box component={Link} href="/movies" sx={navLinkSx}>
            Khám phá
          </Box>

          <Box component={Link} href="/movies?type=series" sx={navLinkSx}>
            Phim bộ
          </Box>

          <Box component={Link} href="/movies?type=single" sx={navLinkSx}>
            Phim lẻ
          </Box>

          <Box component={Link} href="/trending" sx={navLinkSx}>
            Thịnh hành
          </Box>

          {isAuthenticated && (
            <Box component={Link} href="/watchlist" sx={navLinkSx}>
              Danh sách theo dõi
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button onClick={handleToggleMode} sx={navButtonSx} title={`Chế độ: ${mode}`}>
            {renderThemeIcon()}
          </Button>

          {isAuthenticated && !loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {user?.role === "ROLE_ADMIN" && (
                <Link href="/admin" style={{ textDecoration: "none" }}>
                  <Button sx={navButtonSx}>Admin</Button>
                </Link>
              )}
              <UserProfileDropdown onLogout={logout} />
            </Box>
          ) : !loading ? (
            <Box sx={{ display: "flex", gap: 1.5, ml: 1 }}>
              <Link href="/auth/login" style={{ textDecoration: "none" }}>
                <Button sx={navButtonSx}>Đăng nhập</Button>
              </Link>

              <Link href="/auth/register" style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  sx={{
                    borderRadius: 0,
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "none",
                    bgcolor: "text.primary",
                    color: "background.default",
                    "&:hover": {
                      bgcolor: "text.secondary",
                      boxShadow: "none",
                    },
                  }}
                >
                  Đăng ký
                </Button>
              </Link>
            </Box>
          ) : null}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
