import React, { useState, useEffect, useCallback } from "react";
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
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { UserProfileDropdown } from "@/components/UI/UserProfileDropdown";
import SearchBar from "@/components/Search/SearchBar";
import { useSearch } from "@/context/search-context";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  Compass,
  Tv,
  Film,
  Bookmark,
  ShieldCheck,
  LogIn,
  Heart,
  History,
  HardDrive,
  Download,
  WifiOff,
  Shield,
  Clock,
} from "lucide-react";
import NotificationBell from "@/components/Notification/NotificationBell";
import { usePwa } from "@/hooks/use-pwa";

const Navbar: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated, user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { searchOpen, setSearchOpen, searchQuery, setSearchQuery } = useSearch();
  const { isPWA, canInstall, promptInstall, mounted, isInstalled, isIOS } = usePwa();
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [openAppDialogOpen, setOpenAppDialogOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!canInstall) {
      setInstallDialogOpen(false);
      return;
    }
    setInstalling(true);
    const accepted = await promptInstall();
    setInstalling(false);
    if (accepted) {
      setInstallDialogOpen(false);
      router.push("/downloads");
    }
  }, [canInstall, promptInstall, router]);

  if (pathname.startsWith("/auth")) return null;

  const canAccessAdmin = user?.role === "ROLE_ADMIN" || user?.role === "ROLE_MODERATOR";
  const adminHref = user?.role === "ROLE_MODERATOR" ? "/admin/moderation" : "/admin";

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleOfflineClick = (e: React.MouseEvent) => {
    if (!mounted) return;
    if (isPWA) return;
    e.preventDefault();
    setMobileOpen(false);
    if (isInstalled) {
      setOpenAppDialogOpen(true);
    } else {
      setInstallDialogOpen(true);
    }
  };

  const desktopNavLinks = [
    { label: "Khám phá", href: "/discovery", icon: <Compass size={20} /> },
    { label: "Phim bộ", href: "/tv", icon: <Tv size={20} /> },
    { label: "Phim lẻ", href: "/movies", icon: <Film size={20} /> },
    ...(isAuthenticated && !loading
      ? [
          { label: "Xem sau", href: "/watchlist", icon: <Bookmark size={20} /> },
          { label: "Yêu thích", href: "/favorites", icon: <Heart size={20} /> },
          { label: "Lịch sử", href: "/history", icon: <History size={20} /> },
          {
            label: "Ngoại tuyến",
            href: "/downloads",
            icon: <HardDrive size={20} />,
            isOffline: true,
          },
        ]
      : []),
  ];

  const mobileNavLinks = [
    { label: "Trang chủ", href: "/", icon: <Film size={20} /> },
    ...desktopNavLinks,
    ...(canAccessAdmin
      ? [{ label: "Trang quản trị", href: adminHref, icon: <ShieldCheck size={20} /> }]
      : []),
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
    if (!open) setSearchQuery("");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const installDialog = (
    <Dialog
      open={installDialogOpen}
      onClose={() => setInstallDialogOpen(false)}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#161616",
          border: "1px solid rgba(200,16,46,0.25)",
          borderRadius: 3,
          backgroundImage: "none",
          mx: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.5 }}>
          <Box
            component="img"
            src="/icons/logo.webp"
            alt="Gió Phim"
            sx={{ width: 48, height: 48, borderRadius: 2, flexShrink: 0 }}
          />
          <Box>
            <Typography
              sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#F0F0F0", lineHeight: 1.2 }}
            >
              Cài Gió Phim để xem offline
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#8A8A8A", mt: 0.3 }}>
              Tải phim và xem khi không có mạng
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pt: "8px !important", pb: 1 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "rgba(200,16,46,0.06)",
            border: "1px solid rgba(200,16,46,0.15)",
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
          }}
        >
          {[
            { icon: <WifiOff size={15} />, text: "Xem phim không cần mạng" },
            { icon: <Shield size={15} />, text: "Lưu trữ an toàn trên thiết bị" },
            { icon: <Clock size={15} />, text: "Tự động xoá sau 48 giờ" },
          ].map((f) => (
            <Box key={f.text} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ color: "#C8102E", flexShrink: 0, display: "flex" }}>{f.icon}</Box>
              <Typography sx={{ fontSize: "0.85rem", color: "#C0C0C0" }}>{f.text}</Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
        <Button
          onClick={() => setInstallDialogOpen(false)}
          sx={{ color: "#8A8A8A", textTransform: "none", fontWeight: 600, flex: 1 }}
        >
          Để sau
        </Button>
        <Button
          variant="contained"
          onClick={handleInstall}
          disabled={installing}
          startIcon={
            installing ? <CircularProgress size={16} color="inherit" /> : <Download size={16} />
          }
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 1.5,
            bgcolor: "#C8102E",
            "&:hover": { bgcolor: "#A00B24" },
            flex: 2,
          }}
        >
          {canInstall ? (installing ? "Đang cài..." : "Cài đặt ngay") : "Đã hiểu"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const openAppDialog = (
    <Dialog
      open={openAppDialogOpen}
      onClose={() => setOpenAppDialogOpen(false)}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#161616",
          border: "1px solid rgba(74, 222, 128, 0.25)",
          borderRadius: 3,
          backgroundImage: "none",
          mx: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.5 }}>
          <Box
            component="img"
            src="/icons/logo.webp"
            alt="Gió Phim"
            sx={{ width: 48, height: 48, borderRadius: 2, flexShrink: 0 }}
          />
          <Box>
            <Typography
              sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#F0F0F0", lineHeight: 1.2 }}
            >
              Mở Gió Phim để xem offline
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#8A8A8A", mt: 0.3 }}>
              Bạn đã cài app rồi. Hãy mở từ màn hình chính.
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pt: "8px !important", pb: 1 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "rgba(74, 222, 128, 0.06)",
            border: "1px solid rgba(74, 222, 128, 0.15)",
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
          }}
        >
          <Typography sx={{ fontSize: "0.85rem", color: "#C0C0C0", lineHeight: 1.6 }}>
            Trang Ngoại tuyến chỉ hoạt động trong app Gió Phim đã cài đặt. Vui lòng:
          </Typography>
          {(isIOS
            ? [
                "Đóng tab này",
                "Mở app Gió Phim từ màn hình chính iPhone",
                "Bấm lại mục Ngoại tuyến trong app",
              ]
            : [
                "Đóng tab này",
                "Mở app Gió Phim từ màn hình chính / launcher",
                "Bấm lại mục Ngoại tuyến trong app",
              ]
          ).map((step, idx) => (
            <Box key={step} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  bgcolor: "#4ade80",
                  color: "#0b1f12",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "0.7rem",
                  fontWeight: 900,
                  flexShrink: 0,
                  mt: "1px",
                }}
              >
                {idx + 1}
              </Box>
              <Typography sx={{ fontSize: "0.85rem", color: "#C0C0C0", lineHeight: 1.5 }}>
                {step}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => setOpenAppDialogOpen(false)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 1.5,
            bgcolor: "#4ade80",
            color: "#0b1f12",
            "&:hover": { bgcolor: "#22c55e" },
          }}
        >
          Đã hiểu
        </Button>
      </DialogActions>
    </Dialog>
  );

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
          paddingTop: "env(safe-area-inset-top, 0px)",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            minHeight: { xs: 60, md: 68 },
            px: { xs: 1.5, md: 4 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, md: 0 },
              flexShrink: 0,
            }}
          >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                display: { md: "none" },
                color: isScrolled ? "text.primary" : "#ffffff",
                width: 42,
                height: 42,
                mr: 0,
                p: 0.75,
                transition: "transform 0.2s",
                "&:active": { transform: "scale(0.9)" },
              }}
            >
              <MenuRoundedIcon sx={{ fontSize: 27 }} />
            </IconButton>

            <Link href="/" style={{ textDecoration: "none", display: "inline-flex" }}>
              <Typography
                sx={{
                  display: searchOpen ? { xs: "none", sm: "block" } : "block",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 900,
                  fontSize: { xs: "1.2rem", md: "1.5rem" },
                  lineHeight: 1,
                  letterSpacing: "-0.05em",
                  color: isScrolled ? "text.primary" : "#ffffff",
                  cursor: "pointer",
                  transition: "opacity 0.2s ease, font-size 0.2s ease",
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
              {desktopNavLinks.map((link) => (
                <Box
                  key={link.href}
                  component={Link}
                  href={link.href}
                  onClick={(link as any).isOffline ? handleOfflineClick : undefined}
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

          <Box
            sx={{
              display: "flex",
              gap: { xs: 0.5, sm: 1 },
              alignItems: "center",
              flexShrink: 0,
              minWidth: "max-content",
            }}
          >
            <SearchBar
              isOpen={searchOpen}
              onOpenChange={handleSearchOpen}
              onSearch={handleSearch}
              value={searchQuery}
            />

            {isAuthenticated && !loading ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 0.5, sm: 1 },
                  flexShrink: 0,
                }}
              >
                {canAccessAdmin && (
                  <Box sx={{ display: { xs: "none", md: "block" } }}>
                    <Link href={adminHref} style={{ textDecoration: "none" }}>
                      <Button sx={navButtonSx} startIcon={<ShieldCheck size={18} />}>
                        Trang quản trị
                      </Button>
                    </Link>
                  </Box>
                )}

                <Box
                  sx={{
                    display: searchOpen ? { xs: "none", md: "flex" } : { xs: "none", sm: "flex" },
                  }}
                >
                  <NotificationBell isScrolled={isScrolled} />
                </Box>

                <Box
                  sx={{
                    display: searchOpen ? { xs: "none", md: "block" } : "block",
                    flexShrink: 0,
                  }}
                >
                  <UserProfileDropdown onLogout={logout} />
                </Box>
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
            paddingTop: "env(safe-area-inset-top, 0px)",
          },
        }}
      >
        <Box
          sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography variant="h6" fontWeight={900} letterSpacing="-0.04em">
            Gió Phim
          </Typography>
          <IconButton onClick={handleDrawerToggle} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Box>
        <Divider sx={{ opacity: 0.1 }} />
        <List sx={{ pt: 2, px: 1 }}>
          {mobileNavLinks.map((link) => (
            <ListItem key={link.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={link.href}
                onClick={(e: React.MouseEvent) => {
                  if ((link as any).isOffline) handleOfflineClick(e);
                  else handleDrawerToggle();
                }}
                sx={{
                  borderRadius: 1.5,
                  py: 1.2,
                  px: 2,
                  backgroundColor:
                    pathname === link.href ? "rgba(200, 16, 46, 0.08)" : "transparent",
                  color: pathname === link.href ? "primary.main" : "text.primary",
                  gap: 2,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    color: pathname === link.href ? "primary.main" : "text.secondary",
                    opacity: pathname === link.href ? 1 : 0.7,
                  }}
                >
                  {link.icon}
                </Box>
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{
                    fontWeight: pathname === link.href ? 800 : 600,
                    fontSize: "0.95rem",
                    letterSpacing: "-0.01em",
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          {isAuthenticated && !loading && (
            <ListItem disablePadding sx={{ mb: 0.5, display: { xs: "block", sm: "none" } }}>
              <NotificationBell variant="drawer" />
            </ListItem>
          )}
        </List>
        {!isAuthenticated && (
          <Box sx={{ p: 2, mt: "auto", mb: 4 }}>
            <Button
              fullWidth
              variant="contained"
              component={Link}
              href="/auth/login"
              onClick={handleDrawerToggle}
              startIcon={<LogIn size={20} />}
              sx={{
                borderRadius: 1.5,
                py: 1.5,
                fontWeight: 800,
                textTransform: "none",
                fontSize: "1rem",
                boxShadow: "0 8px 20px rgba(200, 16, 46, 0.3)",
              }}
            >
              Đăng nhập
            </Button>
          </Box>
        )}
      </Drawer>

      {installDialog}
      {openAppDialog}
    </>
  );
};

export default Navbar;
