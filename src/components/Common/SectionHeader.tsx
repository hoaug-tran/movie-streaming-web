import { Typography, Box, Link, BoxProps } from "@mui/material";
import NextLink from "next/link";

interface SectionHeaderProps extends BoxProps {
  title: string;
  subtitle?: string;
  actionLink?: {
    label: string;
    href: string;
  };
}

export function SectionHeader({ title, subtitle, actionLink, sx, ...props }: SectionHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: { xs: 1, sm: 0 },
        mb: 3,
        ...sx,
      }}
      {...props}
    >
      <Box>
        <Typography
          variant="h2"
          sx={{
            mb: subtitle ? 0.4 : 0,
            fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.4rem" },
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "text.primary",
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.78rem",
              fontWeight: 400,
              letterSpacing: "0.01em",
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {actionLink && (
        <Link
          component={NextLink}
          href={actionLink.href}
          sx={{
            color: "text.secondary",
            fontWeight: 500,
            textDecoration: "none",
            fontSize: "0.8rem",
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
            transition: "color 0.2s ease",
            "&:hover": { color: "text.primary" },
          }}
        >
          {actionLink.label} →
        </Link>
      )}
    </Box>
  );
}
