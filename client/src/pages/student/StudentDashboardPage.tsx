import { useEffect, useState } from "react";
import { StatsCard } from "../../components/dashboard/StatsCard";
import { ApplicationStatusBadge } from "../../components/ApplicationStatusBadge";
import { studentService } from "../../services/studentService";
import { contentService } from "../../services/contentService";
import type { Application, NotificationItem } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";

export const StudentDashboardPage = () => {
  const { t } = useLanguage();
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    Promise.all([studentService.getApplications(), contentService.getNotifications()]).then(
      ([applicationData, notificationData]) => {
        setApplications(applicationData);
        setNotifications(notificationData);
      }
    );
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-3">
        <StatsCard label={t("applications")} value={applications.length} />
        <StatsCard label={t("activeReviews")} value={applications.filter((item) => item.status === "under-review").length} />
        <StatsCard label={t("notifications")} value={notifications.length} />
      </div>
      <div className="panel p-6">
        <h2 className="text-2xl font-semibold">{t("recentApplications")}</h2>
        <div className="mt-6 space-y-4">
          {applications.map((application) => (
            <div key={application._id} className="flex flex-col gap-3 rounded-3xl bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{application.program?.title}</p>
                <p className="text-sm text-slate-500">{application.program?.university?.name}</p>
              </div>
              <ApplicationStatusBadge status={application.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
