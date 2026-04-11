"use client";

import React from "react";
import { AppBar, Toolbar, Typography, Box, Button, Container } from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useRouter } from "next/navigation";

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, cursor: "pointer" }}
          onClick={() => router.push("/")}
        >
          🎬 Gio Phim
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Link href="/movies" style={{ textDecoration: "none" }}>
            <Button color="inherit">Movies</Button>
          </Link>

          {isAuthenticated ? (
            <>
              <Link href="/profile" style={{ textDecoration: "none" }}>
                <Button color="inherit">Profile</Button>
              </Link>
              <Link href="/watchlist" style={{ textDecoration: "none" }}>
                <Button color="inherit">Watchlist</Button>
              </Link>
              {user?.role === "ROLE_ADMIN" && (
                <Link href="/admin" style={{ textDecoration: "none" }}>
                  <Button color="inherit">Admin</Button>
                </Link>
              )}
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{ textDecoration: "none" }}>
                <Button color="inherit">Login</Button>
              </Link>
              <Link href="/auth/register" style={{ textDecoration: "none" }}>
                <Button variant="contained" color="secondary">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
