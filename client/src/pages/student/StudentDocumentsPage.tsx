import { useEffect, useState } from "react";
import { FileUpload } from "../../components/forms/FileUpload";
import { getApiAssetUrl } from "../../lib/api";
import type { DocumentItem } from "../../types";
import { studentService } from "../../services/studentService";
import { EmptyState } from "../../components/EmptyState";
import { useLanguage } from "../../hooks/useLanguage";
import { dt } from "../../utils/dashboardTranslations";
import { getErrorMessage } from "../../utils/errors";

export const StudentDocumentsPage = () => {
  const { t, language } = useLanguage();
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
    passport: dt(language, "passportFile"),
    "biometric-photo": dt(language, "biometricPhoto"),
    "latest-qualification": dt(language, "latestQualification"),
    transcript: dt(language, "transcriptDocument"),
    "english-test": dt(language, "englishTestDocument"),
    resume: dt(language, "resumeDocument"),
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
                <p className="font-semibold">{document.fileName}</p>
                <p className="text-sm text-slate-500">{documentTypeLabels[document.type] || document.type}</p>
                <p className="mt-2 text-xs text-slate-500">{statusLabels[document.status] || document.status}</p>
                <a href={getApiAssetUrl(document.filePath)} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-semibold text-brand-700">
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
