import { Link } from "react-router-dom";
import type { ApplicationCard } from "../types";
import { useLanguage } from "../hooks/useLanguage";
import { formatDate } from "../utils/format";
import { homeRoute } from "./StudentSmartHome";

const toneText: Record<string, string> = {
  action: "text-amber-700", danger: "text-rose-700", success: "text-emerald-700", info: "text-sky-700", neutral: "text-slate-600",
};

// Everything a student needs at a glance for one application (PRD 15/16).
export const ApplicationCardSummary = ({ card }: { card: ApplicationCard }) => {
  const { language } = useLanguage();
  const ar = language === "ar";
  const t = (a: string, b: string) => (ar ? a : b);
  const item = (label: string, value: string | null | undefined, tone?: string) => (
    <div className="rounded-2xl bg-white px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-sm font-semibold ${tone ? toneText[tone] || "" : "text-slate-800"}`}>{value || "—"}</p>
    </div>
  );
  return <div className="mt-4 space-y-3">
    <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {item(t("الدولة", "Country"), card.country)}
      {item(t("الحرم / المدينة", "Campus / city"), card.campus)}
      {item(t("الفصل الدراسي", "Intake"), card.intake)}
      {item(t("الدرجة", "Degree"), card.degreeLevel)}
      {item(t("لغة الدراسة", "Language"), card.language)}
      {item(t("القبول", "Admission"), card.admissionStatus ? (ar ? card.admissionStatus.labelAr : card.admissionStatus.labelEn) : null, card.admissionStatus?.tone)}
      {item(t("المستندات", "Documents"), card.documentsStatus ? (ar ? card.documentsStatus.labelAr : card.documentsStatus.labelEn) : null, card.documentsStatus?.tone)}
      {item(t("الدفع", "Payment"), card.paymentStatus ? (ar ? card.paymentStatus.labelAr : card.paymentStatus.labelEn) : null, card.paymentStatus?.tone)}
      {item(t("التأشيرة", "Visa"), card.visaStatus ? (ar ? card.visaStatus.labelAr : card.visaStatus.labelEn) : t("لم تبدأ بعد", "Not started"))}
      {item(t("المستشار المتابع", "Assigned consultant"), card.consultant || t("سيُعيَّن قريبًا", "To be assigned"))}
      {item(t("آخر تحديث", "Last update"), card.lastUpdate ? formatDate(card.lastUpdate) : null)}
    </div>
    {card.nextAction ? (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-3">
        <div>
          <p className="text-xs text-slate-500">{card.nextAction.waiting ? t("بانتظار الفريق", "Waiting on the team") : t("الخطوة التالية", "Next action")}</p>
          <p className="font-semibold text-slate-900">{ar ? card.nextAction.titleAr : card.nextAction.titleEn}</p>
          <p className="text-sm text-slate-600">{card.nextAction.descriptionAr}</p>
        </div>
        {!card.nextAction.waiting ? <Link className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white" to={homeRoute(card.nextAction.destination)}>{t("اذهب", "Go")}</Link> : null}
      </div>
    ) : null}
  </div>;
};
