"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatHistoryItem, ChatMessage, streamChat } from "@/services/chatbot-service";

const STORAGE_KEY = "giophim:chatbot:history";
const MAX_PERSIST_MESSAGES = 30;

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadInitialMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
      )
      .slice(-MAX_PERSIST_MESSAGES);
  } catch {
    return [];
  }
}

function persistMessages(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = messages
      .filter((m) => !m.pending && (m.role === "user" || m.role === "assistant"))
      .slice(-MAX_PERSIST_MESSAGES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore */
  }
}

export interface UseChatStreamReturn {
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
  isStreaming: boolean;
  abortStream: () => void;
}

export function useChatStream(): UseChatStreamReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMessages(loadInitialMessages());
  }, []);

  useEffect(() => {
    persistMessages(messages);
  }, [messages]);

  const buildHistory = useCallback((): ChatHistoryItem[] => {
    return messages
      .filter((m) => !m.pending && !m.error && (m.role === "user" || m.role === "assistant"))
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content }));
  }, [messages]);

  const abortStream = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isStreaming) return;

      const userMessage: ChatMessage = {
        id: generateId("u"),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };
      const assistantId = generateId("a");
      const assistantPlaceholder: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        pending: true,
      };

      const historyForRequest = buildHistory();

      setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamChat({
          message: trimmed,
          history: historyForRequest,
          signal: controller.signal,
          onEvent: (event) => {
            if (event.type === "delta") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + event.content, pending: true }
                    : m
                )
              );
            } else if (event.type === "done") {
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, pending: false } : m))
              );
            } else if (event.type === "error") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: m.content || event.content,
                        pending: false,
                        error: true,
                      }
                    : m
                )
              );
            }
          },
        });
      } catch (error: unknown) {
        const isAbort = error instanceof DOMException && error.name === "AbortError";
        if (!isAbort) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: m.content || "Có lỗi xảy ra, vui lòng thử lại sau.",
                    pending: false,
                    error: true,
                  }
                : m
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, pending: false } : m))
          );
        }
      } finally {
        abortRef.current = null;
        setIsStreaming(false);
      }
    },
    [buildHistory, isStreaming]
  );

  const clearHistory = useCallback(() => {
    abortStream();
    setMessages([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [abortStream]);

  return { messages, sendMessage, clearHistory, isStreaming, abortStream };
}
