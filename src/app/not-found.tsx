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
          Không tìm thấy trang
        </Typography>
        <Typography variant="body1" paragraph>
          Ồ ố, bạn có lẽ đã đi nhầm chỗ hoặc Gió phim đang bay đâu mất rồi..
        </Typography>
        <Button variant="contained" onClick={() => router.push("/")}>
          Quay trở về trang chủ
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
