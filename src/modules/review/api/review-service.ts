import apiClient from "@/services/api-client";
import { Review, CreateReviewRequest, UpdateReviewRequest } from "@/modules/review/types/review";
import { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";

class ReviewService {
  async getMovieReviews(movieId: string, params?: PaginationParams): Promise<PaginatedResponse<Review>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Review>>>(
        `/movies/${movieId}/reviews`,
        { params }
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createReview(movieId: string, data: CreateReviewRequest): Promise<Review> {
    try {
      const response = await apiClient.post<ApiResponse<Review>>(
        `/movies/${movieId}/reviews`,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateReview(movieId: string, reviewId: string, data: UpdateReviewRequest): Promise<Review> {
    try {
      const response = await apiClient.put<ApiResponse<Review>>(
        `/movies/${movieId}/reviews/${reviewId}`,
        data
      );
      return response.data.data!;
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
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error("An error occurred");
  }
}

export default new ReviewService();
