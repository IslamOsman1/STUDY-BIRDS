import type { StatusInfo } from "../hooks/useStatusCatalog";
import { useLanguage } from "../hooks/useLanguage";

const toneClasses: Record<StatusInfo["tone"], string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-800",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  action: "border-amber-200 bg-amber-50 text-amber-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  danger: "border-rose-200 bg-rose-50 text-rose-900",
};

// What a status means for the student now and what happens next (PRD 103).
export const StatusExplanation = ({ info, compact = false }: { info?: StatusInfo | null; compact?: boolean }) => {
  const { language } = useLanguage();
  if (!info) return null;
  const copy = language === "ar" ? info.ar : info.en;
  return <div className={`rounded-2xl border p-3 text-sm ${toneClasses[info.tone] || toneClasses.info}`}>
    <p className="font-semibold">{copy.label}</p>
    <p className="mt-1">{copy.meaning}</p>
    {!compact && <p className="mt-1 opacity-80">
      <span className="font-semibold">{language === "ar" ? "الخطوة التالية: " : "Next step: "}</span>{copy.nextStep}
    </p>}
  </div>;
};
