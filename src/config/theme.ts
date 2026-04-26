import { createTheme, Theme } from "@mui/material/styles";
import { lightPalette, darkPalette } from "./palettes";

const typography = {
  fontFamily: "var(--font-geist-sans), var(--font-geist-mono), sans-serif",
  h1: { fontSize: "3rem", fontWeight: 700, letterSpacing: "-0.02em" },
  h2: { fontSize: "2.25rem", fontWeight: 600, letterSpacing: "-0.01em" },
  h3: { fontSize: "1.875rem", fontWeight: 600, letterSpacing: "-0.01em" },
  h4: { fontSize: "1.5rem", fontWeight: 600 },
  h5: { fontSize: "1.25rem", fontWeight: 500 },
  h6: { fontSize: "1.125rem", fontWeight: 500 },
  body1: { fontSize: "1rem", letterSpacing: "0em" },
  body2: { fontSize: "0.875rem", letterSpacing: "0.01em" },
  button: { textTransform: "none" as const, fontWeight: 500 },
};

const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        boxShadow: "none",
        textTransform: "none",
        fontWeight: 600,
        "&:hover": {
          boxShadow: "none",
        },
      },
      contained: {
        border: "1px solid transparent",
      },
      outlined: {
        borderWidth: "1px",
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: 4,
        },
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
