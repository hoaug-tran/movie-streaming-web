"use client";

import { Container, Box, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          textAlign: "center",
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Gio Phim
        </Typography>
        <Typography variant="body1" paragraph>
          Discover and enjoy thousands of movies and TV shows
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
          <Button variant="contained" onClick={() => router.push("/movies")}>
            Browse Movies
          </Button>
          <Button variant="outlined" onClick={() => router.push("/auth/login")}>
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
