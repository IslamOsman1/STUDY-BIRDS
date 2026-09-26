import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { EmptyState } from "../../components/EmptyState";
import { useLanguage } from "../../hooks/useLanguage";
import { studentService } from "../../services/studentService";
import type { NotificationItem } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatDate } from "../../utils/format";

export const StudentNotificationsPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState("");

  useEffect(() => {
    studentService
      .getNotifications()
      .then(setItems)
      .catch((issue) => setError(getErrorMessage(issue, isArabic ? "تعذر تحميل الإشعارات." : "Unable to load notifications.")));
  }, [isArabic]);

  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items]);

  const handleMarkRead = async (id: string) => {
    setLoadingId(id);
    try {
      const updated = await studentService.markNotificationRead(id);
      setItems((current) => current.map((item) => (item._id === updated._id ? updated : item)));
    } catch (issue) {
      setError(getErrorMessage(issue, isArabic ? "تعذر تحديث الإشعار." : "Unable to update the notification."));
    } finally {
      setLoadingId("");
    }
  };

  if (error && items.length === 0) {
    return <EmptyState title={isArabic ? "تعذر التحميل" : "Unable to load"} description={error} />;
  }

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "مركز الإشعارات" : "Notifications Center"}</h1>
            <p className="mt-2 text-sm text-slate-500">{isArabic ? "جميع التحديثات الخاصة بطلباتك ومستنداتك ودعمك في مكان واحد." : "All updates about your applications, documents, and support in one place."}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-5 py-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isArabic ? "غير مقروء" : "Unread"}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{unreadCount}</p>
          </div>
        </div>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      {items.length ? (
        <section className="space-y-4">
          {items.map((item) => (
            <article key={item._id} className={`panel p-6 ${item.isRead ? "" : "ring-1 ring-brand-200"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.isRead ? "bg-slate-100 text-slate-500" : "bg-brand-100 text-brand-700"}`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words text-lg font-semibold text-slate-900">{item.title}</h2>
                    <p className="mt-2 break-words text-sm leading-7 text-slate-600">{item.message}</p>
                    <p className="mt-3 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.isRead ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-700"}`}>
                    {item.isRead ? (isArabic ? "مقروء" : "Read") : isArabic ? "جديد" : "New"}
                  </span>
                  {!item.isRead ? (
                    <button
                      type="button"
                      disabled={loadingId === item._id}
                      onClick={() => handleMarkRead(item._id)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                    >
                      <CheckCheck className="h-4 w-4" />
                      {loadingId === item._id ? (isArabic ? "جارٍ التحديث..." : "Updating...") : isArabic ? "تحديد كمقروء" : "Mark as read"}
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState title={isArabic ? "لا توجد إشعارات بعد" : "No notifications yet"} description={isArabic ? "سيظهر هنا أي تحديث جديد على طلباتك أو مستنداتك." : "New updates about your applications and documents will appear here."} />
      )}
    </div>
  );
};
