import { PaletteOptions } from "@mui/material";

export const lightPalette: PaletteOptions = {
  mode: "light",
  primary: {
    main: "#C8102E",
    light: "#E8192F",
    dark: "#A00B24",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#1C1C1C",
    light: "#444444",
    dark: "#0A0A0A",
    contrastText: "#ffffff",
  },
  background: {
    default: "#F8F7F5",
    paper: "#FFFFFF",
  },
  text: {
    primary: "#0F0F0F",
    secondary: "#5C5C5C",
  },
  divider: "rgba(0, 0, 0, 0.08)",
  action: {
    active: "#0F0F0F",
    hover: "rgba(0, 0, 0, 0.05)",
    selected: "rgba(0, 0, 0, 0.08)",
    disabled: "rgba(0, 0, 0, 0.26)",
    disabledBackground: "rgba(0, 0, 0, 0.08)",
    focus: "rgba(0, 0, 0, 0.10)",
  },
};

export const darkPalette: PaletteOptions = {
  mode: "dark",
  primary: {
    main: "#C8102E",
    light: "#E8192F",
    dark: "#A00B24",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#A0A0A0",
    light: "#C8C8C8",
    dark: "#6A6A6A",
    contrastText: "#000000",
  },
  background: {
    default: "#0C0C0C",
    paper: "#161616",
  },
  text: {
    primary: "#F0F0F0",
    secondary: "#8A8A8A",
  },
  divider: "rgba(255, 255, 255, 0.07)",
  action: {
    active: "#F0F0F0",
    hover: "rgba(255, 255, 255, 0.06)",
    selected: "rgba(255, 255, 255, 0.10)",
    disabled: "rgba(255, 255, 255, 0.28)",
    disabledBackground: "rgba(255, 255, 255, 0.08)",
    focus: "rgba(255, 255, 255, 0.10)",
  },
};
