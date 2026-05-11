import Link from "next/link";
import { Box, Typography, Stack, useTheme, alpha } from "@mui/material";
import { BentoContainer } from "../BentoContainer";

const toneColorMap: Record<string, string> = {
  cyan: "#38bdf8",
  violet: "#8b5cf6",
  amber: "#f59e0b",
  emerald: "#10b981",
};

export function ContentRadar({
  rankings,
}: {
  rankings: {
    title: string;
    subtitle: string;
    accent: string;
    items: {
      id?: number | null;
      slug?: string | null;
      href?: string | null;
      title: string;
      value: string;
      detail: string;
      helper?: string;
    }[];
  }[];
}) {
  const theme = useTheme();

  return (
    <>
      {rankings.slice(0, 2).map((card) => {
        const color = toneColorMap[card.accent] ?? theme.palette.primary.main;
        return (
          <BentoContainer key={card.title} gridColumn="span 2">
            <Typography variant="h6" sx={{ fontWeight: 950, mb: 0.5, color }}>
              {card.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
              {card.subtitle}
            </Typography>
            <Stack spacing={1}>
              {card.items.slice(0, 10).map((item, index) => {
                const row = (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.paper, 0.4),
                      border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                      transition: "all 0.2s",
                      cursor: item.href ? "pointer" : "default",
                      "&:hover": {
                        bgcolor: alpha(color, 0.1),
                        borderColor: alpha(color, 0.3),
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 900, color: alpha(color, 0.8), width: 32 }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </Typography>
                    <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                      <Typography noWrap variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {item.title}
                      </Typography>
                      <Typography noWrap variant="caption" color="text.secondary">
                        {item.detail}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 950, color }}>
                      {item.value}
                    </Typography>
                  </Box>
                );

                return item.href ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {row}
                  </Link>
                ) : (
                  <Box key={item.title}>{row}</Box>
                );
              })}
            </Stack>
          </BentoContainer>
        );
      })}
    </>
  );
}
