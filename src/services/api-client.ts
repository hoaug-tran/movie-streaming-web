const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

interface ApiClientConfig extends RequestInit {
  params?: Record<string, any>;
  skipAuth?: boolean;
}

class ApiClient {
  private async request<T>(url: string, config: ApiClientConfig = {}): Promise<T> {
    const { params, ...init } = config;
    let fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += `${fullUrl.includes("?") ? "&" : "?"}${queryString}`;
      }
    }

    // Default headers
    const headers = new Headers(init.headers);
    if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
    headers.set("Accept", "application/json");

    // Fallback Authorization header from localStorage
    if (typeof window !== "undefined" && !headers.has("Authorization")) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    const response = await fetch(fullUrl, {
      ...init,
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }

      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }

      const error = new Error(errorData.message || "An error occurred");
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private clearAuth(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  }

  public get<T>(url: string, config?: ApiClientConfig) {
    return this.request<T>(url, { ...config, method: "GET" });
  }

  public post<T>(url: string, data?: any, config?: ApiClientConfig) {
    return this.request<T>(url, {
      ...config,
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  public put<T>(url: string, data?: any, config?: ApiClientConfig) {
    return this.request<T>(url, {
      ...config,
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  public patch<T>(url: string, data?: any, config?: ApiClientConfig) {
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
