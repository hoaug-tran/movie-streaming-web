import { Box, BoxProps, IconButton } from "@mui/material";
import { ReactNode, useRef, useState, useEffect } from "react";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

interface HorizontalScrollGridProps extends BoxProps {
  children: ReactNode;
  itemWidth?: number;
}

export function HorizontalScrollGrid({
  children,
  itemWidth = 264,
  sx,
  ...props
}: HorizontalScrollGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const handleScrollCheck = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = itemWidth + 16;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    handleScrollCheck();
    window.addEventListener("resize", handleScrollCheck);
    return () => window.removeEventListener("resize", handleScrollCheck);
  }, [children]);

  const arrowSx = (side: "left" | "right") => ({
    position: "absolute" as const,
    [side]: -8,
    top: "50%",
    transform: "translateY(-50%)",
    width: 40,
    height: 64,
    borderRadius: 1,
    backgroundColor: "rgba(12, 12, 12, 0.72)",
    backdropFilter: "blur(10px)",
    color: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(255,255,255,0.1)",
    zIndex: 10,
    opacity: isHovered ? 1 : 0,
    pointerEvents: isHovered ? "auto" : ("none" as const),
    transition: "opacity 0.25s ease, background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(30, 30, 30, 0.88)",
      color: "#ffffff",
    },
    "& svg": { fontSize: 22 },
  });

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ position: "relative", py: { xs: 1, md: 1.5 }, ...sx }}
      {...props}
    >
      <Box
        ref={scrollRef}
        onScroll={handleScrollCheck}
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          overflowY: "hidden",
          scrollBehavior: "smooth",
          scrollSnapType: "x mandatory",
          pt: 1,
          pb: 1.5,
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {children}
      </Box>

      {canScrollLeft && (
        <IconButton onClick={() => handleScroll("left")} sx={arrowSx("left")}>
          <ChevronLeftRoundedIcon />
        </IconButton>
      )}

      {canScrollRight && (
        <IconButton onClick={() => handleScroll("right")} sx={arrowSx("right")}>
          <ChevronRightRoundedIcon />
        </IconButton>
      )}
    </Box>
  );
}
