export interface MovieSummary {
  id: number;
  title: string;
  originalTitle?: string;
  slug: string;
  description?: string;
  posterUrl?: string | null;
  bannerUrl?: string | null;
  trailerUrl?: string | null;
  releaseYear?: number;
  country?: string;
  language?: string;
  ageRating?: string;
  movieType?: string;
  movieStatus?: string;
  isPremiumOnly?: boolean;
  viewCount?: number;
  favoriteCount?: number;
  averageRating?: number;
  totalRatings?: number;
  totalReviews?: number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface MovieDetail extends MovieSummary {
  episodes: Episode[];
  categories: CategoryItem[];
  tags: TagItem[];
  persons: PersonItem[];
  studios: StudioItem[];
}

export interface MovieComment {
  id: number;
  userId: number;
  movieId: number;
  movieSlug?: string;
  movieTitle?: string;
  episodeId?: number | null;
  parentCommentId?: number | null;
  content: string;
  likeCount: number;
  replyCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface MovieDetailAggregate {
  movie: MovieDetail;
  comments: MovieComment[];
  reviews: MovieReview[];
}

export interface MovieReview {
  id: number;
  movieId: number;
  rating: number;
  title?: string;
  content?: string;
  isEdited?: boolean;
  status?: string;
  likeCount?: number;
  createdAt?: string;
}

export interface Episode {
  id: number;
  title?: string;
  episodeNumber?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  isFreePreview?: boolean;
  status?: string;
}

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
}

export interface TagItem {
  id: number;
  name: string;
}

export interface PersonItem {
  id: number;
  name: string;
  role?: string;
  profileImageUrl?: string;
}

export interface StudioItem {
  id: number;
  name: string;
  logoUrl?: string;
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

export type Movie = MovieSummary;

export interface CreateMovieRequest {
  title: string;
  originalTitle?: string;
  description: string;
  posterUrl?: string;
  bannerUrl?: string;
  releaseDate?: string;
  duration?: number;
  categoryIds: number[];
  tagIds: number[];
  studioIds: number[];
  personIds: number[];
}

export interface UpdateMovieRequest extends Partial<CreateMovieRequest> {
  id: string;
}

export interface SearchMovieRequest {
  keyword?: string;
  categoryId?: number;
  tagId?: number;
  fromYear?: number;
  toYear?: number;
  minRating?: number;
  sortBy?: string;
  sortDirection?: string;
  movieType?: string;
  page?: number;
  size?: number;
}

export interface SearchMovieResponse {
  content: MovieSummary[];
  totalElements?: number;
  totalPages?: number;
  pageNumber?: number;
  pageSize?: number;
  hasNext?: boolean;
}
