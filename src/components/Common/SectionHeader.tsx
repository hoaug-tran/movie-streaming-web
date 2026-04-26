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
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 2,
        mb: 0.5,
        ...sx,
      }}
      {...props}
    >
      <Box>
        <Typography
          variant="h2"
          sx={{
            mb: 0,
            fontSize: { xs: "18px", sm: "20px", md: "24px" },
            fontWeight: 700,
          }}
        >
          {title}
        </Typography>
      </Box>
      {actionLink && (
        <Link
          component={NextLink}
          href={actionLink.href}
          sx={{
            color: "primary.main",
            fontWeight: 600,
            textDecoration: "none",
            fontSize: "14px",
            whiteSpace: "nowrap",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          {actionLink.label}
        </Link>
      )}
    </Box>
  );
}
