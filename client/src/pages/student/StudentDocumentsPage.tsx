import { useEffect, useState } from "react";
import { FileUpload } from "../../components/forms/FileUpload";
import { getDownloadableAssetUrl } from "../../lib/api";
import type { DocumentItem } from "../../types";
import { studentService } from "../../services/studentService";
import { EmptyState } from "../../components/EmptyState";
import { useLanguage } from "../../hooks/useLanguage";
import { dt } from "../../utils/dashboardTranslations";
import { getErrorMessage } from "../../utils/errors";

export const StudentDocumentsPage = () => {
  const { t, language } = useLanguage();
  const isArabic = language === "ar";
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    studentService
      .getDocuments()
      .then(setDocuments)
      .catch((error) => setFormError(getErrorMessage(error, t("noDocumentsDescription"))));
  }, [t]);

  const handleUpload = async (file: File, type: string) => {
    setFormError("");
    try {
      const document = await studentService.uploadDocument(file, type);
      setDocuments((current) => [document, ...current]);
    } catch (error) {
      setFormError(getErrorMessage(error, dt(language, "profileSaveFailed")));
    }
  };

  const documentTypeLabels: Record<string, string> = {
    passport: isArabic ? "صورة جواز السفر" : "Passport Copy",
    "biometric-photo": dt(language, "biometricPhoto"),
    "latest-qualification": isArabic ? "الشهادة الثانوية أو الجامعية" : "High School / University Certificate",
    transcript: dt(language, "transcriptDocument"),
    "english-test": dt(language, "englishTestDocument"),
    resume: dt(language, "resumeDocument"),
    "personal-photos": isArabic ? "صور شخصية" : "Personal Photos",
    "language-certificates": isArabic ? "شهادات اللغة" : "Language Certificates",
    "other-documents": isArabic ? "مستندات أخرى" : "Other Documents",
  };

  const statusLabels: Record<string, string> = {
    pending: dt(language, "uploadedStatusPending"),
    verified: dt(language, "uploadedStatusVerified"),
    rejected: dt(language, "uploadedStatusRejected"),
  };

  return (
    <div className="space-y-6">
      <FileUpload onUpload={handleUpload} />
      {formError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}
      {documents.length ? (
        <div className="panel p-6">
          <h2 className="text-2xl font-semibold">{dt(language, "uploadedFiles")}</h2>
          <p className="mt-2 text-sm text-slate-500">{dt(language, "uploadHistoryHelp")}</p>
          <div className="mt-6 space-y-4">
            {documents.map((document) => (
              <div key={document._id} className="rounded-3xl bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-semibold">{document.fileName}</p>
                    <p className="text-sm text-slate-500">{documentTypeLabels[document.type] || document.type}</p>
                    <p className="mt-2 text-xs text-slate-500">{statusLabels[document.status] || document.status}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${document.status === "verified" ? "bg-emerald-100 text-emerald-700" : document.status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                    {statusLabels[document.status] || document.status}
                  </span>
                </div>
                {document.reviewNote ? <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">{document.reviewNote}</p> : null}
                <a href={getDownloadableAssetUrl(document.filePath)} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-semibold text-brand-700">
                  {dt(language, "viewFile")}
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState title={t("noDocuments")} description={dt(language, "noDocumentsYet")} />
      )}
    </div>
  );
};
