"use client";

import React, { createContext, ReactNode, useCallback, useEffect, useReducer } from "react";
import { AuthState, UserInfo, LoginResponse } from "@/modules/auth/types/auth";
import authService, { isAuthFailure, clearAuthTokens } from "@/modules/auth/api/auth-service";
import { queryClient } from "@/config/react-query";
import { removeFromLocalStorage } from "@/utils/helpers";
import {
  broadcastUserUpdate,
  USER_SYNC_CHANNEL,
  USER_SYNC_STORAGE_KEY,
  UserSyncPayload,
} from "@/modules/auth/utils/user-sync";
interface AuthContextType extends Omit<AuthState, "refreshToken"> {
  login: (identifier: string, password: string) => Promise<void>;
  loginWithOtpVerified: (
    challengeToken: string,
    otp: string,
    rememberMe?: boolean
  ) => Promise<void>;
  register: (fullName: string, username: string, email: string, password: string) => Promise<void>;
  registerWithOtpVerified: (challengeToken: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserInfo | null) => void;
  refreshToken: () => Promise<void>;
  refreshSession: () => Promise<void>;
  loginWithGoogle: (code: string) => Promise<void>;
}

export type { AuthContextType };

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: LoginResponse }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "RESTORE_AUTH"; payload: { user: UserInfo; accessToken: string; refreshToken: string } }
  | { type: "RESTORE_EMPTY" }
  | { type: "LOGOUT" }
  | { type: "SET_USER"; payload: UserInfo | null }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: true,
  error: null,
};

const protectedRoutePrefixes = [
  "/profile",
  "/watchlist",
  "/favorites",
  "/history",
  "/account",
  "/admin",
];

const shouldRedirectAfterLogout = (pathname: string) =>
  protectedRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

const getInitialAuthState = (): AuthState => initialState;

const unauthenticatedState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, loading: true, error: null };

    case "AUTH_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken ?? null,
        loading: false,
        error: null,
      };

    case "AUTH_ERROR":
      return { ...unauthenticatedState, error: action.payload };

    case "RESTORE_AUTH":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        loading: false,
        error: null,
      };

    case "RESTORE_EMPTY":
      return unauthenticatedState;

    case "LOGOUT":
      return unauthenticatedState;

    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
      };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

const persistAuthSession = (_response: LoginResponse) => {
  clearAuthTokens();
};

const clearAuthSession = () => {
  removeFromLocalStorage("user");
  clearAuthTokens();

  removeFromLocalStorage("cached-subscription-plans");
  removeFromLocalStorage("cached-my-subscription");

  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem("google_oauth_state");
  }

  queryClient.clear();
};

const restoreWithRefreshToken = async (): Promise<{
  user: UserInfo;
  accessToken: string;
  refreshToken: string;
} | null> => {
  await authService.refreshToken();
  const user = await authService.getCurrentUser();

  return {
    user,
    accessToken: "cookie",
    refreshToken: "cookie",
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState, getInitialAuthState);

  useEffect(() => {
    authService
      .getCurrentUser()
      .then((user) => {
        dispatch({ type: "SET_USER", payload: user });
      })
      .catch(async (error) => {
        if (isAuthFailure(error)) {
          try {
            const restored = await restoreWithRefreshToken();
            if (restored) {
              dispatch({ type: "RESTORE_AUTH", payload: restored });
              return;
            }
          } catch {}

          clearAuthSession();
          dispatch({ type: "LOGOUT" });
          return;
        }

        dispatch({
          type: "SET_ERROR",
          payload: "Không thể kết nối máy chủ. Phiên đăng nhập tạm thời được giữ lại.",
        });
      });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) channel = new BroadcastChannel(USER_SYNC_CHANNEL);

    const apply = (payload?: UserSyncPayload) => {
      if (payload?.type !== "USER_UPDATED") return;
      dispatch({ type: "SET_USER", payload: payload.user });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] }).catch(() => undefined);
    };

    const onMessage = (event: MessageEvent<UserSyncPayload>) => apply(event.data);
    const onStorage = (event: StorageEvent) => {
      if (event.key !== USER_SYNC_STORAGE_KEY || !event.newValue) return;
      try {
        apply(JSON.parse(event.newValue));
      } catch {}
    };

    channel?.addEventListener("message", onMessage);
    window.addEventListener("storage", onStorage);

    return () => {
      channel?.removeEventListener("message", onMessage);
      channel?.close();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    dispatch({ type: "AUTH_START" });
    try {
      const response = await authService.login({ usernameOrEmail: identifier, password });
      if ("accessToken" in response) {
        const fullUser = await authService.getCurrentUser();
        const loginData = { ...response, user: fullUser };
        persistAuthSession(loginData);
        dispatch({ type: "AUTH_SUCCESS", payload: loginData });
        return;
      }

      dispatch({ type: "SET_ERROR", payload: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Đăng nhập thất bại";
      dispatch({ type: "AUTH_ERROR", payload: errorMessage });
      throw error;
    }
  }, []);

  const loginWithOtpVerified = useCallback(
    async (challengeToken: string, otp: string, rememberMe?: boolean) => {
      dispatch({ type: "AUTH_START" });
      try {
        const response = await authService.verifyLoginOtp({ challengeToken, otp, rememberMe });
        const fullUser = await authService.getCurrentUser();
        const loginData = { ...response, user: fullUser };
        persistAuthSession(loginData);
        dispatch({ type: "AUTH_SUCCESS", payload: loginData });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Xác nhận OTP thất bại";
        dispatch({ type: "AUTH_ERROR", payload: errorMessage });
        throw error;
      }
    },
    []
  );

  const register = useCallback(
    async (fullName: string, username: string, email: string, password: string) => {
      dispatch({ type: "AUTH_START" });
      try {
        await authService.register({
          fullName,
          username,
          email,
          password,
          confirmPassword: password,
        });
        dispatch({ type: "SET_ERROR", payload: null });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Đăng ký thất bại";
        dispatch({ type: "AUTH_ERROR", payload: errorMessage });
        throw error;
      }
    },
    []
  );

  const registerWithOtpVerified = useCallback(async (challengeToken: string, otp: string) => {
    dispatch({ type: "AUTH_START" });
    try {
      const response = await authService.verifyRegisterOtp({ challengeToken, otp });
      const fullUser = await authService.getCurrentUser();
      const registerData = { ...response, user: fullUser };
      persistAuthSession(registerData);
      dispatch({ type: "AUTH_SUCCESS", payload: registerData });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Xác nhận OTP thất bại";
      dispatch({ type: "AUTH_ERROR", payload: errorMessage });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
    } finally {
      clearAuthSession();
      dispatch({ type: "LOGOUT" });

      if (typeof window !== "undefined" && shouldRedirectAfterLogout(window.location.pathname)) {
        window.location.replace("/auth/login");
      }
    }
  }, []);

  const setUser = useCallback((user: UserInfo | null) => {
    dispatch({ type: "SET_USER", payload: user });
    broadcastUserUpdate(user);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      dispatch({ type: "SET_USER", payload: user });
    } catch (error) {
      if (isAuthFailure(error)) {
        try {
          const restored = await restoreWithRefreshToken();
          if (restored) {
            dispatch({ type: "RESTORE_AUTH", payload: restored });
            return;
          }
        } catch {}

        clearAuthSession();
        dispatch({ type: "LOGOUT" });
        return;
      }

      dispatch({
        type: "SET_ERROR",
        payload: "Không thể kết nối máy chủ. Phiên đăng nhập tạm thời được giữ lại.",
      });
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      await authService.refreshToken();
      const user = await authService.getCurrentUser();

      dispatch({
        type: "RESTORE_AUTH",
        payload: {
          user,
          accessToken: "cookie",
          refreshToken: "cookie",
        },
      });
    } catch (error) {
      if (isAuthFailure(error)) {
        clearAuthSession();
        dispatch({ type: "LOGOUT" });
      }

      throw error;
    }
  }, []);

  const loginWithGoogle = useCallback(async (code: string) => {
    dispatch({ type: "AUTH_START" });

    try {
      const response = await authService.exchangeOAuthCode(code, "google");
      persistAuthSession(response);
      dispatch({ type: "AUTH_SUCCESS", payload: response });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Đăng nhập Google thất bại";
      dispatch({ type: "AUTH_ERROR", payload: errorMessage });
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    accessToken: state.accessToken,
    loading: state.loading,
    error: state.error,
    login,
    loginWithOtpVerified,
    register,
    registerWithOtpVerified,
    logout,
    setUser,
    refreshToken,
    refreshSession,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
