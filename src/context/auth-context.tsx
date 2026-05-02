"use client";

import React, { createContext, ReactNode, useCallback, useEffect, useReducer } from "react";
import { AuthState, UserInfo, LoginResponse } from "@/modules/auth/types/auth";
import authService from "@/modules/auth/api/auth-service";
import { queryClient } from "@/config/react-query";
import { getFromLocalStorage, removeFromLocalStorage, setInLocalStorage } from "@/utils/helpers";

interface AuthContextType extends Omit<AuthState, "refreshToken"> {
  login: (identifier: string, password: string) => Promise<void>;
  register: (fullName: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserInfo | null) => void;
  refreshToken: () => Promise<void>;
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

const protectedRoutePrefixes = ["/profile", "/watchlist", "/favorites", "/history"];

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
      return {
        ...state,
        loading: true,
        error: null,
      };

    case "AUTH_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        loading: false,
        error: null,
      };

    case "AUTH_ERROR":
      return {
        ...unauthenticatedState,
        error: action.payload,
      };

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
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

const persistAuthSession = (response: LoginResponse) => {
  setInLocalStorage("user", response.user);
};

const clearAuthSession = () => {
  removeFromLocalStorage("user");
  removeFromLocalStorage("accessToken");
  removeFromLocalStorage("refreshToken");
  removeFromLocalStorage("rememberMe");
  removeFromLocalStorage("rememberedEmail");
  removeFromLocalStorage("rememberedIdentifier");

  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem("google_oauth_state");
  }

  queryClient.clear();
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState, getInitialAuthState);

  useEffect(() => {
    const storedUser = getFromLocalStorage<UserInfo>("user");

    if (storedUser) {
      authService
        .getCurrentUser()
        .then((user) => {
          dispatch({ type: "SET_USER", payload: user });
        })
        .catch(() => {
          clearAuthSession();
          dispatch({ type: "LOGOUT" });
        });
      return;
    }

    clearAuthSession();
    dispatch({ type: "RESTORE_EMPTY" });
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    dispatch({ type: "AUTH_START" });

    try {
      const response = await authService.login({
        usernameOrEmail: identifier,
        password,
      });

      const fullUser = await authService.getCurrentUser();

      const loginData = {
        ...response,
        user: fullUser,
      };

      persistAuthSession(loginData);
      dispatch({ type: "AUTH_SUCCESS", payload: loginData });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Đăng nhập thất bại";
      dispatch({ type: "AUTH_ERROR", payload: errorMessage });
      throw error;
    }
  }, []);

  const register = useCallback(
    async (fullName: string, username: string, email: string, password: string) => {
      dispatch({ type: "AUTH_START" });

      try {
        const response = await authService.register({
          fullName,
          username,
          email,
          password,
          confirmPassword: password,
        });

        const fullUser = await authService.getCurrentUser();

        const registerData = {
          ...response,
          user: fullUser,
        };

        persistAuthSession(registerData);
        dispatch({ type: "AUTH_SUCCESS", payload: registerData });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Đăng ký thất bại";
        dispatch({ type: "AUTH_ERROR", payload: errorMessage });
        throw error;
      }
    },
    []
  );

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

    if (user) {
      setInLocalStorage("user", user);
      return;
    }

    removeFromLocalStorage("user");
  }, []);

  const refreshToken = useCallback(async () => {
    const currentRefreshToken = state.refreshToken || getFromLocalStorage<string>("refreshToken");

    if (!currentRefreshToken) {
      clearAuthSession();
      dispatch({ type: "LOGOUT" });
      return;
    }

    try {
      const response = await authService.refreshToken(currentRefreshToken);
      persistAuthSession(response);
      dispatch({ type: "AUTH_SUCCESS", payload: response });
    } catch (error) {
      clearAuthSession();
      dispatch({ type: "LOGOUT" });
      throw error;
    }
  }, [state.refreshToken]);

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
    register,
    logout,
    setUser,
    refreshToken,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
