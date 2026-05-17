import apiClient from "@/services/api-client";

class StreamingService {
  async startSession(deviceName: string, deviceType: string): Promise<{ sessionId: number }> {
    return apiClient.post<{ sessionId: number }>("/stream/sessions/start", {
      deviceName,
      deviceType,
    });
  }

  async heartbeat(sessionId: number): Promise<void> {
    return apiClient.put<void>(`/stream/sessions/${sessionId}/heartbeat`);
  }

  async stopSession(sessionId: number): Promise<void> {
    return apiClient.delete<void>(`/stream/sessions/${sessionId}`);
  }
}

const streamingService = new StreamingService();
export default streamingService;
