import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  useTheme,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { usePathname } from "next/navigation";
import { UserProfileDropdown } from "@/components/UI/UserProfileDropdown";
import SearchBar from "@/components/Search/SearchBar";
import { useSearch } from "@/context/search-context";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const Navbar: React.FC = () => {
  const theme = useTheme();
  const { isAuthenticated, user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { searchOpen, setSearchOpen, searchQuery, setSearchQuery } = useSearch();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname.startsWith("/auth")) return null;

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const navLinks = [
    { label: "Khám phá", href: "/discovery" },
    { label: "Phim bộ", href: "/tv" },
    { label: "Phim lẻ", href: "/movies" },
    { label: "Thịnh hành", href: "/trending" },
    ...(isAuthenticated ? [{ label: "Danh sách", href: "/watchlist" }] : []),
  ];

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
    <>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 0 } }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                display: { md: "none" },
                color: isScrolled ? "text.primary" : "#ffffff",
                transition: "transform 0.2s",
                "&:active": { transform: "scale(0.9)" },
              }}
            >
              <MenuRoundedIcon />
            </IconButton>

            <Link href="/" style={{ textDecoration: "none" }}>
              <Typography
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 900,
                  fontSize: { xs: "1.2rem", md: "1.5rem" },
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
                ml: 6,
              }}
            >
              {navLinks.map((link) => (
                <Box
                  key={link.href}
                  component={Link}
                  href={link.href}
                  sx={{
                    ...navLinkSx,
                    color: pathname === link.href ? "primary.main" : navLinkSx.color,
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Box>
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
              <Box sx={{ ml: 1, display: { xs: "none", md: "block" } }}>
                <Link href="/auth/login" style={{ textDecoration: "none" }}>
                  <Button
                    variant="contained"
                    sx={{
                      borderRadius: 1,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: { xs: "0.75rem", md: "0.875rem" },
                      boxShadow: "none",
                      bgcolor: isScrolled ? "primary.main" : "rgba(255,255,255,0.95)",
                      color: isScrolled ? "#ffffff" : "#000000",
                      px: { xs: 2.5, md: 3 },
                      py: 0.8,
                      "&:hover": {
                        bgcolor: isScrolled ? "primary.dark" : "#ffffff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      },
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    Đăng nhập
                  </Button>
                </Link>
              </Box>
            ) : null}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
            backgroundColor: "background.default",
            backgroundImage: "none",
            borderRight: `1px solid ${theme.palette.divider}`,
            boxShadow: "10px 0 30px rgba(0,0,0,0.5)",
          },
        }}
      >
        <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" fontWeight={900} letterSpacing="-0.04em">
            Gió Phim
          </Typography>
          <IconButton onClick={handleDrawerToggle} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Box>
        <Divider sx={{ opacity: 0.1 }} />
        <List sx={{ pt: 2, px: 1 }}>
          {navLinks.map((link) => (
            <ListItem key={link.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={link.href}
                onClick={handleDrawerToggle}
                sx={{
                  borderRadius: 1.5,
                  backgroundColor:
                    pathname === link.href ? "rgba(200, 16, 46, 0.08)" : "transparent",
                  color: pathname === link.href ? "primary.main" : "text.primary",
                }}
              >
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{
                    fontWeight: pathname === link.href ? 800 : 500,
                    fontSize: "1rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        {!isAuthenticated && (
          <Box sx={{ p: 2, mt: "auto", mb: 4 }}>
            <Button
              fullWidth
              variant="contained"
              component={Link}
              href="/auth/login"
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: 1.5,
                py: 1.4,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "0.95rem",
              }}
            >
              Đăng nhập
            </Button>
          </Box>
        )}
      </Drawer>
    </>
  );
};

export default Navbar;
