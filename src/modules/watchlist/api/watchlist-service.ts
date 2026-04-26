import apiClient from "@/services/api-client";
import { Watchlist } from "@/modules/watchlist/types/watchlist";
import { PaginatedResponse, PaginationParams } from "@/types/api";

class WatchlistService {
  async getWatchlist(params?: PaginationParams): Promise<PaginatedResponse<Watchlist>> {
    try {
      return await apiClient.get<PaginatedResponse<Watchlist>>("/watchlist", { params });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addToWatchlist(movieId: string): Promise<Watchlist> {
    try {
      return await apiClient.post<Watchlist>("/watchlist", { movieId });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async removeFromWatchlist(movieId: string): Promise<void> {
    try {
      await apiClient.delete(`/watchlist/${movieId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.data?.message) {
      return new Error(error.data.message);
    }
    return new Error(error.message || "An error occurred");
  }
}

export default new WatchlistService();
