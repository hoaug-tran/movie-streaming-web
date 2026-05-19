import apiClient from "@/services/api-client";

export type SystemStatusLevel = "operational" | "degraded" | "maintenance" | "outage";

export interface SystemComponentStatus {
  id: string;
  name: string;
  description: string;
  status: SystemStatusLevel;
  detail: string;
  latencyMs: number | null;
}

export interface SystemStatusPayload {
  overall: SystemStatusLevel;
  checkedAt: string;
  uptimeSeconds: number;
  version: string;
  components: SystemComponentStatus[];
}

export const systemService = {
  getStatus: () => apiClient.get<SystemStatusPayload>("/system/status"),
};
