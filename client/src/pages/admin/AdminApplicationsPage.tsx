import { useEffect, useMemo, useState } from "react";
import { Filter, Inbox, SendHorizontal } from "lucide-react";
import { ApplicationStatusBadge } from "../../components/ApplicationStatusBadge";
import { downloadApiAsset } from "../../lib/api";
import { adminService } from "../../services/adminService";
import { applicationService } from "../../services/applicationService";
import type { ApplicantProfileSnapshot, Application, DocumentItem } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatDate } from "../../utils/format";
import { useLanguage } from "../../hooks/useLanguage";
import { dt } from "../../utils/dashboardTranslations";

export const AdminApplicationsPage = () => {
  const { language, t } = useLanguage();
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [downloadingDocumentId, setDownloadingDocumentId] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    adminService.getApplications().then(setApplications).catch((error) => setFormError(getErrorMessage(error, "Unable to load applications.")));
  }, []);

  const filteredApplications = useMemo(
    () => applications.filter((application) => statusFilter === "all" || application.status === statusFilter),
    [applications, statusFilter]
  );

  const documentTypeLabels: Record<string, string> = {
    passport: dt(language, "passportFile"),
    "biometric-photo": dt(language, "biometricPhoto"),
    "latest-qualification": dt(language, "latestQualification"),
    transcript: dt(language, "transcriptDocument"),
    "english-test": dt(language, "englishTestDocument"),
    resume: dt(language, "resumeDocument"),
  };

  const handleStatusChange = async (id: string, status: string) => {
    setFormError("");
    try {
      const updated = await applicationService.updateStatus(id, {
        status,
        note: noteDrafts[id] || `Updated to ${status}`,
      });
      setApplications((current) => current.map((item) => (item._id === id ? updated : item)));
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to update application status."));
    }
  };

  type ProfileFieldKey =
    | "name"
    | "email"
    | "phone"
    | "dateOfBirth"
    | "nationality"
    | "currentEducation"
    | "gpa"
    | "intake"
    | "address";

  const getProfileValue = (
    primary: ApplicantProfileSnapshot | undefined,
    fallback: ApplicantProfileSnapshot | undefined,
    key: ProfileFieldKey
  ) => primary?.[key] || fallback?.[key] || "";

  const getEnglishTestValue = (
    primary: ApplicantProfileSnapshot | undefined,
    fallback: ApplicantProfileSnapshot | undefined,
    key: "exam" | "score"
  ) => primary?.englishTest?.[key] || fallback?.englishTest?.[key] || "";

  const handleDocumentDownload = async (document: DocumentItem) => {
    setFormError("");
    setDownloadingDocumentId(document._id);

    try {
      await downloadApiAsset(document.filePath, document.fileName);
    } catch (error) {
      setFormError(getErrorMessage(error, language === "ar" ? "تعذر تحميل الملف." : "Unable to download file."));
    } finally {
      setDownloadingDocumentId("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">{dt(language, "applicationsInbox")}</h1>
              <p className="mt-1 text-sm text-slate-500">{dt(language, "applicationsInboxHelp")}</p>
            </div>
          </div>

          <label className="rounded-2xl border border-slate-200 px-4 py-3">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              <Filter className="h-3.5 w-3.5" />
              {dt(language, "filter")}
            </span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full border-none bg-transparent p-0 outline-none">
              <option value="all">{dt(language, "allStatuses")}</option>
              <option value="submitted">{t("statusSubmitted")}</option>
              <option value="under-review">{t("statusUnderReview")}</option>
              <option value="accepted">{dt(language, "reviewStatusAccepted")}</option>
              <option value="rejected">{dt(language, "reviewStatusRejected")}</option>
            </select>
          </label>
        </div>
        {formError ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}
      </section>

      <section className="space-y-4">
        {filteredApplications.map((application) => {
          const applicantProfile = application.applicantProfile;
          const studentProfile = application.studentProfile;
          const applicantName =
            getProfileValue(applicantProfile, studentProfile, "name") ||
            application.student?.name ||
            "Unknown student";
          const applicantEmail =
            getProfileValue(applicantProfile, studentProfile, "email") ||
            application.student?.email ||
            "No email";
          const applicantPhone = getProfileValue(applicantProfile, studentProfile, "phone");
          const applicantDateOfBirth = getProfileValue(applicantProfile, studentProfile, "dateOfBirth");
          const applicantNationality = getProfileValue(applicantProfile, studentProfile, "nationality");
          const applicantCurrentEducation = getProfileValue(applicantProfile, studentProfile, "currentEducation");
          const applicantGpa = getProfileValue(applicantProfile, studentProfile, "gpa");
          const applicantIntake = getProfileValue(applicantProfile, studentProfile, "intake");
          const applicantAddress = getProfileValue(applicantProfile, studentProfile, "address");
          const applicantEnglishExam = getEnglishTestValue(applicantProfile, studentProfile, "exam");
          const applicantEnglishScore = getEnglishTestValue(applicantProfile, studentProfile, "score");
          const timeline = [...(application.statusTimeline || [])].reverse();

          return (
            <div key={application._id} className="panel p-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-900">{application.program?.title || "Untitled application"}</h2>
                    <ApplicationStatusBadge status={application.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {applicantName} - {applicantEmail} - {application.program?.university?.name || "Unknown university"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">Submitted: {formatDate(application.submittedAt || application.createdAt)}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">{dt(language, "documents")}: {application.documents?.length || 0}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">{dt(language, "programIntake")}: {application.program?.intake || dt(language, "flexible")}</span>
                  </div>

                  <div className="mt-5 grid gap-4 xl:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 p-4">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{dt(language, "applicantProfile")}</h3>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-slate-600">
                        <div><span className="font-semibold text-slate-800">{t("name")}:</span> {applicantName}</div>
                        <div><span className="font-semibold text-slate-800">{t("email")}:</span> {applicantEmail}</div>
                        <div><span className="font-semibold text-slate-800">{t("phone")}:</span> {applicantPhone || dt(language, "notAvailable")}</div>
                        <div><span className="font-semibold text-slate-800">{dt(language, "dateOfBirth")}:</span> {applicantDateOfBirth ? formatDate(applicantDateOfBirth) : dt(language, "notAvailable")}</div>
                        <div><span className="font-semibold text-slate-800">{t("nationality")}:</span> {applicantNationality || dt(language, "notAvailable")}</div>
                        <div><span className="font-semibold text-slate-800">{t("currentEducation")}:</span> {applicantCurrentEducation || dt(language, "notAvailable")}</div>
                        <div><span className="font-semibold text-slate-800">{t("gpa")}:</span> {applicantGpa || dt(language, "notAvailable")}</div>
                        <div><span className="font-semibold text-slate-800">{t("preferredIntake")}:</span> {applicantIntake || dt(language, "notAvailable")}</div>
                        <div><span className="font-semibold text-slate-800">{dt(language, "englishExam")}:</span> {applicantEnglishExam || dt(language, "notAvailable")}</div>
                        <div><span className="font-semibold text-slate-800">{dt(language, "englishScore")}:</span> {applicantEnglishScore || dt(language, "notAvailable")}</div>
                        <div className="sm:col-span-2"><span className="font-semibold text-slate-800">{t("address")}:</span> {applicantAddress || dt(language, "notAvailable")}</div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 p-4">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{dt(language, "documentsShared")}</h3>
                      <div className="mt-4 space-y-3">
                        {application.documents?.length ? (
                          application.documents.map((document) => (
                            <div key={document._id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                              <div>
                                <p className="font-medium text-slate-900">{documentTypeLabels[document.type] || document.type}</p>
                                <p className="text-xs text-slate-500">{document.fileName}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDocumentDownload(document)}
                                disabled={downloadingDocumentId === document._id}
                                className="font-semibold text-brand-700 disabled:cursor-not-allowed disabled:text-slate-400"
                              >
                                {downloadingDocumentId === document._id
                                  ? language === "ar"
                                    ? "جارٍ التحميل..."
                                    : "Downloading..."
                                  : language === "ar"
                                    ? "تحميل الملف"
                                    : "Download file"}
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">{dt(language, "notAvailable")}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {application.notes ? (
                    <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                      <span className="font-semibold text-slate-800">{dt(language, "studentNotesLabel")}:</span> {application.notes}
                    </div>
                  ) : null}

                  <div className="mt-4 rounded-3xl border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{dt(language, "statusTimelineLabel")}</h3>
                    <div className="mt-4 space-y-3">
                      {timeline.length ? (
                        timeline.map((item, index) => (
                          <div key={`${application._id}-${item.status}-${item.changedAt || index}`} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <ApplicationStatusBadge status={item.status} />
                              <span className="text-xs text-slate-500">{formatDate(item.changedAt)}</span>
                            </div>
                            {item.note ? <p className="mt-3 text-slate-600">{item.note}</p> : null}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">{dt(language, "noStatusTimeline")}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full xl:max-w-sm">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "reviewNote")}</span>
                    <textarea
                      value={noteDrafts[application._id] ?? ""}
                      onChange={(event) => setNoteDrafts((current) => ({ ...current, [application._id]: event.target.value }))}
                      rows={4}
                      placeholder={dt(language, "reviewNotePlaceholder")}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
                    />
                  </label>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {[
                      ["under-review", dt(language, "moveToReview")],
                      ["accepted", dt(language, "accept")],
                      ["rejected", dt(language, "reject")],
                      ["submitted", dt(language, "resetSubmitted")],
                    ].map(([status, label]) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(application._id, status)}
                        className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                          status === "accepted"
                            ? "bg-emerald-600 text-white"
                            : status === "rejected"
                              ? "bg-rose-600 text-white"
                              : "border border-slate-200 text-slate-700"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleStatusChange(application._id, application.status)}
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                  >
                    <SendHorizontal className="h-4 w-4" />
                    {dt(language, "saveNoteOnly")}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredApplications.length === 0 ? <div className="panel p-10 text-center text-sm text-slate-500">{dt(language, "noApplicationsMatch")}</div> : null}
      </section>
    </div>
  );
};
