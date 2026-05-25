

import { MovieSummary } from "@/modules/movie/types/movie";

export interface Watchlist {
  id: number;
  movieId: number;
  addedAt: string;
  movie?: MovieSummary | null;
}

export interface MovieInWatchlistResponse {
  inWatchlist: boolean;
}
