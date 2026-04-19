import { Box, Typography } from "@mui/material";

interface CategoryCardProps {
  name: string;
}

export function CategoryCard({ name }: CategoryCardProps) {
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${Math.abs(hash) % 360}, 70%, 20%)`;
    return color;
  };

  return (
    <Box
      sx={{
        height: 120,
        backgroundColor: stringToColor(name),
        borderRadius: 2,
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
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          opacity: 0,
          transition: "opacity 0.2s ease",
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: "white",
          fontWeight: 600,
          textAlign: "center",
          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
          zIndex: 1,
          px: 2,
        }}
      >
        {name}
      </Typography>
    </Box>
  );
}
