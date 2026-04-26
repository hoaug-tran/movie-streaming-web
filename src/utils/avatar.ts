export const getAbsoluteAvatarUrl = (avatarUrl: string | null | undefined): string | null => {
  if (!avatarUrl) {
    return null;
  }

  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";
  const baseUrl = apiBase.replace("/api/v1", "");

  if (avatarUrl.startsWith("/")) {
    return `${baseUrl}${avatarUrl}`;
  }

  return `${baseUrl}/${avatarUrl}`;
};
