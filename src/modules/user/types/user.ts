/* User Domain Types */
export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: "ROLE_USER" | "ROLE_ADMIN";
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile extends User {
  bio?: string;
  favoriteCount: number;
  watchlistCount: number;
  reviewCount: number;
}

export interface UpdateProfileRequest {
  fullName?: string;
  avatar?: string;
  bio?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface Favorite {
  id: string;
  userId: string;
  movieId: string;
  createdAt: string;
  movie?: {
    id: string;
    title: string;
    posterUrl?: string;
  };
}

export interface WatchHistory {
  id: string;
  userId: string;
  movieId: string;
  episodeId?: string;
  watchedAt: string;
  currentTime?: number;
  duration?: number;
  movie?: {
    id: string;
    title: string;
    posterUrl?: string;
  };
}
