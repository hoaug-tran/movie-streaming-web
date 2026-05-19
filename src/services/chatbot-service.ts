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

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function streamChat(options: ChatStreamOptions): Promise<void> {
  const { message, history, signal, onEvent } = options;

  const response = await fetch(`${API_BASE_URL}/chat/stream`, {
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

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });

      let separatorIndex = buffer.indexOf(SSE_BUFFER_DELIMITER);
      while (separatorIndex !== -1) {
        const rawEvent = buffer.slice(0, separatorIndex);
        buffer = buffer.slice(separatorIndex + SSE_BUFFER_DELIMITER.length);
        separatorIndex = buffer.indexOf(SSE_BUFFER_DELIMITER);

        const dataLine = rawEvent.split("\n").find((line) => line.startsWith("data:"));
        if (!dataLine) continue;
        const payload = dataLine.slice("data:".length).trim();
        if (!payload) continue;

        try {
          const parsed = JSON.parse(payload) as ChatStreamEvent;
          onEvent(parsed);
        } catch {
          /* skip malformed chunk */
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function fetchChatHealth(): Promise<{ ollamaReady: boolean; model: string }> {
  const response = await fetch(`${API_BASE_URL}/chat/health`, {
    credentials: "include",
  });
  if (!response.ok) {
    return { ollamaReady: false, model: "unknown" };
  }
  return response.json();
}
