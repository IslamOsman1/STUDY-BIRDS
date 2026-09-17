import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApplicationStatusBadge } from "../../components/ApplicationStatusBadge";
import { universityPortalService } from "../../services/universityPortalService";
import type { Application } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatDate } from "../../utils/format";
import { useLanguage } from "../../hooks/useLanguage";

export const UniversityApplicationsPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    universityPortalService
      .getApplications()
      .then(setApplications)
      .catch((err) => setError(getErrorMessage(err, isArabic ? "تعذر تحميل الطلبات." : "Unable to load applications.")));
  }, [isArabic]);

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "الطلبات الواردة" : "Incoming Applications"}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {isArabic ? "الطلبات المرسلة لجامعتكم فقط." : "Applications submitted to your university only."}
        </p>
        {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <section className="space-y-4">
        {applications.length ? (
          applications.map((application) => (
            <Link
              key={application._id}
              to={`/university/applications/${application._id}`}
              className="panel block p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{application.student?.name}</p>
                  <p className="text-sm text-slate-500">{application.program?.title}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {isArabic ? "أُرسل في" : "Submitted"}: {formatDate(application.submittedAt || application.createdAt)}
                  </p>
                </div>
                <ApplicationStatusBadge status={application.status} />
              </div>
            </Link>
          ))
        ) : (
          <div className="panel p-8 text-center text-sm text-slate-500">
            {isArabic ? "لا توجد طلبات حتى الآن." : "No applications yet."}
          </div>
        )}
      </section>
    </div>
  );
};
