"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { Alert, AlertColor, Snackbar } from "@mui/material";

type NotificationPayload = {
  message: string;
  severity?: AlertColor;
};

type NotificationContextValue = {
  notify: (payload: NotificationPayload | string) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<NotificationPayload | null>(null);

  const notify = useCallback((payload: NotificationPayload | string) => {
    setNotification(typeof payload === "string" ? { message: payload, severity: "info" } : payload);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={!!notification}
        autoHideDuration={4200}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          top: {
            xs: "calc(env(safe-area-inset-top, 0px) + 76px)",
            md: "calc(env(safe-area-inset-top, 0px) + 88px)",
          },
          left: "50%",
          right: "auto",
          transform: "translateX(-50%)",
          width: { xs: "80vw", sm: "min(80vw, 520px)", md: 520 },
          maxWidth: "calc(100vw - 32px)",
        }}
      >
        <Alert
          severity={notification?.severity ?? "info"}
          variant="filled"
          onClose={() => setNotification(null)}
          sx={{
            width: "100%",
            borderRadius: 2,
            boxShadow: "0 18px 60px rgba(0,0,0,0.38)",
          }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
