export type AdminApiError = Error & {
  status?: number;
  data?: {
    code?: string;
    message?: string;
    details?: Array<{ field?: string; message?: string }>;
    errorId?: string;
  };
};

export function getAdminErrorMessage(
  error: unknown,
  fallback = "Thao tác thất bại. Vui lòng thử lại."
) {
  if (!error) return fallback;

  const apiError = error as AdminApiError;
  const message = apiError.data?.message || apiError.message;
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }

  const firstDetail = apiError.data?.details?.find((detail) => detail.message);
  if (firstDetail?.message) {
    return firstDetail.field ? `${firstDetail.field}: ${firstDetail.message}` : firstDetail.message;
  }

  return fallback;
}
