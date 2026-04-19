import { Box, BoxProps } from "@mui/material";

interface GradientOverlayProps extends BoxProps {
  children?: React.ReactNode;
  intensity?: "light" | "medium" | "strong";
}

export function GradientOverlay({
  children,
  intensity = "medium",
  sx,
  ...props
}: GradientOverlayProps) {
  const gradientMap = {
    light: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)",
    medium: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.9) 100%)",
    strong: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,1) 100%)",
  };

  return (
    <Box
      sx={{
        position: "relative",
        ...sx,
      }}
      {...props}
    >
      {children}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: gradientMap[intensity],
          pointerEvents: "none",
        }}
      />
    </Box>
  );
}
