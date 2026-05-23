import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { notificationService } from "../service";

export const NOTIFICATION_KEYS = {
  all: ["notifications"] as const,
  myList: () => [...NOTIFICATION_KEYS.all, "me"] as const,
  unreadCount: () => [...NOTIFICATION_KEYS.all, "unread-count"] as const,
  adminList: () => [...NOTIFICATION_KEYS.all, "admin"] as const,
};

export function useMyNotifications() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: NOTIFICATION_KEYS.myList(),
    queryFn: notificationService.getMyNotifications,
    enabled: isAuthenticated,
    staleTime: 15_000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    refetchOnWindowFocus: true,
  });
}

export function useUnreadCount(enabled = true) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount(),
    queryFn: notificationService.getUnreadCount,
    enabled: isAuthenticated && enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAsRead,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_KEYS.myList() });
      const previous = queryClient.getQueryData(NOTIFICATION_KEYS.myList());
      queryClient.setQueryData(NOTIFICATION_KEYS.myList(), (old: any[]) =>
        old?.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      const prevCount = queryClient.getQueryData(NOTIFICATION_KEYS.unreadCount());
      queryClient.setQueryData(NOTIFICATION_KEYS.unreadCount(), (old: number) =>
        Math.max(0, (old ?? 0) - 1)
      );
      return { previous, prevCount };
    },
    onError: (_err, _id, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATION_KEYS.myList(), context.previous);
      }
      if (context?.prevCount !== undefined) {
        queryClient.setQueryData(NOTIFICATION_KEYS.unreadCount(), context.prevCount);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.myList() });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount() });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_KEYS.myList() });
      const previous = queryClient.getQueryData(NOTIFICATION_KEYS.myList());
      queryClient.setQueryData(NOTIFICATION_KEYS.myList(), (old: any[]) =>
        old?.map((n) => ({ ...n, isRead: true }))
      );
      queryClient.setQueryData(NOTIFICATION_KEYS.unreadCount(), 0);
      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATION_KEYS.myList(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.myList() });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount() });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.deleteNotification,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_KEYS.myList() });
      const previous = queryClient.getQueryData(NOTIFICATION_KEYS.myList());
      queryClient.setQueryData(NOTIFICATION_KEYS.myList(), (old: any[]) =>
        old?.filter((n) => n.id !== notificationId)
      );
      return { previous };
    },
    onError: (_err, _id, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATION_KEYS.myList(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.myList() });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount() });
    },
  });
}

export function useDeleteAllMyNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.deleteAllMyNotifications,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_KEYS.myList() });
      const previous = queryClient.getQueryData(NOTIFICATION_KEYS.myList());
      const prevCount = queryClient.getQueryData(NOTIFICATION_KEYS.unreadCount());
      queryClient.setQueryData(NOTIFICATION_KEYS.myList(), [] as any[]);
      queryClient.setQueryData(NOTIFICATION_KEYS.unreadCount(), 0);
      return { previous, prevCount };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATION_KEYS.myList(), context.previous);
      }
      if (context?.prevCount !== undefined) {
        queryClient.setQueryData(NOTIFICATION_KEYS.unreadCount(), context.prevCount);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.myList() });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount() });
    },
  });
}

export function useAdminNotifications() {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.adminList(),
    queryFn: notificationService.adminGetAll,
    staleTime: 30_000,
  });
}
