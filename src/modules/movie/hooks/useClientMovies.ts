import { useQuery } from "@tanstack/react-query";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

export interface Movie {
  id: number;
  title: string;
  slug: string;
  description?: string;
  posterUrl?: string | null;
  bannerUrl?: string | null;
  trailerUrl?: string | null;
  releaseYear?: number;
  country?: string;
  language?: string;
  ageRating?: string;
  movieType?: string;
  movieStatus?: string;
  isPremiumOnly?: boolean;
  viewCount?: number;
  favoriteCount?: number;
  averageRating?: number;
  totalRatings?: number;
  totalReviews?: number;
  publishedAt?: string;
}

export interface Category {
  id: number;
  name: string;
}

function extractMovies(data: unknown): Movie[] {
  if (Array.isArray(data)) return data as Movie[];
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.content)) return d.content as Movie[];
    if (Array.isArray(d.data)) return d.data as Movie[];
  }
  return [];
}

async function fetchMovies(url: string): Promise<Movie[]> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    headers,
    credentials: "include",
  });
  if (res.status === 401 || res.status === 403) return [];
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  const data = await res.json();
  return extractMovies(data);
}

async function fetchCategories(url: string): Promise<Category[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  const data = await res.json();
  if (Array.isArray(data)) return data as Category[];
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.data)) return d.data as Category[];
  }
  return [];
}

export interface SearchMovieParams {
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  size?: number;
  page?: number;
}

async function searchMovies(params: SearchMovieParams): Promise<Movie[]> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/movies/search`, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
    credentials: "include",
  });
  if (res.status === 401 || res.status === 403) return [];
  if (!res.ok) throw new Error(`API error ${res.status}: /movies/search`);
  const data = await res.json();
  return extractMovies(data);
}

export function useTrendingMovies() {
  return useQuery({
    queryKey: ["movies", "trending"],
    queryFn: () => searchMovies({ sortBy: "viewCount", sortDirection: "DESC", size: 8 }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function useLatestMovies() {
  return useQuery({
    queryKey: ["movies", "latest"],
    queryFn: () => searchMovies({ sortBy: "createdAt", sortDirection: "DESC", size: 8 }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function useFeaturedMovie() {
  return useQuery({
    queryKey: ["movies", "featured"],
    queryFn: async () => {
      const movies = await searchMovies({
        sortBy: "averageRating",
        sortDirection: "DESC",
        size: 1,
      });
      return movies.length > 0 ? movies[0] : null;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
  });
}

export function useContinueWatchingMovies(enabled = true) {
  return useQuery({
    queryKey: ["movies", "continue-watching"],
    queryFn: () => fetchMovies(`${API_BASE}/watch-histories/me/continue-watching`),
    enabled,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useRecommendedMovies(enabled = true) {
  return useQuery({
    queryKey: ["movies", "recommended"],
    queryFn: () => fetchMovies(`${API_BASE}/recommendations/me`),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useMovieCategories() {
  return useQuery({
    queryKey: ["movies", "categories"],
    queryFn: () => fetchCategories(`${API_BASE}/movies/categories`),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 2,
  });
}

export function useTopRatedMovies() {
  return useQuery({
    queryKey: ["movies", "top-rated"],
    queryFn: () => searchMovies({ sortBy: "averageRating", sortDirection: "DESC", size: 10 }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function useCarouselMovies() {
  return useQuery({
    queryKey: ["movies", "carousel"],
    queryFn: () => searchMovies({ sortBy: "averageRating", sortDirection: "DESC", size: 6 }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}
