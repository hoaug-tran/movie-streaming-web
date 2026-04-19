import { Box, BoxProps, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { ReactNode, useRef, useState, useEffect } from "react";

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

  return (
    <Box
      sx={{
        position: "relative",
        py: { xs: 1, md: 1.5 },
        ...sx,
      }}
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
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {children}
      </Box>

      {canScrollLeft && (
        <IconButton
          onClick={() => handleScroll("left")}
          sx={{
            position: "absolute",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 40,
            height: 40,
            backgroundColor: "rgba(0, 0, 0, 0.72)",
            color: "white",
            borderRadius: "50%",
            zIndex: 10,
            backdropFilter: "blur(6px)",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.88)",
            },
            "& .MuiSvgIcon-root": {
              fontSize: 18,
            },
          }}
        >
          <ArrowBackIosNewIcon />
        </IconButton>
      )}

      {canScrollRight && (
        <IconButton
          onClick={() => handleScroll("right")}
          sx={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 40,
            height: 40,
            backgroundColor: "rgba(0, 0, 0, 0.72)",
            color: "white",
            borderRadius: "50%",
            zIndex: 10,
            backdropFilter: "blur(6px)",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.88)",
            },
            "& .MuiSvgIcon-root": {
              fontSize: 18,
            },
          }}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      )}
    </Box>
  );
}
