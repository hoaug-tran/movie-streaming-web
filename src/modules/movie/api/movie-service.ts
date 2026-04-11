import apiClient from "@/services/api-client";
import { Movie, MovieDetail, CreateMovieRequest, UpdateMovieRequest } from "@/modules/movie/types/movie";
import { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";

class MovieService {
  async getMovies(params?: PaginationParams): Promise<PaginatedResponse<Movie>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Movie>>>(
        "/movies",
        { params }
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMovieById(id: string): Promise<MovieDetail> {
    try {
      const response = await apiClient.get<ApiResponse<MovieDetail>>(`/movies/${id}`);
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchMovies(query: string, params?: PaginationParams): Promise<PaginatedResponse<Movie>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Movie>>>("/movies/search", {
        params: { query, ...params },
      });
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createMovie(data: CreateMovieRequest): Promise<Movie> {
    try {
      const response = await apiClient.post<ApiResponse<Movie>>("/admin/movies", data);
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateMovie(id: string, data: Partial<CreateMovieRequest>): Promise<Movie> {
    try {
      const response = await apiClient.put<ApiResponse<Movie>>(`/admin/movies/${id}`, data);
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteMovie(id: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/movies/${id}`);
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

export default new MovieService();
