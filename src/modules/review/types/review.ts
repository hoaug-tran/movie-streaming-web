/* Review Domain Types */
export interface Review {
  id: string;
  userId: string;
  movieId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  likes?: number;
  dislikes?: number;
}

export interface CreateReviewRequest {
  movieId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export interface ReviewFilter {
  movieId?: string;
  userId?: string;
  minRating?: number;
  maxRating?: number;
  sortBy?: "createdAt" | "rating" | "likes";
  order?: "asc" | "desc";
}
