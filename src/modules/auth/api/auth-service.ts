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

declare global {
  var __oauthExchangePromises: Map<string, Promise<LoginResponse>> | undefined;
}

const mapRole = (role: string): "ROLE_USER" | "ROLE_ADMIN" => {
  if (role === "ADMIN" || role === "ROLE_ADMIN") {
    return "ROLE_ADMIN";
  }
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

const handleError = (error: any): Error => {
  if (error instanceof Error) {
    return error;
  }
  return new Error("An error occurred");
};

const fetchAPI = async <T>(
  endpoint: string,
  options: RequestInit & { requireAuth?: boolean } = {}
): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers && typeof options.headers === "object" && !Array.isArray(options.headers)) {
    Object.assign(headers, options.headers);
  }

  const { requireAuth, headers: _, ...fetchOptions } = options;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
};

const executeOAuthExchange = async (code: string, provider: string): Promise<LoginResponse> => {
  try {
    const response = await fetchAPI<any>(`/auth/oauth/callback/${provider}`, {
      method: "POST",
      body: JSON.stringify({ code }),
    });

    return mapAuthResponse(response.data || response);
  } catch (error) {
    throw handleError(error);
  }
};

const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const data = await fetchAPI<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    return mapAuthResponse(data.data || data);
  } catch (error) {
    throw handleError(error);
  }
};

const register = async (data: RegisterRequest): Promise<LoginResponse> => {
  try {
    const response = await fetchAPI<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return mapAuthResponse(response.data || response);
  } catch (error) {
    throw handleError(error);
  }
};

const refreshToken = async (token: string): Promise<LoginResponse> => {
  try {
    const response = await fetchAPI<any>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: token }),
    });

    return mapAuthResponse(response.data || response);
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

const forgotPassword = async (email: string): Promise<void> => {
  try {
    await fetchAPI("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  } catch (error) {
    throw handleError(error);
  }
};

const resetPassword = async (data: ResetPasswordRequest): Promise<void> => {
  try {
    await fetchAPI("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (error) {
    throw handleError(error);
  }
};

const verifyEmail = async (data: VerifyEmailRequest): Promise<void> => {
  try {
    await fetchAPI("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(data),
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
  register,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getCurrentUser,
  exchangeOAuthCode,
  getOAuthProviders,
};

export default authService;
