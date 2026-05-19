import apiClient from "@/services/api-client";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr.buffer;
}

async function waitForControlledServiceWorker(
  registration: ServiceWorkerRegistration
): Promise<boolean> {
  if (!registration.active) {
    console.warn("[Push] SW registration has no active worker yet");
    return false;
  }

  if (navigator.serviceWorker.controller) return true;

  console.warn("[Push] Page is not controlled by SW yet, waiting for controllerchange...");
  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      resolve(false);
    }, 2500);

    const onControllerChange = () => {
      window.clearTimeout(timeout);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      resolve(true);
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
  });
}

function isTransientServiceWorkerError(err: unknown): boolean {
  if (!(err instanceof DOMException) && !(err instanceof TypeError)) return false;
  const message = err.message || "";
  return (
    message.includes("no active Service Worker") ||
    message.includes("not the client's active service worker") ||
    message.includes("active service worker")
  );
}

async function createPushSubscription(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  if (!VAPID_PUBLIC_KEY) {
    console.error("[Push] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured");
    return null;
  }

  const isControlled = await waitForControlledServiceWorker(registration);
  if (!isControlled) {
    console.warn(
      "[Push] SW is active but page is not controlled yet; reload page before subscribing"
    );
    return null;
  }

  console.log(
    "[Push] Creating new subscription with VAPID key:",
    VAPID_PUBLIC_KEY.slice(0, 20) + "..."
  );
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
}

export async function subscribeToPush(): Promise<boolean> {
  console.log("[Push] subscribeToPush() called");
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    console.warn("[Push] Not supported: window/serviceWorker/PushManager missing");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log("[Push] Notification.permission =", permission);
    if (permission !== "granted") return false;

    const registration = await navigator.serviceWorker.ready;
    console.log("[Push] SW ready, scope =", registration.scope);

    const existing = await registration.pushManager.getSubscription();
    console.log("[Push] Existing subscription =", existing ? existing.endpoint : "none");

    if (existing) {
      console.log("[Push] Syncing existing subscription to server...");
      await sendSubscriptionToServer(existing);
      console.log("[Push] Sync done");
      return true;
    }

    let subscription: PushSubscription | null;
    try {
      subscription = await createPushSubscription(registration);
    } catch (err) {
      if (!isTransientServiceWorkerError(err)) throw err;
      console.warn("[Push] SW changed while subscribing; retrying once...", err);
      const freshRegistration = await navigator.serviceWorker.ready;
      subscription = await createPushSubscription(freshRegistration);
    }

    if (!subscription) return false;
    console.log("[Push] New subscription endpoint:", subscription.endpoint);

    await sendSubscriptionToServer(subscription);
    console.log("[Push] New subscription sent to server");
    return true;
  } catch (err) {
    console.error("[Push] subscribeToPush FAILED:", err);
    return false;
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    await apiClient.delete("/push/unsubscribe", { body: JSON.stringify({ endpoint }) });
  } catch (err) {
    console.warn("Push unsubscribe failed:", err);
  }
}

async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  const key = subscription.getKey("p256dh");
  const auth = subscription.getKey("auth");
  const body = {
    endpoint: subscription.endpoint,
    p256dh: key ? btoa(String.fromCharCode(...new Uint8Array(key))) : null,
    auth: auth ? btoa(String.fromCharCode(...new Uint8Array(auth))) : null,
  };
  console.log("[Push] POST /push/subscribe payload:", {
    endpoint: body.endpoint,
    p256dh: body.p256dh?.slice(0, 10) + "...",
    auth: body.auth?.slice(0, 10) + "...",
  });
  try {
    await apiClient.post("/push/subscribe", body);
    console.log("[Push] /push/subscribe OK");
  } catch (err) {
    console.error("[Push] /push/subscribe FAILED:", err);
    throw err;
  }
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}
