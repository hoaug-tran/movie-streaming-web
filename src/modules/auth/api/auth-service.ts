import apiClient from "@/services/api-client";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserInfo,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "@/modules/auth/types/auth";
import { ApiResponse } from "@/types/api";

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        "/auth/login",
        credentials
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        "/auth/register",
        data
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        "/auth/refresh-token",
        { refreshToken }
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await apiClient.post("/auth/forgot-password", { email });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    try {
      await apiClient.post("/auth/reset-password", data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyEmail(data: VerifyEmailRequest): Promise<void> {
    try {
      await apiClient.post("/auth/verify-email", data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<UserInfo> {
    try {
      const response = await apiClient.get<ApiResponse<UserInfo>>("/auth/me");
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error("An error occurred");
  }
}

export default new AuthService();
