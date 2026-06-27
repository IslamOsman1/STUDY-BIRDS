import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

export interface ToastItem {
  id: number;
  message: string;
  tone?: "success" | "error" | "info";
}

const toneClasses: Record<NonNullable<ToastItem["tone"]>, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-slate-200 bg-white text-slate-800",
};

const toneIcons = {
  success: CheckCircle2,
  error: TriangleAlert,
  info: Info,
};

export const ToastViewport = ({
  items,
  onDismiss,
}: {
  items: ToastItem[];
  onDismiss: (id: number) => void;
}) => (
  <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-3">
    {items.map((item) => {
      const tone = item.tone || "info";
      const Icon = toneIcons[tone];

      return (
        <div key={item.id} className={`pointer-events-auto rounded-3xl border px-4 py-3 shadow-lg ${toneClasses[tone]}`}>
          <div className="flex items-start gap-3">
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="flex-1 text-sm font-medium leading-6">{item.message}</p>
            <button type="button" onClick={() => onDismiss(item.id)} className="rounded-full p-1 opacity-70 transition hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      );
    })}
  </div>
);
