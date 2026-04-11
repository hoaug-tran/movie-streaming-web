import apiClient from "@/services/api-client";
import { Comment, CreateCommentRequest, UpdateCommentRequest } from "@/modules/comment/types/comment";
import { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";

class CommentService {
  async getMovieComments(movieId: string, params?: PaginationParams): Promise<PaginatedResponse<Comment>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Comment>>>(
        `/movies/${movieId}/comments`,
        { params }
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createComment(movieId: string, data: CreateCommentRequest): Promise<Comment> {
    try {
      const response = await apiClient.post<ApiResponse<Comment>>(
        `/movies/${movieId}/comments`,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateComment(movieId: string, commentId: string, data: UpdateCommentRequest): Promise<Comment> {
    try {
      const response = await apiClient.put<ApiResponse<Comment>>(
        `/movies/${movieId}/comments/${commentId}`,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteComment(movieId: string, commentId: string): Promise<void> {
    try {
      await apiClient.delete(`/movies/${movieId}/comments/${commentId}`);
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

export default new CommentService();
