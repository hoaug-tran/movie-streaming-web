"use client";

import { Container, Box, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";

const NotFound = () => {
  const router = useRouter();

  return (
    <Container maxWidth="sm">
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
        <Typography variant="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" paragraph>
          Page Not Found
        </Typography>
        <Typography variant="body1" paragraph>
          Could not find the requested resource
        </Typography>
        <Button variant="contained" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
