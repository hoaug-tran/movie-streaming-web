/* Movie Domain Types */
export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  description: string;
  posterUrl?: string;
  backdropUrl?: string;
  releaseDate: string;
  duration?: number;
  rating?: number;
  categories: Category[];
  tags: Tag[];
  studios: Studio[];
  persons: Person[];
  isFavorite?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface MovieDetail extends Movie {
  episodes: Episode[];
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export interface Episode {
  id: string;
  name: string;
  episodeNumber: number;
  seasonNumber: number;
  description?: string;
  duration?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  releaseDate: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Studio {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
}

export interface Person {
  id: string;
  name: string;
  role: "ACTOR" | "DIRECTOR" | "PRODUCER" | "WRITER";
  profileImageUrl?: string;
}

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
}

export interface CreateMovieRequest {
  title: string;
  originalTitle?: string;
  description: string;
  posterUrl?: string;
  backdropUrl?: string;
  releaseDate: string;
  duration?: number;
  categoryIds: string[];
  tagIds: string[];
  studioIds: string[];
  personIds: string[];
}

export interface UpdateMovieRequest extends Partial<CreateMovieRequest> {
  id: string;
}

export interface MovieFilter {
  categoryId?: string;
  tagId?: string;
  studioId?: string;
  search?: string;
  minRating?: number;
  maxRating?: number;
  releaseYearFrom?: number;
  releaseYearTo?: number;
}
