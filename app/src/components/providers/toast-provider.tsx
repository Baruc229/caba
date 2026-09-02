"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type FC,
  type ReactNode,
} from "react";
import { FaXmark, FaCircleExclamation } from "react-icons/fa6";

interface Toast {
  id: string;
  message: string;
  type: "info" | "error" | "success";
}

interface ToastContextValue {
  showToast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const COOKIE_KEY = "session_invalidated";
const DISMISS_KEY = "toast_dismissed";

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    document.cookie = `${DISMISS_KEY}=${id}; Max-Age=60; path=/; SameSite=Lax`;
  }, []);

  const showToast = useCallback(
    (message: string, type: Toast["type"] = "info") => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 6000);
    },
    [removeToast]
  );

  useEffect(() => {
    const match = document.cookie.match(
      new RegExp(`(^| )${COOKIE_KEY}=([^;]+)`)
    );
    if (!match) return;
    const reason = decodeURIComponent(match[2]);
    document.cookie = `${COOKIE_KEY}=; Max-Age=0; path=/; SameSite=Lax`;

    const dismissedMatch = document.cookie.match(
      new RegExp(`(^| )${DISMISS_KEY}=([^;]+)`)
    );
    const dismissed = dismissedMatch
      ? new Set(dismissedMatch[2].split(","))
      : new Set<string>();

    if (dismissed.has(reason)) return;

    const messages: Record<string, string> = {
      account_deleted:
        "Votre session a été fermée car votre compte n'existe plus ou a été désactivé.",
      account_deactivated:
        "Votre compte a été désactivé. Veuillez contacter l'administrateur.",
    };
    const timer = setTimeout(() => {
      showToast(messages[reason] ?? "Votre session a été invalidée.", "error");
    }, 0);
    return () => clearTimeout(timer);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" role="region" aria-label="Notifications">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast--${toast.type}`}
            role="alert"
          >
            <FaCircleExclamation aria-hidden="true" className="toast-icon" />
            <span className="toast-message">{toast.message}</span>
            <button
              type="button"
              className="toast-close"
              aria-label="Fermer"
              onClick={() => removeToast(toast.id)}
            >
              <FaXmark aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
