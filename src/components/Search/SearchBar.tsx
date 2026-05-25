"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Popper,
  Paper,
  Typography,
  IconButton,
  Fade,
  ClickAwayListener,
  CircularProgress,
} from "@mui/material";
import { SearchOutlined, CloseOutlined, HistoryOutlined } from "@mui/icons-material";
import {
  useRecentSearchHistories,
  useDeleteSearchHistory,
  useClearSearchHistories,
} from "@/modules/search-history/hooks/useSearchHistory";
import { useAuth } from "@/modules/auth/hooks/useAuth";

interface SearchBarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: string) => void;
  value: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ isOpen, onOpenChange, onSearch, value }) => {
  const [localValue, setLocalValue] = useState(value);
  const [showHistory, setShowHistory] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  const { isAuthenticated } = useAuth();
  const isHistoryEnabled = isAuthenticated && isOpen;
  const {
    data: recentHistories = [],
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useRecentSearchHistories(10, isHistoryEnabled);
  const deleteMutation = useDeleteSearchHistory();
  const clearMutation = useClearSearchHistories();

  const trimmedValue = localValue.trim();
  const showDropdown = useMemo(
    () => isOpen && showHistory && isAuthenticated && trimmedValue.length === 0,
    [isOpen, showHistory, isAuthenticated, trimmedValue]
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isHistoryEnabled) {
      refetchHistory();
    }
  }, [isHistoryEnabled, refetchHistory]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (isOpen && containerRef.current) {
      timer = setTimeout(() => {
        if (containerRef.current) {
          setContainerWidth(containerRef.current.offsetWidth);
        }
      }, 260);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen]);

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
    setShowHistory(true);
  };

  const handleFocus = () => {
    setShowHistory(true);
  };

  const handlePickKeyword = (keyword: string) => {
    setLocalValue(keyword);
    onSearch(keyword);
    setShowHistory(false);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };

  const handleDeleteItem = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteMutation.mutate(id);
  };

  const handleClearAll = () => {
    clearMutation.mutate();
  };

  const handleClickAway = () => {
    setShowHistory(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box
        ref={containerRef}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          width: isOpen
            ? {
                xs: "calc(100vw - 128px)",
                sm: "240px",
                md: "280px",
              }
            : { xs: "42px", sm: "40px" },
          transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          zIndex: isOpen ? 5 : 1,
          willChange: "width",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          perspective: 1000,
        }}
      >
        {isOpen && (
          <TextField
            inputRef={inputRef}
            fullWidth
            placeholder="Tìm kiếm phim..."
            value={localValue}
            onChange={handleChange}
            onFocus={handleFocus}
            variant="standard"
            size="small"
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ color: "rgba(255,255,255,0.6)", fontSize: 18, mr: 0.5 }} />
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

        {!localValue && (
          <Box
            onClick={() => onOpenChange(!isOpen)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 0.85, sm: 1 },
              width: { xs: 42, sm: 40 },
              height: { xs: 42, sm: 40 },
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
                sx={{ fontSize: 24, color: "rgba(255,255,255,0.85)", transition: "all 0.2s ease" }}
              />
            ) : (
              <SearchOutlined
                sx={{ fontSize: 27, color: "rgba(255,255,255,0.85)", transition: "all 0.2s ease" }}
              />
            )}
          </Box>
        )}

        <Popper
          open={showDropdown}
          anchorEl={containerRef.current}
          placement="bottom-end"
          transition
          modifiers={[
            { name: "offset", options: { offset: [0, 8] } },
            { name: "preventOverflow", options: { padding: 12 } },
          ]}
          sx={{ zIndex: 1400 }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={180}>
              <Paper
                elevation={0}
                sx={{
                  width: containerWidth || undefined,
                  minWidth: { xs: 240, sm: 320 },
                  maxWidth: 360,
                  bgcolor: "rgba(18,18,18,0.96)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 2,
                  overflow: "hidden",
                  backdropFilter: "blur(18px)",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <HistoryOutlined sx={{ fontSize: 16, color: "rgba(255,255,255,0.6)" }} />
                    <Typography
                      sx={{
                        fontSize: "0.78rem",
                        color: "rgba(255,255,255,0.7)",
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                        textTransform: "uppercase",
                      }}
                    >
                      Tìm kiếm gần đây
                    </Typography>
                  </Box>
                  {recentHistories.length > 0 && (
                    <Typography
                      onClick={handleClearAll}
                      sx={{
                        fontSize: "0.72rem",
                        color: "rgba(200,16,46,0.85)",
                        cursor: "pointer",
                        fontWeight: 600,
                        "&:hover": { color: "#C8102E" },
                      }}
                    >
                      Xóa tất cả
                    </Typography>
                  )}
                </Box>

                {historyLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                    <CircularProgress size={18} sx={{ color: "rgba(255,255,255,0.4)" }} />
                  </Box>
                ) : recentHistories.length === 0 ? (
                  <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
                    <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)" }}>
                      Chưa có lịch sử tìm kiếm
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: 320, overflowY: "auto", py: 0.5 }}>
                    {recentHistories.map((item) => (
                      <Box
                        key={item.id}
                        onClick={() => handlePickKeyword(item.keyword)}
                        sx={{
                          px: 2,
                          py: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1.5,
                          cursor: "pointer",
                          transition: "background-color 0.15s ease",
                          "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" },
                          "&:hover .delete-history-btn": { opacity: 1 },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.25,
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <SearchOutlined
                            sx={{ fontSize: 16, color: "rgba(255,255,255,0.4)", flexShrink: 0 }}
                          />
                          <Typography
                            sx={{
                              fontSize: "0.85rem",
                              color: "rgba(255,255,255,0.85)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.keyword}
                          </Typography>
                        </Box>
                        <IconButton
                          className="delete-history-btn"
                          size="small"
                          onClick={(e) => handleDeleteItem(e, item.id)}
                          sx={{
                            opacity: { xs: 1, md: 0 },
                            transition: "opacity 0.2s ease",
                            color: "rgba(255,255,255,0.5)",
                            p: 0.5,
                            "&:hover": {
                              color: "#C8102E",
                              backgroundColor: "rgba(200,16,46,0.08)",
                            },
                          }}
                        >
                          <CloseOutlined sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default SearchBar;
