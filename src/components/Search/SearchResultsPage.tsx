"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Box, Typography, Container } from "@mui/material";
import { MovieCard, MovieCardSkeleton } from "@/components/Common/MovieCard";
import { getMovieCardProps } from "@/components/Common/movie-card-props";
import movieService from "@/modules/movie/api/movie-service";
import { Movie } from "@/modules/movie/types/movie";
import { useRouter } from "next/navigation";

interface SearchResultsPageProps {
  query: string;
  onClose: () => void;
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ query, onClose }) => {
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(false);
  const [initialLoadingDone, setInitialLoadingDone] = useState(false);
  const router = useRouter();

  const observerTarget = useRef<HTMLDivElement>(null);
  const isSearchingRef = useRef(false);
  const lastQueryRef = useRef<string>("");
  const lastPageRef = useRef<number>(-1);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const observerTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSearch = useCallback(async (searchQuery: string, pageNum: number = 0) => {
    if (
      isSearchingRef.current ||
      !searchQuery.trim() ||
      (pageNum === lastPageRef.current && pageNum > 0)
    ) {
      return;
    }

    isSearchingRef.current = true;
    lastPageRef.current = pageNum;

    if (pageNum === 0) {
      setInitialLoading(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await movieService.advancedSearch({
        keyword: searchQuery,
        page: pageNum,
        size: 30,
      });

      if (pageNum === 0) {
        setResults(response.content || []);
        setHasMore(response.hasNext ?? false);
        setCurrentPage(1);
        setInitialLoadingDone(true);
      } else {
        setResults((prev) => [...prev, ...(response.content || [])]);
        setHasMore(response.hasNext ?? false);
        setCurrentPage(pageNum + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tìm kiếm");
    } finally {
      setLoading(false);
      setInitialLoading(false);
      isSearchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim() && query !== lastQueryRef.current) {
      lastQueryRef.current = query;
      setResults([]);
      setCurrentPage(0);
      setHasMore(true);
      setError(null);
      setInitialLoadingDone(false);
      isSearchingRef.current = false;
      lastPageRef.current = -1;

      debounceTimerRef.current = setTimeout(() => {
        handleSearch(query, 0);
      }, 100);
    }
  }, [query, handleSearch]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (observerTimeoutRef.current) clearTimeout(observerTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!observerTarget.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        if (isSearchingRef.current || loading || initialLoading || !hasMore || !query.trim())
          return;

        if (observerTimeoutRef.current) clearTimeout(observerTimeoutRef.current);

        observerTimeoutRef.current = setTimeout(() => {
          handleSearch(query, currentPage);
        }, 500);
      },
      { threshold: 0.5 }
    );

    observer.observe(observerTarget.current);

    return () => {
      observer.disconnect();
      if (observerTimeoutRef.current) clearTimeout(observerTimeoutRef.current);
    };
  }, [currentPage, loading, initialLoading, hasMore, query, handleSearch]);

  if (!query.trim()) return null;

  return (
    <Box
      sx={{
        backgroundColor: "#0C0C0C",
        minHeight: "100vh",
        pt: { xs: 10, md: 12 },
        pb: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        {(results.length > 0 || initialLoading) && !error && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "1.5rem",
                mb: 1,
                letterSpacing: "-0.02em",
              }}
            >
              Kết quả tìm kiếm cho &quot;{query}&quot;
            </Typography>
          </Box>
        )}

        {/* Results Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
              lg: "repeat(5, 1fr)",
              xl: "repeat(6, 1fr)",
            },
            gap: 2,
            animation: "fadeIn 0.3s ease",
            "@keyframes fadeIn": {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
          }}
        >
          {/* Initial Loading - Show skeletons */}
          {initialLoading && (
            <>
              {Array.from({ length: 12 }).map((_, i) => (
                <Box key={`skeleton-${i}`} sx={{ aspectRatio: "16 / 9" }}>
                  <MovieCardSkeleton />
                </Box>
              ))}
            </>
          )}

          {/* No Results */}
          {results.length === 0 && !initialLoading && initialLoadingDone && query && !error && (
            <Box sx={{ gridColumn: "1 / -1", textAlign: "center", py: 8 }}>
              <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "1rem" }}>
                Không tìm thấy kết quả cho &quot;{query}&quot;
              </Typography>
            </Box>
          )}

          {/* Error */}
          {error && (
            <Box sx={{ gridColumn: "1 / -1", textAlign: "center", py: 4 }}>
              <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
                {error}
              </Typography>
            </Box>
          )}

          {/* Results */}
          {results.map((movie) => (
            <Box
              key={movie.id}
              onClick={() => {
                onClose();
                router.push(`/${movie.movieType === "SERIES" ? "tv" : "movies"}/${movie.slug}`);
              }}
              sx={{ aspectRatio: "16 / 9", cursor: "pointer" }}
            >
              <MovieCard {...getMovieCardProps(movie, { onPlay: () => onClose() })} />
            </Box>
          ))}

          <div ref={observerTarget} style={{ gridColumn: "1 / -1", height: "1px" }} />
        </Box>

        {loading && hasMore && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              py: 3,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                animation: "pulse 1s ease-in-out infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 0.3, transform: "scale(0.8)" },
                  "50%": { opacity: 1, transform: "scale(1.2)" },
                },
              }}
            />
            <Typography
              sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}
            >
              Đang tải thêm...
            </Typography>
          </Box>
        )}

        {!hasMore && results.length > 0 && !loading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              py: 3,
            }}
          >
            <Box sx={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.08)" }} />
            <Typography
              sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", fontWeight: 600 }}
            >
              Đã hiển thị tất cả {results.length} kết quả
            </Typography>
            <Box sx={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.08)" }} />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default SearchResultsPage;
