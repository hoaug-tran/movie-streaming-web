import { useQuery } from "@tanstack/react-query";
import movieService from "@/modules/movie/api/movie-service";
import commentService from "@/modules/comment/api/comment-service";
import { Movie } from "@/modules/movie/types/movie";
import { Comment } from "@/modules/comment/types/comment";

export const useDiscovery = () => {
  const trendingMovies = useQuery<Movie[]>({
    queryKey: ["movies", "trending"],
    queryFn: () => movieService.getTrendingMovies(10),
    staleTime: 5 * 60 * 1000,
  });

  const weeklyNewMovies = useQuery<Movie[]>({
    queryKey: ["movies", "weekly-new"],
    queryFn: () => movieService.getWeeklyNewMovies(10),
    staleTime: 5 * 60 * 1000,
  });

  const upcomingMovies = useQuery<Movie[]>({
    queryKey: ["movies", "upcoming"],
    queryFn: () => movieService.getUpcomingMovies(10),
    staleTime: 10 * 60 * 1000,
  });

  const topRatedMovies = useQuery<Movie[]>({
    queryKey: ["movies", "top-rated"],
    queryFn: () => movieService.getTopRatedMovies(10),
    staleTime: 5 * 60 * 1000,
  });

  const topSeries = useQuery<Movie[]>({
    queryKey: ["movies", "top-series"],
    queryFn: () => movieService.getTopSeries(10),
    staleTime: 5 * 60 * 1000,
  });

  const seriesDrama = useQuery<Movie[]>({
    queryKey: ["movies", "series-drama"],
    queryFn: () => movieService.getSeriesDrama(10),
    staleTime: 5 * 60 * 1000,
  });

  const actionMovies = useQuery<Movie[]>({
    queryKey: ["movies", "action"],
    queryFn: () => movieService.getActionMovies(10),
    staleTime: 5 * 60 * 1000,
  });

  const thrillerMovies = useQuery<Movie[]>({
    queryKey: ["movies", "thriller"],
    queryFn: () => movieService.getThrillerMovies(10),
    staleTime: 5 * 60 * 1000,
  });

  const animeSeries = useQuery<Movie[]>({
    queryKey: ["movies", "anime-series"],
    queryFn: () => movieService.getAnimeSeries(10),
    staleTime: 5 * 60 * 1000,
  });

  const animeMovies = useQuery<Movie[]>({
    queryKey: ["movies", "anime-movies"],
    queryFn: () => movieService.getAnimeMovies(10),
    staleTime: 5 * 60 * 1000,
  });

  const mostCommentedMovies = useQuery<Movie[]>({
    queryKey: ["movies", "most-commented"],
    queryFn: () => movieService.getMostCommented(10),
    staleTime: 5 * 60 * 1000,
  });

  const mostActiveMovies = useQuery<Movie[]>({
    queryKey: ["movies", "most-active"],
    queryFn: () => movieService.getMostActiveMovies(10),
    staleTime: 5 * 60 * 1000,
  });

  const topComments = useQuery<Comment[]>({
    queryKey: ["comments", "top"],
    queryFn: () => commentService.getTopComments(5),
    staleTime: 2 * 60 * 1000,
  });

  const newComments = useQuery<Comment[]>({
    queryKey: ["comments", "new"],
    queryFn: () => commentService.getNewComments(5),
    staleTime: 1 * 60 * 1000,
  });

  return {
    trendingMovies,
    weeklyNewMovies,
    upcomingMovies,
    topRatedMovies,
    topSeries,
    seriesDrama,
    actionMovies,
    thrillerMovies,
    animeSeries,
    animeMovies,
    mostCommentedMovies,
    mostActiveMovies,
    topComments,
    newComments,
  };
};

export const useRegionalMovies = (country: string) => {
  return useQuery<Movie[]>({
    queryKey: ["movies", "region", country],
    queryFn: () => movieService.getMoviesByRegion(country, 0, 10),
    staleTime: 5 * 60 * 1000,
    enabled: !!country,
  });
};
