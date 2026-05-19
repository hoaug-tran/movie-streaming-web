"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Stack,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import NextLink from "next/link";
import { ChevronRight } from "lucide-react";
import { Footer } from "@/components/Layout/Footer";

export type InfoPageSection = {
  id: string;
  title: string;
  content: ReactNode;
};

export type InfoPageBreadcrumb = {
  label: string;
  href?: string;
};

export type InfoPageRelated = {
  label: string;
  description: string;
  href: string;
};

export type InfoPageShellProps = {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  meta?: string;
  breadcrumbs: InfoPageBreadcrumb[];
  sections: InfoPageSection[];
  related?: InfoPageRelated[];
  intro?: ReactNode;
  contactNote?: ReactNode;
};

export function InfoPageShell({
  eyebrow,
  title,
  subtitle,
  meta,
  breadcrumbs,
  sections,
  related,
  intro,
  contactNote,
}: InfoPageShellProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const ids = sections.map((s) => s.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const handleJump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 90;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
      <Box
        sx={{
          position: "relative",
          pt: { xs: 11, md: 14 },
          pb: { xs: 4, md: 6 },
          overflow: "hidden",
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: isDark
            ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 70%)`
            : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 70%)`,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle at 12% 20%, ${alpha(theme.palette.primary.main, isDark ? 0.18 : 0.12)}, transparent 40%), radial-gradient(circle at 92% 0%, ${alpha(theme.palette.text.primary, isDark ? 0.05 : 0.03)}, transparent 38%)`,
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative" }}>
          <Breadcrumbs
            separator={<ChevronRight size={14} />}
            aria-label="breadcrumb"
            sx={{
              mb: 3,
              fontSize: "0.78rem",
              "& .MuiBreadcrumbs-separator": { color: "text.disabled", mx: 0.75 },
            }}
          >
            <MuiLink
              component={NextLink}
              href="/"
              sx={{
                textDecoration: "none",
                color: "text.secondary",
                fontSize: "0.78rem",
                fontWeight: 500,
                transition: "color 0.2s",
                "&:hover": { color: "text.primary" },
              }}
            >
              Trang chủ
            </MuiLink>
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              if (isLast || !crumb.href) {
                return (
                  <Typography
                    key={crumb.label}
                    sx={{
                      color: "text.primary",
                      fontWeight: 600,
                      fontSize: "0.78rem",
                    }}
                  >
                    {crumb.label}
                  </Typography>
                );
              }
              return (
                <MuiLink
                  key={crumb.label}
                  component={NextLink}
                  href={crumb.href}
                  sx={{
                    textDecoration: "none",
                    color: "text.secondary",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    "&:hover": { color: "text.primary" },
                  }}
                >
                  {crumb.label}
                </MuiLink>
              );
            })}
          </Breadcrumbs>

          <Stack spacing={2.5} sx={{ maxWidth: 820 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Box
                sx={{
                  width: 6,
                  height: 18,
                  backgroundColor: "primary.main",
                  borderRadius: 0.5,
                  boxShadow: `0 0 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "primary.main",
                }}
              >
                {eyebrow}
              </Typography>
            </Box>

            <Typography
              component="h1"
              sx={{
                fontSize: { xs: "2.2rem", sm: "2.8rem", md: "3.6rem" },
                fontWeight: 950,
                letterSpacing: "-0.045em",
                lineHeight: 1.05,
                color: "text.primary",
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: "0.95rem", md: "1.05rem" },
                color: "text.secondary",
                lineHeight: 1.7,
                maxWidth: 720,
              }}
            >
              {subtitle}
            </Typography>

            {meta && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
                <Chip
                  label={meta}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    color: "text.secondary",
                    backgroundColor: alpha(theme.palette.text.primary, 0.05),
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                />
              </Stack>
            )}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 6, md: 9 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "240px minmax(0, 1fr)" },
            gap: { xs: 3, md: 5 },
            alignItems: "flex-start",
          }}
        >
          <Box
            component="aside"
            sx={{
              position: { md: "sticky" },
              top: { md: 96 },
              alignSelf: "flex-start",
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: isDark
                ? alpha(theme.palette.background.paper, 0.5)
                : theme.palette.background.paper,
              p: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "text.secondary",
                mb: 1.5,
              }}
            >
              Mục lục
            </Typography>
            <Stack spacing={0.5} component="nav">
              {sections.map((section, idx) => {
                const isActive = activeId === section.id;
                return (
                  <Box
                    key={section.id}
                    component="button"
                    onClick={() => handleJump(section.id)}
                    sx={{
                      all: "unset",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      cursor: "pointer",
                      px: 1.25,
                      py: 1,
                      borderRadius: 1,
                      transition: "background-color 0.2s, color 0.2s",
                      backgroundColor: isActive
                        ? alpha(theme.palette.primary.main, isDark ? 0.12 : 0.08)
                        : "transparent",
                      color: isActive ? "primary.main" : "text.secondary",
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.06),
                        color: "primary.main",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        opacity: isActive ? 1 : 0.55,
                        minWidth: 22,
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "0.82rem",
                        fontWeight: isActive ? 700 : 500,
                        lineHeight: 1.4,
                      }}
                    >
                      {section.title}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          <Box component="article" sx={{ minWidth: 0 }}>
            {intro && (
              <Box
                sx={{
                  mb: { xs: 4, md: 5 },
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                  backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.06 : 0.04),
                }}
              >
                {intro}
              </Box>
            )}

            <Stack spacing={{ xs: 5, md: 6 }}>
              {sections.map((section, idx) => (
                <Box key={section.id} id={section.id} sx={{ scrollMarginTop: 96 }}>
                  <Stack direction="row" spacing={2} alignItems="baseline" sx={{ mb: 2 }}>
                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        fontWeight: 900,
                        color: "primary.main",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </Typography>
                    <Typography
                      component="h2"
                      sx={{
                        fontSize: { xs: "1.4rem", md: "1.7rem" },
                        fontWeight: 800,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.2,
                        color: "text.primary",
                      }}
                    >
                      {section.title}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      color: "text.secondary",
                      fontSize: { xs: "0.92rem", md: "0.97rem" },
                      lineHeight: 1.8,
                      "& p": { mb: 1.6, mt: 0 },
                      "& ul, & ol": { pl: 3, mb: 1.6 },
                      "& li": { mb: 0.6 },
                      "& strong": { color: "text.primary", fontWeight: 700 },
                    }}
                  >
                    {section.content}
                  </Box>
                </Box>
              ))}
            </Stack>

            {contactNote && (
              <Box
                sx={{
                  mt: { xs: 5, md: 7 },
                  p: { xs: 2.75, md: 3.5 },
                  borderRadius: 2.5,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: isDark
                    ? alpha(theme.palette.background.paper, 0.5)
                    : theme.palette.background.paper,
                }}
              >
                {contactNote}
              </Box>
            )}

            {related && related.length > 0 && (
              <Box sx={{ mt: { xs: 5, md: 7 } }}>
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "text.secondary",
                    mb: 2,
                  }}
                >
                  Đọc thêm
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                    gap: 2,
                  }}
                >
                  {related.map((item) => (
                    <Box
                      key={item.href}
                      component={NextLink}
                      href={item.href}
                      sx={{
                        display: "block",
                        textDecoration: "none",
                        p: 2.25,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: isDark
                          ? alpha(theme.palette.background.paper, 0.4)
                          : theme.palette.background.paper,
                        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          borderColor: alpha(theme.palette.primary.main, 0.4),
                          transform: "translateY(-2px)",
                          boxShadow: `0 18px 40px ${alpha(theme.palette.common.black, isDark ? 0.3 : 0.08)}`,
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "1rem",
                          fontWeight: 800,
                          color: "text.primary",
                          mb: 0.5,
                        }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          color: "text.secondary",
                          lineHeight: 1.6,
                        }}
                      >
                        {item.description}
                      </Typography>
                      <Box
                        sx={{
                          mt: 1.5,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: "primary.main",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                        }}
                      >
                        Xem chi tiết <ChevronRight size={14} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
