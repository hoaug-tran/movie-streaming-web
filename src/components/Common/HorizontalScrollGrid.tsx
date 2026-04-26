import { Box, BoxProps, Button } from "@mui/material";
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
        <Button
          onClick={() => handleScroll("left")}
          sx={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            minWidth: 40,
            height: 48,
            backgroundColor: "background.paper",
            color: "text.primary",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 0,
            zIndex: 10,
            fontWeight: 600,
            fontSize: "1.2rem",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          {"<"}
        </Button>
      )}

      {canScrollRight && (
        <Button
          onClick={() => handleScroll("right")}
          sx={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            minWidth: 40,
            height: 48,
            backgroundColor: "background.paper",
            color: "text.primary",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 0,
            zIndex: 10,
            fontWeight: 600,
            fontSize: "1.2rem",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          {">"}
        </Button>
      )}
    </Box>
  );
}
