import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserInfo,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "@/modules/auth/types/auth";
import { ApiResponse } from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

class AuthService {
  private async fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const data = await this.fetchAPI<ApiResponse<LoginResponse>>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      return data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await this.fetchAPI<ApiResponse<LoginResponse>>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const response = await this.fetchAPI<ApiResponse<LoginResponse>>("/auth/refresh-token", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
      return response.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.fetchAPI("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await this.fetchAPI("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    try {
      await this.fetchAPI("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyEmail(data: VerifyEmailRequest): Promise<void> {
    try {
      await this.fetchAPI("/auth/verify-email", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<UserInfo> {
    try {
      const response = await this.fetchAPI<ApiResponse<UserInfo>>("/auth/me", {
        method: "GET",
      });
      return response.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error("An error occurred");
  }
}

export default new AuthService();
