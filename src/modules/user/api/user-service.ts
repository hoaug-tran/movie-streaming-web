import apiClient from "@/services/api-client";
import { UserProfile, UpdateProfileRequest, Favorite, WatchHistory } from "@/modules/user/types/user";
import { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";

class UserService {
  async getUserProfile(userId?: string): Promise<UserProfile> {
    try {
      const url = userId ? `/users/${userId}` : "/users/profile";
      const response = await apiClient.get<ApiResponse<UserProfile>>(url);
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    try {
      const response = await apiClient.put<ApiResponse<UserProfile>>("/users/profile", data);
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getFavorites(params?: PaginationParams): Promise<PaginatedResponse<Favorite>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Favorite>>>(
        "/users/favorites",
        { params }
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addFavorite(movieId: string): Promise<Favorite> {
    try {
      const response = await apiClient.post<ApiResponse<Favorite>>("/users/favorites", {
        movieId,
      });
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async removeFavorite(movieId: string): Promise<void> {
    try {
      await apiClient.delete(`/users/favorites/${movieId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWatchHistory(params?: PaginationParams): Promise<PaginatedResponse<WatchHistory>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<WatchHistory>>>(
        "/users/watch-history",
        { params }
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addWatchHistory(movieId: string, currentTime?: number): Promise<WatchHistory> {
    try {
      const response = await apiClient.post<ApiResponse<WatchHistory>>("/users/watch-history", {
        movieId,
        currentTime,
      });
      return response.data.data!;
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

export default new UserService();
