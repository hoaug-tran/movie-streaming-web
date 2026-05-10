import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import commentService from "@/modules/comment/api/comment-service";
import { CreateCommentRequest } from "@/modules/comment/types/comment";
import { MovieComment, MovieDetailAggregate } from "@/modules/movie/types/movie";

type ToggleCommentLikeVariables = {
  commentId: number;
  liked: boolean;
};

export const movieCommentsQueryKey = (movieId: number) => ["movie-comments", movieId] as const;
export const movieCommentsPageQueryKey = (movieId: number, page: number, size: number) =>
  ["movie-comments-page", movieId, page, size] as const;
export const movieDetailQueryKey = (slug: string) => ["movie-detail", slug] as const;

export function useMovieComments(movieId: number, initialComments: MovieComment[] = []) {
  return useQuery({
    queryKey: movieCommentsQueryKey(movieId),
    queryFn: () => commentService.getMovieComments(String(movieId)),
    initialData: initialComments,
    enabled: Number.isFinite(movieId),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useMovieCommentsPage(movieId: number, page: number, size: number = 10) {
  return useQuery({
    queryKey: movieCommentsPageQueryKey(movieId, page, size),
    queryFn: () => commentService.getMovieCommentsPage(String(movieId), page, size),
    enabled: Number.isFinite(movieId),
    staleTime: 0,
  });
}

export function useCreateMovieComment(movieId: number, slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => commentService.createComment(String(movieId), data),
    onSuccess: (created) => {
      queryClient.setQueryData<MovieComment[]>(movieCommentsQueryKey(movieId), (current = []) => {
        if (current.some((comment) => comment.id === created.id)) return current;
        return [created, ...current].map((comment) =>
          comment.id === created.parentCommentId
            ? { ...comment, replyCount: (comment.replyCount || 0) + 1 }
            : comment
        );
      });

      queryClient.setQueryData<MovieDetailAggregate>(movieDetailQueryKey(slug), (current) => {
        if (!current) return current;
        if (current.comments.some((comment) => comment.id === created.id)) return current;
        return {
          ...current,
          comments: [created, ...current.comments].map((comment) =>
            comment.id === created.parentCommentId
              ? { ...comment, replyCount: (comment.replyCount || 0) + 1 }
              : comment
          ),
        };
      });

      queryClient.invalidateQueries({ queryKey: movieCommentsQueryKey(movieId) });
      queryClient.invalidateQueries({ queryKey: movieDetailQueryKey(slug) });
    },
  });
}

export function useToggleCommentLike(movieId: number, slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: ToggleCommentLikeVariables) =>
      commentService.toggleLike(String(commentId)),
    onMutate: async ({ commentId, liked }) => {
      await queryClient.cancelQueries({ queryKey: movieCommentsQueryKey(movieId) });
      const previousComments = queryClient.getQueryData<MovieComment[]>(
        movieCommentsQueryKey(movieId)
      );
      const previousDetail = queryClient.getQueryData<MovieDetailAggregate>(
        movieDetailQueryKey(slug)
      );
      const delta = liked ? -1 : 1;

      const bump = (comment: MovieComment) =>
        comment.id === commentId
          ? {
              ...comment,
              likeCount: Math.max((comment.likeCount || 0) + delta, 0),
              likedByCurrentUser: !liked,
            }
          : comment;

      queryClient.setQueryData<MovieComment[]>(movieCommentsQueryKey(movieId), (current = []) =>
        current.map(bump)
      );
      queryClient.setQueryData<MovieDetailAggregate>(movieDetailQueryKey(slug), (current) =>
        current ? { ...current, comments: current.comments.map(bump) } : current
      );

      return { previousComments, previousDetail };
    },
    onError: (_error, _commentId, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(movieCommentsQueryKey(movieId), context.previousComments);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(movieDetailQueryKey(slug), context.previousDetail);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: movieCommentsQueryKey(movieId) });
      queryClient.invalidateQueries({ queryKey: movieDetailQueryKey(slug) });
    },
  });
}
