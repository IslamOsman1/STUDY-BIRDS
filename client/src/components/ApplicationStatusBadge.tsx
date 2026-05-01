import { useLanguage } from "../hooks/useLanguage";

const styleMap: Record<string, string> = {
  submitted: "bg-brand-100 text-brand-700",
  "under-review": "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  draft: "bg-slate-100 text-slate-700",
};

const statusKeyMap: Record<string, "statusAccepted" | "statusDraft" | "statusRejected" | "statusSubmitted" | "statusUnderReview"> = {
  accepted: "statusAccepted",
  draft: "statusDraft",
  rejected: "statusRejected",
  submitted: "statusSubmitted",
  "under-review": "statusUnderReview",
};

export const ApplicationStatusBadge = ({ status }: { status: string }) => {
  const { t } = useLanguage();

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${styleMap[status] || styleMap.draft}`}>
      {t(statusKeyMap[status] || "statusDraft")}
    </span>
  );
};
