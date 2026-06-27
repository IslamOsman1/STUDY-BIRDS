import { useCallback, useEffect, useRef, useState } from "react";
import type { ToastItem } from "../components/ToastViewport";

type ToastTone = ToastItem["tone"];

export const useToasts = () => {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Record<number, number>>({});

  const dismissToast = useCallback((id: number) => {
    window.clearTimeout(timers.current[id]);
    delete timers.current[id];
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setItems((current) => [...current, { id, message, tone }]);
      timers.current[id] = window.setTimeout(() => dismissToast(id), 3500);
    },
    [dismissToast]
  );

  useEffect(
    () => () => {
      Object.values(timers.current).forEach((timer) => window.clearTimeout(timer));
    },
    []
  );

  return { toasts: items, pushToast, dismissToast };
};
