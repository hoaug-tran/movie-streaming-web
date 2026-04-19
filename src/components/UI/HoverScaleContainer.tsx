import { Box, BoxProps } from "@mui/material";

interface HoverScaleContainerProps extends BoxProps {
  children: React.ReactNode;
  scale?: number;
}

export function HoverScaleContainer({
  children,
  scale = 1.05,
  sx,
  ...props
}: HoverScaleContainerProps) {
  return (
    <Box
      sx={{
        transition: "all 0.3s ease",
        transform: "scale(1)",
        "&:hover": {
          transform: `scale(${scale})`,
          zIndex: 10,
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
