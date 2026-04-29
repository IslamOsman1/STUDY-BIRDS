import { useState, type FormEvent } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import { dt } from "../../utils/dashboardTranslations";

export const FileUpload = ({
  onUpload,
}: {
  onUpload: (file: File, type: string) => Promise<void>;
}) => {
  const { language, t } = useLanguage();
  const [type, setType] = useState("passport");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) return;
    await onUpload(file, type);
    setFile(null);
    const input = event.currentTarget.querySelector('input[type="file"]') as HTMLInputElement | null;
    if (input) {
      input.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="panel space-y-4 p-6">
      <select value={type} onChange={(event) => setType(event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
        <option value="passport">{dt(language, "passportFile")}</option>
        <option value="latest-qualification">{dt(language, "latestQualification")}</option>
        <option value="transcript">{dt(language, "transcriptDocument")}</option>
        <option value="english-test">{dt(language, "englishTestDocument")}</option>
        <option value="resume">{dt(language, "resumeDocument")}</option>
        <option value="biometric-photo">{dt(language, "biometricPhoto")}</option>
      </select>
      <input type="file" accept=".pdf,image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6" />
      <button type="submit" disabled={!file} className="rounded-full bg-brand-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
        {t("uploadDocument")}
      </button>
    </form>
  );
};
