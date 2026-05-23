"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "@/context/auth-context";
import { SearchProvider, useSearch } from "@/context/search-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/config/react-query";
import Navbar from "@/components/Layout/Navbar";
import SearchResultsPage from "@/components/Search/SearchResultsPage";
import { darkTheme } from "@/config/theme";
import { Box } from "@mui/material";
import { NotificationProvider } from "@/context/notification-context";
import { UploadProgressProvider } from "@/context/upload-progress-context";
import UploadProgressSnackbar from "@/components/Upload/UploadProgressSnackbar";
import InstallBanner from "@/components/PWA/InstallBanner";
import PwaRecoveryManager from "@/components/PWA/PwaRecoveryManager";
import GioPhimBot from "@/components/Chatbot/GioPhimBot";
import { usePushNotification } from "@/hooks/use-push-notification";
import { useNotificationSync } from "@/modules/notification/hooks/useNotificationSync";

function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { searchOpen, searchQuery, setSearchOpen, setSearchQuery } = useSearch();
  const isAdminRoute = pathname?.startsWith("/admin");
  usePushNotification();
  useNotificationSync();

  const handleCloseSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, [pathname, setSearchOpen, setSearchQuery]);

  if (isAdminRoute) {
    return <Box>{children}</Box>;
  }

  return (
    <>
      <Navbar />
      <Box sx={{ display: searchOpen && searchQuery ? "none" : "block" }}>{children}</Box>
      {searchOpen && searchQuery && (
        <SearchResultsPage query={searchQuery} onClose={handleCloseSearch} />
      )}
      <InstallBanner />
      <GioPhimBot />
    </>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SearchProvider>
            <NotificationProvider>
              <UploadProgressProvider>
                <LayoutWrapper>{children}</LayoutWrapper>
                <PwaRecoveryManager />
                <UploadProgressSnackbar />
              </UploadProgressProvider>
            </NotificationProvider>
          </SearchProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
