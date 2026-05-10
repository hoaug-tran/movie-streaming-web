import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import reviewService, { CreateMovieReviewRequest } from "@/modules/review/api/review-service";
import { MovieDetailAggregate, MovieReview } from "@/modules/movie/types/movie";
import { movieDetailQueryKey } from "@/modules/comment/hooks/useMovieComments";

export const movieReviewsPageQueryKey = (movieId: number, page: number, size: number) =>
  ["movie-reviews-page", movieId, page, size] as const;

type ToggleReviewLikeVariables = {
  reviewId: number;
  liked: boolean;
};

export function useMovieReviewsPage(movieId: number, page: number, size: number = 10) {
  return useQuery({
    queryKey: movieReviewsPageQueryKey(movieId, page, size),
    queryFn: () => reviewService.getMovieReviewsPage(String(movieId), page, size),
    enabled: Number.isFinite(movieId),
    staleTime: 0,
  });
}

export function useCreateMovieReview(movieId: number, slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMovieReviewRequest) => reviewService.createMovieReview(movieId, data),
    onSuccess: (created) => {
      queryClient.setQueryData<MovieDetailAggregate>(movieDetailQueryKey(slug), (current) => {
        if (!current) return current;
        const reviews = current.reviews.some((review) => review.id === created.id)
          ? current.reviews.map((review) => (review.id === created.id ? created : review))
          : [created, ...current.reviews];
        return {
          ...current,
          reviews,
          movie: {
            ...current.movie,
            totalReviews: reviews.length,
          },
        };
      });
      queryClient.invalidateQueries({ queryKey: movieDetailQueryKey(slug) });
    },
  });
}

export function useToggleReviewLike(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId }: ToggleReviewLikeVariables) =>
      reviewService.toggleReviewLike(reviewId),
    onMutate: async ({ reviewId, liked }) => {
      await queryClient.cancelQueries({ queryKey: movieDetailQueryKey(slug) });
      const previousDetail = queryClient.getQueryData<MovieDetailAggregate>(
        movieDetailQueryKey(slug)
      );
      const delta = liked ? -1 : 1;
      const bump = (review: MovieReview) =>
        review.id === reviewId
          ? {
              ...review,
              likeCount: Math.max((review.likeCount || 0) + delta, 0),
              likedByCurrentUser: !liked,
            }
          : review;

      queryClient.setQueryData<MovieDetailAggregate>(movieDetailQueryKey(slug), (current) =>
        current ? { ...current, reviews: current.reviews.map(bump) } : current
      );

      return { previousDetail };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(movieDetailQueryKey(slug), context.previousDetail);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: movieDetailQueryKey(slug) });
    },
  });
}
