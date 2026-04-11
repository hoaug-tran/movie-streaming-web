/* Watchlist Domain Types */
export interface Watchlist {
  id: string;
  userId: string;
  movieId: string;
  addedAt: string;
  movie?: {
    id: string;
    title: string;
    posterUrl?: string;
    rating?: number;
  };
}

export interface AddToWatchlistRequest {
  movieId: string;
}
