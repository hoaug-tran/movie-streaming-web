import apiClient from "@/services/api-client";
import {
  UserProfile,
  UpdateProfileRequest,
  EmailChangeResponse,
  Favorite,
  WatchHistory,
} from "@/modules/user/types/user";
import { PaginatedResponse, PaginationParams } from "@/types/api";

class UserService {
  async getUserProfile(): Promise<UserProfile> {
    try {
      return await apiClient.get<UserProfile>("/users/me");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    try {
      return await apiClient.put<UserProfile>("/users/me", data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadAvatar(file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiClient.patch<UserProfile>("/users/me/avatar", formData);
  }

  async startEmailChange(newEmail: string): Promise<EmailChangeResponse> {
    return apiClient.patch<EmailChangeResponse>("/users/me/email-change/start", { newEmail });
  }

  async verifyCurrentEmailChange(otp: string): Promise<EmailChangeResponse> {
    return apiClient.patch<EmailChangeResponse>("/users/me/email-change/verify-current", { otp });
  }

  async verifyNewEmailChange(otp: string): Promise<EmailChangeResponse> {
    return apiClient.patch<EmailChangeResponse>("/users/me/email-change/verify-new", { otp });
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
