import { MovieSummary } from "@/modules/movie/types/movie";

export interface Favorite {
  id: number;
  movieId: number;
  addedAt: string;
  movie?: MovieSummary | null;
}

export interface MovieInFavoriteResponse {
  inFavorite: boolean;
}
