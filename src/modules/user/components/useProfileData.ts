"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import userService from "@/modules/user/api/user-service";
import deviceSessionService, { DeviceSession } from "@/modules/user/api/device-session-service";
import subscriptionService from "@/modules/subscription/api/subscription-service";
import { EmailChangeResponse, UserProfile } from "@/modules/user/types/user";
import {
  Invoice,
  PaymentTransaction,
  UserSubscription,
} from "@/modules/subscription/types/subscription";
import { useNotification } from "@/context/notification-context";

type LoadState = "loading" | "ready" | "error";
type EmailStep = "idle" | "current" | "new";
type SubtitleLanguage = "vi" | "en" | "zh" | "auto";
type AutoplayMode = "next" | "off";

type CropSelection = {
  file: File;
  previewUrl: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
};

type ProfileSettings = {
  newsletter: boolean;
  releaseDigest: boolean;
  securityAlerts: boolean;
  subtitleLanguage: SubtitleLanguage;
  autoplay: AutoplayMode;
  matureContent: boolean;
};

const SETTINGS_KEY = "giophim.profile.settings";

const defaultSettings: ProfileSettings = {
  newsletter: true,
  releaseDigest: true,
  securityAlerts: true,
  subtitleLanguage: "vi",
  autoplay: "next",
  matureContent: false,
};

export const subtitleLabels: Record<SubtitleLanguage, string> = {
  vi: "Tiếng Việt",
  en: "English",
  zh: "中文",
  auto: "Tự động",
};

export const formatDate = (value?: string) => {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value)
  );
};

const daysLeft = (value?: string) => {
  if (!value) return 0;
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 86400000));
};

export const sessionStatus = (session: DeviceSession) =>
  session.isRevoked ? "Đã thu hồi" : "Đang cho phép";

const isPrivateIp = (ip?: string) => {
  if (!ip) return true;
  return /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|::1|localhost)/.test(ip);
};

const resolveSessionLocations = async (sessions: DeviceSession[]) => {
  const uniqueIps = [...new Set(sessions.map((session) => session.ipAddress).filter(Boolean))];
  const entries = await Promise.all(
    uniqueIps.map(async (ip) => {
      if (isPrivateIp(ip)) return [ip, "Mạng nội bộ"] as const;
      try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        if (!response.ok) return [ip, "Không xác định"] as const;
        const data = await response.json();
        const location = [data.city, data.region, data.country_name].filter(Boolean).join(", ");
        return [ip, location || "Không xác định"] as const;
      } catch {
        return [ip, "Không xác định"] as const;
      }
    })
  );
  return Object.fromEntries(entries) as Record<string, string>;
};

const createCroppedAvatar = (
  sourceUrl: string,
  zoom: number,
  offsetX: number,
  offsetY: number
): Promise<File> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const size = 512;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Không thể xử lý ảnh"));
        return;
      }
      canvas.width = size;
      canvas.height = size;
      const scale = Math.max(size / image.width, size / image.height) * zoom;
      const width = image.width * scale;
      const height = image.height * scale;
      const x = (size - width) / 2 + offsetX * 2;
      const y = (size - height) / 2 + offsetY * 2;
      context.drawImage(image, x, y, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Không thể tạo ảnh đại diện"));
            return;
          }
          resolve(new File([blob], "avatar.webp", { type: "image/webp" }));
        },
        "image/webp",
        0.92
      );
    };
    image.onerror = () => reject(new Error("Ảnh không hợp lệ"));
    image.src = sourceUrl;
  });

const loadSettings = (): ProfileSettings => {
  if (typeof window === "undefined") return defaultSettings;
  const raw = window.localStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
};

export type {
  LoadState,
  EmailStep,
  SubtitleLanguage,
  AutoplayMode,
  CropSelection,
  ProfileSettings,
};

export function useProfileData() {
  const { notify } = useNotification();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [history, setHistory] = useState<UserSubscription[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sessionLocations, setSessionLocations] = useState<Record<string, string>>({});
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<DeviceSession | null>(null);
  const [fullName, setFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentOtp, setCurrentOtp] = useState("");
  const [newOtp, setNewOtp] = useState("");
  const [emailFlow, setEmailFlow] = useState<EmailChangeResponse | null>(null);
  const [emailStep, setEmailStep] = useState<EmailStep>("idle");
  const [settings, setSettings] = useState<ProfileSettings>(defaultSettings);
  const [crop, setCrop] = useState<CropSelection | null>(null);
  const [verifyingOrderCode, setVerifyingOrderCode] = useState<string | null>(null);

  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null);

  const avatarUrl = profile?.avatarUrl ?? profile?.avatar ?? "/images/default-avatar.png";
  const premiumDays = useMemo(
    () => daysLeft(currentSubscription?.endAt ?? profile?.premiumExpiryDate),
    [currentSubscription?.endAt, profile?.premiumExpiryDate]
  );

  const refreshBillingData = async () => {
    const [activeData, historyData, paymentData, invoiceData] = await Promise.all([
      subscriptionService.getActiveSubscription().catch(() => null),
      subscriptionService.getMySubscriptions().catch(() => []),
      subscriptionService.getMyPayments().catch(() => []),
      subscriptionService.getMyInvoices().catch(() => []),
    ]);
    setCurrentSubscription(activeData);
    setHistory(historyData);
    setPayments(paymentData);
    setInvoices(invoiceData);
    return { activeData, historyData, paymentData, invoiceData };
  };

  useEffect(() => {
    setSettings(loadSettings());
    let mounted = true;
    Promise.all([
      userService.getUserProfile(),
      subscriptionService.getActiveSubscription().catch(() => null),
      subscriptionService.getMySubscriptions().catch(() => []),
      subscriptionService.getMyPayments().catch(() => []),
      subscriptionService.getMyInvoices().catch(() => []),
      deviceSessionService.getMySessions().catch(() => []),
    ])
      .then(
        async ([profileData, activeData, historyData, paymentData, invoiceData, sessionData]) => {
          if (!mounted) return;
          setProfile(profileData);
          setCurrentSubscription(activeData);
          setHistory(historyData);
          setPayments(paymentData);
          setInvoices(invoiceData);
          setSessions(sessionData);
          setSessionLocations(await resolveSessionLocations(sessionData));
          setFullName(profileData.fullName ?? "");
          setState("ready");
        }
      )
      .catch(() => setState("error"));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (crop?.previewUrl) URL.revokeObjectURL(crop.previewUrl);
    };
  }, [crop?.previewUrl]);

  const saveProfile = async () => {
    const updated = await userService.updateProfile({ fullName });
    setProfile(updated);
    notify({ message: "Đã cập nhật tên hiển thị.", severity: "success" });
  };

  const saveSettings = (next: ProfileSettings) => {
    setSettings(next);
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    notify({ message: "Đã lưu cài đặt.", severity: "success" });
  };

  const selectAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (crop?.previewUrl) URL.revokeObjectURL(crop.previewUrl);
    setCrop({
      file,
      previewUrl: URL.createObjectURL(file),
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      isDragging: false,
    });
    event.target.value = "";
  };

  const updateCrop = (next: Partial<CropSelection>) => {
    setCrop((prev) => (prev ? { ...prev, ...next } : prev));
  };

  const moveCrop = (movementX: number, movementY: number) => {
    setCrop((prev) => {
      if (!prev || !prev.isDragging) return prev;
      const limit = 120 * prev.zoom;
      return {
        ...prev,
        offsetX: Math.max(-limit, Math.min(limit, prev.offsetX + movementX)),
        offsetY: Math.max(-limit, Math.min(limit, prev.offsetY + movementY)),
      };
    });
  };

  const uploadCroppedAvatar = async () => {
    if (!crop) return;
    const cropped = await createCroppedAvatar(
      crop.previewUrl,
      crop.zoom,
      crop.offsetX,
      crop.offsetY
    );
    const updated = await userService.uploadAvatar(cropped);
    setProfile(updated);
    setCrop(null);
    notify({ message: "Đã cập nhật ảnh đại diện.", severity: "success" });
  };

  const toggleAutoRenew = async () => {
    if (!currentSubscription) return;
    const updated = await subscriptionService.updateAutoRenew(!currentSubscription.autoRenew);
    setCurrentSubscription(updated);
    notify({
      message: updated.autoRenew ? "Đã bật tự động gia hạn." : "Đã tắt tự động gia hạn.",
      severity: "success",
    });
  };

  const startEmailChange = async () => {
    const response = await userService.startEmailChange(newEmail);
    setEmailFlow(response);
    setEmailStep("current");
    notify({ message: "Mã xác nhận đã gửi tới email hiện tại.", severity: "success" });
  };

  const verifyCurrentEmail = async () => {
    const response = await userService.verifyCurrentEmailChange(currentOtp);
    setEmailFlow(response);
    setEmailStep("new");
    notify({ message: "Đã xác minh. Mã mới đã gửi tới email mới.", severity: "success" });
  };

  const verifyNewEmail = async () => {
    const response = await userService.verifyNewEmailChange(newOtp);
    setEmailFlow(response);
    setEmailStep("idle");
    setNewEmail("");
    setCurrentOtp("");
    setNewOtp("");
    setProfile((prev) => (prev ? { ...prev, email: response.newEmail } : prev));
    notify({ message: "Đã đổi email thành công.", severity: "success" });
  };

  const revokeSession = async (sessionId: number) => {
    await deviceSessionService.revoke(sessionId);
    const updated = sessions.map((s) => (s.id === sessionId ? { ...s, isRevoked: true } : s));
    setSessions(updated);
    setSelectedSession((prev) => (prev?.id === sessionId ? { ...prev, isRevoked: true } : prev));
    notify({ message: "Đã thu hồi quyền truy cập.", severity: "success" });
  };

  const verifyPendingPayment = async (orderCode?: string) => {
    if (!orderCode) return;
    setVerifyingOrderCode(orderCode);
    try {
      const result = await subscriptionService.verifyPaymentManually(orderCode);
      const { historyData } = await refreshBillingData();
      setSelectedSubscription(
        historyData.find((item) => item.id === result.subscriptionId) ?? selectedSubscription
      );
      notify({
        message:
          result.status === "SUCCESS"
            ? "Thanh toán đã được xác nhận thành công."
            : result.status === "FAILED"
              ? "Thanh toán đã hết hạn hoặc thất bại."
              : "Thanh toán vẫn đang chờ PayOS xác nhận.",
        severity:
          result.status === "SUCCESS" ? "success" : result.status === "FAILED" ? "warning" : "info",
      });
    } finally {
      setVerifyingOrderCode(null);
    }
  };

  return {
    fileInputRef,
    state,
    profile,
    currentSubscription,
    history,
    payments,
    invoices,
    sessionLocations,
    sessions,
    selectedSession,
    setSelectedSession,
    fullName,
    setFullName,
    newEmail,
    setNewEmail,
    currentOtp,
    setCurrentOtp,
    newOtp,
    setNewOtp,
    emailFlow,
    emailStep,
    settings,
    crop,
    setCrop,
    selectedSubscription,
    setSelectedSubscription,
    avatarUrl,
    premiumDays,
    saveProfile,
    saveSettings,
    selectAvatar,
    updateCrop,
    moveCrop,
    uploadCroppedAvatar,
    toggleAutoRenew,
    startEmailChange,
    verifyCurrentEmail,
    verifyNewEmail,
    revokeSession,
    verifyPendingPayment,
    verifyingOrderCode,
  };
}
