import apiClient from "@/services/api-client";
import {
  Advertisement,
  AdvertisementViewRequest,
} from "@/modules/advertisement/types/advertisement";

class AdvertisementService {
  async getAdsByType(adType: "PRE_ROLL" | "MID_ROLL" | "POST_ROLL"): Promise<Advertisement[]> {
    try {
      return await apiClient.get<Advertisement[]>(`/advertisements/type/${adType}`);
    } catch {
      return [];
    }
  }

  async getActiveAds(): Promise<Advertisement[]> {
    try {
      return await apiClient.get<Advertisement[]>("/advertisements/active");
    } catch {
      return [];
    }
  }

  async trackView(request: AdvertisementViewRequest): Promise<void> {
    try {
      await apiClient.post("/advertisements/views", {
        advertisementId: request.advertisementId,
        movieId: request.movieId,
        episodeId: request.episodeId,
      });
    } catch {
      // shutup
    }
  }
}

const advertisementService = new AdvertisementService();
export default advertisementService;
