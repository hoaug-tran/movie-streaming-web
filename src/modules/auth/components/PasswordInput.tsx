"use client";

import React, { useState, useCallback } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { EyeIcon, EyeOffIcon } from "./LucideIcons";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  label?: string;
  placeholder?: string;
  fullWidth?: boolean;
  sx?: any;
}

const PasswordInputComponent: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  error,
  helperText,
  label = "Mật Khẩu",
  placeholder = "Nhập mật khẩu",
  fullWidth = true,
  sx,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <TextField
      fullWidth={fullWidth}
      type={showPassword ? "text" : "password"}
      value={value}
      onChange={handleChange}
      label={label}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleTogglePassword}
                edge="end"
                size="small"
                sx={{
                  color: "rgba(255, 255, 255, 0.6)",
                  "&:hover": {
                    color: "#E63946",
                  },
                }}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            color: "#FFFFFF",
            fontSize: "0.9rem",
            "& input::placeholder": {
              color: "rgba(255, 255, 255, 0.4)",
              opacity: 1,
            },
          },
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 0,
          borderColor: "rgba(255, 255, 255, 0.15)",
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          "&:hover fieldset": {
            borderColor: "rgba(255, 255, 255, 0.3)",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#ffffff",
          },
        },
        "& .MuiInputLabel-root": {
          color: "rgba(255, 255, 255, 0.5)",
          "&.Mui-focused": {
            color: "#ffffff",
          },
        },
        ...sx,
      }}
    />
  );
};

export const PasswordInput = React.memo(PasswordInputComponent);
