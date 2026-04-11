/* Common API Response Types */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
  status: number;
  path: string;
}

/* Pagination */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

/* API Request/Response Common */
export interface ApiErrorDetail {
  code: string;
  message: string;
  field?: string;
}
