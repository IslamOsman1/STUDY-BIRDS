import { useLanguage } from "../hooks/useLanguage";
import { useStatusCatalog } from "../hooks/useStatusCatalog";

const styleMap: Record<string, string> = {
  submitted: "bg-brand-100 text-brand-700",
  "under-review": "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  "preliminary-accepted": "bg-sky-100 text-sky-700",
  "preliminary-accepted-first-payment": "bg-cyan-100 text-cyan-700",
  "final-accepted": "bg-teal-100 text-teal-700",
  "file-completed-accepted": "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  "file-completed-rejected": "bg-rose-100 text-rose-700",
  draft: "bg-slate-100 text-slate-700",
};

type StatusTranslationKey =
  | "statusAccepted"
  | "statusDraft"
  | "statusRejected"
  | "statusSubmitted"
  | "statusUnderReview"
  | "statusPreliminaryAccepted"
  | "statusPreliminaryAcceptedFirstPayment"
  | "statusFinalAccepted"
  | "statusFileCompletedAccepted"
  | "statusFileCompletedRejected";

const statusKeyMap: Record<string, StatusTranslationKey> = {
  accepted: "statusAccepted",
  draft: "statusDraft",
  rejected: "statusRejected",
  submitted: "statusSubmitted",
  "under-review": "statusUnderReview",
  "preliminary-accepted": "statusPreliminaryAccepted",
  "preliminary-accepted-first-payment": "statusPreliminaryAcceptedFirstPayment",
  "final-accepted": "statusFinalAccepted",
  "file-completed-accepted": "statusFileCompletedAccepted",
  "file-completed-rejected": "statusFileCompletedRejected",
};

const toneStyle: Record<string, string> = {
  neutral: styleMap.draft, info: "bg-sky-100 text-sky-700", action: "bg-amber-100 text-amber-700",
  success: "bg-emerald-100 text-emerald-700", danger: "bg-rose-100 text-rose-700",
};

// Website review statuses keep their existing labels; detailed lifecycle
// statuses (e.g. payment-verification) come from the shared status catalog
// instead of silently falling back to "Draft".
export const ApplicationStatusBadge = ({ status }: { status: string }) => {
  const { t, language } = useLanguage();
  const catalog = useStatusCatalog();
  const detailed = !statusKeyMap[status] ? catalog?.applications[status] : undefined;

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styleMap[status] || (detailed ? toneStyle[detailed.tone] : styleMap.draft)}`}>
      {detailed ? (language === "ar" ? detailed.ar.label : detailed.en.label) : statusKeyMap[status] ? t(statusKeyMap[status]) : "…"}
    </span>
  );
};
