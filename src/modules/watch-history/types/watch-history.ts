export interface WatchHistoryMovieSummary {
  id: number;
  title: string;
  slug: string;
  posterUrl?: string;
  bannerUrl?: string;
  releaseYear?: number;
  movieType?: string;
  averageRating?: number;
}

export interface WatchHistory {
  id: number;
  userId?: number;
  movieId: number;
  episodeId: number;
  episodeTitle?: string | null;
  episodeNumber?: number | null;
  episodeDurationSeconds?: number | null;
  watchedDurationSeconds: number;
  stoppedAtSecond: number;
  resumeSecond?: number | null;
  progressPercent?: number | null;
  isCompleted: boolean;
  lastWatchedAt: string;
  movie?: WatchHistoryMovieSummary | null;
}

export interface ContinueWatchingItem {
  movieId: number;
  episodeId: number;
  episodeTitle?: string | null;
  episodeNumber?: number | null;
  episodeDurationSeconds: number;
  stoppedAtSecond: number;
  watchedDurationSeconds: number;
  resumeSecond: number;
  progressPercent: number;
  lastWatchedAt: string;
  movie: WatchHistoryMovieSummary;
}

export interface UpsertWatchHistoryRequest {
  movieId: number;
  episodeId: number;
  watchedDurationSeconds: number;
  stoppedAtSecond: number;
  isCompleted: boolean;
}
