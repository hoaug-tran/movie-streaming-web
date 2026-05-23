import { UserInfo } from "@/modules/auth/types/auth";

export const USER_SYNC_CHANNEL = "giophim-user-sync";
export const USER_SYNC_STORAGE_KEY = "giophim.user.sync";

export type UserSyncPayload = {
  type: "USER_UPDATED";
  user: UserInfo | null;
  at: number;
};

export function withAvatarCacheBust<
  T extends { avatarUrl?: string | null; avatar?: string | null },
>(user: T): T {
  const stamp = Date.now();
  const bust = (url?: string | null) => {
    if (!url) return url;
    if (url.startsWith("data:")) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}v=${stamp}`;
  };

  return {
    ...user,
    avatarUrl: bust(user.avatarUrl),
    avatar: bust(user.avatar),
  };
}

export function broadcastUserUpdate(user: UserInfo | null) {
  if (typeof window === "undefined") return;

  const payload: UserSyncPayload = {
    type: "USER_UPDATED",
    user,
    at: Date.now(),
  };

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(USER_SYNC_CHANNEL);
    channel.postMessage(payload);
    channel.close();
  }

  window.localStorage.setItem(USER_SYNC_STORAGE_KEY, JSON.stringify(payload));
}
