import { DocumentFileLink } from '../../components/DocumentFileLink';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ApplicationStatusBadge } from "../../components/ApplicationStatusBadge";
import { universityPortalService } from "../../services/universityPortalService";
import type { Application } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatDate } from "../../utils/format";
import { useLanguage } from "../../hooks/useLanguage";

const DETAILED_STATUS_OPTIONS: Array<{ value: string; labelAr: string; labelEn: string }> = [
  { value: "documents-missing", labelAr: "مستندات ناقصة", labelEn: "Documents Missing" },
  { value: "ready-to-apply", labelAr: "جاهز للتقديم", labelEn: "Ready to Apply" },
  { value: "under-review", labelAr: "قيد المراجعة", labelEn: "Under Review" },
  { value: "additional-documents-required", labelAr: "مطلوب مستندات إضافية", labelEn: "Additional Documents Required" },
  { value: "conditional-admission", labelAr: "قبول مشروط", labelEn: "Conditional Admission" },
  { value: "payment-required", labelAr: "الدفع مطلوب", labelEn: "Payment Required" },
  { value: "payment-verification", labelAr: "التحقق من الدفع", labelEn: "Payment Verification" },
  { value: "final-admission", labelAr: "قبول نهائي", labelEn: "Final Admission" },
  { value: "visa-preparation", labelAr: "تجهيز التأشيرة", labelEn: "Visa Preparation" },
  { value: "completed", labelAr: "مكتمل", labelEn: "Completed" },
  { value: "accepted", labelAr: "مقبول", labelEn: "Accepted" },
  { value: "rejected", labelAr: "مرفوض", labelEn: "Rejected" },
];

export const UniversityApplicationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState("");
  const [statusDraft, setStatusDraft] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [docReason, setDocReason] = useState("");
  const [sendingDocRequest, setSendingDocRequest] = useState(false);
  const [docRequestSent, setDocRequestSent] = useState(false);

  const load = () => {
    if (!id) return;
    universityPortalService
      .getApplicationById(id)
      .then((data) => {
        setApplication(data);
        setStatusDraft(data.detailedStatus || data.status);
      })
      .catch((err) => setError(getErrorMessage(err, isArabic ? "تعذر تحميل الطلب." : "Unable to load this application.")));
  };

  useEffect(load, [id, isArabic]);

  const handleUpdateStatus = async () => {
    if (!id || !statusDraft) return;
    setSaving(true);
    setError("");
    try {
      const updated = await universityPortalService.updateApplicationStatus(id, { detailedStatus: statusDraft, note });
      setApplication(updated);
      setNote("");
    } catch (err) {
      setError(getErrorMessage(err, isArabic ? "تعذر تحديث الحالة." : "Unable to update the status."));
    } finally {
      setSaving(false);
    }
  };

  const handleRequestDocument = async () => {
    if (!id) return;
    setSendingDocRequest(true);
    setError("");
    try {
      await universityPortalService.requestDocument(id, { reason: docReason });
      setDocRequestSent(true);
      setDocReason("");
    } catch (err) {
      setError(getErrorMessage(err, isArabic ? "تعذر إرسال الطلب." : "Unable to send the request."));
    } finally {
      setSendingDocRequest(false);
    }
  };

  if (error && !application) {
    return <div className="panel p-6 text-sm text-rose-700">{error}</div>;
  }

  if (!application) {
    return <div className="panel p-6 text-sm text-slate-500">{isArabic ? "جارٍ التحميل..." : "Loading..."}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{application.student?.name}</h1>
            <p className="mt-1 text-sm text-slate-500">{application.program?.title}</p>
          </div>
          <ApplicationStatusBadge status={application.status} />
        </div>
        {application.detailedStatus ? (
          <p className="mt-2 text-xs text-slate-400">
            {isArabic ? "الحالة التفصيلية" : "Detailed status"}: {application.detailedStatus}
          </p>
        ) : null}
        {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <section className="panel p-6">
        <h2 className="text-lg font-semibold text-slate-900">{isArabic ? "المستندات المرفقة" : "Attached Documents"}</h2>
        <div className="mt-4 space-y-3">
          {application.documents?.length ? (
            application.documents.map((document) => (
              <div key={document._id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                <p className="font-medium text-slate-900">{document.type}</p>
                <DocumentFileLink className="font-semibold text-brand-700" path={document.filePath}>
                  {isArabic ? "عرض الملف" : "View file"}
                </DocumentFileLink>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">{isArabic ? "لا توجد مستندات مرفقة." : "No documents attached."}</p>
          )}
        </div>
      </section>

      <section className="panel p-6">
        <h2 className="text-lg font-semibold text-slate-900">{isArabic ? "تحديث حالة الطلب" : "Update Application Status"}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isArabic ? "الحالة الجديدة" : "New status"}</span>
            <select
              value={statusDraft}
              onChange={(event) => setStatusDraft(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            >
              {DETAILED_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {isArabic ? option.labelAr : option.labelEn}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isArabic ? "ملاحظة (اختياري)" : "Note (optional)"}</span>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={handleUpdateStatus}
          className="mt-4 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : isArabic ? "حفظ الحالة" : "Save Status"}
        </button>
      </section>

      <section className="panel p-6">
        <h2 className="text-lg font-semibold text-slate-900">{isArabic ? "طلب مستند إضافي من الطالب" : "Request an Additional Document"}</h2>
        <div className="mt-4">
          <textarea
            value={docReason}
            onChange={(event) => setDocReason(event.target.value)}
            rows={3}
            placeholder={isArabic ? "مثال: يرجى رفع كشف درجات مصدّق" : "e.g. Please upload a certified transcript"}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
          />
        </div>
        <button
          type="button"
          disabled={sendingDocRequest}
          onClick={handleRequestDocument}
          className="mt-4 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sendingDocRequest ? (isArabic ? "جارٍ الإرسال..." : "Sending...") : isArabic ? "إرسال الطلب للطالب" : "Send Request to Student"}
        </button>
        {docRequestSent ? (
          <p className="mt-3 text-sm font-semibold text-emerald-700">{isArabic ? "تم إرسال الطلب بنجاح." : "Request sent successfully."}</p>
        ) : null}
      </section>

      <p className="text-center text-xs text-slate-400">
        {formatDate(application.submittedAt || application.createdAt)}
      </p>
    </div>
  );
};
