import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import type { FavoriteItem } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";
import { formatCurrency, formatDate } from "../../utils/format";

export const AdminStudentFavoritesPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService
      .getStudentFavorites()
      .then(setItems)
      .catch((issue) => setError(getErrorMessage(issue, isArabic ? "تعذر تحميل مفضلة الطلاب." : "Unable to load student favorites.")));
  }, [isArabic]);

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "مفضلة الطلاب" : "Student Favorites"}</h1>
        <p className="mt-2 text-sm text-slate-500">{isArabic ? "اعرف ما الذي يهتم به الطلاب من جامعات وبرامج." : "See which universities and programs students are saving the most."}</p>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <section className="panel p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{isArabic ? "الطالب" : "Student"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "النوع" : "Type"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "العنصر" : "Item"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "تفاصيل" : "Details"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "التاريخ" : "Date"}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-t border-slate-100">
                  <td className="px-4 py-4">{item.student?.name || "--"}</td>
                  <td className="px-4 py-4">{item.itemType}</td>
                  <td className="px-4 py-4 font-semibold text-slate-900">{item.itemType === "university" ? item.university?.name : item.program?.title}</td>
                  <td className="px-4 py-4 text-slate-600">
                    {item.itemType === "university"
                      ? `${item.university?.city || "--"} / ${item.university?.country?.name || "--"}`
                      : `${item.program?.university?.name || "--"} • ${formatCurrency(item.program?.tuition)}`}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
