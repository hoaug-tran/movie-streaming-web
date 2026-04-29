export interface Advertisement {
  id: number;
  title: string;
  adType: "PRE_ROLL" | "MID_ROLL" | "POST_ROLL";
  videoUrl: string;
  targetUrl?: string;
  isSkippable: boolean;
  skipAfterSeconds: number;
  durationSeconds?: number;
  isActive: boolean;
}

export interface AdvertisementViewRequest {
  advertisementId: number;
  movieId?: number;
  episodeId?: number;
}
