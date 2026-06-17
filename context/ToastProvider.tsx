"use client";

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";

type ToastType = "success" | "error" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "error") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-primary/60 backdrop-blur-sm transition-opacity"
            onClick={() => removeToast(toasts[0].id)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-surface w-full max-w-lg shadow-2xl z-10 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => removeToast(toasts[0].id)}
              className="absolute top-6 right-6 text-primary hover:text-secondary transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h2 className="text-2xl text-primary mb-6 pr-8 font-light">
              {toasts[0].type === "success"
                ? "Success"
                : toasts[0].type === "warning"
                  ? "Notification"
                  : "Notice"}
            </h2>

            <p className="text-secondary text-base leading-relaxed mb-8 font-light">
              {toasts[0].message}
            </p>

            <button
              onClick={() => removeToast(toasts[0].id)}
              className="w-full bg-primary text-inverse py-4 px-6 font-medium hover:bg-primary-light transition-colors duration-300"
            >
              {toasts[0].type === "success" ? "Continue" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
