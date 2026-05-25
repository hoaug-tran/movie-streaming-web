import {
  LoginRequest,
  LoginResponse,
  OtpChallengeResponse,
  RegisterRequest,
  UserInfo,
  VerifyOtpRequest,
  VerifyPasswordResetOtpRequest,
  ChangePasswordRequest,
} from "@/modules/auth/types/auth";
import deviceSessionService from "@/modules/user/api/device-session-service";
import { ApiResponse } from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

export const clearClientAuthCache = (): void => {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem("accessToken");
  window.localStorage.removeItem("refreshToken");
};

const persistAuthTokens = (authResponse: LoginResponse): void => {
  if (typeof window === "undefined") return;
  if (authResponse.accessToken) {
    window.localStorage.setItem("accessToken", authResponse.accessToken);
  }
  if (authResponse.refreshToken) {
    window.localStorage.setItem("refreshToken", authResponse.refreshToken);
  }
};

export const clearAuthTokens = clearClientAuthCache;

declare global {
  var __oauthExchangePromises: Map<string, Promise<LoginResponse>> | undefined;
}

const mapRole = (role: string): "ROLE_USER" | "ROLE_ADMIN" | "ROLE_MODERATOR" => {
  if (role === "ADMIN" || role === "ROLE_ADMIN") return "ROLE_ADMIN";
  if (role === "MODERATOR" || role === "ROLE_MODERATOR") return "ROLE_MODERATOR";
  return "ROLE_USER";
};

const mapAuthResponse = (authData: any): LoginResponse => {
  return {
    accessToken: authData.accessToken,
    refreshToken: authData.refreshToken,
    user: {
      id: String(authData.userId ?? authData.id),
      email: authData.email,
      fullName: authData.fullName,
      avatarUrl:
        authData.avatarUrl ||
        authData.avatar_url ||
        authData.picture ||
        authData.profilePictureUrl ||
        authData.profile_picture ||
        undefined,
      role: mapRole(authData.role),
      createdAt: authData.createdAt || authData.created_at || new Date().toISOString(),
      updatedAt: authData.updatedAt || authData.updated_at || undefined,
    },
  };
};

const ensureDeviceSession = async (authResponse?: LoginResponse): Promise<void> => {
  if (typeof window === "undefined") return;

  if (authResponse) {
    persistAuthTokens(authResponse);
  }

  try {
    await deviceSessionService.createCurrentSession();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Device session creation failed", error);
    }
  }
};

const handleError = (error: any): Error => {
  if (error instanceof Error) {
    return error;
  }
  return new Error("Đã xảy ra lỗi, vui lòng thử lại");
};

const createHttpError = (message: string, status: number, data?: unknown): Error => {
  const error = new Error(message);
  (error as Error & { status?: number; data?: unknown }).status = status;
  (error as Error & { status?: number; data?: unknown }).data = data;
  return error;
};

export const isAuthFailure = (error: unknown): boolean => {
  const status = (error as { status?: number } | null)?.status;
  return status === 401 || status === 403;
};

const fetchAPI = async <T>(
  endpoint: string,
  options: RequestInit & { requireAuth?: boolean } = {}
): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers && typeof options.headers === "object" && !Array.isArray(options.headers)) {
    Object.assign(headers, options.headers as Record<string, string>);
  }

  const { requireAuth, headers: _, ...fetchOptions } = options;

  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw createHttpError(
      errorData.message || `HTTP ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
};

const isDirectAuthResponse = (value: unknown): boolean => {
  const data = value as { accessToken?: unknown } | null;
  return !!data && typeof data === "object" && typeof data.accessToken === "string";
};

const login = async (credentials: LoginRequest): Promise<OtpChallengeResponse | LoginResponse> => {
  try {
    const data = await fetchAPI<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    const payload = data.data || data;

    if (isDirectAuthResponse(payload)) {
      const authResponse = mapAuthResponse(payload);
      await ensureDeviceSession(authResponse);
      return authResponse;
    }

    return payload;
  } catch (error) {
    throw handleError(error);
  }
};

const verifyLoginOtp = async (request: VerifyOtpRequest): Promise<LoginResponse> => {
  try {
    const data = await fetchAPI<any>("/auth/login/verify-otp", {
      method: "POST",
      body: JSON.stringify(request),
    });
    const authResponse = mapAuthResponse(data.data || data);
    await ensureDeviceSession(authResponse);
    return authResponse;
  } catch (error) {
    throw handleError(error);
  }
};

const register = async (data: RegisterRequest): Promise<OtpChallengeResponse> => {
  try {
    const response = await fetchAPI<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data || response;
  } catch (error) {
    throw handleError(error);
  }
};

const verifyRegisterOtp = async (request: VerifyOtpRequest): Promise<LoginResponse> => {
  try {
    const response = await fetchAPI<any>("/auth/register/verify-otp", {
      method: "POST",
      body: JSON.stringify(request),
    });
    const authResponse = mapAuthResponse(response.data || response);
    await ensureDeviceSession(authResponse);
    return authResponse;
  } catch (error) {
    throw handleError(error);
  }
};

const refreshToken = async (): Promise<{ accessToken: string; refreshToken?: string }> => {
  try {
    const response = await fetchAPI<any>("/auth/refresh", {
      method: "POST",
    });

    const payload = response.data || response;

    if (typeof window !== "undefined") {
      if (payload.accessToken) window.localStorage.setItem("accessToken", payload.accessToken);
      if (payload.refreshToken) window.localStorage.setItem("refreshToken", payload.refreshToken);
    }

    return {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
    };
  } catch (error) {
    throw handleError(error);
  }
};

const logout = async (): Promise<void> => {
  try {
    await fetchAPI("/auth/logout", {
      method: "POST",
      requireAuth: true,
    });
  } catch (error) {
    console.error("Logout error:", error);
  }
};

const forgotPassword = async (email: string): Promise<OtpChallengeResponse> => {
  try {
    const data = await fetchAPI<any>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return data.data || data;
  } catch (error) {
    throw handleError(error);
  }
};

const resetPassword = async (request: VerifyPasswordResetOtpRequest): Promise<void> => {
  try {
    await fetchAPI("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(request),
    });
  } catch (error) {
    throw handleError(error);
  }
};

const startChangePassword = async (currentPassword: string): Promise<OtpChallengeResponse> => {
  try {
    const data = await fetchAPI<any>("/auth/change-password/start", {
      method: "POST",
      body: JSON.stringify({ currentPassword }),
      requireAuth: true,
    });
    return data.data || data;
  } catch (error) {
    throw handleError(error);
  }
};

const changePassword = async (request: ChangePasswordRequest): Promise<void> => {
  try {
    await fetchAPI("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({
        currentPassword: request.currentPassword,
        newPassword: request.newPassword,
        challengeToken: request.challengeToken,
        otp: request.otp,
      }),
      requireAuth: true,
    });
  } catch (error) {
    throw handleError(error);
  }
};

const getCurrentUser = async (): Promise<UserInfo> => {
  try {
    const response = await fetchAPI<any>("/auth/me", {
      method: "GET",
      requireAuth: true,
    });

    const userData = response.data || response;

    return {
      id: String(userData.id ?? userData.userId),
      email: userData.email,
      fullName: userData.fullName,
      avatarUrl:
        userData.avatarUrl ||
        userData.avatar_url ||
        userData.picture ||
        userData.profilePictureUrl ||
        userData.profile_picture ||
        undefined,
      role: mapRole(userData.role),
      createdAt: userData.createdAt || userData.created_at || new Date().toISOString(),
      updatedAt: userData.updatedAt || userData.updated_at || undefined,
    };
  } catch (error) {
    throw handleError(error);
  }
};

const executeOAuthExchange = async (code: string, provider: string): Promise<LoginResponse> => {
  try {
    const response = await fetchAPI<any>(`/auth/oauth/callback/${provider}`, {
      method: "POST",
      body: JSON.stringify({ code }),
    });

    const authResponse = mapAuthResponse(response.data || response);
    await ensureDeviceSession(authResponse);
    return authResponse;
  } catch (error) {
    throw handleError(error);
  }
};

const exchangeOAuthCode = async (code: string, provider: string): Promise<LoginResponse> => {
  return executeOAuthExchange(code, provider);
};

const getOAuthProviders = async (): Promise<Record<string, string>> => {
  try {
    const response = await fetchAPI<ApiResponse<Record<string, string>>>("/auth/oauth/providers", {
      method: "GET",
    });

    return response.data || {};
  } catch (error) {
    throw handleError(error);
  }
};

const authService = {
  login,
  verifyLoginOtp,
  register,
  verifyRegisterOtp,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  startChangePassword,
  changePassword,
  getCurrentUser,
  exchangeOAuthCode,
  getOAuthProviders,
};

export default authService;
