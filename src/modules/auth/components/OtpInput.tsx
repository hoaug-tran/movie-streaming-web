"use client";

import React, { useRef, KeyboardEvent, ClipboardEvent } from "react";
import { Box, useTheme, alpha } from "@mui/material";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
  error = false,
}) => {
  const theme = useTheme();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, "").split("").slice(0, length);

  const handleChange = (index: number, char: string) => {
    const cleaned = char.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    onChange(newDigits.join("").replace(/ /g, ""));

    if (cleaned && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join("").replace(/ /g, ""));
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = "";
        onChange(newDigits.join("").replace(/ /g, ""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted);
    const nextIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const borderColor = error ? theme.palette.error.main : alpha(theme.palette.common.white, 0.15);

  const focusBorderColor = error ? theme.palette.error.main : theme.palette.primary.main;

  return (
    <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}>
      {Array.from({ length }).map((_, i) => (
        <Box
          key={i}
          component="input"
          ref={(el: HTMLInputElement | null) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i]?.trim() || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(i, e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          sx={{
            width: 48,
            height: 56,
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: 800,
            fontFamily: "'Inter', monospace",
            color: "white",
            background: alpha(theme.palette.common.white, 0.05),
            border: `2px solid ${borderColor}`,
            borderRadius: 1.5,
            outline: "none",
            caretColor: theme.palette.primary.main,
            transition: "all 0.2s ease",
            "&:focus": {
              border: `2px solid ${focusBorderColor}`,
              background: alpha(theme.palette.common.white, 0.08),
              boxShadow: `0 0 0 3px ${alpha(focusBorderColor, 0.15)}`,
            },
            "&:disabled": {
              opacity: 0.4,
              cursor: "not-allowed",
            },
            "&::selection": {
              background: "transparent",
            },
          }}
        />
      ))}
    </Box>
  );
};
