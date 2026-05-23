const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

const PUBLIC_ROUTES = [
  "/auth",
  "/access",
  "/movies",
  "/series",
  "/watch",
  "/category",
  "/genres",
  "/search",
  "/about",
  "/policy",
  "/terms",
  "/help",
];

interface ApiClientConfig extends RequestInit {
  params?: Record<string, string | number | boolean | null | undefined>;
  skipAuthRedirect?: boolean;
}

class ApiClient {
  private async request<T>(url: string, config: ApiClientConfig = {}): Promise<T> {
    const { params, skipAuthRedirect, ...init } = config;
    let fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += `${fullUrl.includes("?") ? "&" : "?"}${queryString}`;
      }
    }

    const headers = new Headers(init.headers);
    if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
    headers.set("Accept", "application/json");

    const response = await fetch(fullUrl, {
      ...init,
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401 && !skipAuthRedirect && typeof window !== "undefined") {
        if (!url.includes("/auth/refresh")) {
          try {
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: "POST",
              headers: {
                Accept: "application/json",
              },
              credentials: "include",
            });

            if (refreshResponse.ok) {
              const retryResponse = await fetch(fullUrl, {
                ...init,
                headers,
                credentials: "include",
              });

              if (retryResponse.ok) {
                if (retryResponse.status === 204) {
                  return {} as T;
                }
                const retryText = await retryResponse.text();
                return retryText ? (JSON.parse(retryText) as T) : ({} as T);
              }
            }
          } catch {}
        }

        const path = window.location.pathname;
        const isOnPublicRoute = PUBLIC_ROUTES.some(
          (route) => path === route || path.startsWith(route + "/") || path === "/"
        );
        if (!isOnPublicRoute) {
          const next = encodeURIComponent(path + window.location.search);
          window.location.replace(`/auth/login?returnTo=${next}&next=${next}`);
        }
      }

      let errorData: Record<string, unknown> = { message: response.statusText };
      try {
        errorData = (await response.json()) as Record<string, unknown>;
      } catch {
        errorData = { message: response.statusText };
      }

      const message =
        typeof errorData.message === "string" && errorData.message.trim().length > 0
          ? errorData.message
          : "Đã xảy ra lỗi, vui lòng thử lại";
      const error = new Error(message);
      (error as Error & { status?: number; data?: unknown }).status = response.status;
      (error as Error & { status?: number; data?: unknown }).data = errorData;
      throw error;
    }

    if (response.status === 204) {
      return {} as T;
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text) as T;
  }

  public get<T>(url: string, config?: ApiClientConfig) {
    return this.request<T>(url, { ...config, method: "GET" });
  }

  public post<T>(url: string, data?: unknown, config?: ApiClientConfig) {
    return this.request<T>(url, {
      ...config,
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  public put<T>(url: string, data?: unknown, config?: ApiClientConfig) {
    return this.request<T>(url, {
      ...config,
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  public patch<T>(url: string, data?: unknown, config?: ApiClientConfig) {
    return this.request<T>(url, {
      ...config,
      method: "PATCH",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  public delete<T>(url: string, config?: ApiClientConfig) {
    return this.request<T>(url, { ...config, method: "DELETE" });
  }
}

const apiClient = new ApiClient();
export default apiClient;
