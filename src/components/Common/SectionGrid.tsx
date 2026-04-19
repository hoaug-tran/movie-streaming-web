import { Grid, Box, BoxProps } from "@mui/material";
import { ReactNode } from "react";

interface SectionGridProps extends BoxProps {
  children: ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

export function SectionGrid({
  children,
  columns = { xs: 1, sm: 2, md: 4 },
  sx,
  ...props
}: SectionGridProps) {
  return (
    <Box
      sx={{
        py: { xs: 3, md: 4 },
        ...sx,
      }}
      {...props}
    >
      <Grid
        container
        spacing={{ xs: 1.5, sm: 2, md: 2.5 }}
        columns={{ xs: 1, sm: 2, md: 4, lg: 4 }}
      >
        {children}
      </Grid>
    </Box>
  );
}
