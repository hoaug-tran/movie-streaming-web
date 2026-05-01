/* User Domain Types */
export interface User {
  id: string | number;
  username?: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  avatar?: string;
  role: "USER" | "ADMIN" | "ROLE_USER" | "ROLE_ADMIN";
  accountStatus?: string;
  premiumExpiryDate?: string;
  lastLoginAt?: string;
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
  bio?: string;
}

export interface EmailChangeResponse {
  currentEmail: string;
  newEmail: string;
  status: "PENDING_CURRENT" | "PENDING_NEW" | "VERIFIED" | "EXPIRED" | "CANCELLED";
  expiresAt: string;
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
