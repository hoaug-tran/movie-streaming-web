"use client";

import { Box, Typography } from "@mui/material";

export default function IOSInstallInstructions() {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Typography
        sx={{
          fontSize: "0.78rem",
          color: "#C0C0C0",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          mb: 0.25,
        }}
      >
        Cài trên iPhone / iPad (Safari)
      </Typography>

      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            bgcolor: "rgba(200,16,46,0.12)",
            color: "#C8102E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontWeight: 800,
            fontSize: "0.78rem",
          }}
        >
          1
        </Box>
        <Box sx={{ flex: 1, pt: 0.25 }}>
          <Typography sx={{ fontSize: "0.85rem", color: "#F0F0F0", lineHeight: 1.5 }}>
            Mở trang này trong{" "}
            <Box component="strong" sx={{ color: "#fff" }}>
              Safari
            </Box>{" "}
            (Chrome iOS không hỗ trợ).
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            bgcolor: "rgba(200,16,46,0.12)",
            color: "#C8102E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontWeight: 800,
            fontSize: "0.78rem",
          }}
        >
          2
        </Box>
        <Box sx={{ flex: 1, pt: 0.25 }}>
          <Typography sx={{ fontSize: "0.85rem", color: "#F0F0F0", lineHeight: 1.5 }}>
            Nhấn nút{" "}
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                bgcolor: "rgba(255,255,255,0.08)",
                color: "#fff",
                fontWeight: 600,
                verticalAlign: "middle",
              }}
            >
              ↗ Chia sẻ
            </Box>{" "}
            ở thanh công cụ.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            bgcolor: "rgba(200,16,46,0.12)",
            color: "#C8102E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontWeight: 800,
            fontSize: "0.78rem",
          }}
        >
          3
        </Box>
        <Box sx={{ flex: 1, pt: 0.25 }}>
          <Typography sx={{ fontSize: "0.85rem", color: "#F0F0F0", lineHeight: 1.5 }}>
            Chọn{" "}
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                bgcolor: "rgba(255,255,255,0.08)",
                color: "#fff",
                fontWeight: 600,
                verticalAlign: "middle",
              }}
            >
              ⊕ Thêm vào màn hình chính
            </Box>
            .
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          mt: 0.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "#8A8A8A",
        }}
      >
        <Typography component="span" sx={{ fontSize: "1.2rem", lineHeight: 1 }}>
          📱
        </Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#8A8A8A", lineHeight: 1.5 }}>
          Sau khi cài, mở Gió Phim từ màn hình chính để xem offline.
        </Typography>
      </Box>
    </Box>
  );
}
