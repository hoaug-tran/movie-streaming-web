import apiClient from "@/services/api-client";
import { Review, CreateReviewRequest, UpdateReviewRequest } from "@/modules/review/types/review";
import { PaginatedResponse, PaginationParams } from "@/types/api";

class ReviewService {
  async getMovieReviews(
    movieId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Review>> {
    try {
      return await apiClient.get<PaginatedResponse<Review>>(`/movies/${movieId}/reviews`, {
        params,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createReview(movieId: string, data: CreateReviewRequest): Promise<Review> {
    try {
      return await apiClient.post<Review>(`/movies/${movieId}/reviews`, data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateReview(
    movieId: string,
    reviewId: string,
    data: UpdateReviewRequest
  ): Promise<Review> {
    try {
      return await apiClient.put<Review>(`/movies/${movieId}/reviews/${reviewId}`, data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteReview(movieId: string, reviewId: string): Promise<void> {
    try {
      await apiClient.delete(`/movies/${movieId}/reviews/${reviewId}`);
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

export default new ReviewService();
