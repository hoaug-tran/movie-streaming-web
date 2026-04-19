import { createTheme } from "@mui/material/styles";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0F0F0F",
      paper: "#1A1A1A",
    },
    primary: {
      main: "#E63946",
      light: "#F55A64",
      dark: "#D62828",
    },
    secondary: {
      main: "#BB86FC",
      light: "#CE93FF",
      dark: "#9D4EDD",
    },
    info: {
      main: "#4D9DE0",
    },
    success: {
      main: "#10B981",
    },
    warning: {
      main: "#F59E0B",
    },
    error: {
      main: "#EF4444",
    },
    divider: "#333333",
    text: {
      primary: "#FFFFFF",
      secondary: "#E0E0E0",
      disabled: "#707070",
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: "56px",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.5px",
    },
    h2: {
      fontSize: "32px",
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: "-0.3px",
    },
    h3: {
      fontSize: "24px",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: "20px",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      fontSize: "14px",
      fontWeight: 600,
      lineHeight: 1.5,
      textTransform: "none",
    },
    caption: {
      fontSize: "12px",
      fontWeight: 400,
      lineHeight: 1.4,
    },
    overline: {
      fontSize: "12px",
      fontWeight: 600,
      lineHeight: 1.8,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 6,
          transition: "all 0.3s ease",
          "&:hover": {
            opacity: 0.9,
          },
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(230, 57, 70, 0.3)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#1A1A1A",
          backgroundImage: "none",
          border: "1px solid #222222",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: "#333333",
          borderRadius: 4,
          height: 4,
        },
      },
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#FFFFFF",
      paper: "#F8F8F8",
    },
    primary: {
      main: "#E63946",
    },
    secondary: {
      main: "#BB86FC",
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
