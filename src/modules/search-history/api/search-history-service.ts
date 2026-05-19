import apiClient from "@/services/api-client";

export interface SearchHistoryResponse {
  id: number;
  keyword: string;
  searchedAt: string;
}

class SearchHistoryService {
  async getMine(): Promise<SearchHistoryResponse[]> {
    return apiClient.get<SearchHistoryResponse[]>("/search-histories/me");
  }

  async getRecent(limit = 10): Promise<SearchHistoryResponse[]> {
    return apiClient.get<SearchHistoryResponse[]>("/search-histories/me/recent", {
      params: { limit },
    });
  }

  async create(keyword: string): Promise<SearchHistoryResponse> {
    return apiClient.post<SearchHistoryResponse>("/search-histories", { keyword });
  }

  async remove(id: number): Promise<void> {
    await apiClient.delete<void>(`/search-histories/${id}`);
  }

  async clearMine(): Promise<void> {
    await apiClient.delete<void>("/search-histories/me");
  }
}

const searchHistoryService = new SearchHistoryService();
export default searchHistoryService;
