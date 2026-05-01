"use client";

import { ReactNode } from "react";
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

function LayoutWrapper({ children }: { children: ReactNode }) {
  const { searchOpen, searchQuery, setSearchOpen, setSearchQuery } = useSearch();

  const handleCloseSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <Navbar />

      {searchOpen && searchQuery ? (
        <SearchResultsPage query={searchQuery} onClose={handleCloseSearch} />
      ) : (
        <Box>{children}</Box>
      )}
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
              <LayoutWrapper>{children}</LayoutWrapper>
            </NotificationProvider>
          </SearchProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
