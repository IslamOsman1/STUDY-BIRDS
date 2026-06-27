import { useEffect, useState } from "react";
import { EmptyState } from "../../components/EmptyState";
import { partnerService } from "../../services/partnerService";
import type { NotificationItem } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";

export const PartnerNotificationsPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [error, setError] = useState("");

  const loadNotifications = () =>
    partnerService
      .getNotifications()
      .then(setItems)
      .catch((issue) =>
        setError(getErrorMessage(issue, isArabic ? "تعذر تحميل الإشعارات." : "Unable to load notifications."))
      );

  useEffect(() => {
    loadNotifications();
  }, [isArabic]);

  const handleMarkRead = async (id: string) => {
    const updated = await partnerService.markNotificationRead(id);
    setItems((current) => current.map((item) => (item._id === id ? updated : item)));
  };

  if (error) {
    return <EmptyState title={isArabic ? "تعذر التحميل" : "Unable to load"} description={error} />;
  }

  if (!items.length) {
    return <EmptyState title={isArabic ? "لا توجد إشعارات" : "No notifications"} description={isArabic ? "ستظهر التحديثات المهمة هنا." : "Important updates will appear here."} />;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article key={item._id} className="panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{item.title}</h1>
              <p className="mt-2 text-sm text-slate-600">{item.message}</p>
            </div>
            {!item.isRead ? (
              <button onClick={() => handleMarkRead(item._id)} className="rounded-full bg-brand-900 px-4 py-2 text-sm font-semibold text-white">
                {isArabic ? "تحديد كمقروء" : "Mark as read"}
              </button>
            ) : (
              <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">
                {isArabic ? "مقروء" : "Read"}
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
};
