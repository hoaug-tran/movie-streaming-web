"use client";

import { MovieSummary } from "@/modules/movie/types/movie";
import { MovieCardProps } from "@/components/Common/MovieCard";
import { usePlayNavigation } from "@/hooks/use-play-navigation";

type MovieCardMovie = Partial<MovieSummary> & {
  id: number;
  title: string;
  slug?: string;
  progress?: number;
  matchScore?: number;
};

type MovieCardOptions = Partial<MovieCardProps>;

export function useMovieCardProps(
  movie: MovieCardMovie,
  options: MovieCardOptions = {}
): MovieCardProps {
  const { navigateToWatch } = usePlayNavigation();
  const defaultReleaseDate =
    movie.publishedAt || (movie.releaseYear ? `${movie.releaseYear}-01-01` : movie.createdAt);

  const handlePlay =
    options.onPlay ||
    (() => {
      if (!movie.slug) {
        console.warn("Cannot play movie without slug:", movie.title);
        return;
      }

      navigateToWatch({
        movieSlug: movie.slug,
        movieId: movie.id,
        isPremiumOnly: movie.isPremiumOnly,
      });
    });

  return {
    id: movie.id,
    title: movie.title,
    slug: movie.slug,
    posterUrl: movie.posterUrl ?? undefined,
    bannerUrl: movie.bannerUrl ?? undefined,
    rating: movie.averageRating,
    releaseDate: options.releaseDate ?? defaultReleaseDate,
    ageRating: movie.ageRating,
    movieType: movie.movieType,
    description: movie.description,
    country: movie.country,
    language: movie.language,
    viewCount: movie.viewCount,
    favoriteCount: movie.favoriteCount,
    movieStatus: movie.movieStatus,
    isPremiumOnly: movie.isPremiumOnly,
    originalTitle: movie.originalTitle,
    totalRatings: movie.totalRatings,
    totalReviews: movie.totalReviews,
    publishedAt: movie.publishedAt,
    trailerUrl: movie.trailerUrl,
    categories: movie.categories,
    matchScore: movie.matchScore,
    onPlay: handlePlay,
    ...options,
  };
}

export function getMovieCardProps(
  movie: MovieCardMovie,
  options: MovieCardOptions = {}
): MovieCardProps {
  const defaultReleaseDate =
    movie.publishedAt || (movie.releaseYear ? `${movie.releaseYear}-01-01` : movie.createdAt);

  return {
    id: movie.id,
    title: movie.title,
    slug: movie.slug,
    posterUrl: movie.posterUrl ?? undefined,
    bannerUrl: movie.bannerUrl ?? undefined,
    rating: movie.averageRating,
    releaseDate: options.releaseDate ?? defaultReleaseDate,
    ageRating: movie.ageRating,
    movieType: movie.movieType,
    description: movie.description,
    country: movie.country,
    language: movie.language,
    viewCount: movie.viewCount,
    favoriteCount: movie.favoriteCount,
    movieStatus: movie.movieStatus,
    isPremiumOnly: movie.isPremiumOnly,
    originalTitle: movie.originalTitle,
    totalRatings: movie.totalRatings,
    totalReviews: movie.totalReviews,
    publishedAt: movie.publishedAt,
    trailerUrl: movie.trailerUrl,
    categories: movie.categories,
    matchScore: movie.matchScore,
    ...options,
  };
}
