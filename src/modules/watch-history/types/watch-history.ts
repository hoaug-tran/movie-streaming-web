export interface WatchHistory {
  id: number;
  userId: number;
  movieId: number;
  episodeId: number;
  watchedDurationSeconds: number;
  stoppedAtSecond: number;
  isCompleted: boolean;
  lastWatchedAt: string;
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
  movie: {
    id: number;
    title: string;
    slug: string;
    posterUrl?: string | null;
    bannerUrl?: string | null;
    releaseYear?: number;
    movieType?: string;
    averageRating?: number;
  };
}

export interface UpsertWatchHistoryRequest {
  movieId: number;
  episodeId: number;
  watchedDurationSeconds: number;
  stoppedAtSecond: number;
  isCompleted: boolean;
}
