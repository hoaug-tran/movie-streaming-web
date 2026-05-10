export type CreateReportRequest = {
  commentId?: number;
  reviewId?: number;
  reason: string;
  description?: string;
};

export type ReportResponse = {
  id: number;
  reporterUserId: number;
  commentId?: number | null;
  reviewId?: number | null;
  reason: string;
  description?: string | null;
  status: string;
  createdAt?: string;
};
