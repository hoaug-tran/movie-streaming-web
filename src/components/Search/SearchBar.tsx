"use client";

import React, { useState, useRef, useEffect } from "react";
import { Box, TextField, InputAdornment } from "@mui/material";
import { SearchOutlined, CloseOutlined } from "@mui/icons-material";

interface SearchBarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: string) => void;
  value: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ isOpen, onOpenChange, onSearch, value }) => {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      onSearch(newValue);
    }, 300);
  };

  const handleClear = () => {
    setLocalValue("");
    onSearch("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        animation: isOpen
          ? "expandSearch 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
          : "collapseSearch 0.4s ease",
        "@keyframes expandSearch": {
          from: { width: "40px", opacity: 0 },
          to: { width: "280px", opacity: 1 },
        },
        "@keyframes collapseSearch": {
          from: { width: "280px", opacity: 1 },
          to: { width: "40px", opacity: 0 },
        },
      }}
    >
      {isOpen && (
        <TextField
          inputRef={inputRef}
          fullWidth
          placeholder="Tìm kiếm phim..."
          value={localValue}
          onChange={handleChange}
          variant="standard"
          size="small"
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined
                  sx={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 18,
                    mr: 0.5,
                  }}
                />
              </InputAdornment>
            ),
            endAdornment: localValue && (
              <InputAdornment position="end">
                <Box
                  onClick={handleClear}
                  sx={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 0.25,
                    borderRadius: "4px",
                    transition: "background-color 0.2s",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
                  }}
                >
                  <CloseOutlined sx={{ fontSize: 16, color: "rgba(255,255,255,0.6)" }} />
                </Box>
              </InputAdornment>
            ),
            sx: {
              fontSize: "0.9rem",
              color: "#ffffff",
              "::placeholder": { color: "rgba(255,255,255,0.5)", opacity: 1 },
              backgroundColor: "rgba(255,255,255,0.06)",
              borderRadius: "6px",
              px: 1.5,
              py: 0.75,
              transition: "background-color 0.2s",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              "&:focus-within": { backgroundColor: "rgba(255,255,255,0.12)" },
            },
          }}
          sx={{
            "& .MuiInput-underline:before": { borderBottom: "none" },
            "& .MuiInput-underline:after": { borderBottom: "none" },
          }}
        />
      )}

      {/* Close/Search button - hide when text exists (clear button shown inside) */}
      {!localValue && (
        <Box
          onClick={() => onOpenChange(!isOpen)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 1,
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            backgroundColor: isOpen ? "rgba(255,255,255,0.08)" : "transparent",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
          }}
          title={isOpen ? "Đóng tìm kiếm" : "Tìm kiếm"}
        >
          {isOpen ? (
            <CloseOutlined
              sx={{
                fontSize: 24,
                color: "rgba(255,255,255,0.85)",
                transition: "all 0.2s ease",
              }}
            />
          ) : (
            <SearchOutlined
              sx={{
                fontSize: 24,
                color: "rgba(255,255,255,0.85)",
                transition: "all 0.2s ease",
              }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default SearchBar;
