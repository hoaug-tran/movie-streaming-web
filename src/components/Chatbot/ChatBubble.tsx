"use client";

import { Box, Stack, Typography, alpha, useTheme } from "@mui/material";
import Link from "next/link";
import { Fragment, ReactNode } from "react";
import { ChatMessage } from "@/services/chatbot-service";

interface ChatBubbleProps {
  message: ChatMessage;
}

const PATH_REGEX = /(\/[a-z0-9][a-z0-9/_-]*)/gi;
const BOLD_REGEX = /\*\*([^*]+)\*\*/g;

function renderRichText(text: string, accent: string, isUser: boolean): ReactNode[] {
  if (!text) return [text];
  const parts: ReactNode[] = [];
  const lines = text.split("\n");

  lines.forEach((line, lineIdx) => {
    let working = line;
    const tokens: ReactNode[] = [];
    let cursor = 0;

    const matches: { start: number; end: number; node: ReactNode }[] = [];

    let m: RegExpExecArray | null;
    const boldRe = new RegExp(BOLD_REGEX);
    while ((m = boldRe.exec(working)) !== null) {
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

    matches.forEach((mt, idx) => {
      if (mt.start > cursor) {
        tokens.push(working.slice(cursor, mt.start));
      }
      tokens.push(mt.node);
      cursor = mt.end;
      void idx;
    });

    if (cursor < working.length) {
      tokens.push(working.slice(cursor));
    }

    if (tokens.length === 0) tokens.push(line);
    parts.push(<Fragment key={`ln-${lineIdx}`}>{tokens}</Fragment>);
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
          maxWidth: "85%",
          ...bubbleStyles,
          px: 1.5,
          py: 1,
          borderRadius: 1.5,
          fontSize: "0.88rem",
          lineHeight: 1.6,
          letterSpacing: "0.005em",
          wordBreak: "break-word",
        }}
      >
        {message.pending && !message.content ? (
          <TypingDots accent={accent} />
        ) : (
          <Typography
            variant="body2"
            component="div"
            sx={{ fontSize: "inherit", lineHeight: "inherit", color: "inherit" }}
          >
            {renderRichText(message.content, accent, isUser)}
            {message.pending && <BlinkCursor />}
          </Typography>
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
