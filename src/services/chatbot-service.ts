const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

export type ChatRole = "user" | "assistant" | "system" | "tool";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  pending?: boolean;
  error?: boolean;
}

export interface ChatHistoryItem {
  role: ChatRole;
  content: string;
}

export interface ChatStreamEvent {
  type: "delta" | "done" | "error" | "tool";
  content: string;
}

export interface ChatStreamOptions {
  message: string;
  history: ChatHistoryItem[];
  signal?: AbortSignal;
  onEvent: (event: ChatStreamEvent) => void;
}

const SSE_BUFFER_DELIMITER = "\n\n";
// Watchdog: nếu không nhận được chunk nào trong khoảng thời gian này thì coi như
// connection đã chết (Safari iOS PWA hay bị suspend ngầm khi app vào background).
const CHAT_STREAM_INACTIVITY_MS = 60_000;

function getAuthHeader(): Record<string, string> {
  return {};
}

export async function streamChat(options: ChatStreamOptions): Promise<void> {
  const { message, history, signal, onEvent } = options;

  const response = await fetch(`${API_BASE_URL}/assistant/stream`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ message, history }),
    signal,
  });

  if (!response.ok || !response.body) {
    let errMessage = "Không thể kết nối Gió Phim Bot. Vui lòng thử lại sau.";
    try {
      const data = await response.json();
      if (data?.message) {
        errMessage = data.message;
      }
    } catch {
      /* swallow */
    }
    onEvent({ type: "error", content: errMessage });
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let receivedDone = false;
  let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  let watchdogTriggered = false;

  const armWatchdog = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      watchdogTriggered = true;
      try {
        reader.cancel().catch(() => undefined);
      } catch {
        /* ignore */
      }
    }, CHAT_STREAM_INACTIVITY_MS);
  };

  const flushBuffer = () => {
    // Sau khi stream đóng, flush nốt TextDecoder để không mất ký tự multi-byte cuối.
    buffer += decoder.decode();
    const segments: string[] = [];
    let working = buffer.replace(/\r\n/g, "\n");
    let idx = working.indexOf("\n\n");
    while (idx !== -1) {
      segments.push(working.slice(0, idx));
      working = working.slice(idx + 2);
      idx = working.indexOf("\n\n");
    }
    if (working.trim().length > 0) {
      segments.push(working);
    }
    for (const segment of segments) {
      const dataLine = segment.split("\n").find((line) => line.startsWith("data:"));
      if (!dataLine) continue;
      const payload = dataLine.slice("data:".length).trim();
      if (!payload) continue;
      try {
        const parsed = JSON.parse(payload) as ChatStreamEvent;
        if (parsed.type === "done") receivedDone = true;
        onEvent(parsed);
      } catch {
        /* skip malformed chunk */
      }
    }
    buffer = "";
  };

  armWatchdog();

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      armWatchdog();
      buffer += decoder.decode(value, { stream: true });
      // Chuẩn hóa CRLF trước để logic dưới chỉ cần xử lý \n\n.
      let normalized = buffer.replace(/\r\n/g, "\n");
      let separatorIndex = normalized.indexOf(SSE_BUFFER_DELIMITER);
      while (separatorIndex !== -1) {
        const rawEvent = normalized.slice(0, separatorIndex);
        normalized = normalized.slice(separatorIndex + SSE_BUFFER_DELIMITER.length);
        separatorIndex = normalized.indexOf(SSE_BUFFER_DELIMITER);

        const dataLine = rawEvent.split("\n").find((line) => line.startsWith("data:"));
        if (!dataLine) continue;
        const payload = dataLine.slice("data:".length).trim();
        if (!payload) continue;

        try {
          const parsed = JSON.parse(payload) as ChatStreamEvent;
          if (parsed.type === "done") receivedDone = true;
          onEvent(parsed);
        } catch {
          /* skip malformed chunk */
        }
      }
      buffer = normalized;
    }
  } finally {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    try {
      reader.releaseLock();
    } catch {
      /* ignore */
    }
    if (!watchdogTriggered) {
      flushBuffer();
    }
    if (watchdogTriggered) {
      onEvent({
        type: "error",
        content:
          "Kết nối với trợ lý bị gián đoạn. Ứng dụng có thể đang chạy ở chế độ tiết kiệm pin trên iOS. Vui lòng thử lại.",
      });
    } else if (!receivedDone) {
      // Stream đóng bình thường nhưng không nhận được done event => gửi done
      // để UI thoát khỏi loading state.
      onEvent({ type: "done", content: "" });
    }
  }
}

export async function fetchChatHealth(): Promise<{ ollamaReady: boolean; model: string }> {
  const response = await fetch(`${API_BASE_URL}/assistant/health`, {
    credentials: "include",
  });
  if (!response.ok) {
    return { ollamaReady: false, model: "unknown" };
  }
  return response.json();
}
