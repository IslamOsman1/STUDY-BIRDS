import { useLanguage } from "../hooks/useLanguage";

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

export const ApplicationStatusBadge = ({ status }: { status: string }) => {
  const { t } = useLanguage();

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styleMap[status] || styleMap.draft}`}>
      {t(statusKeyMap[status] || "statusDraft")}
    </span>
  );
};
