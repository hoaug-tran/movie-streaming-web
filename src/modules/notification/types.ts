export type NotificationType =
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "PREMIUM_EXPIRING"
  | "SUBSCRIPTION_EXPIRED"
  | "NEW_EPISODE"
  | "COMMENT_REPLY"
  | "COMMENT_LIKE"
  | "REVIEW_LIKE"
  | "HOT_MOVIES"
  | "SYSTEM";

export interface Notification {
  id: number;
  title: string;
  content: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl?: string | null;
  referenceId?: number | null;
  createdAt: string;
}

export interface CreateNotificationPayload {
  userId: number;
  title: string;
  content: string;
  type: NotificationType;
  actionUrl?: string | null;
  referenceId?: number | null;
}

export interface UpdateNotificationPayload {
  title: string;
  content: string;
  type: NotificationType;
  actionUrl?: string | null;
}

export interface BroadcastNotificationPayload {
  title: string;
  content: string;
  type: NotificationType;
  actionUrl?: string | null;
}
