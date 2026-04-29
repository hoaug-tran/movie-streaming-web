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

export interface UpsertWatchHistoryRequest {
  movieId: number;
  episodeId: number;
  watchedDurationSeconds: number;
  stoppedAtSecond: number;
  isCompleted: boolean;
}
