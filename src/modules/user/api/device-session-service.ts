import apiClient from "@/services/api-client";

export interface DeviceSession {
  id: number;
  deviceName?: string;
  deviceType?: string;
  ipAddress?: string;
  userAgent?: string;
  lastActiveAt?: string;
  createdAt?: string;
  isRevoked?: boolean;
}

class DeviceSessionService {
  async createCurrentSession(): Promise<DeviceSession> {
    return apiClient.post<DeviceSession>("/device-sessions", {
      deviceName: navigator.platform || "Browser",
      deviceType: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
      ipAddress: "client-detected-by-server",
      userAgent: navigator.userAgent || "Unknown",
    });
  }

  async getMySessions(): Promise<DeviceSession[]> {
    return apiClient.get<DeviceSession[]>("/device-sessions/me");
  }

  async revoke(sessionId: number): Promise<void> {
    await apiClient.patch<void>(`/device-sessions/${sessionId}/revoke`);
  }

  async revokeAll(): Promise<void> {
    await apiClient.patch<void>("/device-sessions/me/revoke-all");
  }
}

export default new DeviceSessionService();
