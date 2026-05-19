import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import searchHistoryService, {
  SearchHistoryResponse,
} from "@/modules/search-history/api/search-history-service";

export const searchHistoryQueryKeys = {
  all: ["search-histories"] as const,
  mine: () => [...searchHistoryQueryKeys.all, "me"] as const,
  recent: (limit: number) => [...searchHistoryQueryKeys.all, "recent", limit] as const,
};

export function useMySearchHistories(enabled = true) {
  return useQuery<SearchHistoryResponse[]>({
    queryKey: searchHistoryQueryKeys.mine(),
    queryFn: () => searchHistoryService.getMine(),
    enabled,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 0,
  });
}

export function useRecentSearchHistories(limit = 10, enabled = true) {
  return useQuery<SearchHistoryResponse[]>({
    queryKey: searchHistoryQueryKeys.recent(limit),
    queryFn: () => searchHistoryService.getRecent(limit),
    enabled,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 0,
  });
}

export function useDeleteSearchHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => searchHistoryService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchHistoryQueryKeys.all });
    },
  });
}

export function useClearSearchHistories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => searchHistoryService.clearMine(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchHistoryQueryKeys.all });
    },
  });
}
