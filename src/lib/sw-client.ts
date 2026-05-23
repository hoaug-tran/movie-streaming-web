export async function waitForServiceWorkerReady() {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator)) return null;

  const registration = await navigator.serviceWorker.ready;

  return navigator.serviceWorker.controller || registration.active || null;
}

export async function sendSWMessage<T = any>(
  message: Record<string, any>,
  timeoutMs = 20000
): Promise<T | null> {
  const sw = await waitForServiceWorkerReady();

  if (!sw) return null;

  return new Promise((resolve) => {
    const channel = new MessageChannel();

    const timer = window.setTimeout(() => {
      channel.port1.close();
      resolve(null);
    }, timeoutMs);

    channel.port1.onmessage = (event) => {
      window.clearTimeout(timer);
      channel.port1.close();
      resolve(event.data as T);
    };

    sw.postMessage(message, [channel.port2]);
  });
}

export async function precacheOfflineApp() {
  return sendSWMessage<{
    ok: boolean;
    type: string;
    version: string;
    error?: string;
  }>({
    type: "PRECACHE_OFFLINE_APP",
  });
}
