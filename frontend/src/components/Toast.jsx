import { useCallback, useState } from "react";

const STYLES = {
  success: "border-success/40 text-success",
  error: "border-error/40 text-error",
  info: "border-info/40 text-info",
};

export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "info") => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2800);
  }, []);

  return { toasts, push };
}

export function ToastStack({ toasts }) {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-enter bg-surface border rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg ${STYLES[t.type] || STYLES.info}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
