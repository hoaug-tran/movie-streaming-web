import { useQuery } from "@tanstack/react-query";

import movieService from "@/modules/movie/api/movie-service";

export function useMovieDetailPage(slug: string) {
  return useQuery({
    queryKey: ["movie-detail", slug],
    queryFn: () => movieService.getMovieDetailBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
  });
}
