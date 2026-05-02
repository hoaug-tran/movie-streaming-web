import { useQuery } from "@tanstack/react-query";
import watchHistoryService from "@/modules/watch-history/api/watch-history-service";

export function useMyWatchHistories(enabled = true) {
  return useQuery({
    queryKey: ["watch-history", "me"],
    queryFn: () => watchHistoryService.getMyWatchHistories(),
    enabled,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useContinueWatching(enabled = true) {
  return useQuery({
    queryKey: ["watch-history", "continue-watching"],
    queryFn: () => watchHistoryService.getContinueWatching(),
    enabled,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}
