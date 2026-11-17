import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  ToastCard,
  type ToastVariant,
  type NotificationItem,
} from "@etherealui/react";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  timestamp: Date;
}

interface NotificationContextType {
  toasts: ToastItem[];
  notifications: NotificationItem[];
  unreadCount: number;
  addToast: (toast: Omit<ToastItem, "id" | "timestamp">) => void;
  removeToast: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  dismiss: (id: string) => void;
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
  };
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Clock-In Synchronized",
    description:
      "Your daily attendance was verified and synced to Supabase PostgreSQL.",
    timestamp: "10m ago",
    type: "success",
    read: false,
    actor: {
      name: "Postgres Sync",
    },
  },
  {
    id: "notif-2",
    title: "Payroll Disbursement Ready",
    description:
      "November 2026 payroll calculation has been verified by Finance.",
    timestamp: "1h ago",
    type: "info",
    read: false,
    actor: {
      name: "Payroll Engine",
    },
  },
  {
    id: "notif-3",
    title: "New ATS Candidate",
    description: "Rian Pratama advanced to the Technical Interview stage.",
    timestamp: "3h ago",
    type: "warning",
    read: true,
    actor: {
      name: "Talent Portal",
    },
  },
];

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS,
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({
      title,
      description,
      variant = "info",
    }: Omit<ToastItem, "id" | "timestamp">) => {
      const id = "toast-" + Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = {
        id,
        title,
        description,
        variant,
        timestamp: new Date(),
      };

      setToasts((prev) => [...prev.slice(-3), newToast]); // Keep max 4 toasts

      // Auto dismiss after 4.5 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast],
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toastHelpers = {
    success: (title: string, description?: string) =>
      addToast({ title, description, variant: "success" }),
    error: (title: string, description?: string) =>
      addToast({ title, description, variant: "error" }),
    warning: (title: string, description?: string) =>
      addToast({ title, description, variant: "warning" }),
    info: (title: string, description?: string) =>
      addToast({ title, description, variant: "info" }),
  };

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        notifications,
        unreadCount,
        addToast,
        removeToast,
        markAsRead,
        markAllAsRead,
        clearAll,
        dismiss,
        toast: toastHelpers,
      }}
    >
      {children}

      {/* Floating Ethereal Toast Notification Viewport */}
      {toasts.length > 0 && (
        <aside
          aria-label="Notifications"
          className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none transition-all duration-300"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              className="pointer-events-auto transform transition-all duration-200 animate-in fade-in slide-in-from-bottom-3"
            >
              <ToastCard
                title={t.title}
                description={t.description}
                variant={t.variant}
                onDismiss={() => removeToast(t.id)}
                className="shadow-xl backdrop-blur-md"
              />
            </div>
          ))}
        </aside>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
}
