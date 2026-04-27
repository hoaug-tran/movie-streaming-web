import { createTheme, Theme } from "@mui/material/styles";
import { lightPalette, darkPalette } from "./palettes";

const typography = {
  fontFamily: "'Inter', 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  h1: { fontSize: "3rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 },
  h2: { fontSize: "2.25rem", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15 },
  h3: { fontSize: "1.875rem", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 },
  h4: { fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.015em" },
  h5: { fontSize: "1.25rem", fontWeight: 600, letterSpacing: "-0.01em" },
  h6: { fontSize: "1rem", fontWeight: 600, letterSpacing: "-0.005em" },
  body1: { fontSize: "1rem", lineHeight: 1.65, letterSpacing: "0em" },
  body2: { fontSize: "0.875rem", lineHeight: 1.6, letterSpacing: "0.01em" },
  caption: { fontSize: "0.75rem", lineHeight: 1.5, letterSpacing: "0.02em" },
  button: { textTransform: "none" as const, fontWeight: 600, letterSpacing: "0.01em" },
};

const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 2,
        boxShadow: "none",
        textTransform: "none",
        fontWeight: 600,
        "&:hover": { boxShadow: "none" },
      },
      contained: { border: "1px solid transparent" },
      outlined: { borderWidth: "1px" },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": { borderRadius: 2 },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        backgroundImage: "none",
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: "none",
        borderRadius: 4,
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundImage: "none",
        boxShadow: "none",
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        fontWeight: 500,
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: { borderColor: "rgba(255,255,255,0.06)" },
    },
  },
};

export const lightTheme: Theme = createTheme({
  palette: lightPalette,
  typography,
  components,
});

export const darkTheme: Theme = createTheme({
  palette: darkPalette,
  typography,
  components,
});
