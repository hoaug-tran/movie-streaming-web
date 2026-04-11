import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

interface ApiClientConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
}

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          this.clearAuthToken();
          // Redirect to login if needed
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  private clearAuthToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }

  public get<T>(url: string, config?: ApiClientConfig) {
    return this.instance.get<T>(url, config);
  }

  public post<T>(url: string, data?: any, config?: ApiClientConfig) {
    return this.instance.post<T>(url, data, config);
  }

  public put<T>(url: string, data?: any, config?: ApiClientConfig) {
    return this.instance.put<T>(url, data, config);
  }

  public patch<T>(url: string, data?: any, config?: ApiClientConfig) {
    return this.instance.patch<T>(url, data, config);
  }

  public delete<T>(url: string, config?: ApiClientConfig) {
    return this.instance.delete<T>(url, config);
  }

  public setAuthToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
      this.instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }

  public getClient(): AxiosInstance {
    return this.instance;
  }
}

export default new ApiClient();
