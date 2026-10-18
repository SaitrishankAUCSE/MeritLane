"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, Info, Mail } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "message";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  duration?: number; // ms, default 4500
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  addToast: (opts: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-success" />,
  error:   <AlertTriangle className="h-4 w-4 text-danger" />,
  info:    <Info className="h-4 w-4 text-info" />,
  message: <Mail className="h-4 w-4 text-primary" />,
};

const ACCENT: Record<ToastType, string> = {
  success: "border-l-success",
  error:   "border-l-danger",
  info:    "border-l-info",
  message: "border-l-primary",
};

// ─── Single Toast Card ────────────────────────────────────────────────────────

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    timerRef.current = setTimeout(
      () => onDismiss(toast.id),
      toast.duration ?? 4500
    );
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{    opacity: 0, y: 16, scale: 0.97  }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className={`
        flex items-start gap-3 w-full max-w-[340px] bg-surface-bright
        border border-border border-l-4 ${ACCENT[toast.type]}
        rounded shadow-lg px-4 py-3.5 pointer-events-auto
      `}
    >
      <div className="shrink-0 mt-0.5">{ICONS[toast.type]}</div>

      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold text-foreground leading-snug">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action!.onClick();
              onDismiss(toast.id);
            }}
            className="mt-2 text-[12px] font-semibold text-foreground underline underline-offset-2
                       hover:opacity-60 transition-opacity"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 h-6 w-6 rounded-md flex items-center justify-center
                   text-muted-foreground hover:text-foreground hover:bg-surface-dim transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...opts, id }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, addToast: toast }}>
      {children}

      {/* Toast viewport — fixed bottom-right */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {toasts.map((t) => (
            <ToastCard key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
