"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { X, Download, WifiOff, Shield, Clock, Share } from "lucide-react";
import { usePwa } from "@/hooks/use-pwa";
import IOSInstallInstructions from "./IOSInstallInstructions";
import React from "react";

const DISMISSED_KEY = "giophim-install-banner-dismissed";
const AUTO_SHOW_KEY = "giophim-install-auto-shown";
const AUTO_SHOW_DELAY_MS = 45000;
const BANNER_HEIGHT_VAR = "--giophim-install-banner-h";
const BANNER_HEIGHT_PX = 76;

const SlideUp = React.forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function InstallBanner() {
  const { isPWA, canInstall, promptInstall, mounted, isIOS, isSafari, needsManualInstall } =
    usePwa();
  const [bannerVisible, setBannerVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  const showIOSGuide = needsManualInstall && isSafari;

  useEffect(() => {
    if (!mounted || isPWA) return;

    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;

    if (canInstall || showIOSGuide) {
      setBannerVisible(true);
      return;
    }

    const autoShown = sessionStorage.getItem(AUTO_SHOW_KEY);
    if (autoShown) return;

    const timer = setTimeout(() => {
      sessionStorage.setItem(AUTO_SHOW_KEY, "1");
      setModalOpen(true);
    }, AUTO_SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [mounted, isPWA, canInstall, showIOSGuide]);

  useEffect(() => {
    if ((canInstall || showIOSGuide) && mounted && !isPWA) {
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      if (!dismissed) setBannerVisible(true);
    }
  }, [canInstall, mounted, isPWA, showIOSGuide]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (bannerVisible) {
      root.style.setProperty(BANNER_HEIGHT_VAR, `${BANNER_HEIGHT_PX}px`);
    } else {
      root.style.setProperty(BANNER_HEIGHT_VAR, "0px");
    }
    return () => {
      root.style.setProperty(BANNER_HEIGHT_VAR, "0px");
    };
  }, [bannerVisible]);

  const handleInstall = useCallback(async () => {
    if (showIOSGuide) {
      setModalOpen(true);
      setBannerVisible(false);
      return;
    }
    if (!canInstall) {
      setModalOpen(false);
      setBannerVisible(false);
      return;
    }
    setInstalling(true);
    const accepted = await promptInstall();
    setInstalling(false);
    if (accepted) {
      setModalOpen(false);
      setBannerVisible(false);
    }
  }, [canInstall, promptInstall, showIOSGuide]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setBannerVisible(false);
    setModalOpen(false);
  }, []);

  if (!mounted || isPWA) return null;

  if (isIOS && !isSafari) return null;

  const features = [
    { icon: <WifiOff size={15} />, text: "Xem phim không cần mạng" },
    { icon: <Shield size={15} />, text: "Lưu trữ an toàn trên thiết bị" },
    { icon: <Clock size={15} />, text: "Tự động xoá sau 48 giờ" },
  ];

  const buttonLabel = (() => {
    if (showIOSGuide) return "Cách cài";
    if (installing) return "Đang cài...";
    return "Cài đặt";
  })();

  const modalButtonLabel = (() => {
    if (showIOSGuide) return "Đã hiểu";
    if (!canInstall) return "Đã hiểu";
    if (installing) return "Đang cài...";
    return "Cài đặt ngay";
  })();

  return (
    <>
      <Slide direction="up" in={bannerVisible} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1400,
            bgcolor: "#161616",
            borderTop: "1px solid rgba(200,16,46,0.3)",
            px: { xs: 2, sm: 3 },
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            boxShadow: "0 -8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <Box
            component="img"
            src="/icons/logo.webp"
            alt="Gió Phim"
            sx={{ width: 44, height: 44, borderRadius: 2, flexShrink: 0 }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#F0F0F0", lineHeight: 1.3 }}
            >
              Cài đặt Gió Phim
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#8A8A8A", lineHeight: 1.4, mt: 0.25 }}>
              {showIOSGuide
                ? "Thêm vào màn hình chính để xem offline"
                : "Tải phim offline, xem không cần mạng"}
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={handleInstall}
            disabled={installing}
            startIcon={showIOSGuide ? <Share size={14} /> : undefined}
            sx={{
              bgcolor: "#C8102E",
              "&:hover": { bgcolor: "#A00B24" },
              fontWeight: 700,
              fontSize: "0.8rem",
              px: 2,
              py: 0.75,
              borderRadius: 1.5,
              flexShrink: 0,
            }}
          >
            {buttonLabel}
          </Button>
          <IconButton
            size="small"
            onClick={handleDismiss}
            aria-label="Đóng banner cài đặt"
            sx={{ color: "#8A8A8A", flexShrink: 0 }}
          >
            <X size={18} />
          </IconButton>
        </Box>
      </Slide>

      <Dialog
        open={modalOpen}
        onClose={handleDismiss}
        TransitionComponent={SlideUp}
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Box
              component="img"
              src="/icons/logo.webp"
              alt="Gió Phim"
              sx={{ width: 52, height: 52, borderRadius: 2, flexShrink: 0 }}
            />
            <Box>
              <Typography
                sx={{ fontWeight: 800, fontSize: "1.15rem", color: "#F0F0F0", lineHeight: 1.2 }}
              >
                Cài Gió Phim
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "#8A8A8A", mt: 0.3 }}>
                Trải nghiệm tốt hơn trên thiết bị
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            px: 3,
            pt: "8px !important",
            pb: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
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
            {features.map((f) => (
              <Box key={f.text} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ color: "#C8102E", flexShrink: 0, display: "flex" }}>{f.icon}</Box>
                <Typography sx={{ fontSize: "0.85rem", color: "#C0C0C0" }}>{f.text}</Typography>
              </Box>
            ))}
          </Box>

          {showIOSGuide && <IOSInstallInstructions />}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={handleDismiss}
            sx={{ color: "#8A8A8A", textTransform: "none", fontWeight: 600, flex: 1 }}
          >
            {showIOSGuide ? "Đóng" : "Để sau"}
          </Button>
          <Button
            variant="contained"
            onClick={showIOSGuide ? handleDismiss : handleInstall}
            disabled={installing}
            startIcon={showIOSGuide ? undefined : <Download size={16} />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 1.5,
              bgcolor: "#C8102E",
              "&:hover": { bgcolor: "#A00B24" },
              flex: 2,
            }}
          >
            {modalButtonLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
