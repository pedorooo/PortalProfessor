import { AlertCircle, CheckCircle, Info, XCircle, X } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import type { ToastType } from "@/context/ToastContext";

const TOAST_STYLES: Record<
  ToastType,
  { bg: string; border: string; text: string; icon: React.ReactNode }
> = {
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    icon: <XCircle className="w-5 h-5 text-red-600" />,
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
    icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    icon: <Info className="w-5 h-5 text-blue-600" />,
  },
};

export function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => {
        const styles = TOAST_STYLES[toast.type];

        return (
          <div
            key={toast.id}
            className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 max-w-md pointer-events-auto animate-in slide-in-from-right-4 fade-in-0 duration-200`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
              <div className="flex-1">
                <p className={`${styles.text} font-medium text-sm`}>
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className={`flex-shrink-0 ${styles.text} hover:opacity-70 transition-opacity`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
