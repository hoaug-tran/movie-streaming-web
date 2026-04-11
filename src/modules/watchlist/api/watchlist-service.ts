import apiClient from "@/services/api-client";
import { Watchlist, AddToWatchlistRequest } from "@/modules/watchlist/types/watchlist";
import { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";

class WatchlistService {
  async getWatchlist(params?: PaginationParams): Promise<PaginatedResponse<Watchlist>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Watchlist>>>(
        "/watchlist",
        { params }
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addToWatchlist(movieId: string): Promise<Watchlist> {
    try {
      const response = await apiClient.post<ApiResponse<Watchlist>>("/watchlist", { movieId });
      return response.data.data!;
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
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error("An error occurred");
  }
}

export default new WatchlistService();
