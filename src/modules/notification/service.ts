import apiClient from "@/services/api-client";
import type {
  BroadcastNotificationPayload,
  CreateNotificationPayload,
  Notification,
  UpdateNotificationPayload,
} from "./types";

export const notificationService = {
  getMyNotifications(): Promise<Notification[]> {
    return apiClient.get<Notification[]>("/notifications/me");
  },

  getUnreadCount(): Promise<number> {
    return apiClient.get<number>("/notifications/me/unread-count");
  },

  markAsRead(notificationId: number): Promise<void> {
    return apiClient.patch<void>(`/notifications/${notificationId}/read`, {});
  },

  markAllAsRead(): Promise<void> {
    return apiClient.patch<void>("/notifications/me/read-all", {});
  },

  deleteNotification(notificationId: number): Promise<void> {
    return apiClient.delete<void>(`/notifications/${notificationId}`);
  },

  deleteAllMyNotifications(): Promise<void> {
    return apiClient.delete<void>("/notifications/me");
  },

  adminGetAll(): Promise<Notification[]> {
    return apiClient.get<Notification[]>("/notifications/admin");
  },

  adminCreate(payload: CreateNotificationPayload): Promise<Notification> {
    return apiClient.post<Notification>("/notifications", payload);
  },

  adminUpdate(notificationId: number, payload: UpdateNotificationPayload): Promise<Notification> {
    return apiClient.put<Notification>(`/notifications/admin/${notificationId}`, payload);
  },

  adminDelete(notificationId: number): Promise<void> {
    return apiClient.delete<void>(`/notifications/admin/${notificationId}`);
  },

  adminBroadcast(payload: BroadcastNotificationPayload): Promise<number> {
    return apiClient.post<number>("/notifications/admin/broadcast", payload);
  },
};
