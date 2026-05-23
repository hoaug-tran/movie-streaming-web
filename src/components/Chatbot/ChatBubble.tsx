"use client";

import { Box, Stack, Typography, alpha, useTheme } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Link from "next/link";
import { Fragment, ReactNode } from "react";
import { ChatMessage } from "@/services/chatbot-service";

interface ChatBubbleProps {
  message: ChatMessage;
}

const MOVIE_TOKEN_REGEX = /\[MOVIE:([a-z0-9_-]+):([^\]]+)\]/g;
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\((\/[a-z0-9][a-z0-9/_?=&.-]*)\)/gi;
const BOLD_REGEX = /\*\*([^*]+)\*\*/g;
const PATH_REGEX = /(\/[a-z0-9][a-z0-9/_-]*)/gi;

function MovieCard({ slug, title, accent }: { slug: string; title: string; accent: string }) {
  return (
    <Box
      component={Link}
      href={`/movies/${slug}`}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        mt: 0.5,
        px: 1.25,
        py: 0.75,
        borderRadius: 1.5,
        border: `1px solid ${alpha(accent, 0.3)}`,
        bgcolor: alpha(accent, 0.06),
        textDecoration: "none",
        transition: "all 0.18s ease",
        "&:hover": {
          bgcolor: alpha(accent, 0.14),
          borderColor: alpha(accent, 0.6),
          transform: "translateX(2px)",
        },
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          bgcolor: alpha(accent, 0.15),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <PlayArrowIcon sx={{ fontSize: 16, color: accent }} />
      </Box>
      <Typography
        sx={{
          fontSize: "0.84rem",
          fontWeight: 600,
          color: accent,
          lineHeight: 1.3,
          flex: 1,
        }}
      >
        {title}
      </Typography>
    </Box>
  );
}

function renderLine(line: string, accent: string, isUser: boolean, lineIdx: number): ReactNode {
  const working = line.replace(/\*\*\s*\*\*/g, "").replace(/__\s*__/g, "");
  const matches: { start: number; end: number; node: ReactNode }[] = [];

  let m: RegExpExecArray | null;

  const movieRe = new RegExp(MOVIE_TOKEN_REGEX);
  while ((m = movieRe.exec(working)) !== null) {
    const slug = m[1];
    const title = m[2];
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      node: (
        <MovieCard key={`mv-${lineIdx}-${m.index}`} slug={slug} title={title} accent={accent} />
      ),
    });
  }

  const markdownLinkRe = new RegExp(MARKDOWN_LINK_REGEX);
  while ((m = markdownLinkRe.exec(working)) !== null) {
    const label = m[1];
    const href = m[2];
    const overlap = matches.some((mm) => m!.index < mm.end && m!.index + m![0].length > mm.start);
    if (overlap) continue;
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      node: (
        <Link
          key={`md-l-${lineIdx}-${m.index}`}
          href={href}
          style={{
            color: isUser ? "#fff" : accent,
            textDecoration: "underline",
            textUnderlineOffset: 2,
            fontWeight: 600,
          }}
        >
          {label}
        </Link>
      ),
    });
  }

  const boldRe = new RegExp(BOLD_REGEX);
  while ((m = boldRe.exec(working)) !== null) {
    const overlap = matches.some((mm) => m!.index < mm.end && m!.index + m![0].length > mm.start);
    if (overlap) continue;
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      node: (
        <strong key={`b-${lineIdx}-${m.index}`} style={{ fontWeight: 700 }}>
          {m[1]}
        </strong>
      ),
    });
  }

  const pathRe = new RegExp(PATH_REGEX);
  while ((m = pathRe.exec(working)) !== null) {
    const start = m.index;
    const end = m.index + m[0].length;
    const overlap = matches.some((mm) => start < mm.end && end > mm.start);
    if (overlap) continue;
    const href = m[0];
    matches.push({
      start,
      end,
      node: (
        <Link
          key={`l-${lineIdx}-${start}`}
          href={href}
          style={{
            color: isUser ? "#fff" : accent,
            textDecoration: "underline",
            textUnderlineOffset: 2,
            fontWeight: 500,
            wordBreak: "break-all",
          }}
        >
          {href}
        </Link>
      ),
    });
  }

  matches.sort((a, b) => a.start - b.start);

  const tokens: ReactNode[] = [];
  let cursor = 0;
  matches.forEach((mt) => {
    if (mt.start > cursor) tokens.push(working.slice(cursor, mt.start));
    tokens.push(mt.node);
    cursor = mt.end;
  });
  if (cursor < working.length) tokens.push(working.slice(cursor));
  if (tokens.length === 0) tokens.push(line);

  return tokens;
}

function renderRichText(text: string, accent: string, isUser: boolean): ReactNode[] {
  if (!text) return [];
  const parts: ReactNode[] = [];
  const lines = text.split("\n");

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trimStart();

    if (trimmed.startsWith("## ")) {
      const heading = trimmed.slice(3);
      parts.push(
        <Typography
          key={`h-${lineIdx}`}
          sx={{
            fontWeight: 700,
            fontSize: "0.82rem",
            color: isUser ? "rgba(255,255,255,0.65)" : accent,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            mt: lineIdx > 0 ? 1 : 0,
            mb: 0.25,
          }}
        >
          {heading}
        </Typography>
      );
      return;
    }

    if (trimmed.startsWith("# ")) {
      const heading = trimmed.slice(2);
      parts.push(
        <Typography
          key={`h1-${lineIdx}`}
          sx={{ fontWeight: 800, fontSize: "0.95rem", mt: lineIdx > 0 ? 1 : 0, mb: 0.5 }}
        >
          {heading}
        </Typography>
      );
      return;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const itemText = trimmed.slice(2);
      const hasMovieToken = MOVIE_TOKEN_REGEX.test(itemText);
      MOVIE_TOKEN_REGEX.lastIndex = 0;
      const rendered = renderLine(itemText, accent, isUser, lineIdx);
      if (hasMovieToken) {
        parts.push(<Fragment key={`li-${lineIdx}`}>{rendered}</Fragment>);
      } else {
        parts.push(
          <Box key={`li-${lineIdx}`} sx={{ display: "flex", gap: 0.75, alignItems: "flex-start" }}>
            <Box
              component="span"
              sx={{
                mt: "6px",
                width: 5,
                height: 5,
                borderRadius: "50%",
                bgcolor: isUser ? "rgba(255,255,255,0.5)" : accent,
                flexShrink: 0,
              }}
            />
            <Box component="span" sx={{ flex: 1 }}>
              {rendered}
            </Box>
          </Box>
        );
      }
      return;
    }

    if (trimmed === "") {
      if (lineIdx > 0 && lineIdx < lines.length - 1) {
        parts.push(<Box key={`gap-${lineIdx}`} sx={{ height: 4 }} />);
      }
      return;
    }

    const rendered = renderLine(line, accent, isUser, lineIdx);
    parts.push(<Fragment key={`ln-${lineIdx}`}>{rendered}</Fragment>);
    if (lineIdx < lines.length - 1) parts.push(<br key={`br-${lineIdx}`} />);
  });

  return parts;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const theme = useTheme();
  const isUser = message.role === "user";
  const isError = message.error;
  const isDark = theme.palette.mode === "dark";
  const accent = theme.palette.primary.main;

  const bubbleStyles = isUser
    ? {
        backgroundColor: isDark ? "#252932" : "#1f2937",
        color: "#fff",
        border: "none",
      }
    : isError
      ? {
          backgroundColor: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.main,
          border: `1px solid ${alpha(theme.palette.error.main, 0.35)}`,
        }
      : {
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
        };

  const align = isUser ? "flex-end" : "flex-start";

  return (
    <Stack direction="row" justifyContent={align} sx={{ width: "100%" }}>
      <Box
        sx={{
          maxWidth: "88%",
          ...bubbleStyles,
          px: 1.5,
          py: 1,
          borderRadius: 1.5,
          fontSize: "0.88rem",
          lineHeight: 1.65,
          letterSpacing: "0.005em",
          wordBreak: "break-word",
        }}
      >
        {message.pending && !message.content ? (
          <TypingDots accent={accent} />
        ) : (
          <Box sx={{ fontSize: "inherit", lineHeight: "inherit", color: "inherit" }}>
            {renderRichText(message.content, accent, isUser)}
            {message.pending && <BlinkCursor />}
          </Box>
        )}
      </Box>
    </Stack>
  );
}

function TypingDots({ accent }: { accent: string }) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ py: 0.5 }}>
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: accent,
            animation: "giophim-typing 1.2s infinite ease-in-out",
            animationDelay: `${index * 0.18}s`,
            "@keyframes giophim-typing": {
              "0%, 80%, 100%": { transform: "scale(0.5)", opacity: 0.4 },
              "40%": { transform: "scale(1)", opacity: 1 },
            },
          }}
        />
      ))}
    </Stack>
  );
}

function BlinkCursor() {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        width: "0.5em",
        height: "0.95em",
        ml: 0.4,
        verticalAlign: "text-bottom",
        backgroundColor: "currentColor",
        opacity: 0.7,
        animation: "giophim-cursor 1s steps(1) infinite",
        "@keyframes giophim-cursor": {
          "0%, 50%": { opacity: 0.7 },
          "51%, 100%": { opacity: 0 },
        },
      }}
    />
  );
}
