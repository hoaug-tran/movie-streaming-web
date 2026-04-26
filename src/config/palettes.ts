import { PaletteOptions } from "@mui/material";

export const lightPalette: PaletteOptions = {
  mode: "light",
  primary: {
    main: "#E50914",
    light: "#F40612",
    dark: "#B81D24",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#333333",
    light: "#666666",
    dark: "#1A1A1A",
    contrastText: "#ffffff",
  },
  background: {
    default: "#F5F5F5",
    paper: "#FFFFFF",
  },
  text: {
    primary: "#141414",
    secondary: "#666666",
  },
  divider: "rgba(0, 0, 0, 0.12)",
  action: {
    active: "#141414",
    hover: "rgba(0, 0, 0, 0.04)",
    selected: "rgba(0, 0, 0, 0.08)",
    disabled: "rgba(0, 0, 0, 0.26)",
    disabledBackground: "rgba(0, 0, 0, 0.12)",
    focus: "rgba(0, 0, 0, 0.12)",
  },
};

export const darkPalette: PaletteOptions = {
  mode: "dark",
  primary: {
    main: "#E50914",
    light: "#F40612",
    dark: "#B81D24",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#B3B3B3",
    light: "#E5E5E5",
    dark: "#808080",
    contrastText: "#000000",
  },
  background: {
    default: "#1A1A1A",
    paper: "#242424",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#B3B3B3",
  },
  divider: "rgba(255, 255, 255, 0.12)",
  action: {
    active: "#FFFFFF",
    hover: "rgba(255, 255, 255, 0.1)",
    selected: "rgba(255, 255, 255, 0.16)",
    disabled: "rgba(255, 255, 255, 0.3)",
    disabledBackground: "rgba(255, 255, 255, 0.12)",
    focus: "rgba(255, 255, 255, 0.12)",
  },
};
