import apiClient from "@/services/api-client";
import {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "@/modules/comment/types/comment";
import { PaginatedResponse, PaginationParams } from "@/types/api";

class CommentService {
  async getMovieComments(
    movieId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Comment>> {
    try {
      return await apiClient.get<PaginatedResponse<Comment>>(`/movies/${movieId}/comments`, {
        params,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createComment(movieId: string, data: CreateCommentRequest): Promise<Comment> {
    try {
      return await apiClient.post<Comment>(`/movies/${movieId}/comments`, data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateComment(
    movieId: string,
    commentId: string,
    data: UpdateCommentRequest
  ): Promise<Comment> {
    try {
      return await apiClient.put<Comment>(`/movies/${movieId}/comments/${commentId}`, data);
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

  // Discovery Methods
  async getTopComments(limit: number = 5): Promise<Comment[]> {
    try {
      return (
        (await apiClient.get<Comment[]>("/discovery/top-comments", {
          params: { limit },
        })) || []
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getNewComments(limit: number = 5): Promise<Comment[]> {
    try {
      return (
        (await apiClient.get<Comment[]>("/discovery/new-comments", {
          params: { limit },
        })) || []
      );
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

export default new CommentService();
