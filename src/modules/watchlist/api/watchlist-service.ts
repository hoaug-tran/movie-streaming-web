import apiClient from "@/services/api-client";
import { MovieInWatchlistResponse, Watchlist } from "@/modules/watchlist/types/watchlist";

class WatchlistService {
  async getMyWatchlist(): Promise<Watchlist[]> {
    return apiClient.get<Watchlist[]>("/watchlists/me");
  }

  async add(movieId: number): Promise<Watchlist> {
    return apiClient.post<Watchlist>(`/watchlists/${movieId}`);
  }

  async remove(movieId: number): Promise<void> {
    await apiClient.delete<void>(`/watchlists/${movieId}`);
  }

  async check(movieId: number): Promise<MovieInWatchlistResponse> {
    return apiClient.get<MovieInWatchlistResponse>(`/watchlists/me/check/${movieId}`);
  }
}

const watchlistService = new WatchlistService();
export default watchlistService;
