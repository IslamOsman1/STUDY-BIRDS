import { useEffect, useState } from "react";
import { EmptyState } from "../../components/EmptyState";
import { partnerService } from "../../services/partnerService";
import type { ActivityLogItem } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";

export const PartnerActivityLogPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<ActivityLogItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    partnerService
      .getActivityLog()
      .then(setItems)
      .catch((issue) => setError(getErrorMessage(issue, isArabic ? "تعذر تحميل السجل." : "Unable to load activity log.")));
  }, [isArabic]);

  if (error) {
    return <EmptyState title={isArabic ? "تعذر التحميل" : "Unable to load"} description={error} />;
  }

  if (!items.length) {
    return <EmptyState title={isArabic ? "لا توجد نشاطات بعد" : "No activity yet"} description={isArabic ? "ستظهر نشاطات الحساب هنا." : "Your account activity will appear here."} />;
  }

  return (
    <section className="panel overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {[isArabic ? "العملية" : "Action", isArabic ? "الوصف" : "Description", "IP", isArabic ? "المتصفح / الجهاز" : "Browser / Device", isArabic ? "التاريخ" : "Date"].map((header) => (
                <th key={header} className="px-5 py-4 text-start font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-t border-slate-100">
                <td className="px-5 py-4 font-semibold text-slate-900">{item.action}</td>
                <td className="px-5 py-4 text-slate-600">{item.description || "--"}</td>
                <td className="px-5 py-4 text-slate-600">{item.ipAddress || "--"}</td>
                <td className="px-5 py-4 text-slate-600">{item.userAgent || "--"}</td>
                <td className="px-5 py-4 text-slate-600">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "--"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
