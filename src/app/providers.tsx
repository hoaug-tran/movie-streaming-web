"use client";

import { ReactNode, createContext, useState, useMemo, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "@/context/auth-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/config/react-query";
import Navbar from "@/components/Layout/Navbar";
import { lightTheme, darkTheme } from "@/config/theme";

export const ThemeContext = createContext({
  toggleColorMode: (newMode?: "light" | "dark" | "system") => {},
  mode: "dark" as "light" | "dark" | "system",
});

export default function Providers({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark" | "system">("system");
  const [mounted, setMounted] = useState(false);
  const [actualMode, setActualMode] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode") as "light" | "dark" | "system" | null;
    if (savedMode) {
      setMode(savedMode);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setActualMode(prefersDark ? "dark" : "light");

      const listener = (e: MediaQueryListEvent) => {
        setActualMode(e.matches ? "dark" : "light");
      };

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    } else {
      setActualMode(mode);
    }
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: (newMode?: "light" | "dark" | "system") => {
        setMode((prevMode) => {
          const nextMode = newMode || (prevMode === "light" ? "dark" : "light");
          localStorage.setItem("themeMode", nextMode);
          return nextMode;
        });
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(() => (actualMode === "light" ? lightTheme : darkTheme), [actualMode]);

  if (!mounted) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
