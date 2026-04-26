import { Box, Typography } from "@mui/material";

interface CategoryCardProps {
  name: string;
}

export function CategoryCard({ name }: CategoryCardProps) {
  return (
    <Box
      sx={{
        height: 120,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s ease",
        "&:hover": {
          transform: "scale(1.05)",
          "&::after": {
            opacity: 1,
          },
        },
        "::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "action.hover",
          opacity: 0,
          transition: "opacity 0.2s ease",
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: "text.primary",
          fontWeight: 600,
          textAlign: "center",
          zIndex: 1,
          px: 2,
        }}
      >
        {name}
      </Typography>
    </Box>
  );
}
