import apiClient from "@/services/api-client";
import { Movie, MovieDetail, CreateMovieRequest } from "@/modules/movie/types/movie";
import { PaginatedResponse, PaginationParams } from "@/types/api";

class MovieService {
  async getMovies(params?: PaginationParams): Promise<PaginatedResponse<Movie>> {
    try {
      return await apiClient.get<PaginatedResponse<Movie>>("/movies", {
        params,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMovieById(id: string): Promise<MovieDetail> {
    try {
      return await apiClient.get<MovieDetail>(`/movies/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchMovies(query: string, params?: PaginationParams): Promise<PaginatedResponse<Movie>> {
    try {
      return await apiClient.get<PaginatedResponse<Movie>>("/movies/search", {
        params: { query, ...params },
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createMovie(data: CreateMovieRequest): Promise<Movie> {
    try {
      return await apiClient.post<Movie>("/admin/movies", data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateMovie(id: string, data: Partial<CreateMovieRequest>): Promise<Movie> {
    try {
      return await apiClient.put<Movie>(`/admin/movies/${id}`, data);
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

  // Discovery Methods
  async getTrendingMovies(limit: number = 10): Promise<Movie[]> {
    try {
      const data = await apiClient.get<{ movies: Movie[] }>("/discovery/trending", {
        params: { limit },
      });
      return data?.movies || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWeeklyNewMovies(limit: number = 10): Promise<Movie[]> {
    try {
      const data = await apiClient.get<{ movies: Movie[] }>("/discovery/weekly-new", {
        params: { limit },
      });
      return data?.movies || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUpcomingMovies(limit: number = 10): Promise<Movie[]> {
    try {
      const data = await apiClient.get<{ movies: Movie[] }>("/discovery/upcoming", {
        params: { limit },
      });
      return data?.movies || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTopRatedMovies(limit: number = 10): Promise<Movie[]> {
    try {
      const data = await apiClient.get<{ movies: Movie[] }>("/discovery/top-rated", {
        params: { limit },
      });
      return data?.movies || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTopSeries(limit: number = 10): Promise<Movie[]> {
    try {
      const data = await apiClient.get<{ movies: Movie[] }>("/discovery/top-series", {
        params: { limit },
      });
      return data?.movies || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMoviesByRegion(country: string, page: number = 0, size: number = 10): Promise<Movie[]> {
    try {
      const data = await apiClient.get<{ movies: Movie[] }>("/discovery/region", {
        params: { country, page, size },
      });
      return data?.movies || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMostActiveMovies(limit: number = 10): Promise<Movie[]> {
    try {
      const data = await apiClient.get<{ movies: Movie[] }>("/discovery/most-active", {
        params: { limit },
      });
      return data?.movies || [];
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

export default new MovieService();
