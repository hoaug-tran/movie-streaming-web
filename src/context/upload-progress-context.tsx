"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type UploadPhase = "preparing" | "uploading" | "finalizing" | "done" | "error";

export interface UploadTask {
  id: string;
  label: string;
  fileName: string;
  totalBytes: number;
  bytesUploaded: number;
  percent: number;
  phase: UploadPhase;
  speedKBps: number;
  etaSeconds: number | null;
  message: string;
  startedAt: number;
  finishedAt?: number;
  error?: string;
}

interface UploadProgressContextValue {
  tasks: UploadTask[];
  startTask: (task: { label: string; fileName: string; totalBytes: number }) => string;
  updateTask: (id: string, patch: Partial<UploadTask>) => void;
  finishTask: (id: string, ok: boolean, message?: string) => void;
  removeTask: (id: string) => void;
  clearDone: () => void;
}

const UploadProgressContext = createContext<UploadProgressContextValue | null>(null);

export function UploadProgressProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<UploadTask[]>([]);

  const startTask = useCallback(
    (input: { label: string; fileName: string; totalBytes: number }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setTasks((prev) => [
        ...prev,
        {
          id,
          label: input.label,
          fileName: input.fileName,
          totalBytes: input.totalBytes,
          bytesUploaded: 0,
          percent: 0,
          phase: "preparing",
          speedKBps: 0,
          etaSeconds: null,
          message: "Đang chuẩn bị upload...",
          startedAt: Date.now(),
        },
      ]);
      return id;
    },
    []
  );

  const updateTask = useCallback((id: string, patch: Partial<UploadTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const finishTask = useCallback((id: string, ok: boolean, message?: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              phase: ok ? "done" : "error",
              percent: ok ? 100 : t.percent,
              message: message ?? (ok ? "Upload hoàn tất" : "Upload thất bại"),
              error: ok ? undefined : message,
              finishedAt: Date.now(),
            }
          : t
      )
    );
    if (ok) {
      window.setTimeout(() => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }, 6000);
    }
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearDone = useCallback(() => {
    setTasks((prev) => prev.filter((t) => t.phase !== "done"));
  }, []);

  return (
    <UploadProgressContext.Provider
      value={{ tasks, startTask, updateTask, finishTask, removeTask, clearDone }}
    >
      {children}
    </UploadProgressContext.Provider>
  );
}

export function useUploadProgress() {
  const ctx = useContext(UploadProgressContext);
  if (!ctx) {
    throw new Error("useUploadProgress must be used inside UploadProgressProvider");
  }
  return ctx;
}
