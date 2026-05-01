"use client";

import React, { useState } from "react";
import { Box, Avatar, Menu, MenuItem, Divider, Typography, Button } from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { getAbsoluteAvatarUrl } from "@/utils/avatar";

interface UserProfileDropdownProps {
  onLogout: () => Promise<void>;
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const avatarUrl = getAbsoluteAvatarUrl(user?.avatarUrl);

  const getInitials = () => {
    if (user?.fullName) {
      return user.fullName.charAt(0).toUpperCase();
    }

    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return "U";
  };

  return (
    <Box>
      <Button
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          textTransform: "none",
          color: "text.primary",
          padding: "6px 12px",
          borderRadius: 1.5,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "transparent",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        <Avatar
          src={avatarUrl || undefined}
          alt={user?.fullName || "User"}
          sx={{
            width: 32,
            height: 32,
            fontSize: "0.875rem",
            fontWeight: 500,
            bgcolor: "text.primary",
            color: "background.default",
            borderRadius: 1,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {getInitials()}
        </Avatar>

        <Typography
          variant="body2"
          sx={{
            display: { xs: "none", sm: "block" },
            fontWeight: 500,
            fontSize: "0.9rem",
            maxWidth: "150px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {user?.fullName || user?.email}
        </Typography>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.5,
            mt: 1,
            boxShadow: "none",
            minWidth: "280px",
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Avatar
            src={avatarUrl || undefined}
            alt={user?.fullName || "User"}
            sx={{
              width: 40,
              height: 40,
              fontSize: "1rem",
              fontWeight: 500,
              bgcolor: "text.primary",
              color: "background.default",
              borderRadius: 1,
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {getInitials()}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                color: "text.primary",
                fontWeight: 600,
                fontSize: "0.95rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.fullName}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email}
            </Typography>
          </Box>
        </Box>

        <Link href="/watchlist" style={{ textDecoration: "none" }}>
          <MenuItem
            onClick={handleClose}
            sx={{
              py: 1.5,
              px: 2,
              color: "text.primary",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              fontSize: "0.95rem",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            Danh sách theo dõi
          </MenuItem>
        </Link>

        <Link href="/favorites" style={{ textDecoration: "none" }}>
          <MenuItem
            onClick={handleClose}
            sx={{
              py: 1.5,
              px: 2,
              color: "text.primary",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              fontSize: "0.95rem",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            Phim yêu thích
          </MenuItem>
        </Link>

        <Link href="/history" style={{ textDecoration: "none" }}>
          <MenuItem
            onClick={handleClose}
            sx={{
              py: 1.5,
              px: 2,
              color: "text.primary",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              fontSize: "0.95rem",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            Lịch sử xem
          </MenuItem>
        </Link>

        <Divider
          sx={{
            borderColor: "divider",
            my: 0.5,
          }}
        />

        <Link href="/profile" style={{ textDecoration: "none" }}>
          <MenuItem
            onClick={handleClose}
            sx={{
              py: 1.5,
              px: 2,
              color: "text.primary",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              fontSize: "0.95rem",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            Tài khoản
          </MenuItem>
        </Link>

        <MenuItem
          onClick={() => {
            window.open("/help", "_blank");
            handleClose();
          }}
          sx={{
            py: 1.5,
            px: 2,
            color: "text.primary",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            fontSize: "0.95rem",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          Trung tâm trợ giúp
        </MenuItem>

        <Divider
          sx={{
            borderColor: "divider",
            my: 0.5,
          }}
        />

        <MenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          sx={{
            py: 1.5,
            px: 2,
            color: "primary.main",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            fontSize: "0.95rem",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "action.hover",
            },
            "&.Mui-disabled": {
              color: "action.disabled",
            },
          }}
        >
          {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất khỏi Gió Phim"}
        </MenuItem>
      </Menu>
    </Box>
  );
};
