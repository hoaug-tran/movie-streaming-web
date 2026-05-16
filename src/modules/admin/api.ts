import apiClient from "@/services/api-client";

export interface AdminMetric {
  label: string;
  value: string;
  delta: string;
  tone: "cyan" | "violet" | "amber" | "emerald";
  helper?: string;
}

export interface AdminMetricGroup {
  title: string;
  subtitle: string;
  items: AdminMetric[];
}

export interface AdminWorkloadItem {
  name: string;
  value: number;
  color: string;
  caption?: string;
}

export interface AdminDistributionItem {
  label: string;
  value: number;
  color: string;
  scope: string;
}

export interface AdminSystemSignal {
  label: string;
  value: string;
  status: "success" | "warning" | "info" | string;
  detail: string;
}

export interface AdminActivity {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "success";
  time: string;
}

export interface AdminRankingItem {
  id?: number | null;
  slug?: string | null;
  href?: string | null;
  title: string;
  value: string;
  detail: string;
  meta: string;
}

export interface AdminRankingCard {
  title: string;
  subtitle: string;
  accent: "cyan" | "violet" | "amber" | "emerald" | string;
  items: AdminRankingItem[];
}

export interface AdminServerPerformance {
  label: string;
  color: string;
  data: number[];
  value?: string;
  unit?: string;
}

export interface AdminDashboardSummary {
  metrics: AdminMetric[];
  workload: AdminWorkloadItem[];
  activities: AdminActivity[];
  trendSets?: number[][];
  mainTrend?: number[];
  metricGroups?: AdminMetricGroup[];
  distributions?: AdminDistributionItem[];
  systemSignals?: AdminSystemSignal[];
  rankingCards?: AdminRankingCard[];
  serverPerformance?: AdminServerPerformance[];
  userActivities?: AdminActivity[];
  adminActivities?: AdminActivity[];
}

export type AdminReportStatus = "PENDING" | "RESOLVED" | "REJECTED" | string;

export interface AdminReport {
  id: number;
  reporterUserId: number;
  commentId?: number | null;
  reviewId?: number | null;
  reason: string;
  description?: string | null;
  status: AdminReportStatus;
  createdAt?: string | null;
  resolvedAt?: string | null;
}

export interface ResolveReportPayload {
  status: "RESOLVED" | "REJECTED";
}

export type AdminMovieType = "MOVIE" | "SERIES" | string;
export type AdminMovieStatus = "DRAFT" | "REVIEWING" | "PUBLISHED" | "ARCHIVED" | string;

export interface AdminMovie {
  id: number;
  title: string;
  originalTitle?: string | null;
  slug?: string | null;
  description?: string | null;
  posterUrl?: string | null;
  bannerUrl?: string | null;
  trailerUrl?: string | null;
  releaseYear?: number | null;
  country?: string | null;
  language?: string | null;
  ageRating?: string | null;
  movieType?: AdminMovieType | null;
  movieStatus?: AdminMovieStatus | null;
  isPremiumOnly?: boolean | null;
  viewCount?: number | null;
  favoriteCount?: number | null;
  averageRating?: number | string | null;
  totalRatings?: number | null;
  totalReviews?: number | null;
  publishedAt?: string | null;
  commentsLocked?: boolean | null;
  reviewsLocked?: boolean | null;
}

export interface AdminMoviePerson {
  id: number;
  person: AdminPerson;
  role?: string | null;
  characterName?: string | null;
  displayOrder?: number | null;
}

export interface AdminMovieStudio {
  id: number;
  studio: AdminStudio;
  role?: string | null;
}

export interface AdminMovieDetail extends AdminMovie {
  episodes?: AdminEpisode[] | null;
  categories?: AdminCategory[] | null;
  tags?: AdminTag[] | null;
  persons?: AdminMoviePerson[] | null;
  studios?: AdminMovieStudio[] | null;
}

export interface AdminMovieInteractionLocksPayload {
  commentsLocked: boolean;
  reviewsLocked: boolean;
}

export interface AdminMoviePersonPayload {
  personId: number;
  role: string;
  characterName?: string | null;
  displayOrder?: number | null;
}

export interface AdminMovieStudioPayload {
  studioId: number;
  role: string;
}

export interface AdminMoviePayload {
  title: string;
  originalTitle?: string | null;
  slug: string;
  description?: string | null;
  posterUrl?: string | null;
  bannerUrl?: string | null;
  trailerUrl?: string | null;
  releaseYear: number;
  country?: string | null;
  language?: string | null;
  ageRating?: string | null;
  movieType: AdminMovieType;
  movieStatus: AdminMovieStatus;
  isPremiumOnly: boolean;
}

export interface AdminEpisodePayload {
  title: string;
  episodeNumber: number;
  durationSeconds: number;
  isFreePreview: boolean;
  status: string;
}

export interface AdminEpisode extends AdminEpisodePayload {
  id: number;
  movieId?: number | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AdminCategory {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  createdAt?: string | null;
}

export interface AdminCategoryPayload {
  name: string;
  slug: string;
  description?: string | null;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  role: "ROLE_ADMIN" | "ROLE_MODERATOR" | "ROLE_USER" | string;
  accountStatus: "ACTIVE" | "LOCKED" | "DISABLED" | "PENDING" | string;
  premiumExpiryDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  lastLoginAt?: string | null;
}

export interface AdminUserPayload {
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: AdminUser["role"];
  accountStatus: AdminUser["accountStatus"];
  premiumExpiryDate?: string | null;
}

export interface AdminAd {
  id: number;
  title?: string | null;
  name?: string | null;
  videoUrl?: string | null;
  adType?: string | null;
  placement?: string | null;
  targetUrl?: string | null;
  mediaUrl?: string | null;
  durationSeconds?: number | null;
  priority?: number | null;
  isSkippable?: boolean | null;
  skipAfterSeconds?: number | null;
  isActive?: boolean | null;
  startAt?: string | null;
  endAt?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface AdminAdPayload {
  title: string;
  videoUrl: string;
  targetUrl?: string | null;
  durationSeconds: number;
  adType: string;
  priority: number;
  isSkippable: boolean;
  skipAfterSeconds?: number | null;
  isActive: boolean;
  startAt?: string | null;
  endAt?: string | null;
}

export interface AdminPerson {
  id: number;
  fullName: string;
  stageName?: string | null;
  biography?: string | null;
  birthDate?: string | null;
  nationality?: string | null;
  avatarUrl?: string | null;
}

export interface AdminPersonPayload {
  fullName: string;
  stageName?: string | null;
  biography?: string | null;
  birthDate?: string | null;
  nationality?: string | null;
  avatarUrl?: string | null;
}

export interface AdminStudio {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  country?: string | null;
  websiteUrl?: string | null;
}

export interface AdminStudioPayload {
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  country?: string | null;
  websiteUrl?: string | null;
}

export interface AdminTag {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
}

export interface AdminTagPayload {
  name: string;
  slug: string;
  description?: string | null;
}

export interface AdminComment {
  id: number;
  userId?: number | null;
  movieId?: number | null;
  movieSlug?: string | null;
  movieTitle?: string | null;
  episodeId?: number | null;
  parentCommentId?: number | null;
  content?: string | null;
  likeCount?: number | null;
  replyCount?: number | null;
  status?: string | null;
  authorUsername?: string | null;
  authorFullName?: string | null;
  authorAvatarUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AdminCommentPayload {
  userId: number;
  movieId: number;
  episodeId?: number | null;
  parentCommentId?: number | null;
  content: string;
  status: string;
}

export interface AdminSubscriptionPlan {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  price?: number | string | null;
  durationDays?: number | null;
  maxDevices?: number | null;
  videoQuality?: string | null;
  hasAdsFree?: boolean | null;
  isActive?: boolean | null;
}

export type AdminNotificationType =
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "PREMIUM_EXPIRING"
  | "NEW_EPISODE"
  | "SYSTEM"
  | string;

export interface AdminNotification {
  id: number;
  title: string;
  content: string;
  type: AdminNotificationType;
  isRead: boolean;
  actionUrl?: string | null;
  referenceId?: number | null;
  createdAt?: string | null;
}

export interface AdminNotificationPayload {
  userId: number;
  title: string;
  content: string;
  type: AdminNotificationType;
}

export interface AdminNotificationUpdatePayload {
  title: string;
  content: string;
  type: AdminNotificationType;
}

export interface AdminBroadcastPayload {
  title: string;
  content: string;
  type: AdminNotificationType;
}

export const adminService = {
  getDashboardSummary(): Promise<AdminDashboardSummary> {
    return apiClient.get<AdminDashboardSummary>("/admin/dashboard/summary");
  },

  getReports(): Promise<AdminReport[]> {
    return apiClient.get<AdminReport[]>("/reports");
  },

  resolveReport(reportId: number, payload: ResolveReportPayload): Promise<AdminReport> {
    return apiClient.patch<AdminReport>(`/reports/${reportId}/resolve`, payload);
  },

  getMovies(): Promise<AdminMovie[]> {
    return apiClient.get<AdminMovie[]>("/movies");
  },

  getMovieDetail(movieId: number): Promise<AdminMovieDetail> {
    return apiClient.get<AdminMovieDetail>(`/movies/${movieId}`);
  },

  createMovie(payload: AdminMoviePayload): Promise<AdminMovie> {
    return apiClient.post<AdminMovie>("/admin/movies", payload);
  },

  updateMovie(movieId: number, payload: AdminMoviePayload): Promise<AdminMovie> {
    return apiClient.put<AdminMovie>(`/admin/movies/${movieId}`, payload);
  },

  createEpisode(movieId: number, payload: AdminEpisodePayload): Promise<AdminEpisode> {
    return apiClient.post<AdminEpisode>(`/admin/movies/${movieId}/episodes`, payload);
  },

  updateMovieStatus(movieId: number, movieStatus: string): Promise<AdminMovie> {
    return apiClient.patch<AdminMovie>(`/admin/movies/${movieId}/status`, { movieStatus });
  },

  updateMovieInteractionLocks(
    movieId: number,
    payload: AdminMovieInteractionLocksPayload
  ): Promise<AdminMovieDetail> {
    return apiClient.patch<AdminMovieDetail>(`/admin/movies/${movieId}/interaction-locks`, payload);
  },

  addMovieCategory(movieId: number, categoryId: number): Promise<AdminCategory> {
    return apiClient.post<AdminCategory>(`/admin/movies/${movieId}/categories`, { categoryId });
  },

  removeMovieCategory(movieId: number, categoryId: number): Promise<void> {
    return apiClient.delete<void>(`/admin/movies/${movieId}/categories/${categoryId}`);
  },

  addMovieTag(movieId: number, tagId: number): Promise<AdminTag> {
    return apiClient.post<AdminTag>(`/admin/movies/${movieId}/tags`, { tagId });
  },

  removeMovieTag(movieId: number, tagId: number): Promise<void> {
    return apiClient.delete<void>(`/admin/movies/${movieId}/tags/${tagId}`);
  },

  addMoviePerson(movieId: number, payload: AdminMoviePersonPayload): Promise<AdminMoviePerson> {
    return apiClient.post<AdminMoviePerson>(`/admin/movies/${movieId}/persons`, payload);
  },

  removeMoviePerson(movieId: number, moviePersonId: number): Promise<void> {
    void movieId;
    return apiClient.delete<void>(`/admin/movies/movie-persons/${moviePersonId}`);
  },

  addMovieStudio(movieId: number, payload: AdminMovieStudioPayload): Promise<AdminMovieStudio> {
    return apiClient.post<AdminMovieStudio>(`/admin/movies/${movieId}/studios`, payload);
  },

  removeMovieStudio(movieId: number, movieStudioId: number): Promise<void> {
    void movieId;
    return apiClient.delete<void>(`/admin/movies/movie-studios/${movieStudioId}`);
  },

  deleteMovie(movieId: number): Promise<void> {
    return apiClient.delete<void>(`/admin/movies/${movieId}`);
  },

  getCategories(): Promise<AdminCategory[]> {
    return apiClient.get<AdminCategory[]>("/admin/categories");
  },

  createCategory(payload: AdminCategoryPayload): Promise<AdminCategory> {
    return apiClient.post<AdminCategory>("/admin/categories", payload);
  },

  updateCategory(categoryId: number, payload: AdminCategoryPayload): Promise<AdminCategory> {
    return apiClient.put<AdminCategory>(`/admin/categories/${categoryId}`, payload);
  },

  deleteCategory(categoryId: number): Promise<void> {
    return apiClient.delete<void>(`/admin/categories/${categoryId}`);
  },

  getUsers(): Promise<AdminUser[]> {
    return apiClient.get<AdminUser[]>("/users/");
  },

  updateUserStatus(userId: number, accountStatus: string): Promise<AdminUser> {
    return apiClient.patch<AdminUser>(`/users/${userId}/status`, { accountStatus });
  },

  updateUserRole(userId: number, role: string): Promise<AdminUser> {
    return apiClient.patch<AdminUser>(`/users/${userId}/role`, { role });
  },

  updateUser(userId: number, payload: AdminUserPayload): Promise<AdminUser> {
    return apiClient.put<AdminUser>(`/users/${userId}`, payload);
  },

  updateUserAccess(userId: number, payload: AdminUserPayload): Promise<AdminUser[]> {
    return Promise.all([
      this.updateUserRole(userId, payload.role),
      this.updateUserStatus(userId, payload.accountStatus),
    ]);
  },

  deleteUser(userId: number): Promise<void> {
    return apiClient.delete<void>(`/users/${userId}`);
  },

  getAds(): Promise<AdminAd[]> {
    return apiClient.get<AdminAd[]>("/advertisements");
  },

  createAd(payload: AdminAdPayload): Promise<AdminAd> {
    return apiClient.post<AdminAd>("/advertisements", payload);
  },

  updateAd(adId: number, payload: AdminAdPayload): Promise<AdminAd> {
    return apiClient.put<AdminAd>(`/advertisements/${adId}`, payload);
  },

  deleteAd(adId: number): Promise<void> {
    return apiClient.delete<void>(`/advertisements/${adId}`);
  },

  getPersons(): Promise<AdminPerson[]> {
    return apiClient.get<AdminPerson[]>("/admin/persons");
  },

  createPerson(payload: AdminPersonPayload): Promise<AdminPerson> {
    return apiClient.post<AdminPerson>("/admin/persons", payload);
  },

  updatePerson(personId: number, payload: AdminPersonPayload): Promise<AdminPerson> {
    return apiClient.put<AdminPerson>(`/admin/persons/${personId}`, payload);
  },

  deletePerson(personId: number): Promise<void> {
    return apiClient.delete<void>(`/admin/persons/${personId}`);
  },

  getStudios(): Promise<AdminStudio[]> {
    return apiClient.get<AdminStudio[]>("/admin/studios");
  },

  createStudio(payload: AdminStudioPayload): Promise<AdminStudio> {
    return apiClient.post<AdminStudio>("/admin/studios", payload);
  },

  updateStudio(studioId: number, payload: AdminStudioPayload): Promise<AdminStudio> {
    return apiClient.put<AdminStudio>(`/admin/studios/${studioId}`, payload);
  },

  deleteStudio(studioId: number): Promise<void> {
    return apiClient.delete<void>(`/admin/studios/${studioId}`);
  },

  getTags(): Promise<AdminTag[]> {
    return apiClient.get<AdminTag[]>("/admin/tags");
  },

  createTag(payload: AdminTagPayload): Promise<AdminTag> {
    return apiClient.post<AdminTag>("/admin/tags", payload);
  },

  updateTag(tagId: number, payload: AdminTagPayload): Promise<AdminTag> {
    return apiClient.put<AdminTag>(`/admin/tags/${tagId}`, payload);
  },

  deleteTag(tagId: number): Promise<void> {
    return apiClient.delete<void>(`/admin/tags/${tagId}`);
  },

  getComments(): Promise<AdminComment[]> {
    return apiClient.get<AdminComment[]>("/admin/comments");
  },

  createComment(payload: AdminCommentPayload): Promise<AdminComment> {
    return apiClient.post<AdminComment>("/admin/comments", payload);
  },

  updateComment(commentId: number, payload: AdminCommentPayload): Promise<AdminComment> {
    return apiClient.put<AdminComment>(`/admin/comments/${commentId}`, payload);
  },

  deleteComment(commentId: number): Promise<void> {
    return apiClient.delete<void>(`/admin/comments/${commentId}`);
  },

  getSubscriptionPlans(): Promise<AdminSubscriptionPlan[]> {
    return apiClient.get<AdminSubscriptionPlan[]>("/subscriptions/plans");
  },

  createSubscriptionPlan(payload: any): Promise<AdminSubscriptionPlan> {
    return apiClient.post<AdminSubscriptionPlan>("/subscriptions/plans", payload);
  },

  updateSubscriptionPlan(planId: number, payload: any): Promise<AdminSubscriptionPlan> {
    return apiClient.put<AdminSubscriptionPlan>(`/subscriptions/plans/${planId}`, payload);
  },

  deleteSubscriptionPlan(planId: number): Promise<void> {
    return apiClient.delete<void>(`/subscriptions/plans/${planId}`);
  },

  getNotifications(): Promise<AdminNotification[]> {
    return apiClient.get<AdminNotification[]>("/notifications/admin");
  },

  createNotification(payload: AdminNotificationPayload): Promise<AdminNotification> {
    return apiClient.post<AdminNotification>("/notifications", payload);
  },

  updateNotification(
    notificationId: number,
    payload: AdminNotificationUpdatePayload
  ): Promise<AdminNotification> {
    return apiClient.put<AdminNotification>(`/notifications/admin/${notificationId}`, payload);
  },

  deleteNotification(notificationId: number): Promise<void> {
    return apiClient.delete<void>(`/notifications/admin/${notificationId}`);
  },

  broadcastNotification(payload: AdminBroadcastPayload): Promise<number> {
    return apiClient.post<number>("/notifications/admin/broadcast", payload);
  },
};
