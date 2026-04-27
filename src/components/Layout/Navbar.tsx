"use client";

import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Box, Button, useTheme } from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { usePathname } from "next/navigation";
import { UserProfileDropdown } from "@/components/UI/UserProfileDropdown";
import SearchBar from "@/components/Search/SearchBar";
import { useSearch } from "@/context/search-context";

const Navbar: React.FC = () => {
  const theme = useTheme();
  const { isAuthenticated, user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { searchOpen, setSearchOpen, searchQuery, setSearchQuery } = useSearch();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname.startsWith("/auth")) return null;

  const navLinkSx = {
    color: isScrolled ? "text.primary" : "rgba(255,255,255,0.85)",
    fontWeight: 500,
    fontSize: "0.875rem",
    letterSpacing: "0.01em",
    textDecoration: "none",
    transition: "color 0.2s ease, opacity 0.2s ease",
    "&:hover": { color: isScrolled ? "text.primary" : "#ffffff", opacity: 1 },
    "&.active": { color: "primary.main", fontWeight: 600 },
  };

  const navButtonSx = {
    color: isScrolled ? "text.primary" : "rgba(255,255,255,0.85)",
    transition: "all 0.2s ease",
    borderRadius: 1,
    textTransform: "none",
    fontWeight: 500,
    fontSize: "0.875rem",
    minWidth: "auto",
    px: 1.5,
    "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
  };

  const handleSearchOpen = (open: boolean) => {
    setSearchOpen(open);
    if (!open) {
      setSearchQuery("");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: isScrolled
          ? theme.palette.mode === "dark"
            ? "rgba(12, 12, 12, 0.94)"
            : "rgba(255, 255, 255, 0.94)"
          : "transparent",
        backdropFilter: isScrolled ? "blur(16px)" : "none",
        backgroundImage: "none",
        borderBottom: isScrolled ? `1px solid ${theme.palette.divider}` : "1px solid transparent",
        transition:
          "background-color 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease",
        zIndex: 1000,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          minHeight: { xs: 60, md: 68 },
          px: { xs: 2, md: 4 },
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <Typography
            sx={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 900,
              fontSize: { xs: "1.3rem", md: "1.5rem" },
              letterSpacing: "-0.05em",
              color: isScrolled ? "text.primary" : "#ffffff",
              cursor: "pointer",
              transition: "opacity 0.2s ease",
              "&:hover": { opacity: 0.8 },
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
          <Box component={Link} href="/discovery" sx={navLinkSx}>
            Khám phá
          </Box>
          <Box component={Link} href="/tv" sx={navLinkSx}>
            Phim bộ
          </Box>
          <Box component={Link} href="/movies" sx={navLinkSx}>
            Phim lẻ
          </Box>
          <Box component={Link} href="/trending" sx={navLinkSx}>
            Thịnh hành
          </Box>
          {isAuthenticated && (
            <Box component={Link} href="/watchlist" sx={navLinkSx}>
              Danh sách
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <SearchBar
            isOpen={searchOpen}
            onOpenChange={handleSearchOpen}
            onSearch={handleSearch}
            value={searchQuery}
          />

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
                    borderRadius: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    boxShadow: "none",
                    bgcolor: "primary.main",
                    color: "#ffffff",
                    px: 2,
                    "&:hover": { bgcolor: "primary.dark", boxShadow: "none" },
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
