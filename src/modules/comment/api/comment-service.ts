import apiClient from "@/services/api-client";
import {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "@/modules/comment/types/comment";
import { PageResponse } from "@/types/page-response";

class CommentService {
  async getMovieComments(movieId: string): Promise<Comment[]> {
    try {
      return await apiClient.get<Comment[]>(`/comments/movie/${movieId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMovieCommentsPage(
    movieId: string,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<Comment>> {
    try {
      return await apiClient.get<PageResponse<Comment>>(`/comments/movie/${movieId}/page`, {
        params: { page, size },
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createComment(movieId: string, data: CreateCommentRequest): Promise<Comment> {
    try {
      return await apiClient.post<Comment>("/comments", {
        ...data,
        movieId: Number(movieId),
        parentCommentId: data.parentCommentId ? Number(data.parentCommentId) : undefined,
        episodeId: data.episodeId ? Number(data.episodeId) : undefined,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateComment(
    _movieId: string,
    commentId: string,
    data: UpdateCommentRequest
  ): Promise<Comment> {
    try {
      return await apiClient.put<Comment>(`/comments/${commentId}`, data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteComment(_movieId: string, commentId: string): Promise<void> {
    try {
      await apiClient.delete(`/comments/${commentId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async toggleLike(commentId: string): Promise<{ commentId: number; liked: boolean }> {
    try {
      return await apiClient.post<{ commentId: number; liked: boolean }>(
        `/comment-likes/${commentId}`
      );
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
    return new Error(error.message || "Đã xảy ra lỗi, vui lòng thử lại");
  }
}

export default new CommentService();
