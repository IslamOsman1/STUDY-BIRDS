import { useEffect, useState } from "react";
import { UploadCloud } from "lucide-react";
import { EmptyState } from "../../components/EmptyState";
import { DOCUMENT_UPLOAD_ACCEPT, DOCUMENT_UPLOAD_HINT_AR, DOCUMENT_UPLOAD_HINT_EN } from "../../constants/upload";
import { partnerService } from "../../services/partnerService";
import type { VerificationOverview } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";

export const PartnerVerificationPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [data, setData] = useState<VerificationOverview | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingType, setUploadingType] = useState("");

  const loadVerification = () =>
    partnerService
      .getVerification()
      .then(setData)
      .catch((issue) =>
        setError(getErrorMessage(issue, isArabic ? "تعذر تحميل بيانات التوثيق." : "Unable to load verification data."))
      );

  useEffect(() => {
    loadVerification();
  }, [isArabic]);

  const handleUpload = async (type: string, file?: File | null) => {
    if (!file) return;
    setUploadingType(type);
    setError("");
    setSuccess("");
    try {
      await partnerService.uploadVerificationDocument(file, type);
      setSuccess(isArabic ? "تم رفع المستند بنجاح." : "Document uploaded successfully.");
      await loadVerification();
    } catch (issue) {
      setError(getErrorMessage(issue, isArabic ? "تعذر رفع المستند." : "Unable to upload document."));
    } finally {
      setUploadingType("");
    }
  };

  if (!data) {
    return <div className="panel p-8 text-sm text-slate-500">{error || (isArabic ? "جارٍ تحميل البيانات..." : "Loading verification data...")}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "توثيق الحساب" : "Account Verification"}</h1>
            <p className="mt-2 text-sm text-slate-500">
              {isArabic ? "ارفع المستندات المطلوبة ليتم مراجعتها من الإدارة." : "Upload the required documents for admin review."}
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {isArabic ? "الحالة" : "Status"}: {data.status}
          </span>
        </div>
        {data.reason ? <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{data.reason}</div> : null}
        {success ? <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        {[
          ["identity", isArabic ? "هوية أو جواز المسؤول" : "Identity / Passport"],
          ["commercial-license", isArabic ? "الرخصة أو السجل التجاري" : "Commercial License"],
          ["supporting-document", isArabic ? "مستند داعم إضافي" : "Supporting Document"],
        ].map(([type, label]) => (
          <label key={type} className="panel cursor-pointer border border-dashed border-slate-300 p-6 text-center">
            <UploadCloud className="mx-auto h-5 w-5 text-slate-400" />
            <div className="mt-3 text-sm font-semibold text-slate-900">{label}</div>
            <div className="mt-2 text-xs text-slate-500">
              {uploadingType === type ? (isArabic ? "جارٍ الرفع..." : "Uploading...") : isArabic ? "اختر ملفًا للرفع" : "Choose a file to upload"}
            </div>
            <input type="file" accept={DOCUMENT_UPLOAD_ACCEPT} className="mt-4 w-full text-xs" onChange={(event) => handleUpload(type, event.target.files?.[0] || null)} />
            <div className="mt-2 text-[11px] text-slate-400">{isArabic ? DOCUMENT_UPLOAD_HINT_AR : DOCUMENT_UPLOAD_HINT_EN}</div>
          </label>
        ))}
      </div>

      {data.documents.length ? (
        <section className="panel overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {[isArabic ? "النوع" : "Type", isArabic ? "اسم الملف" : "File Name", isArabic ? "الحالة" : "Status", isArabic ? "التاريخ" : "Date"].map((header) => (
                    <th key={header} className="px-5 py-4 text-start font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.documents.map((document) => (
                  <tr key={document._id} className="border-t border-slate-100">
                    <td className="px-5 py-4 text-slate-600">{document.type}</td>
                    <td className="px-5 py-4">
                      <a href={document.filePath} target="_blank" rel="noreferrer" className="font-semibold text-brand-700 hover:underline">
                        {document.fileName}
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{document.status}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{document.createdAt ? new Date(document.createdAt).toLocaleDateString() : "--"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <EmptyState title={isArabic ? "لا توجد مستندات مرفوعة" : "No uploaded documents"} description={isArabic ? "ابدأ برفع مستندات التوثيق المطلوبة." : "Upload the required verification documents to get started."} />
      )}
    </div>
  );
};
