"use client";

import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme } from "@/config/theme";
import { queryClient } from "@/config/react-query";
import Navbar from "@/components/Layout/Navbar";
import { AuthProvider } from "@/context/auth-context";

export function ClientLayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
