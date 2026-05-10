import { useMutation } from "@tanstack/react-query";

import reportService from "@/modules/report/api/report-service";
import { CreateReportRequest } from "@/modules/report/types/report";

export function useCreateReport() {
  return useMutation({
    mutationFn: (data: CreateReportRequest) => reportService.createReport(data),
  });
}
