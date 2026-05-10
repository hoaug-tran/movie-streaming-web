export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
  rememberMe?: boolean;
}

export interface OtpChallengeResponse {
  otpRequired: boolean;
  challengeToken?: string;
  email?: string;
  expiresInSeconds?: number;
  resendAfterSeconds?: number;
  message?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: UserInfo;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: "ROLE_USER" | "ROLE_ADMIN";
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  challengeToken: string;
  otp: string;
  rememberMe?: boolean;
}

export interface VerifyPasswordResetOtpRequest extends VerifyOtpRequest {
  newPassword: string;
}

export interface VerifyEmailRequest {
  email: string;
  verificationCode: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword?: string;
  challengeToken: string;
  otp: string;
}
