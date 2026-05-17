import apiClient from "@/services/api-client";

const streamingService = {
  startSession(deviceName: string, deviceType: string): Promise<{ sessionId: number }> {
    return apiClient.post<{ sessionId: number }>("/stream/sessions/start", {
      deviceName,
      deviceType,
    });
  },

  heartbeat(sessionId: number): Promise<void> {
    return apiClient.put<void>(`/stream/sessions/${sessionId}/heartbeat`);
  },

  stopSession(sessionId: number): Promise<void> {
    return apiClient.delete<void>(`/stream/sessions/${sessionId}`);
  },
};

export default streamingService;
