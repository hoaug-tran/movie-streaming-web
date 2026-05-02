import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import favoriteService from "@/modules/favorite/api/favorite-service";

export const favoriteQueryKeys = {
  all: ["favorites"] as const,
  mine: () => [...favoriteQueryKeys.all, "me"] as const,
  check: (movieId: number) => [...favoriteQueryKeys.all, "check", movieId] as const,
};

export function useMyFavorites(enabled = true) {
  return useQuery({
    queryKey: favoriteQueryKeys.mine(),
    queryFn: () => favoriteService.getMyFavorites(),
    enabled,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useCheckFavorite(movieId: number, enabled = true) {
  return useQuery({
    queryKey: favoriteQueryKeys.check(movieId),
    queryFn: () => favoriteService.check(movieId),
    enabled: enabled && Number.isFinite(movieId),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (movieId: number) => favoriteService.add(movieId),
    onSuccess: (_data, movieId) => {
      queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.mine() });
      queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.check(movieId) });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (movieId: number) => favoriteService.remove(movieId),
    onSuccess: (_data, movieId) => {
      queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.mine() });
      queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.check(movieId) });
    },
  });
}

export function useClearFavorites() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => favoriteService.clearMine(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.all });
    },
  });
}
