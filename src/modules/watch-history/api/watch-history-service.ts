import apiClient from "@/services/api-client";
import {
  WatchHistory,
  UpsertWatchHistoryRequest,
} from "@/modules/watch-history/types/watch-history";

class WatchHistoryService {
  async upsert(request: UpsertWatchHistoryRequest): Promise<WatchHistory> {
    return apiClient.post<WatchHistory>("/watch-histories", request);
  }

  async getMyMovieHistory(movieId: number): Promise<WatchHistory[]> {
    try {
      return await apiClient.get<WatchHistory[]>(`/watch-histories/me/movie/${movieId}`);
    } catch {
      return [];
    }
  }

  async getEpisodeProgress(movieId: number, episodeId: number): Promise<WatchHistory | null> {
    try {
      const histories = await this.getMyMovieHistory(movieId);
      return histories.find((h) => h.episodeId === episodeId) ?? null;
    } catch {
      return null;
    }
  }
}

const watchHistoryService = new WatchHistoryService();
export default watchHistoryService;
