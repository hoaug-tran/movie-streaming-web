import apiClient from "@/services/api-client";
import { Favorite, MovieInFavoriteResponse } from "@/modules/favorite/types/favorite";

class FavoriteService {
  async getMyFavorites(): Promise<Favorite[]> {
    return apiClient.get<Favorite[]>("/favorites/me");
  }

  async add(movieId: number): Promise<Favorite> {
    return apiClient.post<Favorite>(`/favorites/${movieId}`);
  }

  async remove(movieId: number): Promise<void> {
    await apiClient.delete<void>(`/favorites/${movieId}`);
  }

  async clearMine(): Promise<void> {
    await apiClient.delete<void>("/favorites/me");
  }

  async check(movieId: number): Promise<MovieInFavoriteResponse> {
    return apiClient.get<MovieInFavoriteResponse>(`/favorites/me/check/${movieId}`);
  }
}

const favoriteService = new FavoriteService();
export default favoriteService;
