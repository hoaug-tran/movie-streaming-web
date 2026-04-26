import apiClient from "@/services/api-client";
import {
  UserProfile,
  UpdateProfileRequest,
  Favorite,
  WatchHistory,
} from "@/modules/user/types/user";
import { PaginatedResponse, PaginationParams } from "@/types/api";

class UserService {
  async getUserProfile(userId?: string): Promise<UserProfile> {
    try {
      const url = userId ? `/users/${userId}` : "/users/profile";
      return await apiClient.get<UserProfile>(url);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    try {
      return await apiClient.put<UserProfile>("/users/profile", data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getFavorites(params?: PaginationParams): Promise<PaginatedResponse<Favorite>> {
    try {
      return await apiClient.get<PaginatedResponse<Favorite>>("/users/favorites", { params });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addFavorite(movieId: string): Promise<Favorite> {
    try {
      return await apiClient.post<Favorite>("/users/favorites", {
        movieId,
      });
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
      return await apiClient.get<PaginatedResponse<WatchHistory>>("/users/watch-history", {
        params,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addWatchHistory(movieId: string, currentTime?: number): Promise<WatchHistory> {
    try {
      return await apiClient.post<WatchHistory>("/users/watch-history", {
        movieId,
        currentTime,
      });
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

export default new UserService();
