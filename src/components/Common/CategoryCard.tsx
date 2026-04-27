import { Box, Typography } from "@mui/material";

const GENRE_STYLES: Record<
  string,
  { accent: string; shape: "circle" | "diagonal" | "arc" | "cross" | "wave" | "diamond" }
> = {
  "Hành động": { accent: "#FF4500", shape: "diagonal" },
  "Kinh dị": { accent: "#8B00FF", shape: "arc" },
  "Tình cảm": { accent: "#FF3D7F", shape: "circle" },
  "Hài hước": { accent: "#FFD60A", shape: "wave" },
  "Hoạt hình": { accent: "#00C896", shape: "circle" },
  "Khoa học viễn tưởng": { accent: "#00B4D8", shape: "cross" },
  "Tâm lý": { accent: "#A855F7", shape: "arc" },
  "Phiêu lưu": { accent: "#06D6A0", shape: "diagonal" },
  "Tội phạm": { accent: "#EF233C", shape: "cross" },
  "Võ thuật": { accent: "#FF8C00", shape: "diagonal" },
  "Cổ trang": { accent: "#C9A84C", shape: "diamond" },
  "Gia đình": { accent: "#7CB518", shape: "wave" },
  "Tài liệu": { accent: "#4A90D9", shape: "cross" },
  "Âm nhạc": { accent: "#FF6BCD", shape: "wave" },
  "Thể thao": { accent: "#FFB703", shape: "diagonal" },
};

const DEFAULT_STYLE = { accent: "#888888", shape: "circle" as const };

function ShapeLayer({ shape, accent }: { shape: string; accent: string }) {
  if (shape === "diagonal") {
    return (
      <>
        <Box
          sx={{
            position: "absolute",
            right: -20,
            top: -20,
            width: 120,
            height: 120,
            background: `${accent}18`,
            transform: "rotate(45deg)",
            borderRadius: "12px",
            transition: "transform 0.4s ease",
            ".cat-card:hover &": { transform: "rotate(55deg) scale(1.1)" },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            right: 10,
            top: 10,
            width: 60,
            height: 60,
            background: `${accent}10`,
            transform: "rotate(45deg)",
            borderRadius: "6px",
          }}
        />
      </>
    );
  }
  if (shape === "circle") {
    return (
      <>
        <Box
          sx={{
            position: "absolute",
            right: -30,
            bottom: -30,
            width: 130,
            height: 130,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
            transition: "transform 0.4s ease",
            ".cat-card:hover &": { transform: "scale(1.2)" },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            right: 20,
            bottom: 20,
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: `1.5px solid ${accent}30`,
          }}
        />
      </>
    );
  }
  if (shape === "arc") {
    return (
      <Box
        sx={{
          position: "absolute",
          right: -40,
          top: -40,
          width: 140,
          height: 140,
          borderRadius: "50%",
          border: `18px solid ${accent}20`,
          transition: "transform 0.4s ease",
          ".cat-card:hover &": { transform: "scale(1.15) rotate(20deg)" },
        }}
      />
    );
  }
  if (shape === "cross") {
    return (
      <>
        <Box
          sx={{
            position: "absolute",
            right: 16,
            top: "50%",
            width: 48,
            height: 3,
            backgroundColor: `${accent}25`,
            transform: "translateY(-50%)",
            borderRadius: "2px",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            right: 37,
            top: "calc(50% - 24px)",
            width: 3,
            height: 48,
            backgroundColor: `${accent}25`,
            borderRadius: "2px",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            right: 28,
            top: "50%",
            width: 24,
            height: 24,
            border: `1.5px solid ${accent}20`,
            transform: "translateY(-50%) rotate(45deg)",
            borderRadius: "3px",
          }}
        />
      </>
    );
  }
  if (shape === "wave") {
    return (
      <Box
        sx={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "45%",
          background: `repeating-linear-gradient(
          -45deg,
          ${accent}08,
          ${accent}08 2px,
          transparent 2px,
          transparent 12px
        )`,
          borderLeft: `1px solid ${accent}12`,
        }}
      />
    );
  }
  if (shape === "diamond") {
    return (
      <>
        <Box
          sx={{
            position: "absolute",
            right: 20,
            top: "50%",
            width: 56,
            height: 56,
            border: `2px solid ${accent}25`,
            transform: "translateY(-50%) rotate(45deg)",
            borderRadius: "4px",
            transition: "transform 0.4s ease",
            ".cat-card:hover &": { transform: "translateY(-50%) rotate(55deg) scale(1.1)" },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            right: 32,
            top: "50%",
            width: 28,
            height: 28,
            backgroundColor: `${accent}15`,
            transform: "translateY(-50%) rotate(45deg)",
            borderRadius: "2px",
          }}
        />
      </>
    );
  }
  return null;
}

interface CategoryCardProps {
  name: string;
}

export function CategoryCard({ name }: CategoryCardProps) {
  const style = GENRE_STYLES[name] ?? DEFAULT_STYLE;

  return (
    <Box
      className="cat-card"
      sx={{
        height: 140,
        position: "relative",
        overflow: "hidden",
        borderRadius: 1.5,
        cursor: "pointer",
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "&:hover": {
          transform: "translateY(-5px)",
          borderColor: `${style.accent}55`,
          boxShadow: `0 12px 32px ${style.accent}18`,
          "& .cat-name": { color: style.accent },
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "55%",
            background: `linear-gradient(to top, ${style.accent}12 0%, transparent 100%)`,
          }}
        />
        <ShapeLayer shape={style.shape} accent={style.accent} />
      </Box>

      <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, p: 2 }}>
        <Typography
          className="cat-name"
          sx={{
            fontWeight: 700,
            fontSize: "0.9rem",
            letterSpacing: "-0.01em",
            color: "rgba(255,255,255,0.9)",
            lineHeight: 1.2,
            transition: "color 0.25s ease",
          }}
        >
          {name}
        </Typography>
      </Box>
    </Box>
  );
}
