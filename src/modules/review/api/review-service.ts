import apiClient from "@/services/api-client";
import { MovieReview } from "@/modules/movie/types/movie";
import { PageResponse } from "@/types/page-response";

export type CreateMovieReviewRequest = {
  movieId: number;
  rating: number;
  content: string;
};

export type ReviewLikeResponse = {
  reviewId: number;
  liked: boolean;
};

class ReviewService {
  async getMovieReviews(movieId: string): Promise<MovieReview[]> {
    try {
      return await apiClient.get<MovieReview[]>(`/reviews/movie/${movieId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMovieReviewsPage(
    movieId: string,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<MovieReview>> {
    try {
      return await apiClient.get<PageResponse<MovieReview>>(`/reviews/movie/${movieId}/page`, {
        params: { page, size },
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createMovieReview(movieId: number, data: CreateMovieReviewRequest): Promise<MovieReview> {
    try {
      return await apiClient.post<MovieReview>("/reviews", {
        ...data,
        movieId,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async toggleReviewLike(reviewId: number): Promise<boolean> {
    try {
      const res = await apiClient.post<ReviewLikeResponse>(`/review-likes/${reviewId}`);
      return res.liked;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.data?.message) {
      return new Error(error.data.message);
    }
    return new Error(error.message || "Đã xảy ra lỗi, vui lòng thử lại");
  }
}

export default new ReviewService();
