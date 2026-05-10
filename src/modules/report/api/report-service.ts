import apiClient from "@/services/api-client";
import { CreateReportRequest, ReportResponse } from "@/modules/report/types/report";

class ReportService {
  async createReport(data: CreateReportRequest): Promise<ReportResponse> {
    return apiClient.post<ReportResponse>("/reports", data);
  }
}

export default new ReportService();
