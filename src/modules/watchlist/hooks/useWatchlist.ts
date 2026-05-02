import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import watchlistService from "@/modules/watchlist/api/watchlist-service";

export const watchlistQueryKeys = {
  all: ["watchlists"] as const,
  mine: () => [...watchlistQueryKeys.all, "me"] as const,
  check: (movieId: number) => [...watchlistQueryKeys.all, "check", movieId] as const,
};

export function useMyWatchlist(enabled = true) {
  return useQuery({
    queryKey: watchlistQueryKeys.mine(),
    queryFn: () => watchlistService.getMyWatchlist(),
    enabled,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useCheckWatchlist(movieId: number, enabled = true) {
  return useQuery({
    queryKey: watchlistQueryKeys.check(movieId),
    queryFn: () => watchlistService.check(movieId),
    enabled: enabled && Number.isFinite(movieId),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (movieId: number) => watchlistService.add(movieId),
    onSuccess: (_data, movieId) => {
      queryClient.invalidateQueries({ queryKey: watchlistQueryKeys.mine() });
      queryClient.invalidateQueries({ queryKey: watchlistQueryKeys.check(movieId) });
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (movieId: number) => watchlistService.remove(movieId),
    onSuccess: (_data, movieId) => {
      queryClient.invalidateQueries({ queryKey: watchlistQueryKeys.mine() });
      queryClient.invalidateQueries({ queryKey: watchlistQueryKeys.check(movieId) });
    },
  });
}
