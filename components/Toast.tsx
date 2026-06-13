"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning";
  onClose: () => void;
}

export default function Toast({ message, type = "error", onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: "bg-success",
    error: "bg-error",
    warning: "bg-warning"
  }[type];

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} text-inverse px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right`}>
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="hover:bg-white/20 p-1 rounded transition-colors"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
