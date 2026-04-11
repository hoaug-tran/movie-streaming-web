"use client";

import React, { createContext, ReactNode, useReducer, useCallback } from "react";
import { AuthState, UserInfo, LoginResponse } from "@/modules/auth/types/auth";
import authService from "@/modules/auth/api/auth-service";
import { setInLocalStorage, removeFromLocalStorage, getFromLocalStorage } from "@/utils/helpers";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserInfo | null) => void;
  refreshToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: LoginResponse }
  | { type: "LOGIN_ERROR"; payload: string }
  | { type: "REGISTER_START" }
  | { type: "REGISTER_SUCCESS"; payload: LoginResponse }
  | { type: "REGISTER_ERROR"; payload: string }
  | { type: "LOGOUT" }
  | { type: "SET_USER"; payload: UserInfo | null }
  | { type: "RESTORE_AUTH"; payload: { user: UserInfo; accessToken: string } }
  | { type: "SET_ERROR"; payload: string };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
    case "REGISTER_START":
      return { ...state, loading: true, error: null };

    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        loading: false,
        error: null,
      };

    case "LOGIN_ERROR":
    case "REGISTER_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      };

    case "LOGOUT":
      return initialState;

    case "SET_USER":
      return { ...state, user: action.payload };

    case "RESTORE_AUTH":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
      };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore auth from localStorage on mount
  React.useEffect(() => {
    const storedUser = getFromLocalStorage<UserInfo>("user");
    const storedToken = getFromLocalStorage<string>("accessToken");

    if (storedUser && storedToken) {
      dispatch({
        type: "RESTORE_AUTH",
        payload: { user: storedUser, accessToken: storedToken },
      });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await authService.login({ email, password });
      setInLocalStorage("user", response.user);
      setInLocalStorage("accessToken", response.accessToken);
      setInLocalStorage("refreshToken", response.refreshToken);
      dispatch({ type: "LOGIN_SUCCESS", payload: response });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      dispatch({ type: "LOGIN_ERROR", payload: errorMessage });
      throw error;
    }
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    dispatch({ type: "REGISTER_START" });
    try {
      const response = await authService.register({
        fullName,
        email,
        password,
        confirmPassword: password,
      });
      setInLocalStorage("user", response.user);
      setInLocalStorage("accessToken", response.accessToken);
      setInLocalStorage("refreshToken", response.refreshToken);
      dispatch({ type: "REGISTER_SUCCESS", payload: response });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      dispatch({ type: "REGISTER_ERROR", payload: errorMessage });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      removeFromLocalStorage("user");
      removeFromLocalStorage("accessToken");
      removeFromLocalStorage("refreshToken");
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const setUser = useCallback((user: UserInfo | null) => {
    dispatch({ type: "SET_USER", payload: user });
    if (user) {
      setInLocalStorage("user", user);
    } else {
      removeFromLocalStorage("user");
    }
  }, []);

  const refreshToken = useCallback(async () => {
    if (!state.refreshToken) return;
    try {
      const response = await authService.refreshToken(state.refreshToken);
      setInLocalStorage("accessToken", response.accessToken);
      dispatch({
        type: "RESTORE_AUTH",
        payload: { user: response.user, accessToken: response.accessToken },
      });
    } catch (error) {
      dispatch({ type: "LOGOUT" });
      throw error;
    }
  }, [state.refreshToken]);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    setUser,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
